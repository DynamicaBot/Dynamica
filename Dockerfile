FROM node:lts-buster-slim
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install openssl -y -qq
RUN yarn install --frozen-lockfile
CMD yarn deploy && yarn prisma migrate deploy && yarn start