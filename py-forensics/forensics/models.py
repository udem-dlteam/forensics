import os
import sqlite3
import pkgutil
import configparser
from datetime import datetime
from pony.orm import *

import pandas as pd

from forensics import init_logger

db = Database()


# Utils
def ls_dir(path):
    return [d for d in os.scandir(path) if d.is_dir()]


def ls_files(path):
    return [f for f in os.scandir(path) if f.is_file()]


class System(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    shortname = Required(str, unique=True)
    icon = Optional(str)
    description = Required(str)
    setup = Required(str)  # E.g. Github repo url
    commits = Set("Commit")
    configs = Set("Config")
    usages = Set("Usage")
    builds = Set("Build")
    url = Optional(str)


class Commit(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    description = Required(str)
    timestamp = Required(datetime)
    system = Required(System)
    builds = Set("Build")
    url = Optional(str)
    branch = Optional(str)


class Config(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    system = Required(System)
    builds = Set("Build")


class Usage(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    system = Required(System)
    runs = Set("Run")


class Benchmark(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    # TODO: Make sure shortname is unique in future revisions.
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    runs = Set("Run")


class Machine(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    shortname = Required(str, unique=True)
    description = Required(str)
    setup = Required(str)
    specs = Required(str)
    builds = Set("Build")


class Build(db.Entity):
    id = PrimaryKey(int, auto=True)
    timestamp = Optional(datetime)
    result = Required(str)
    system = Required(System)
    commit = Required(Commit)
    machine = Required(Machine)
    config = Required(Config)
    runs = Set("Run")


class Run(db.Entity):
    id = PrimaryKey(int, auto=True)
    timestamp = Required(datetime)
    result = Required(str)
    usage = Required(Usage)
    benchmark = Required(Benchmark)
    build = Required(Build)
    # TODO: Add "machine" field as benchmark and build machines can differ


def init_db(config):
    """Initialize the database if it does not exist."""

    # We either pass a path, or a Config object
    if isinstance(config, str):
        _config = config
        config = configparser.ConfigParser()
        config.read(os.path.expanduser(_config))

    logger = init_logger(config)

    db_path = config["SERVER"]["database"]
    schema = pkgutil.get_data("forensics", "templates/schema.sql")

    if os.path.exists(db_path):
        print("Database already exists.")
        exit()

    with sqlite3.connect(db_path) as conn:
        with conn:
            conn.executescript(schema.decode("ascii"))

    print("Initialized database.")
    logger.info("Initialized database.")


# For interactive queries on the DB in a Python shell
def db_connect(config):
    if isinstance(config, str):
        _config = config
        config = configparser.ConfigParser()
        config.read(os.path.expanduser(_config))

    db.bind(provider="sqlite", filename=config["SERVER"]["database"])
    db.generate_mapping(create_tables=False)
