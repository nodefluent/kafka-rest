"use strict";

const getConsumersRouter = require("./consumers.js");
const getTopicsRouter = require("./topics.js");
const getOthersRouter = require("./others.js");
const getAdminRouter = require("./admin.js");

module.exports = {
  getConsumersRouter,
  getTopicsRouter,
  getOthersRouter,
  getAdminRouter
};
