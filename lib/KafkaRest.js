"use strict";

const EventEmitter = require("events");
const express = require("express");
const bodyParser = require("body-parser");
const pjson = require("./../package.json");

class KafkaRest extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;

    this.aliveStatus = 1;
    this.webApp = express();
    this.webServer = this._buildWebServer(this.config.http);
  }

  run() {
    this.config.logger.info("Server running");
  }

  _buildWebServer(config = null) {

    if (config === null) {
      throw new Error("Config not found");
    }

    const { port, middlewares } = config;

    this.webApp.use(bodyParser.text());
    this.webApp.use(bodyParser.json());

    this.webApp.use((req, res, next) => {
      super.emit("request", {
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      next();
    });

    this.webApp.get("/", (req, res) => {
      let base = req.headers.host;
      base = base.startsWith("http") ? base : "http://" + base;
      res.status(200).json({
        _: pjson.name,
        version: pjson.version,
        endpoints: {
          "GET": {
            [`${base}/`]: "self",
            [`${base}/alive`]: "alive status",
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

    this.webApp.get("/alive", (req, res) => {
      res.status(this.aliveStatus ? 200 : 503).end(this.aliveStatus ? "alive" : "dead");
    });

    this.webApp.get("/topics", (req, res) => {
      // http://docs.confluent.io/current/kafka-rest/docs/api.html#topics
      res.status(200).json(["__consumer_offsets", "test"]);
    });

    this.webApp.get("/topics/:topic", (req, res) => {
      res.status(200).json({
        "name":"test",
        "configs":{},
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

    this.webApp.get("/topics/:topic/partitions", (req, res) => {
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

    this.webApp.get("/brokers", (req, res) => {
      // http://docs.confluent.io/current/kafka-rest/docs/api.html#brokers
      res.status(200).json({"brokers": [1, 2, 3]});
    });

    this.webApp.post("/consumers/:consumer", (req, res) => {
      // http://docs.confluent.io/current/kafka-rest/docs/api.html#consumers
      // headers: "Content-Type: application/vnd.kafka.v2+json"
      // body: {"name": "my_consumer_instance", "format": "json", "auto.offset.reset": "earliest"}
      res.status(204).json({
        "instance_id":"my_consumer_instance",
        "base_uri":"http://localhost:8082/consumers/my_json_consumer/instances/my_consumer_instance"
      });
    });

    this.webApp.post("/consumers/:consumer/instances/:instance/subscription", (req, res) => {
      // body: {"topics":["test"]}
      res.status(204).end();
    });

    this.webApp.post("/consumers/:consumer/instances/:instance/positions/beginning", (req, res) => {
      // body: {"topics":["test"]}
      res.status(204).json({
        "partitions": [
          {
            "topic": "test",
            "partition": 0
          },
          {
            "topic": "test",
            "partition": 1
          }
        ]
      });
    });

    this.webApp.post("/consumers/:consumer/instances/:instance/assignments", (req, res) => {
      // body: {"topics":["test"]}
      res.status(204).json({
        "partitions": [
          {
            "topic": "test",
            "partition": 0
          },
          {
            "topic": "test",
            "partition": 1
          }
        ]
      });
    });

    this.webApp.get("/consumers/:consumer/instances/:instance/records", (req, res) => {
      // headers: "Content-Type: application/vnd.kafka.v2+json"
      res.status(200).json([{
        "key":1,
        "value":{"foo":"bar"},
        "partition":0,
        "offset":0,
        "topic":"test"
      }]);
    });

    this.webApp.delete("/consumers/:consumer/instances/:instance", (req, res) => {
      res.status(204).end();
    });

    if (middlewares && middlewares.length > 0) {
      middlewares.forEach(middleware => {
        if (typeof middleware === "function") {
          this.webApp.use(middleware);
        } else {
          super.emit("error", new Error("http middlewares must be functions."));
        }
      });
    }

    this.webApp.use((req, res, next, error) => {
      // super.emit("error", error);
      res.status(500).send(error.message);
    });

    return this.webApp.listen(port);
  }
}

module.exports = KafkaRest;
