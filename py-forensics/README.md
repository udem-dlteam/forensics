# py-forensics

The `forensics` Python module. In this directory, run `pip install -e .`, preferably already in a virtualenv.

You need to provide a configuration file to the scripts. An example is given in `templates/example.conf`. Please copy it elsewhere and modify it to suit your needs.

## Collector

The `collector` submodule requires a configuration file. An example is provided
in the `templates` submodule. Use full paths.

To initialize the database: `python -m forensics.collector --conf /path/to/conf
--init`. Or you can do it manually in a Python shell:

``` python
from forensics.models import *
init_db("/path/to/conf")
```

To collect data:

``` sh
python -m forensics.collector --conf /path/to/conf --batch-all /path/to/system-builds
```

## Aggregator

TODO

## Server

The `server` submodule is a Flask application intended which serves the results
from the DB through HTTP.

To run the Flask development server: `python -m forensics.server --conf
~/.forensics/forensics.conf` where you need to point to your own configuration
file. This will run the Flask server in `DEBUG` mode, listening on port 5000.

To run with gunicorn: 

``` sh
gunicorn -w4 -b localhost:8080 'forensics.server:create_app("/path/to/conf")'
```

It should work with any other WSGI server.
