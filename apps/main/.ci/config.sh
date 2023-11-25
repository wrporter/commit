#!/usr/bin/env bash

NAMESPACE="wesp"
APP="commit"
: "${SCOPE:?SCOPE must be set}"
APP_SCOPE="${APP}-${SCOPE}"
APP_SECRETS="${APP}_SECRETS"

IMAGE_PATH="${IMAGE_PATH:-${NAMESPACE}/${APP_SCOPE}}"

SSH_PORT_OPT="-p ${SSH_PORT}"
SCP_PORT="-P ${SSH_PORT}"
BASE_DIRECTORY="/volume1/docker"

VERSION="${GIT_COMMIT:-$(git rev-parse HEAD)}"
BUILD_ID=${BUILD_ID:="LOCAL_BUILD_ID"}
BUILD_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

GIT_REPO_URL="${GIT_URL:-$(git remote get-url origin)}"
GIT_COMMIT=${GIT_COMMIT:-$(git rev-parse HEAD)}
GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL:-$(git show -s --format="%ae" HEAD)}
GIT_BRANCH=${GIT_BRANCH:-"$(git rev-parse --abbrev-ref HEAD)"}
GIT_BRANCH_NAME=$(echo ${GIT_BRANCH} | rev | cut -d/ -f1 | rev)

function dockerBuild() {
  docker build \
    --label "app.build-info.build-time=${BUILD_DATE}" \
    --label "app.build-info.git-branch=${GIT_BRANCH_NAME}" \
    --label "app.build-info.git-commit=${GIT_COMMIT}" \
    --label "app.build-info.git-repo=${GIT_REPO_URL}" \
    --label "app.build-info.git-user-email=${GIT_AUTHOR_EMAIL}" \
    --label "app.build-info.slack-channel=${SLACK_CHANNEL}" \
    $@
}

function injectSecrets() {
  if [ ! -f "apps/${SCOPE}/.env.prod" ] -a  [ -n "${!APP_SECRETS}" ]; then
    echo "${!$(upper ${APP_SECRETS})}" > .env.prod
  fi
}

function upper() {
  echo ${1} | tr 'a-z' 'A-Z'
}