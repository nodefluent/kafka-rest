"use strict";

const express = require("express");

const getRouter = (app) => {

  const router = express.Router();

  router.get("/", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#topics
    app.kafka.getMetadata().then(metadata => {
      res.status(200).json(metadata.asTopicList());
    });
  });

  router.get("/:topic", (req, res) => {
    app.kafka.getMetadata([req.params.topic]).then(metadata => {
      res.status(200).json(metadata.asTopicDescription(req.params.topic));
    });
  });

  router.get("/:topic/partitions", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#partitions
    app.kafka.getMetadata([req.params.topic]).then(metadata => {
      res.status(200).json(metadata.asTopicPartitions(req.params.topic));
    });
  });

  return router;
};

module.exports = getRouter;
