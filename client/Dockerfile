FROM node:10.5-alpine as build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY src src/
COPY public public/
COPY .postcssrc .babelrc index.html categories.json ./

ENV NODE_ENV=production
ENV API_URL='https://fillaripolleri.raine.dev/api'
RUN yarn parcel build --public-url '/' --no-source-maps index.html

FROM nginx:1.15-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
