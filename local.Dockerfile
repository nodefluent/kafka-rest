FROM node:alpine

RUN apk add --upgrade --no-cache  \
    alpine-sdk \
    libc6-compat \
    bash \
    make \
    gcc \
    g++ \
    python \
    cyrus-sasl-dev \
    libressl2.5-libcrypto --repository http://dl-3.alpinelinux.org/alpine/edge/main/ --allow-untrusted \
    libressl2.5-libssl --repository http://dl-3.alpinelinux.org/alpine/edge/main/ --allow-untrusted \
    librdkafka-dev --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted \
    dumb-init --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted \
    \
    && yarn global add node-gyp nodemon

ENV BUILD_LIBRDKAFKA=0

WORKDIR /usr/src
COPY ./package.json /usr/src/package.json
RUN yarn install

VOLUME /usr/src/app
WORKDIR /usr/src/app
CMD ["nodemon", "/usr/src/app"]
