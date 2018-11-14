FROM node:10.5-alpine

WORKDIR /usr/src/app

RUN apk add -U bash

ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install

COPY sql ./sql
COPY lib ./lib
COPY routes ./routes
COPY scripts ./scripts
COPY data ./data
COPY grammar ./grammar

COPY index.js main.js ./

CMD ["npm", "start"]
