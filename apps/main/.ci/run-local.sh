#!/usr/bin/env bash

source .ci/config.sh

# Add the following option when using custom environment variables in development
# --env-file .env \

docker run -it --init \
	--rm \
	--name=${APP_SCOPE} \
	--env-file .env \
	-e DATABASE_URL="postgresql://postgres:postgres@docker.host.internal:5432/commit" \
	-p 3000:3000 \
	-p 22500:22500 \
	${IMAGE_PATH}
