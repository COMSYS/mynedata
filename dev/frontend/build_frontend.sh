#! /bin/bash

MY_DIR="$(readlink -f ${0} | xargs dirname)"
source ${MY_DIR}/../../config_shellscripts_vagrant.sh

function check_angular_installed {
    echo -n "Checking if Angular and Node.js are installed on this system..."

    if [ `type -P node | grep -c "/usr/bin/node"` -eq 0 ] || [ `type -P npm | grep -c "/usr/bin/npm"` -eq 0 ]; then
        echo "no."
        echo "Either Node.js, NPM or Angular CLI are not installed. Running 'sudo install_angular.sh'"
        bash ${MY_DIR}/install_angular.sh
    else
        echo "yes."
    fi

}

function deploy_frontend_files {
    echo "Copying frontend files to ${MYNEDATA_FRONTEND_DIR}."

    if [ ! -d "${MYNEDATA_FRONTEND_DIR}" ]; then
        echo "    ${MYNEDATA_FRONTEND_DIR} does not exist, creating it."
        mkdir -p ${MYNEDATA_FRONTEND_DIR}
        if [ $? -ne 0 ]; then
            echo "    Permission was denied, creating via sudo."
            sudo mkdir -p ${MYNEDATA_FRONTEND_DIR}
            if [[ "$(hostname)" = "mynedata-vagrant" ]]; then
                sudo chown -R vagrant:www-data ${MYNEDATA_DIR}  # We now build the frontend as root during setup in Vagrant
            else
                sudo chown -R $(whoami):www-data ${MYNEDATA_DIR}
            fi
        fi
        echo "Created ${MYNEDATA_FRONTEND_DIR}."
    elif [ "$(stat -c %U ${MYNEDATA_FRONTEND_DIR})" != "$(whoami)" ]; then
        echo "    ${MYNEDATA_FRONTEND_DIR} already exists and is not owned by $(whoami). Exiting."
        exit 1
    fi

    rsync --quiet -avP --exclude "node_modules" --exclude "dist" --exclude "package-lock.json" ${MY_DIR}/../../frontend/ ${MYNEDATA_FRONTEND_DIR}/

    if [ $? -eq 0 ]; then
        echo "Copied frontend files sucessfully."
    else
        echo "ERROR: Could not copy frontend files. Exiting."
        exit 1
    fi

    # Symlinks for Angular files that define the API endpoint
    # Use files corresponding to deployment scenario (native or vagrant)

    # Backup non-symlink files if they exist
    if [ -f ${MYNEDATA_FRONTEND_DIR}/src/environments/environment.prod.ts ]; then
        mv ${MYNEDATA_FRONTEND_DIR}/src/environments/environment.prod.ts ${MYNEDATA_FRONTEND_DIR}/src/environments/environment.prod.ts.bak
    fi

    # Create respective symlinks
    if [[ "$(hostname)" = "mynedata-vagrant" ]]; then
        ln -s ${MY_DIR}/environment.vagrant.prod.ts ${MYNEDATA_FRONTEND_DIR}/src/environments/environment.prod.ts
    else
        ln -s ${MY_DIR}/environment.native.prod.ts ${MYNEDATA_FRONTEND_DIR}/src/environments/environment.prod.ts
    fi
}

function build_production_frontend {
    echo "Building production version in ${MYNEDATA_FRONTEND_BUILD}."

    if [ ! -d "${MYNEDATA_FRONTEND_BUILD}" ]; then
        echo "    ${MYNEDATA_FRONTEND_BUILD} does not exist, creating it."
        mkdir -p ${MYNEDATA_FRONTEND_BUILD}
        if [ $? -ne 0 ]; then
            echo "    Permission was denied, creating via sudo."
            sudo mkdir -p ${MYNEDATA_FRONTEND_BUILD}
            if [[ "$(hostname)" = "mynedata-vagrant" ]]; then
                sudo chown vagrant:www-data ${MYNEDATA_FRONTEND_BUILD}  # We now build the frontend as root during setup in Vagrant
            else
                sudo chown $(whoami):www-data ${MYNEDATA_FRONTEND_BUILD}
            fi
        fi
        echo "Created ${MYNEDATA_FRONTEND_BUILD}."
    fi

    # Check roughly whether the frontend folder has changed since last build,
    # skip building  otherwise.
    if [ ! -e ${MYNEDATA_DIR}/.last_frontend_build ]; then
        echo "INFO: This seems to be the first frontend build."
        echo -n "last_frontend_build=0" > ${MYNEDATA_DIR}/.last_frontend_build
    fi
    source ${MYNEDATA_DIR}/.last_frontend_build
    if [[ "${1}" == "--force" || $(stat -c "%Y" ${MYNEDATA_FRONTEND_DIR}) > ${last_frontend_build} ]]; then
        if [[ "${1}" == "--force" ]]; then
            echo "INFO: Rebuilding was enforced."
        else
            echo "INFO: Recognized changes to frontend data. Rebuilding the production build."
        fi
        pushd "${MYNEDATA_FRONTEND_DIR}"
        npm install
        npm update
        ng build --prod --output-path=${MYNEDATA_FRONTEND_BUILD}
        echo -n "last_frontend_build=$(stat -c "%Y" ${MYNEDATA_FRONTEND_DIR})" > ${MYNEDATA_DIR}/.last_frontend_build
        popd

        if [ $? -eq 0 ]; then
            echo "Building complete."
        else
            echo "ERROR: Build failed. Exiting."
            exit 1
        fi
    else
        echo "INFO: No changes to the frontend were detected. Avoiding to rebuild."
    fi
}

check_angular_installed

if [[ "${1}" == "--build" || "${1}" == "--force" ]]; then
    deploy_frontend_files
    if [[ "${1}" == "--build" ]]; then
        build_production_frontend ${2}
    else
        build_production_frontend ${1}
    fi
elif [[ "${1}" == "--test" ]]; then
    deploy_frontend_files
else
    echo "USAGE: ${0} [mode]"
    echo ""
    echo "mode:"
    echo "    --build (default): Fully deploy frontend, to be integrated with nginx."
    echo "    --test: Just copy files to be used with the Angular testing server."
    exit 0
fi

