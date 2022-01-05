# Deps
FROM node:16-buster-slim as base
WORKDIR /app
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY prisma prisma
COPY yarn.lock .

# Build
FROM base as build
WORKDIR /app

COPY tsconfig.json .
COPY src ./src
RUN yarn install --immutable
RUN yarn build
COPY prisma/schema.prisma ./dist/schema.prisma

# Runner
FROM base as runner
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/app/config/db.sqlite"
COPY --from=build /app/dist dist
RUN yarn install --production --frozen-lockfile
CMD yarn deploy && yarn prisma migrate deploy && yarn start