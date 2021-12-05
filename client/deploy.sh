#!/usr/bin/env bash

now=$(date +"%m_%d_%Y")
base="/usr/local/var/websites"
forensics="${base}/forensics.gambitscheme.org"

(cd ..; git pull)

# NOTE: For now, we keep the UI in the v2 directory
if [ -d "_deploy" ]
then
    mv  _deploy "_deploy_$now"
fi

cp -r ./v2 _deploy

sudo rsync -a ./_deploy/ "${forensics}/"
