"use strict";
const debug = require("debug");

const logger = {
  debug: debug("node-kafka-rest:debug"),
  info: debug("node-kafka-rest:info"),
  warn: debug("node-kafka-rest:warn"),
  error: debug("node-kafka-rest:error")
};

module.exports= {
  logger,
  noptions: {
    //"debug": "all",
    //"metadata.broker.list": "localhost:9092", // for local development with kafka-setup
    "metadata.broker.list": "kafka:9092",
    "group.id": "node-kafka-rest",
    "event_cb": true,
    "compression.codec": "none",
  },
  http:{
    port: 8082
  }
};
