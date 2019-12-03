#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../config_shellscripts_vagrant.sh

function running_api {
    # Note: This is not perfectly failsafe, but a rough way of telling whether the process is running (correctly)
    if [[ $(pgrep -f "mynedata_ctl_api.py" | wc -l) > 0 ]]; then
        return 0
    else
        return 1
    fi
}

function print_running_api {
    if running_api; then
        echo "myneData API is running."
    else
        echo "myneData API is NOT running."
    fi
}

function start_api {
    if running_api; then
        echo "WARN: myneData API already running. Not doing anything."
        exit 2
    fi
    echo "Starting myneData API in the background."
    if [ ! -d ${MYNEDATA_LOGDIR} ]; then
        mkdir -p ${MYNEDATA_LOGDIR}
    fi
    nohup python3 ${MY_DIR}/../lib/ctl_scripts/mynedata_ctl_api.py >> ${MYNEDATA_LOGDIR}/api.log 2>&1 & disown -h
    echo "Done."
}

function stop_api {
    if running_api; then
        pgrep -f "mynedata_ctl_api.py" | xargs kill 2> /dev/null
    else
        echo "WARN: No running myneData API instance found. Not doing anything."
        exit 2
    fi
}

function restart_api {
    stop_api
    start_api
}

if [[ "${1}" = "start" ]]; then
    start_api
elif [[ "${1}" = "stop" ]]; then
    stop_api
elif [[ "${1}" = "restart" ]]; then
    restart_api
elif [[ "${1}" = "running" ]]; then
    print_running_api
else
    echo "Usage: ${0} (start|stop|restart|running)"
    exit 1
fi
