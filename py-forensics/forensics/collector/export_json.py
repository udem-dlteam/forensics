#!/usr/bin/env python3

import json
import argparse
import configparser

from forensics import init_logger
from forensics.models import *

# Provide very succinct debug information in the logs
debug = False

parser = argparse.ArgumentParser(
    description="benchd - The Gambit-forensics benchmarks daemon."
)
parser.add_argument("-c", "--conf", nargs=1, help="path to a benchd.conf file")

args = parser.parse_args()

config = configparser.ConfigParser()
config.read(args.conf)

logger = init_logger(config)

db.bind(provider="sqlite", filename=config["SERVER"]["database"])
db.generate_mapping(create_tables=False)

# Automatically created non-existing keys in dicts
output = {
    "options": dict(),
    "results": []
}
options = output["options"]

with db_session():
    # Select systems which actually have a run.
    # Distinct by default in PonyORM
    systems = select(s for s in System for b in Build for r in Run if b == r.build and s == b.system)[:]

    # Build the options dictionary
    for system in systems:
        # Each system is a root
        options[system.name] = dict()
        # Re-use query
        _builds = select(b for b in Build for r in Run if b.system == system and b == r.build)
        if debug: logger.info(f"export_json.py ### processing {len(_builds)} builds")

        _system = options[system.name]

        _system["commitMessages"] = {c.name:c.description for c in select(c for c in Commit)}

        _system["commitShas"] = {c.name:c.sha for c in select(c for c in Commit)}

        _system["benchmarks"] = [b.name for b in select(bench for bench in Benchmark for b in Build for r in Run if b.system == system and bench == r.benchmark)]

        _commits = [[c[0], c[1].timestamp()*1000] for c in sorted([(c.name, c.timestamp) for c in select(b.commit for b in _builds)], key=lambda x:x[1])]
        if debug: logger.info(f"export_json.py ### processing {len(_commits)} commits")
        _system["commits"] = [c[0] for c in _commits]

        _system["configs"] = [c.name for c in select(b.config for b in _builds)]

        _runs = select(r for b in Build for r in Run if b.system == system and b == r.build)
        if debug: logger.info(f"export_json.py ### processing {len(_runs)} runs")

        output["results"] = [{
            "system": r.build.system.name,
            "benchmark": r.benchmark.name,
            "commit": r.build.commit.name,
            "timestamp": (r.build.commit.timestamp).timestamp()*1000,
            "values": r.result.split(' '),
            "config": r.build.config.name,
        } for r in _runs]

_json = json.dumps(output, indent=2)
json_path = config["SERVER"]["json"]
with open(json_path, 'w') as f:
    print(_json, file=f)

logger.info(f"export_json.py ### Wrote {json_path}")
