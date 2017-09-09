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
    autoremove: 30000,
    noptions: {
      //"debug": "all",
      "metadata.broker.list": "kafka:9092",
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
      "metadata.broker.list": "kafka:9092",
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

if(process.env.KAFKA_REST_METADATA_BROKER_LIST){
  config.producer.noptions["metadata.broker.list"] = process.env.KAFKA_REST_METADATA_BROKER_LIST;
  config.consumer.noptions["metadata.broker.list"] = process.env.KAFKA_REST_METADATA_BROKER_LIST;
}
if(process.env.KAFKA_REST_SECURITY_PROTOCOL){
  config.producer.noptions["security.protocol"] = process.env.KAFKA_REST_SECURITY_PROTOCOL;
  config.consumer.noptions["security.protocol"] = process.env.KAFKA_REST_SECURITY_PROTOCOL;
}
if(process.env.KAFKA_REST_SSL_KEY_LOCATION){
  config.producer.noptions["ssl.key.location"] = process.env.KAFKA_REST_SSL_KEY_LOCATION;
  config.consumer.noptions["ssl.key.location"] = process.env.KAFKA_REST_SSL_KEY_LOCATION;
}
if(process.env.KAFKA_REST_SSL_KEY_PASSWORD){
  config.producer.noptions["ssl.key.password"] = process.env.KAFKA_REST_SSL_KEY_PASSWORD;
  config.consumer.noptions["ssl.key.password"] = process.env.KAFKA_REST_SSL_KEY_PASSWORD;
}
if(process.env.KAFKA_REST_SSL_CERTIFICATE_LOCATION){
  config.producer.noptions["ssl.certificate.location"] = process.env.KAFKA_REST_SSL_CERTIFICATE_LOCATION;
  config.consumer.noptions["ssl.certificate.location"] = process.env.KAFKA_REST_SSL_CERTIFICATE_LOCATION;
}
if(process.env.KAFKA_REST_SSL_CA_LOCATION){
  config.producer.noptions["ssl.ca.location"] = process.env.KAFKA_REST_SSL_CA_LOCATION;
  config.consumer.noptions["ssl.ca.location"] = process.env.KAFKA_REST_SSL_CA_LOCATION;
}
if(process.env.KAFKA_REST_SASL_MECHANISMS){
  config.producer.noptions["sasl.mechanisms"] = process.env.KAFKA_REST_SASL_MECHANISMS;
  config.consumer.noptions["sasl.mechanisms"] = process.env.KAFKA_REST_SASL_MECHANISMS;
}
if(process.env.KAFKA_REST_SASL_USERNAME){
  config.producer.noptions["sasl.username"] = process.env.KAFKA_REST_SASL_USERNAME;
  config.consumer.noptions["sasl.username"] = process.env.KAFKA_REST_SASL_USERNAME;
}
if(process.env.KAFKA_REST_SASL_PASSWORD){
  config.producer.noptions["sasl.password"] = process.env.KAFKA_REST_SASL_PASSWORD;
  config.consumer.noptions["sasl.password"] = process.env.KAFKA_REST_SASL_PASSWORD;
}
if(process.env.KAFKA_REST_API_VERSION_REQUEST){
  config.producer.noptions["api.version.request"] = process.env.KAFKA_REST_API_VERSION_REQUEST;
  config.consumer.noptions["api.version.request"] = process.env.KAFKA_REST_API_VERSION_REQUEST;
}
if(process.env.KAFKA_REST_DEBUG){
  config.producer.noptions["debug"] = process.env.KAFKA_REST_DEBUG;
  config.consumer.noptions["debug"] = process.env.KAFKA_REST_DEBUG;
}

module.exports= config;
