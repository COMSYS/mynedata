#!/bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../config_shellscripts_vagrant.sh

function running_frontend_build {
    if [[ $(service --status-all | grep nginx | grep "+" | wc -l) > 0 ]]; then
        return 0
    else
        return 1
    fi
}

function running_frontend_test {
    if [[ $(pgrep -f "ng serve" | wc -l) > 0 ]]; then
        return 0
    else
        return 1
    fi
}

function running_frontend {
    if running_frontend_build || running_frontend_test; then
        return 0
    else
        return 1
    fi
}

function print_running_frontend {
    if running_frontend; then
        echo "myneData frontend is running."
    else
        echo "myneData frontend is NOT running."
    fi
}

function start_frontend {
    if running_frontend; then
        echo "WARN: myneData frontend already running. Not doing anything."
        exit 2
    fi

    if [[ "${1}" = "--test" ]]; then
        mode="test"
    elif [[ "${1}" = "--build" || "${1}" = "" ]]; then
        mode="build"
    elif [[ "${1}" = "--recompile" ]]; then
        rm ${MYNEDATA_DIR}/.last_frontend_build
        mode="build"
    else
        echo "ERROR: Starting mode ${1} for myneData frontend not recognized. Exiting."
        exit 1
    fi

    echo "Rebuilding myneData frontend before starting."
    bash ${MY_DIR}/../dev/frontend/build_frontend.sh --${mode}
    echo "Done."

    if [[ "${mode}" == "test" ]]; then
        echo "Starting test build of myneData frontend in the background."
        pushd ${MYNEDATA_FRONTEND_DIR}
        npm install
        if [ ! -d ${MYNEDATA_LOGDIR} ]; then
            mkdir -p ${MYNEDATA_LOGDIR}
        fi
        nohup ng serve --port 14201 --host 0.0.0.0 --proxy-config proxy.conf.json >>${MYNEDATA_LOGDIR}/frontend_test.log 2>&1 & disown -h
        popd
        echo "Done."
    else
        echo "Starting production build of myneData frontend as service."
        sudo service nginx start
        echo "Done."
    fi
}

function stop_frontend {
    # Check whether production build or test build is running, stop accordingly.
    if running_frontend_build; then
        # nginx service runs (serving production build)
        echo "Shutting down production build."
        sudo service nginx stop
        if [[ $? != 0 ]]; then
            echo "ERROR: Something went shutting down production build."
            exit 1
        fi
        echo "Done."
    elif running_frontend_test; then
        # Test build runs in background
        echo "Shutting down test build."
        pgrep -f "ng serve" | xargs kill
        if [[ $? != 0 ]]; then
            echo "ERROR: Something went shutting down test build."
            exit 1
        fi
        echo "Done."
    else
        # Some unknown state
        echo "WARN: No running frontend instance found. Not doing anything."
        exit 2
    fi
}

function restart_frontend {
    stop_frontend
    start_frontend ${1}
}

if [[ "${1}" = "start" ]]; then
    start_frontend ${2}
elif [[ "${1}" = "stop" ]]; then
    stop_frontend
elif [[ "${1}" = "restart" ]]; then
    restart_frontend ${2}
elif [[ "${1}" = "running" ]]; then
    print_running_frontend
else
    echo "Usage: ${0} (start [mode]|stop|restart [mode]|running)"
    echo ""
    echo "    mode: Either --build for production build or --test for test build"
    exit 1
fi
