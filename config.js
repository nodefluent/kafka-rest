"use strict";
const debug = require("debug");

const logger = {
  debug: debug("kafka-rest:debug"),
  info: debug("kafka-rest:info"),
  warn: debug("kafka-rest:warn"),
  error: debug("kafka-rest:error")
};

const config = {
  logger,
  consumer: {
    noptions: {
      //"debug": "all",
      "metadata.broker.list": "localhost:9092",
      "group.id": "kafka-rest-group",
      "event_cb": true,
      "compression.codec": "none",
      "enable.auto.commit": false
    },
    tconf: {
    }
  },
  producer: {
    noptions: {
      //"debug": "all",
      "metadata.broker.list": "localhost:9092",
      "client.id": "kafka-rest-client",
      "event_cb": true,
      "compression.codec": "none",
    },
    tconf: {
    }
  },
  http:{
    port: 8082
  }
};

module.exports= config;
