FROM node:lts-buster-slim
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install openssl -y -qq
RUN yarn install --frozen-lockfile
RUN yarn prisma migrate deploy
CMD yarn start