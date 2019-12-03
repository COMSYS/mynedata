#!/bin/bash
MY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source ${MY_DIR}/../config_shellscripts_vagrant.sh

function running_backend {
    if [[ $(pgrep -f "celery.*lib\.backend\.tasks\.app" | wc -l) > 0 ]]; then
        return 0
    fi
    return 1
}

function print_running_backend {
    if running_backend; then
        echo "myneData backend is running."
    else
        echo "myneData backend is NOT running."
    fi
}

function start_backend {
    if running_backend; then
        echo "WARN: myneData backend already running. Not doing anything."
        exit 2
    fi
    echo "Starting myneData backend in the background."
    if [ ! -d ${MYNEDATA_LOGDIR} ]; then
        mkdir -p ${MYNEDATA_LOGDIR}
    fi
    nohup python3 ${MY_DIR}/../lib/ctl_scripts/mynedata_ctl_backend.py >> ${MYNEDATA_LOGDIR}/backend_ctl.log 2>&1 & disown -h
    echo "Done."
}

function start_backend_testmode {
    if running_backend; then
        echo "WARN: myneData backend already running. Not doing anything."
        exit 2
    fi
    echo "Starting myneData backend in the background. Using testmode."
    if [ ! -d ${MYNEDATA_LOGDIR} ]; then
        mkdir -p ${MYNEDATA_LOGDIR}
    fi
    nohup python3 ${MY_DIR}/../lib/ctl_scripts/mynedata_ctl_backend.py --testmode >> ${MYNEDATA_LOGDIR}/backend_ctl.log 2>&1 & disown -h
    echo "Done."
}

function stop_backend {
    if running_backend; then
        pgrep -f "mynedata_ctl_backend.py" | xargs kill 2> /dev/null
        pgrep -f "celery.*lib\.backend\.tasks\.app" | xargs kill 2> /dev/null
    else
        echo "WARN: No running myneData backend instance found. Not doing anything."
        exit 2
    fi
}

function restart_backend {
    stop_backend
    sleep 3
    start_backend
}

if [[ "${1}" = "start" ]]; then
    if [[ "${2}" = "testmode" ]]; then
        start_backend_testmode
    else
        start_backend
    fi
elif [[ "${1}" = "stop" ]]; then
    stop_backend
elif [[ "${1}" = "restart" ]]; then
    restart_backend
elif [[ "${1}" = "running" ]]; then
    print_running_backend
else
    echo "Usage: ${0} (start|stop|restart|running)"
    exit 1
fi
