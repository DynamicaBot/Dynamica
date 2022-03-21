# Deps
FROM node:16-alpine as base
WORKDIR /app
RUN apk update --no-cache
RUN apk add --no-cache python3 make gcc g++ bash
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY package.json pnpm-lock.yaml tsup.config.js tsconfig.json ./
COPY prisma prisma

# Build
FROM base as build
WORKDIR /app
COPY src ./src
RUN pnpm install
RUN pnpm build

# Runner
FROM base as runner
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL "file:/app/config/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
COPY --from=build /app/dist dist
RUN pnpm fetch --prod
RUN pnpm install -r --offline --prod
CMD ls dist && pnpm deploy && npx prisma migrate deploy && pnpm start

# Runner
FROM build as pterodactyl


ENV NODE_ENV="production"
ENV DATABASE_URL "file:/home/container/dynamica/db.sqlite"
ARG DRONE_TAG
ENV VERSION=$DRONE_TAG
WORKDIR /app
COPY --from=build /app/dist dist
RUN pnpm fetch --prod
RUN pnpm install -r --offline --prod
RUN adduser -H -D container -s /bin/bash
USER container

COPY entrypoint.sh /entrypoint.sh

CMD [ "/bin/bash", "/entrypoint.sh" ]
