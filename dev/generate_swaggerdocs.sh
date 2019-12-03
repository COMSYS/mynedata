#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    MY_DIR="$(readlink -f ${0} | xargs dirname)"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    MY_DIR="$(greadlink -f ${0} | xargs dirname)"
fi

if [[ ! -f swagger-codegen-cli.jar ]]; then
	echo "Downloading swagger-codegen..."
	wget http://central.maven.org/maven2/io/swagger/swagger-codegen-cli/2.3.1/swagger-codegen-cli-2.3.1.jar -O "${MY_DIR}/swagger-codegen-cli.jar"
fi

rm -rf "${MY_DIR}/../doc/api"
echo "Generating swaggerdocs..."
java -jar "${MY_DIR}/swagger-codegen-cli.jar" generate -l html -i "${MY_DIR}/../lib/api/api.yaml" -o "${MY_DIR}/../doc/api/"
