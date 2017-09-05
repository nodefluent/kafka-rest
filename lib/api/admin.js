"use strict";

const express = require("express");

const getRouter = (app) => {

  const router = express.Router();

  router.get("/health", (req, res) => {
    res.status(app.aliveStatus ? 200 : 503).json(app.aliveStatus ? {status: "UP"} : {status: "DOWN"});
  });

  router.get("/healthcheck", (req, res) => {
    res.status(app.aliveStatus ? 200 : 503).end(app.aliveStatus ? "UP" : "DOWN");
  });

  return router;
};

module.exports = getRouter;
