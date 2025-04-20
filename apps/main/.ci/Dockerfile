###############################################################################
# Base image
###############################################################################
FROM node:22-alpine AS base

WORKDIR /app
RUN apk update && apk upgrade --no-cache
RUN npm config set update-notifier false

###############################################################################
# Install dependencies and build application
###############################################################################
FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --loglevel=warn

COPY . .
RUN npm run ci

RUN npm prune --omit=dev

###############################################################################
# Export test results
###############################################################################
FROM scratch AS test-results

WORKDIR /

COPY --from=builder /app/junit.xml ./
COPY --from=builder /app/coverage/cobertura-coverage.xml ./

###############################################################################
# Production image
###############################################################################
FROM base AS production

WORKDIR /app

# Build version metadata
ARG APP_ID
ARG BUILD_BRANCH
ARG BUILD_SHA
ARG BUILD_VERSION
ARG BUILD_DATE
ENV APP_ID=$APP_ID
ENV BUILD_BRANCH=$BUILD_BRANCH
ENV BUILD_SHA=$BUILD_SHA
ENV BUILD_VERSION=$BUILD_VERSION
ENV BUILD_DATE=$BUILD_DATE

ENV NODE_ENV=production

COPY --from=builder --chown=node /app/package*.json .
COPY --from=builder --chown=node /app/node_modules ./node_modules
COPY --from=builder --chown=node /app/build ./build
COPY --from=builder --chown=node /app/server-build ./server-build
COPY --from=builder --chown=node /app/migrations ./migrations

USER node

CMD ["node", "--enable-source-maps", "--require=./server-build/opentelemetry.cjs", "./server-build/main.js"]
