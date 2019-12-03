#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../../config_shellscripts_vagrant.sh

# Download Bitcoin Core client
wget --quiet -O /tmp/bitcoin.tar.gz https://bitcoin.org/bin/bitcoin-core-0.17.1/bitcoin-0.17.1-x86_64-linux-gnu.tar.gz

# Check that ${MYNEDATA_DIR} is set up properly
if [ ! -d "${MYNEDATA_BITCOIN_DIR}" ]; then
    echo "    ${MYNEDATA_BITCOIN_DIR} does not exist, creating it."
    mkdir -p ${MYNEDATA_BITCOIN_DIR}
    if [ $? -ne 0 ]; then
        echo "    Permission was denied, creating via sudo."
        sudo mkdir -p ${MYNEDATA_BITCOIN_DIR}
        if [[ "$(hostname)" = "mynedata-vagrant" ]]; then
            sudo chown -R vagrant:vagrant ${MYNEDATA_DIR}  # We now build the frontend as root during setup in Vagrant
        else
            sudo chown -R $(whoami):$(whoami) ${MYNEDATA_DIR}
        fi
    fi
    echo "Created ${MYNEDATA_BITCOIN_DIR}."
elif [ "$(stat -c %U ${MYNEDATA_BITCOIN_DIR})" != "$(whoami)" ]; then
    echo "    ${MYNEDATA_BITCOIN_DIR} already exists and is not owned by $(whoami). Exiting."
    exit 1
fi

# Extract Bitcoin Core client to standard location
tar -zxf /tmp/bitcoin.tar.gz -C ${MYNEDATA_BITCOIN_DIR} --strip 1

# Link bitcoin.conf to standard location
ln -s ${MY_DIR}/bitcoin.conf ${MYNEDATA_BITCOIN_CONFIG}

# Create datadir for Bitcoin
mkdir -p ${MYNEDATA_BITCOIN_DATADIR}
