#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    MY_DIR="$(readlink -f ${0} | xargs dirname)"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    MY_DIR="$(greadlink -f ${0} | xargs dirname)"
fi
source "${MY_DIR}/../config_shellscripts_vagrant.sh"

function running_bitcoin {
    # Note: This is not perfectly failsafe, but a rough way of telling whether the process is running (correctly)
    if [[ $(pgrep -f "bitcoind" | wc -l) > 0 ]]; then
        return 0
    else
        return 1
    fi
}

function print_running_bitcoin {
    if running_bitcoin; then
        echo "Bitcoin Core client is running."
    else
        echo "Bitcoin Core client is NOT running."
    fi
}

function start_bitcoin {
    if running_bitcoin; then
        echo "WARN: Bitcoin Core client already running. Not doing anything."
        exit 2
    fi
    echo "Starting Bitcoin Core client in the background."
    ${MYNEDATA_BITCOIND} ${MYNEDATA_BITCOIN_STDPARAMS} -daemon -deprecatedrpc=accounts -deprecatedrpc=signrawtransaction -timeout=100000
    echo "Done."
}

function stop_bitcoin {
    if running_bitcoin; then
        ${MYNEDATA_BITCOINCLI} ${MYNEDATA_BITCOIN_STDPARAMS} stop
    else
        echo "WARN: No running Bitcoin Core client instance found. Not doing anything."
        exit 2
    fi
}

function restart_bitcoin {
    stop_bitcoin
    start_bitcoin
}

if [[ "${1}" = "start" ]]; then
    start_bitcoin
elif [[ "${1}" = "stop" ]]; then
    stop_bitcoin
elif [[ "${1}" = "restart" ]]; then
    restart_bitcoin
elif [[ "${1}" = "running" ]]; then
    print_running_bitcoin
else
    echo "Usage: ${0} (start|stop|restart|running)"
    exit 1
fi

