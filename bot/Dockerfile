FROM node:10.15-alpine AS build

MAINTAINER Joe Bullard <joebullard>

WORKDIR /app
COPY package.json /app/package.json
RUN yarn install --production -s


FROM node:10.15-alpine

WORKDIR /app
COPY ./src ./src
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

USER node
CMD ["node", "/app/src/index.js"]
