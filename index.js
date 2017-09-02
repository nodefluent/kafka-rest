"use strict";
const config = require("./config");

const KafkaRest = require("./lib/KafkaRest");

const rest = new KafkaRest(config);
rest.run();
