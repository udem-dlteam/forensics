import configparser

from forensics.models import *

# ==========================================
# ============== FLASK API =================
# ==========================================

from flask import Flask, Response
from flask_caching import Cache
from flask_cors import CORS, cross_origin

from flask.views import MethodView
from pony.flask import Pony

import json

# TODO Use global Flask app config
cache = Cache(config={"CACHE_TYPE": "SimpleCache"})

# taken here : https://stackoverflow.com/questions/354038/how-do-i-check-if-a-string-is-a-number-float
def str_is_float(s):
    return s.replace('.','',1).isdigit()

class APILegacy(MethodView):
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

            commits = sorted(sys.commits, key=lambda x : x.timestamp);

            # Commit name
            tags.append(sys.name + "-version")
            commits_name = list(map(lambda x: x.timestamp.strftime("%m/%d/%-y %H:%M ") + x.name, commits))
            meta = list(
                map(
                    lambda x: f"name : {x.name}\ntime : {x.timestamp}\n description : {x.description}\n",
                    commits,
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
            for commit in commits:
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
                            to_append = results[0].result
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

        return Response(json.dumps(return_value), mimetype="application/json")


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


class APISystem(MethodView):
    def get(self):
        sys = select(x for x in System)
        return to_json(sys)


class APIConfig(MethodView):
    def get(self, system):
        config = select(x for x in Config if x.system.name == system)
        return to_json(config)


class APIMachine(MethodView):
    def get(self):
        machine = select(x for x in Machine)
        return to_json(machine)

from flask import request
"""
'system' : ['zipi'],
'zipi-setting' : ['gambit'],
'zipi-commits' : ['commit1', 'commit2'],
'benchmark' : ['bench1']

"""

LAYOUT_TO_VARIABLE = {
        'benchmarks' : '"benchmark"."name"',
        'commits' : '"build"."commit"."name"',
        'configs' : '"config"."name"',
        'system' : '.system.name'
}

VARIABLES = ['benchmarks', 'commits', 'configs', 'system']

def set_or_add(dic, key, val):
    if key in dic:
        dic[key] += [val]
    else:
        dic[key] = [val]

LAYOUT = {
    'system':{
        'type' : {
            'commit' : {
                'type' : 'list',
                'class' : Commit,
                'filter' : 
                    (lambda parent: 
                        lambda op : op.system.name == parent),
                'transform' : lambda x : x.name
            },
            'config' : {
                'type' : 'list',
                'class' : Config,
                'filter' : 
                    (lambda parent: 
                        lambda op : op.system.name == parent),
                'transform' : lambda x : x.name
            }
        },
        'class' : System,
        'transform' : lambda x : x.name
    },
    'benchmark':{
        'type' : 'list',
        'class' : Benchmark,
        'transform' : lambda x : x.name
    },
}



class APIState(MethodView):
    def post(self, axisX, axisZ):
        data = json.loads(request.data)

        sys_name = data['system']
        sys_config_zipi = data['zipi/config']
        sys_config_cpython = data['cpython/config']
        sys_commits_zipi = data['zipi/commit']
        sys_commits_cpython = data['cpython/commit']
        sys_bench = data['benchmark']

        print(sys_config_zipi)
        print(sys_config_cpython)

        pony.orm.set_sql_debug(debug = True, show_values = True)
       
        print("name")
        if(axisZ == ""):
            aggregation = select(
                # WARNING : sql injections here
                [raw_sql('"' + axisX + '"."name"'), run.result]
                for run in Run if
                (('zipi' in sys_name and 'zipi' == run.build.system.name 
                    and run.build.config.name in sys_config_zipi and run.build.commit.name in  sys_commits_zipi) 
                    or 
                 ('cpython' in sys_name and 'cpython' == run.build.system.name 
                     and run.build.config.name in sys_config_cpython and run.build.commit.name in sys_commits_cpython))

                and run.benchmark.name in sys_bench
            )
            

        
        else:

            aggregation = select(
                    # WARNING : sql injection here, need checks
                [raw_sql('"' + axisZ + '"."name"'), raw_sql('"' + axisX + '"."name"'), run.result]
                for run in Run if
                (('zipi' in sys_name and 'zipi' == run.build.system.name 
                    and run.build.config.name in sys_config_zipi and run.build.commit.name in  sys_commits_zipi) 
                    or 
                 ('cpython' in sys_name and 'cpython' == run.build.system.name 
                     and run.build.config.name in sys_config_cpython and run.build.commit.name in sys_config_cpython))

                and run.benchmark.name in sys_bench
            )


        result = list(aggregation)

        

        return Response(json.dumps(result), mimetype="application/json")

def recur(layout, parent):
    result = {}
    for key, config in layout.items():
        if config['type'] == 'list':
            print('class :', config['class'])
            query = select(op for op in config['class'])
            if 'filter' in config:
                query.where(config['filter'](parent))

            if 'transform' in config:
                query = map(config['transform'], query)

            result[key] = {
                'type' : config['type'],
                'options' : list(query)
            }

        elif type(config['type']) == dict:
            result[key] = {}
            result[key]['type'] = {}
            pos_values = list(select(op.name for op in config['class']))
            print(pos_values)
            for val in pos_values:
                result[key]['type'][val] = recur(config['type'], val)
    
    return result


class APILayout(MethodView):
    def get(self):
        result = dict()

        pony.orm.set_sql_debug(debug = True, show_values = True)

        print(list(select(op for op in Config).where(lambda op:op.system.name == "zipi")))
        result = recur(LAYOUT, None);


        return Response(json.dumps(result), mimetype="application/json")


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

    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config["CORS_HEADERS"] = "Content-Type"

    app.add_url_rule('/legacy', view_func=APILegacy.as_view('legacy'), methods=["GET",])
    app.add_url_rule('/state/<axisX>', defaults = {'axisZ' : ""}, view_func=APIState.as_view('stateX'), methods=["POST",])
    app.add_url_rule('/state/<axisX>/<axisZ>', view_func=APIState.as_view('stateXZ'), methods=["POST",])
    app.add_url_rule('/layout', view_func=APILayout.as_view('layout'), methods=["GET",])

    db.bind(provider="sqlite", filename=config["SERVER"]["database"])
    db.generate_mapping(create_tables=False)

    return app
