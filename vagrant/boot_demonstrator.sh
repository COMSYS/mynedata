#!/bin/bash

vm_name="mynedata_platform"
status="$(vagrant status | grep ${vm_name} | cut -f 2- -d" " | sed 's/^ *//g' | sed 's/ ([^)]*)//g')"

if [[ "${status}" == "running" ]]; then
    echo "Warning: VM ${vm_name} is already running. Not starting it."
else
    if [[ "${status}" == "not created" ]]; then
        echo "Warning: VM ${vm_name} is not yet created. Will provision first. This may take some time."
        vagrant up
        echo "Done! VM provisioned and running."
    else
        printf "Starting VM ${vm_name}..."
        vagrant up
        echo "done!"
    fi
fi

echo -n "Stopping myneData services (if running)..."
vagrant ssh -c "cd /mynedata/bin; bash ./mynedata_all.sh stop"
echo "done!"

echo -n "Installing available data sources..."
vagrant ssh -c "cd /mynedata/dev; python3 install_data_sources.py"
echo "done!"

echo -n "Starting myneData services..."
vagrant ssh -c "cd /mynedata/bin; bash ./mynedata_all.sh start --build"

echo
echo "Finished!"
