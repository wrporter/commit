#!/usr/bin/env bash

set -ex
source .ci/config.sh

echo "-- ${0} start..."
echo "-- Building docker image for production"

injectSecrets commit

echo "-- ${0} complete!"
