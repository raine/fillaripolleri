FROM node:10.5-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
COPY server/package.json server/yarn.lock ./
RUN yarn install

COPY server/sql ./sql
COPY server/lib ./lib
COPY server/routes ./routes
COPY server/scripts ./scripts
COPY server/data ./data
COPY server/grammar ./grammar

COPY server/index.js server/main.js server/nginx.conf.sigil  ./

CMD ["npm", "start"]
