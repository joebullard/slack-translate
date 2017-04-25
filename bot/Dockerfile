FROM node:7.9-alpine

MAINTAINER Joe Bullard <joebullard>

WORKDIR /src

COPY package.json /src/package.json

RUN npm install

COPY . /src/

CMD ["node", "/src/index.js"]
