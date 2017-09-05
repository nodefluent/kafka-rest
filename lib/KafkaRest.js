"use strict";

const EventEmitter = require("events");
const Promise = require("bluebird");
const express = require("express");
const bodyParser = require("body-parser");

const {
  getConsumersRouter,
  getTopicsRouter,
  getOthersRouter,
  getAdminRouter
} = require("./api");

class KafkaRest extends EventEmitter {

  constructor(config) {
    super();

    this.pjson = require("./../package.json");
    this.config = config;

    this.aliveStatus = 1;
    this.app = this._buildWebServer(this.config.http);
    this.httpServer = null;
  }

  async run() {
    this.config.logger.info("Server starting..");

    await this._startHttpServer(this.config.http);

    this.config.logger.info(`Server listening @ http://localhost:${this.config.http.port}/`);
    return this;
  }

  close(){
    if(this.httpServer){
      this.httpServer.close();
    }
  }

  _startHttpServer(config = null){
    return new Promise((resolve, reject) => {

      if (config === null) {
        return reject(new Error("Config not found"));
      }

      const { port } = config;

      this.httpServer = this.app.listen(port, () => {
        resolve();
      });
    });
  }

  _buildWebServer(config = null) {

    if (config === null) {
      throw new Error("Config not found");
    }

    const app = express();

    const { middlewares } = config;

    app.use(bodyParser.text());
    app.use(bodyParser.json());

    app.use((req, res, next) => {
      super.emit("request", {
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      next();
    });

    app.use("/", getOthersRouter(this));
    app.use("/admin", getAdminRouter(this));
    app.use("/consumers", getConsumersRouter(this));
    app.use("/topics", getTopicsRouter(this));

    if (middlewares && middlewares.length > 0) {
      middlewares.forEach(middleware => {
        if (typeof middleware === "function") {
          app.use(middleware);
        } else {
          super.emit("error", new Error("http middlewares must be functions."));
        }
      });
    }

    app.use((req, res, next, error) => {
      super.emit("error", error);
      res.status(500).send(error.message);
    });

    return app;
  }
}

module.exports = KafkaRest;
