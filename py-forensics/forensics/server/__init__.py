import configparser

from forensics.models import *

# ==========================================
# ============== FLASK API =================
# ==========================================

from flask import Flask
from flask_caching import Cache
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource
from pony.flask import Pony

# TODO Use global Flask app config
cache = Cache(config={"CACHE_TYPE": "SimpleCache"})

# taken here : https://stackoverflow.com/questions/354038/how-do-i-check-if-a-string-is-a-number-float
def str_is_float(s):
    return s.replace('.','',1).isdigit()

class APILegacy(Resource):
    @cache.cached(timeout=60)
    def get(self):
        systems = select(x for x in System)
        return_value = []
        for sys in systems:
            name = sys.name
            measures = ["real time"]

            tags = []
            options = []
            meta = []

            # Commit name
            tags.append(sys.name + "-version")
            commits_name = list(map(lambda x: x.name, sys.commits))
            meta = list(
                map(
                    lambda x: f"name : {x.name}\ntime : {x.timestamp}\n description : {x.description}\n",
                    sys.commits,
                )
            )
            options.append(commits_name)

            # build name
            tags.append(sys.name + "-settings")
            config_name = list(map(lambda x: x.name, sys.configs))
            options.append(config_name)

            # benchmark
            tags.append("benchmarks")
            all_benchmarks = select(x for x in Benchmark)
            benchmarks = all_benchmarks

            # for bench in all_benchmarks:
            #    if sys in map(lambda x : x.build.system, bench.runs):
            #        benchmarks.append(bench)

            options.append(list(map(lambda x: x.name, benchmarks)))

            tags.append("measure")
            options.append(measures)

            tags.append("stat")
            options.append(["mean", "sd"])

            data = []
            for commit in sys.commits:
                commit_data = []
                for config in sys.configs:
                    config_data = []
                    for bench in benchmarks:
                        bench_data = []
                        results = select(
                            d
                            for d in Run
                            if d.build.config == config
                            and d.build.commit == commit
                            and d.build.system == sys
                            and d.benchmark == bench
                        )
                        results = list(results)
                        to_append = "0"
                        if len(results) != 0:
                            split_res = results[0].result.split(" ")

                            # check if all values are numbers
                            if all(map(str_is_float, split_res)):
                                to_append = split_res[0]

                        bench_data.append([to_append])

                        config_data.append(bench_data)
                    commit_data.append(config_data)
                data.append(commit_data)

            return_value.append(
                {
                    "name": name,
                    "measures": measures,
                    "tags": tags,
                    "options": options,
                    "data": data,
                    "meta": meta,
                }
            )

        return return_value


# ========================================
# ===== FOLLOWING CODE IS NOT USED TO ====
# ========= SERVE THE FRONT-END ==========
# ========================================

"""
Returns a closure that transform an object into a python
dictionary.

The parameters indicates witch attributes should be
considered. Deep attributes are recursively constructed by
calling the to_json function on them. Shallow ones must define
an attribute of that object that will represent them.

Consider the following exemple :

    Build: jsonify(["timestamp", "result", "runs"],
                   [("system", "name"), ("commit", "name")])

Here, "timestamp", "result" and "runs" are deep attributes and
"system" and "commit" are shallow ones.

If we call to_json(Build), we get:

    {
        "timestamp": "2021-04-02 01:55:26",
        "result": "result",
        "runs": [
            {
                "id": 8,
                "timestamp": "2021-04-02 16:41:31",
                "result": "1.36",
                ...
            },
            ...
        ],
        "system": "chez",
        "commit": "ab1656597150676dd33c311b8ae7e37287bbe54e"
    }

Note here that runs is completely copied and jsonified, but system
  and commit is only shown as their name
"""


def jsonify(deep=[], shallow=[]):
    def closure(elem):
        return {attr: to_json(getattr(elem, attr)) for attr in deep} | {
            attr[0]: to_json(getattr(getattr(elem, attr[0]), attr[1]))
            for attr in shallow
        }

    return closure


METHODS = {
    System: jsonify(["name", "shortname", "description", "icon", "configs", "commits"]),
    Commit: jsonify(["name", "description", "builds"]),
    Config: jsonify(["name", "shortname", "description", "builds"]),
    Build: jsonify(
        ["timestamp", "result", "runs"], [("system", "name"), ("commit", "name")]
    ),
    Machine: jsonify(
        ["id", "name", "shortname", "description", "setup", "specs", "builds"]
    ),
    Run: jsonify(
        ["id", "timestamp", "result", "usage", "benchmark"], [("build", "id")]
    ),
    Benchmark: jsonify(["id", "name", "description", "setup"]),
    Usage: jsonify(
        ["id", "name", "shortname", "description", "setup"],
        [("system", "name"), ("runs", "id")],
    ),
    str: lambda x: x,
    int: lambda x: x,
    datetime: lambda x: str(x),
}


def to_json(obj):
    if type(obj) in METHODS:
        return METHODS[type(obj)](obj)
    if hasattr(obj, "__iter__"):
        return [to_json(obj) for obj in obj]
    return "JSON cannot be applied on " + str(type(obj))


class APISystem(Resource):
    def get(self):
        sys = select(x for x in System)
        return to_json(sys)


class APIConfig(Resource):
    def get(self, system):
        config = select(x for x in Config if x.system.name == system)
        return to_json(config)


class APIMachine(Resource):
    def get(self):
        machine = select(x for x in Machine)
        return to_json(machine)


# App factory
def create_app(config):

    if isinstance(config, str):
        import os

        _config = config
        config = configparser.ConfigParser()
        config.read(os.path.expanduser(_config))

    # wrapper for db_session
    app = Flask(__name__)
    Pony(app)

    cache.init_app(app)

    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"

    api = Api(app)
    api.add_resource(APILegacy, "/legacy")
    api.add_resource(APISystem, "/systems")
    api.add_resource(APIConfig, "/systems/<string:system>")
    api.add_resource(APIMachine, "/machines")

    db.bind(provider="sqlite", filename=config["SERVER"]["database"])
    db.generate_mapping(create_tables=False)

    return app
