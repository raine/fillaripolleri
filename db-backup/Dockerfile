FROM alpine:3.12.0

RUN apk add -U --no-cache --virtual .build-deps
RUN apk add -U bash make curl openssh git postgresql-client groff less aws-cli
RUN apk --purge -v del 
RUN rm /var/cache/apk/*
