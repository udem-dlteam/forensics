import argparse

from forensics.server import create_app

parser = argparse.ArgumentParser(description="forensics web server")
parser.add_argument("-c", "--conf", nargs=1, help="path to a forensics.conf file")

args = parser.parse_args()

app = create_app(args.conf[0])

# Always run on debug when running as __main__
app.run(debug=True)
