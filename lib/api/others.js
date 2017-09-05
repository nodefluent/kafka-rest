"use strict";

const express = require("express");

const getRouter = (app) => {

  const router = express.Router();

  router.get("/", (req, res) => {

    let base = req.headers.host;
    base = base.startsWith("http") ? base : "http://" + base;

    res.status(200).json({
      _: app.pjson.name,
      version: app.pjson.version,
      endpoints: {
        "GET": {
          [`${base}/`]: "self",
          [`${base}/alive`]: "alive status",
          [`${base}/admin/healthcheck`]: "healthcheck",
          [`${base}/admin/health`]: "healthcheck json",
          [`${base}/brokers`]: "kafka brokers",
          [`${base}/topics`]: "kafka topics",
          [`${base}/topics/:topic`]: "kafka topic information",
          [`${base}/topics/:topic/partitions`]: "kafka topic information",
          [`${base}/consumers/:consumer/instances/:instance/records`]: "get messages",
          [`${base}/consumers/:consumer/instances/:instance/offset`]: "get offset",
          [`${base}/consumers/:consumer/instances/:instance/subscription`]: "get the current subscribed list of topics.",
          [`${base}/consumers/:consumer/instances/:instance/assignments`]: "get the list of partitions currently manually assigned to this consumer.",
        },
        "POST":{
          [`${base}/consumers/:consumer`]: "create a consumer",
          [`${base}/consumers/:consumer/instances/:instance/offset`]: "commit a list of offsets for the consumer",
          [`${base}/consumers/:consumer/instances/:instance/subscription`]: "subscribe the consumer to a topic",
          [`${base}/consumers/:consumer/instances/:instance/assignments`]: "manually assign a list of partitions to this consumer.",
          [`${base}/consumers/:consumer/instances/:instance/positions`]: "overrides the fetch offsets that the consumer will use for the next set of records to fetch.",
          [`${base}/consumers/:consumer/instances/:instance/positions/beginning`]: "seek to the first offset for each of the given partitions.",
          [`${base}/consumers/:consumer/instances/:instance/positions/end`]: "seek to the last offset for each of the given partitions.",
        },
        "DELETE":{
          [`${base}/consumers/:consumer/instances/:instance`]: "delete a consumer",
        }
      }
    });
  });

  router.get("/alive", (req, res) => {
    res.status(app.aliveStatus ? 200 : 503).end(app.aliveStatus ? "alive" : "dead");
  });

  router.get("/brokers", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#brokers
    app.kafka.getMetadata().then(metadata => {
      res.status(200).json(metadata.asBrokers());
    });
  });

  return router;
};

module.exports = getRouter;
