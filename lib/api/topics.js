"use strict";

const express = require("express");

const getRouter = () => {

  const router = express.Router();

  router.get("/", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#topics
    res.status(200).json(["test"]);
  });

  router.get("/:topic", (req, res) => {
    res.status(200).json({
      "name":"test",
      "configs":{
        "cleanup.policy": "compact"
      },
      "partitions":[{
        "partition":0,
        "leader":0,
        "replicas":[{
          "broker":0,
          "leader":true,
          "in_sync":true
        }]
      }]
    });
  });

  router.get("/:topic/partitions", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#partitions
    res.status(200).json([{
      "partition":0,
      "leader":0,
      "replicas":[{
        "broker":0,
        "leader":true,
        "in_sync":true
      }]
    }]);
  });

  return router;
};

module.exports = getRouter;
