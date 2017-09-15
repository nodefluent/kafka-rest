"use strict";

const express = require("express");

const getRouter = (app) => {

  const router = express.Router();

  router.get("/", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#topics
    app.kafka.getMetadata().then(metadata => {
      app.getLogger().info("Returning metadata.");
      res.status(200).json(metadata.asTopicList());
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  router.get("/:topic", (req, res) => {
    app.kafka.getMetadata([req.params.topic]).then(metadata => {
      app.getLogger().info("Returning topic metadata.");

      const description = metadata.asTopicDescription(req.params.topic);
      app.zookeeper.getTopicConfiguration(req.params.topic).then(configs => {
        description.configs = configs.config; // {version, config}
        res.status(200).json(description);
      }).catch(() => {
        res.status(200).json(description); //fallback without topic config
      });
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  router.get("/:topic/partitions", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#partitions
    app.kafka.getMetadata([req.params.topic]).then(metadata => {
      app.getLogger().info("Returning partition metadata.");
      res.status(200).json(metadata.asTopicPartitions(req.params.topic));
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  return router;
};

module.exports = getRouter;
