import os
import sys
import logging
import configparser


def init_logger(config, stdout=False):
    if isinstance(config, str):
        _config = config
        config = configparser.ConfigParser()
        config.read(os.path.expanduser(_config))

    logger = logging.getLogger("forensics")

    if stdout:
        logging.basicConfig(
            stream=sys.stdout,
            level=logging.__dict__[config["DEFAULT"]["log_level"]],
            format="%(asctime)s %(levelname)s: %(message)s",
        )
    else:
        logging.basicConfig(
            filename=config["DEFAULT"]["log_file"],
            level=logging.__dict__[config["DEFAULT"]["log_level"]],
            format="%(asctime)s %(levelname)s: %(message)s",
        )

    return logger
