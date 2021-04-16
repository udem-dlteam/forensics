import logging
import configparser


def init_logger(config):
    if isinstance(config, str):
        _config = config
        config = configparser.ConfigParser()
        config.read(_config)

    logger = logging.getLogger("forensics")

    logging.basicConfig(
        filename=config["DEFAULT"]["log_file"],
        level=logging.__dict__[config["DEFAULT"]["log_level"]],
        format="%(asctime)s %(levelname)s: %(message)s",
    )

    return logger
