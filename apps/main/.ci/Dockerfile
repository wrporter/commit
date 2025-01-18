###############################################################################
# Base image
###############################################################################
FROM node:20-alpine AS base

RUN apk update && apk upgrade --no-cache

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

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

CMD ["node", "--enable-source-maps", "--require=./server-build/opentelemetry.cjs", "./server-build/main.js"]
