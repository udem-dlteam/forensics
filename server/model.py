from datetime import datetime
from pony.orm import *


db = Database()


class System(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    shortname = Required(str, unique=True)
    icon = Optional(str)
    description = Required(str)
    setup = Required(str)  # E.g. Github repo url
    commits = Set('Commit')
    configs = Set('Config')
    usages = Set('Usage')
    builds = Set('Build')
    url = Optional(str)


class Commit(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    description = Required(str)
    timestamp = Required(datetime)
    system = Required(System)
    builds = Set('Build')
    url = Optional(str)


class Config(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    system = Required(System)
    builds = Set('Build')


class Usage(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    system = Required(System)
    runs = Set('Run')


class Benchmark(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    shortname = Required(str)
    description = Required(str)
    setup = Required(str)
    runs = Set('Run')


class Machine(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    shortname = Required(str, unique=True)
    description = Required(str)
    setup = Required(str)
    specs = Required(str)
    builds = Set('Build')


class Build(db.Entity):
    id = PrimaryKey(int, auto=True)
    timestamp = Optional(datetime)
    result = Required(str)
    system = Required(System)
    commit = Required(Commit)
    machine = Required(Machine)
    config = Required(Config)
    runs = Set('Run')


class Run(db.Entity):
    id = PrimaryKey(int, auto=True)
    timestamp = Required(datetime)
    result = Required(str)
    usage = Required(Usage)
    benchmark = Required(Benchmark)
    build = Required(Build)



db.bind(provider="sqlite", filename="test.db")
db.generate_mapping()
