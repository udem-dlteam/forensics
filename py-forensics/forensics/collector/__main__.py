import argparse
import configparser

from forensics import init_logger
from forensics.models import *

parser = argparse.ArgumentParser(
    description="benchd - The Gambit-forensics benchmarks daemon."
)
parser.add_argument("-c", "--conf", nargs=1, help="path to a benchd.conf file")
parser.add_argument("-i", "--init", action="store_true", help="initialize the database")
parser.add_argument("-b", "--batch", nargs=1, help="path to system directory")
parser.add_argument(
    "-ba", "--batch-all", nargs=1, help="path to gambit-forensics root directory"
)
parser.add_argument("-v", "--verbose", action="store_true", help="log to stdout")

args = parser.parse_args()

config = configparser.ConfigParser()
config.read(args.conf)

logger = init_logger(config, args.verbose)


def batch_insert(system):
    """Batch insert of results for one system by recursively traversing the filesystem."""
    # TODO: refactor batch_insert_all for code reuse.
    print(f"batch_insert {system}")


def batch_insert_all(root):
    """Batch insert of results for all systems by recursively traversing the filesystem."""

    logger.info(f"Proceding with batch_insert_all in {root}")

    systems = ls_dir(root)

    for system in systems:
        commits = ls_dir(system)
        for commit in commits:
            configs = ls_dir(commit)
            for config in configs:
                build_results = config.path + "/.forensics-build-results"
                # Don't continue for failed builds.
                # NOTE: Maybe save failed build state?
                if not os.path.exists(build_results):
                    logger.warning(
                        f"Build results absent for {system.name}/{commit.name}/{config.name}"
                    )
                    break

                try:
                    build_id = insert_build_results(build_results)
                except Exception as e:
                    logger.warning(
                            f"Could not process build for {system.name}/{commit.name}/{config.name}, skipping (Exception: {str(e)})"
                    )
                    break

                logger.debug(
                    f"Processed build for {system.name}/{commit.name}/{config.name}"
                )

                if not os.path.exists(config.path + "/.forensics-usage"):
                    logger.warning(
                        f"Usage directory absent for {system.name}/{commit.name}/{config.name}, skipping"
                    )
                    break

                usages = ls_dir(config.path + "/.forensics-usage")
                for usage in usages:
                    run_results = usage.path + "/.forensics-run-results"
                    if not os.path.exists(run_results):
                        logger.warning(
                            f"Run results absent for {system.name}/{commit.name}/{config.name}, skipping"
                        )
                        break

                    run_context = usage.path + "/.forensics-run-context"
                    if not os.path.exists(run_context):
                        logger.warning(
                            f"Run context absent for {system.name}/{commit.name}/{config.name}, skipping"
                        )
                        break

                    try:
                        insert_run_results(run_results, run_context, build_id)
                    except Exception as e:
                        logger.warning(
                            f"Could not process run for {system.name}/{commit.name}/{config.name}/{usage.name}, skipping"
                        )
                        raise e

                    logger.debug(
                        f"Processed run for {system.name}/{commit.name}/{config.name}/{usage.name}"
                    )

    logger.info(f"Completed batch_insert_all in {root}")


@db_session
def insert_build_results(path):
    """Inserts build results into the System, Commit, Config, Machine and Build tables."""

    # TODO: Figure out why some cpython commits aren't properly parsed
    df = pd.read_csv(path)
    data = df.iloc[0].to_dict()

    # Always check if entities already exist
    system = System.get(name=data["system-name"])
    if system is None:
        system = System(
            name=data["system-name"],
            shortname=data["system-shortname"],
            icon=data["system-icon"],
            description=data["system-desc"],
            setup=data["system-setup"],
            url=data["system-url"],
        )

    commit = Commit.get(sha=data["commit-hash"], system=system)
    if commit is None:
        commit = Commit(
            name=data["commit-name"],
            sha=data["commit-hash"],
            description=data["commit-desc"],
            timestamp=datetime.fromtimestamp(int(data["commit-timestamp"])),
            system=system,
            url=data["commit-url"],
            branch=data["commit-branch"]
        )

    config = Config.get(name=data["config-name"], system=system)
    if config is None:
        config = Config(
            name=data["config-name"],
            shortname=data["config-shortname"],
            description=data["config-desc"],
            setup=data["config-setup"],
            system=system,
        )

    # NOTE: Maybe insert machine elsewhere
    machine = Machine.get(name=data["machine-name"])
    if machine is None:
        machine = Machine(
            name=data["machine-name"],
            shortname=data["machine-shortname"],
            description="change me",
            setup=data["machine-setup"],
            specs=data["machine-specs"],
        )

    build = Build.get(system=system, commit=commit, machine=machine, config=config)
    if build is None:
        build = Build(
            timestamp=datetime.fromtimestamp(int(data["build-timestamp"])),
            result=data["build-result"],
            system=system,
            commit=commit,
            machine=machine,
            config=config,
        )

        build.flush()

    return build.id


@db_session
def insert_run_results(run_results, run_context, build_id):

    build = Build[build_id]

    # This should never trigger.
    if build is None:
        logger.critical("Build not found, skipping...")
        return

    # NOTE: Only get usage in the case of a bulk insert
    ctx = pd.read_csv(run_context)
    if ctx.empty:
        raise Exception(f"Run context {run_context} is empty")

    df = pd.read_csv(run_results)
    if df.empty:
        raise Exception(f"Run results {run_results} is empty")

    for row in df.iloc:
        data = row.to_dict()

        # TODO: Properly fill usage information. Must emit in forensics.
        usage = Usage.get(name=ctx["usage-name"][0], system=build.system)
        if usage is None:
            usage = Usage(
                name=ctx["usage-name"][0],
                shortname="change me",
                description="change me",
                setup=ctx["usage-setup"][0],
                system=build.system,
            )

        # TODO: Fill setup information and discriminate using
        # setup+name pair.
        benchmark = Benchmark.get(name=data["benchmark-name"])
        if benchmark is None:
            benchmark = Benchmark(
                name=data["benchmark-name"],
                shortname="change me",
                description="change me",
                setup="change me",
            )

        run = Run(
            # NOTE: We choose the end of the computation as the timestamp.
            timestamp=datetime.fromtimestamp(int(ctx["run-end-timestamp"][0])),
            result=str(data["run-result"]),
            build=build,
            usage=usage,
            benchmark=benchmark,
        )

if args.init:
    init_db(config=config)
    exit()

db.bind(provider="sqlite", filename=config["SERVER"]["database"])
db.generate_mapping(create_tables=False)

# TODO
# --batch system
if args.batch:
    print(f"Initiating batch_insert in {args.batch[0]}...")
    batch_insert(args.batch[0])
    print(f"Completed batch_insert in {args.batch[0]}.")
    exit()

# --batch-all
if args.batch_all:
    print(f"Initiating batch_insert_all in {args.batch_all[0]}...")
    batch_insert_all(args.batch_all[0])
    print(f"Completed batch_insert_all in {args.batch_all[0]}.")
    exit()
