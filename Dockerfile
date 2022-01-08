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
COPY scripts ./scripts
RUN yarn install --immutable
RUN yarn build

# Runner
FROM base as runner
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/app/config/db.sqlite"
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
# CMD yarn deploy && echo "Test" && yarn start
CMD yarn deploy && npx prisma migrate deploy && yarn start