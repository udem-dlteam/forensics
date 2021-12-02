#!/usr/bin/env bash

now=$(date +"%m_%d_%Y")
base="/usr/local/var/websites"
forensics="${base}/forensics.gambitscheme.org"
git_url="https://github.com/udem-dlteam/forensics.git"

if [ -d "forensics" ]
then
    (cd forensics; git pull)
else
    git clone "$git_url"
fi

echo $PWD

# NOTE: For now, we keep the UI in the v2 directory
if [ -d "_deploy" ]
then
    mv  "_deploy_$now"
fi

cp -R ./forensics/client/v2 _deploy

sudo cp -R _deploy/ "${forensics}/"
