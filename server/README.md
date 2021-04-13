# Backend server

This server is reponsible for hosting the data for the [front-end](../web). It is splitted in two files : [server.py](server.py) and [model.py](model.py). `server.py` contains all the logic for the server and defines the routes. The `model.py` contains the ponyorm model (generated with the [online tool](https://editor.ponyorm.com/)). The link to access the online tool is available here : [https://editor.ponyorm.com/user/belmarca/fa/designer](https://editor.ponyorm.com/user/belmarca/fa/designer)

For now, the database is in [test.db](./test.db)

## Routes

For now, the only route that is used by the server is `/legacy` (defined at the end of the `server.py` file). This route creates a json in the format needed for the [frontend](../web). In the futur, it would be great to change this representation for someting that could be used by other applications. This is why I called this route "legacy" because it uses a representation of data that is really specific to this front-end.

In the effort of having a more general representation, other routes have been defined (note that these are **not** used by the front end and could change at any time):
- `/systems` that returns a complete json of all the systems
- `/machines` returns a complete json of all the machines

## Dev op setup

Create a virtual environnement using virtualenv (or other tools), activate it and install the packages from requirements.txt.

```
python3 -m venv env
source ./env/bin/source
python3 -m pip install -r requirements.txt
```

## run the server

The server is written in flask. To run it, use these commands : 
```bash
export FLASK_APP="serverpy"
flask run
```
