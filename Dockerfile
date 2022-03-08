# Deps
FROM node:16-alpine as base
WORKDIR /app
RUN apk update --no-cache
RUN apk add --no-cache python3 make gcc g++ bash
COPY package.json .
COPY prisma prisma
COPY yarn.lock .
COPY tsup.config.js .
COPY tsconfig.json .

# Build
FROM base as build
WORKDIR /app
COPY src ./src
RUN yarn install
RUN yarn cache clean
RUN yarn build:tsup

# Runner
FROM base as runner
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/app/config/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
COPY --from=build /app/dist dist
RUN yarn install --production --link-duplicates
RUN yarn cache clean
# CMD yarn deploy && echo "Test" && yarn start
CMD ls dist && yarn deploy && npx prisma migrate deploy && yarn start

# Runner
FROM build as pterodactyl


ENV NODE_ENV="production"
ENV DATABASE_URL "file:/home/container/dynamica/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
WORKDIR /app
COPY --from=build /app/dist dist
RUN yarn install --production --link-duplicates
RUN yarn cache clean
RUN adduser -H -D container -s /bin/bash
USER container

COPY entrypoint.sh /entrypoint.sh

CMD [ "/bin/bash", "/entrypoint.sh" ]
