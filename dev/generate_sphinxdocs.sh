#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    MY_DIR="$(readlink -f ${0} | xargs dirname)"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    MY_DIR="$(greadlink -f ${0} | xargs dirname)"
fi

pushd "${MY_DIR}/../doc"

# clean build folder
make clean

# creates module files
sphinx-apidoc --force -o source/ ../lib

# generates sphinx docs
make html

popd
