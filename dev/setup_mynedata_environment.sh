#!/bin/bash

MYNEDATA_ROOT="/mynedata"
MYNEDATA_TARGET="/opt/mynedata/"

echo ""
echo ""
echo "=============================="
echo "= SETUP MYNEDATA ENVIRONMENT ="
echo "=============================="
echo ""
echo ""

sudo mkdir -p ${MYNEDATA_TARGET}
if [[ "$(hostname)" == "mynedata-vagrant" ]]; then
    sudo chown -R vagrant:www-data ${MYNEDATA_TARGET}
else
    username="$(whoami)"
    sudo chown -R ${username}:www-data ${MYNEDATA_TARGET}
fi


echo ""
echo ""
echo "==========================="
echo "= GETTING UBUNTU PACKAGES ="
echo "==========================="
echo ""
echo ""

sudo apt-get update
# Temporarily disable possibility to generate documentation
# sudo apt-get install --assume-yes python3 python3-pip rabbitmq-server openjdk-7-jre
sudo apt-get --assume-yes install python3 python3-pip rabbitmq-server sqlite3
# This line is apparently needed in order to prevent installing Python requirements from
# attempting to configure the libssl package, locking the VM provisioning
# See: https://bugs.launchpad.net/ubuntu/+source/openssl/+bug/1832919
sudo apt-get --assume-yes upgrade


echo ""
echo ""
echo "==========================="
echo "= GETTING PYTHON PACKAGES ="
echo "==========================="
echo ""
echo ""

yes | sudo pip3 install --requirement=${MYNEDATA_ROOT}/dev/python_requirements.txt


echo ""
echo ""
echo "===================="
echo "= SETUP WEB SERVER ="
echo "===================="
echo ""
echo ""

bash ${MYNEDATA_ROOT}/dev/frontend/install_angular.sh
bash ${MYNEDATA_ROOT}/dev/frontend/install_nginx.sh


echo ""
echo ""
echo "=========================="
echo "= SETUP PAYMENT SOFTWARE ="
echo "=========================="
echo ""
echo ""

bash ${MYNEDATA_ROOT}/dev/payments/install_bitcoin.sh


echo ""
echo ""
echo "===================="
echo "= FINALIZING SETUP ="
echo "===================="
echo ""
echo ""

if [[ "$(hostname)" == "mynedata-vagrant" ]]; then
    sudo chown -R vagrant:www-data ${MYNEDATA_TARGET}
else
    username="$(whoami)"
    sudo chown -R ${username}:www-data ${MYNEDATA_TARGET}
fi
