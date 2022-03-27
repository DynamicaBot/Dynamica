# Deps
FROM node:16-alpine as base
WORKDIR /app
RUN apk update --no-cache
RUN apk add --no-cache python3 make gcc g++ bash curl
COPY package.json yarn.lock tsconfig.json tsup.config.js prisma ./

# Build
FROM base as build
WORKDIR /app
RUN yarn install --frozen-lockfile
COPY src ./src
RUN yarn generate
RUN yarn build

# Runner
FROM base as runner
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/app/config/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/dist dist
RUN yarn install --production --frozen-lockfile
CMD yarn deploy && npx prisma migrate deploy && yarn start

# Runner
FROM build as pterodactyl

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/home/container/dynamica/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
WORKDIR /app
RUN yarn install --production --frozen-lockfile
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/dist dist
RUN adduser -H -D container -s /bin/bash
USER container

COPY entrypoint.sh /entrypoint.sh

CMD [ "/bin/bash", "/entrypoint.sh" ]
