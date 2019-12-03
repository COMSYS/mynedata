#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../../config_shellscripts_vagrant.sh

echo "About to install nginx webserver"
sudo apt-get -y install nginx

# stop a running instance before attempting to copy the config
if [[ $(service --status-all | grep nginx | grep "+" | wc -l) > 0 ]]; then
    sudo service nginx stop
fi

echo "Create symbolic link for nginx configuration."
sudo mv ${WEBSERVER_CONFIG} ${WEBSERVER_CONFIG}.bak
if [[ "$(hostname)" = "mynedata-vagrant" ]]; then
    sudo ln -s ${MY_DIR}/nginx.vagrant.conf ${WEBSERVER_CONFIG}
else
    sudo ln -s ${MY_DIR}/nginx.native.conf ${WEBSERVER_CONFIG}
fi

sudo service nginx start
echo "Done."
