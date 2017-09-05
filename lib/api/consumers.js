"use strict";

const express = require("express");

const getRouter = () => {

  const router = express.Router();

  router.post("/:consumer", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#consumers
    // headers: "Content-Type: application/vnd.kafka.v2+json"
    // request body: {"name": "my_consumer_instance", "format": "json", "auto.offset.reset": "earliest"}
    res.status(204).json({
      "instance_id":"my_consumer_instance",
      "base_uri":"http://node-kafka-rest:8082/consumers/my_json_consumer/instances/my_consumer_instance"
    });
  });

  router.post("/:consumer/instances/:instance/subscription", (req, res) => {
    // request body: {"topics":["test"]}
    res.status(204).end();
  });

  router.post("/:consumer/instances/:instance/positions", (req, res) => {
    // request body: {"offsets": [{"topic": "test","partition": 0,"offset": 1}]}
    res.status(204).end();
  });

  router.post("/:consumer/instances/:instance/positions/beginning", (req, res) => {
    // request body: {"partitions": [{"topic": "test","partition": 0}]}
    res.status(204).json({
      "partitions": [
        {
          "topic": "test",
          "partition": 0
        }
      ]
    });
  });

  router.post("/:consumer/instances/:instance/positions/end", (req, res) => {
    // request body: {"partitions": [{"topic": "test","partition": 0}]}
    res.status(204).json({
      "partitions": [
        {
          "topic": "test",
          "partition": 0
        }
      ]
    });
  });

  router.post("/:consumer/instances/:instance/assignments", (req, res) => {
    // request body: {"topics":["test"]}
    res.status(204).json({
      "partitions": [
        {
          "topic": "test",
          "partition": 0
        }
      ]
    });
  });

  router.get("/:consumer/instances/:instance/records", (req, res) => {
    // headers: "Content-Type: application/vnd.kafka.v2+json"
    res.status(200).json([{
      "key":1,
      "value":{"foo":"bar"},
      "partition":0,
      "offset":0,
      "topic":"test"
    }]);
  });

  router.delete("/:consumer/instances/:instance", (req, res) => {
    res.status(204).end();
  });

  return router;
};

module.exports = getRouter;
