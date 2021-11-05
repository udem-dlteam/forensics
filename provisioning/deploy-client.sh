#! /bin/sh
# This must be run inside the client/react-forensics folder
# You must also configure a new host called "gambit-forensics"

# "homepage": "https://zipi-forensics.gambitscheme.org/",

CURRENT_URL=zipi-forensics.gambitscheme.org
PUBLIC_URL=https://$CURRENT_URL/ npm run build && \
rsync -r build/* gambit-forensics:/usr/local/var/websites/$CURRENT_URL/

CURRENT_URL=forensics.gambitscheme.org
PUBLIC_URL=https://$CURRENT_URL/ npm run build && \
rsync -r build/* gambit-forensics:/usr/local/var/websites/$CURRENT_URL/