#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../../config_shellscripts_vagrant.sh

echo "About to install Node.js (10.x), NPM and Angular CLI (both latest) ..."
echo "Fetching and integrating PPA ..."
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
echo "Installing Node.js ..."
sudo apt-get install -y nodejs

echo "Updating NPM to latest version ..."
sudo npm install npm@latest -g
echo "Installing Angular CLI globally ..."
sudo npm install @angular/cli -g
echo "Finished"

sudo npm config set prefix "${MYNEDATA_DIR}/npm"
sudo npm config set cache "${MYNEDATA_DIR}/npm-cache"
npm config ls -l
