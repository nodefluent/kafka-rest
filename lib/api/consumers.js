"use strict";

const express = require("express");

const getRouter = (app) => {

  const router = express.Router();

  router.post("/:consumer", (req, res) => {
    // http://docs.confluent.io/current/kafka-rest/docs/api.html#consumers
    // headers: "Content-Type: application/vnd.kafka.v2+json"
    // request body: {"name": "my_consumer_instance", "format": "json", "auto.offset.reset": "earliest"}

    const body = req.body;

    if(!body || !body.name){
      return res.status(400).end("missing body or body.name");
    }

    if(body.format !== "json"){
      return res.status(400).end("only json format is supported.");
    }

    const earliestElseLatest = body["auto.offset.reset"] === "earliest" ? true : false;
    app.kafka.getConsumer(body.name, [], earliestElseLatest, body.maxWindowSize ? body.maxWindowSize : 1000).then(() => {
      res.status(200).json({
        "instance_id":body.name,
        "base_uri":`/consumers/${body.name}/instances/${body.name}`
      });
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  router.post("/:consumer/instances/:instance/subscription", (req, res) => {
    // request body: {"topics":["test"]}

    if(!app.kafka.consumers[req.params.instance]){
      return res.status(404).end("consumer instance does not exist.");
    }

    const body = req.body;

    if(!body || !body.topics){
      return res.status(400).end("missing body or body.name or body.topics");
    }

    app.kafka.getConsumer(body.name).then(consumer => {
      return consumer.adjustSubscription(body.topics).then(() => {
        res.status(204).end();
      });
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  router.get("/:consumer/instances/:instance/records", (req, res) => {
    // headers: "Content-Type: application/vnd.kafka.v2+json"

    const consumer = app.kafka.consumers[req.params.instance];

    if(!consumer){
      return res.status(404).end("consumer instance does not exist.");
    }

    res.status(200).json(consumer.getMessages());
  });

  router.delete("/:consumer/instances/:instance", (req, res) => {
    app.kafka.removeConsumer(req.params.instance);
    res.status(204).end();
  });

  router.post("/:consumer/instances/:instance/positions", (req, res) => {
    // request body: {"offsets": [{"topic": "test","partition": 0,"offset": 1}]}
    //TODO
    res.status(204).end();
  });

  router.post("/:consumer/instances/:instance/positions/beginning", (req, res) => {
    // request body: {"partitions": [{"topic": "test","partition": 0}]}
    //TODO
    res.status(200).json(req.body);
  });

  router.post("/:consumer/instances/:instance/positions/end", (req, res) => {
    // request body: {"partitions": [{"topic": "test","partition": 0}]}
    //TODO
    res.status(200).json(req.body);
  });

  router.post("/:consumer/instances/:instance/assignments", (req, res) => {
    // request body: {"topics":["test"]}
    //TODO
    res.status(200).json({
      "partitions": [
      /* {
          "topic": "test",
          "partition": 0
       } */
      ]
    });
  });

  return router;
};

module.exports = getRouter;
