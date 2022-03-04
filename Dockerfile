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
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
# CMD yarn deploy && echo "Test" && yarn start
CMD yarn deploy && npx prisma migrate deploy && yarn start

# Runner
FROM build as pterodactyl


ENV NODE_ENV="production"
ENV DATABASE_URL "file:/home/container/dynamica/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
WORKDIR /app
RUN useradd container -m -s /bin/bash 
USER container
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY entrypoint.sh /entrypoint.sh

CMD [ "/bin/bash", "/entrypoint.sh" ]
