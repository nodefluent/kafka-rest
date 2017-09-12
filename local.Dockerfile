FROM node:8

RUN mkdir -p /usr/src/app \
  && apt-get update && apt-get install -y build-essential python librdkafka-dev libsasl2-dev libsasl2-modules openssl \
  && apt-get autoremove -y && apt-get autoclean -y \
  && rm -rf /var/lib/apt/lists/* \
  && yarn global add nodemon

WORKDIR /usr/src
COPY ./package.json /usr/src/package.json
RUN yarn install

VOLUME /usr/src/app
WORKDIR /usr/src/app
CMD ["nodemon", "/usr/src/app"]
