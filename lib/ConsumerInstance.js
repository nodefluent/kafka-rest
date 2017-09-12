"use strict";
const Promise = require("bluebird");
const debug = require("debug")("kafka-rest:consumer-instance");
const {NConsumer} = require("sinek");

class ConsumerInstance {

  constructor(config, maxWindowSize = 100, messageFormat, earliestElseLatest){
    this.config = config;
    this.maxWindowSize = maxWindowSize;
    this.messageFormat = messageFormat;
    this.earliestElseLatest = earliestElseLatest;
    this.window = [];
    this.hasSubscribed = false;
  }

  _onMessage(message){

    if(this.messageFormat === "json"){
      try {
        message.key = message.key ? message.key.toString("utf8"): null;
        message.value = message.value ? message.value.toString("utf8"): null;
        message.value = JSON.parse(message.value);
      } catch(error){
        debug("Failed to JSON parse message value:", error);
      }
    }

    if(this.messageFormat === "binary"){
      message.key = message.key ? message.key.toString("base64") : null;
      message.value = message.value ? message.value.toString("base64") : null;
    }

    if(this.window.length >= this.maxWindowSize){
      if(!this.earliestElseLatest){
        this.window.shift(); //latest
      } else {
        this.window.pop(); //earliest
      }
    }

    this.window.push(message);
  }

  getMessages(timeout = 500, tries = 3, maxBytes = 50000) {
    debug("Get messages.", {timeout, tries, messages: this.window});
    //TODO commit and remove on read?
    return Promise.delay(timeout).then(() => {
      if(this.window < this.maxWindowSize &&
        Buffer.byteLength(JSON.stringify(this.window), "utf8") < maxBytes &&
        tries > 1){
        return this.getMessages(timeout, tries - 1);
      } else {
        return this.window;
      }
    });

    // return this.window;
  }

  reset(){
    this.window = [];
  }

  async start(){
    try {
      this.consumer = new NConsumer([], this.config);
      this.consumer.on("error", error => this.config.logger.error(error));
      this.consumer.on("message", message => this.config.logger.info("kafka message", message, this.earliestElseLatest));
      this.consumer.on("message", message => this._onMessage(message));
      return true;
    }
    catch(error){
      return false;
    }
  }

  async adjustSubscription(topics = []){

    if(this.hasSubscribed){
      debug("has already subscribed, cannot adjust streaming consumer.");
      return false;
    }

    if(!this.consumer){
      debug("no consumer created yet, run .start() first");
      return false;
    }

    this.hasSubscribed = true;
    this.consumer.topics = topics;
    await this.consumer.connect(true);
    return true;
  }

  close(){
    if(this.consumer){
      return this.consumer.close();
    }
  }

}

module.exports = ConsumerInstance;
