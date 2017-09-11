"use strict";

const express = require("express");
const debug = require("debug")("kafka-rest:api:consumer");

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

    debug("consumer create request:", body);

    const opts = {
      clientId: req.params.consumer,
      consumerGroup: body.name
    };

    const earliestElseLatest = body["auto.offset.reset"] === "earliest" ? true : false;
    app.kafka.getConsumer(req.params.consumer, [], earliestElseLatest, body.maxWindowSize ? body.maxWindowSize : 100, body.format, opts).then(() => {

      app.getLogger().info(`Created consumer ${req.params.consumer}.`);

      res.status(200).json({
        "instance_id":body.name,
        "base_uri":`/consumers/${req.params.consumer}/instances/${body.name}`
      });
    }).catch(error => {
      res.status(500).end(error.message);
    });
  });

  router.post("/:consumer/instances/:instance/subscription", (req, res) => {
    // request body: {"topics":["test"]}

    if(!app.kafka.consumers[req.params.consumer]){
      return res.status(404).end("consumer instance does not exist.");
    }

    if(!req.body || !req.body.topics){
      return res.status(400).end("missing body or body.name or body.topics");
    }

    subscribeAndResponce(app, req, res, req.body.topics);
  });

  router.get("/:consumer/instances/:instance/records", async (req, res) => {
    // headers: "Content-Type: application/vnd.kafka.v2+json"

    const consumer = app.kafka.consumers[req.params.consumer];

    if(!consumer){
      return res.status(404).end("consumer consumer does not exist.");
    }

    //prevent further requests for avro messages
    //this 404 is a hack to prevent further calls
    //(it is actually only returned if the avro schema registry cannot be reached)
    if(req.get("Accept") === "application/vnd.kafka.avro.v2+json"){
      return res.status(404).end("avro format does not supported");
    }

    const tries = 3;
    const messages = await consumer.getMessages(req.query.timeout/tries, tries, req.query.max_bytes);
    app.getLogger().info(`Getting ${messages.length} for ${req.params.consumer}.`);
    res.status(200).json(messages);
  });

  router.delete("/:consumer/instances/:instance", (req, res) => {
    app.getLogger().info(`Removing ${req.params.consumer}.`);
    app.kafka.removeConsumer(req.params.consumer);
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
    // res.status(200).json(req.body);

    if(!app.kafka.consumers[req.params.consumer]){
      return res.status(404).end("consumer instance does not exist.");
    }

    if(!req.body || !req.body.partitions || req.body.partitions.length === 0){
      return res.status(200).json();
    }

    const topics = getTopicsFromPartitions(req.body.partitions);
    subscribeAndResponce(app, req, res, topics);
  });

  router.post("/:consumer/instances/:instance/positions/end", (req, res) => {
    // request body: {"partitions": [{"topic": "test","partition": 0}]}
    //TODO
    // res.status(200).json(req.body);
    if(!app.kafka.consumers[req.params.consumer]){
      return res.status(404).end("consumer instance does not exist.");
    }

    if(!req.body || !req.body.partitions || req.body.partitions.length === 0){
      return res.status(200).json();
    }

    const topics = getTopicsFromPartitions(req.body.partitions);
    subscribeAndResponce(app, req, res, topics, false);
  });

  router.post("/:consumer/instances/:instance/assignments", (req, res) => {
    // request body: {"topics":["test"]}
    //TODO
    res.status(200).json();
    /*res.status(200).json({
      "partitions": [
       {
          "topic": "test",
          "partition": 0
       }
      ]
    });*/
  });

  return router;
};

const subscribeAndResponce = (app, req, res, topics, earliestElseLatest = true)=>{
  app.kafka.getConsumer(req.params.consumer, earliestElseLatest, 100).then(consumer => {
    return consumer.adjustSubscription(topics).then(() => {
      app.getLogger().info(`${req.params.consumer} subscribing to ${topics.join(", ")}.`);
      res.status(204).end();
    });
  }).catch(error => {
    res.status(500).end(error.message);
  });
};

const getTopicsFromPartitions = (partitions)=>{
  return partitions.reduce((topics, partition)=>{
    if(partition && partition.topic && topics.indexOf(partition.topic) === -1){
      topics.push(partition.topic);
    }
    return topics;
  },[]);
};

module.exports = getRouter;
