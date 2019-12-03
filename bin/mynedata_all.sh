#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"

function print_running_all {
    bash ${MY_DIR}/mynedata_backend.sh running
    bash ${MY_DIR}/mynedata_api.sh running
    bash ${MY_DIR}/mynedata_frontend.sh running
}

function start_all {
    echo "Starting myneData backend, API, and frontend in the background. Use \"${0} stop\" to stop all."
    bash ${MY_DIR}/mynedata_backend.sh start
    bash ${MY_DIR}/mynedata_api.sh start
    bash ${MY_DIR}/mynedata_frontend.sh start ${1}
    echo "Done!"
}

function stop_all {
    echo "Stopping myneData backend, API, and frontend."
    bash ${MY_DIR}/mynedata_backend.sh stop
    bash ${MY_DIR}/mynedata_api.sh stop
    bash ${MY_DIR}/mynedata_frontend.sh stop
    echo "Done!"
}

function restart_all {
    echo "Restarting myneData backend, API, and frontend in the background."
    bash ${MY_DIR}/mynedata_backend.sh stop
    bash ${MY_DIR}/mynedata_api.sh stop
    bash ${MY_DIR}/mynedata_frontend.sh stop
    bash ${MY_DIR}/mynedata_backend.sh start
    bash ${MY_DIR}/mynedata_api.sh start
    bash ${MY_DIR}/mynedata_frontend.sh start ${1}
    echo "Done!"
}


if [[ "${1}" = "running" ]]; then
    print_running_all
elif [[ "${1}" = "start" ]]; then
    start_all ${2}
elif [[ "${1}" = "stop" ]]; then
    stop_all
elif [[ "${1}" = "restart" ]]; then
    restart_all ${2}
else
    echo "Usage: ${0} (start [mode]|stop|restart [mode]|running)"
    echo ""
    echo "    mode: Either --build for production build or --test for test build of the frontend"
    exit 1
fi
