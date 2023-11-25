#!/usr/bin/env bash

set -e
source .ci/config.sh

echo "-- ${0} start..."
echo "-- Building docker image for production"

dockerBuild \
    --file .ci/Dockerfile \
    --build-arg APP_ID=${APP} \
    --build-arg BUILD_SHA=${VERSION} \
    --build-arg BUILD_BRANCH=${GIT_BRANCH} \
    --build-arg BUILD_DATE=${BUILD_DATE} \
    --tag "${IMAGE_PATH}:${VERSION}" \
    --tag "${IMAGE_PATH}:latest" \
    .

echo "-- ${0} complete!"
