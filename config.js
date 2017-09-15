"use strict";
const debug = require("debug");

const logger = {
  debug: debug("kafka-rest:debug"),
  info: debug("kafka-rest:info"),
  warn: debug("kafka-rest:warn"),
  error: debug("kafka-rest:error")
};

const host = "kafka";

const config = {
  logger,
  consumer: {
    autoremove: 30000,
    noptions: {
      //"debug": "all",
      "metadata.broker.list": `${host}:9092`,
      "group.id": "kafka-rest-group-test",
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
      "metadata.broker.list": `${host}:9092`,
      "client.id": "kafka-rest-client-test",
      "event_cb": true,
      "compression.codec": "none",
    },
    tconf: {
    }
  },
  http:{
    port: 8082
  },
  zookeeper: {
    host: "localhost:2181",
    timeout: 20000
  }
};

Object.keys(process.env).forEach((env)=>{
  if(env === "KAFKA_REST_HTTP_PORT"){
    config.http.port = process.env.KAFKA_REST_HTTP_PORT;
  } else if(env.startsWith("KAFKA_REST_CONSUMER_")){
    config.consumer.noptions[env.slice(20).toLowerCase().replace(/_/g, ".")] = process.env[env];
  } else if(env.startsWith("KAFKA_REST_PRODUCER_")){
    config.producer.noptions[env.slice(20).toLowerCase().replace(/_/g, ".")] = process.env[env];
  } else if(env.startsWith("KAFKA_REST_") && !env.startsWith("KAFKA_REST_UI_")){
    config.consumer.noptions[env.slice(11).toLowerCase().replace(/_/g, ".")] = process.env[env];
    config.producer.noptions[env.slice(11).toLowerCase().replace(/_/g, ".")] = process.env[env];
  }
});

module.exports= config;
