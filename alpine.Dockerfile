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
    #librdkafka-dev --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted \
    dumb-init --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted

# build from source
WORKDIR /root
RUN git clone https://github.com/edenhill/librdkafka.git \
   && cd /root/librdkafka \
   && git reset --hard cf4a4c62f3a9a15c01d40fef86710be970a0190e
WORKDIR /root/librdkafka
RUN /root/librdkafka/configure
RUN make
RUN make install

ENV BUILD_LIBRDKAFKA=0

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN yarn install

CMD ["yarn", "start"]
