"use strict";
const Promise = require("bluebird");
const debug = require("debug")("kafka-rest:consumer-instance");

class ConsumerInstance {

  constructor(consumer, maxWindowSize = 1000){
    this.consumer = consumer;
    this.maxWindowSize = maxWindowSize;
    this.window = [];
  }

  _onMessage(message){
    debug("Got message.", message);
    if(this.window >= this.maxWindowSize){
      this.window.shift();
    }
    if(message && message.key) {
      message.key = message.key.toString("utf8");
    }
    this.window.push(message);
  }

  getMessages(timeout = 500, tries = 3) {
    debug("Get messages.", {timeout, tries, messages: this.window});
    //TODO commit and remove on read?
    return Promise.delay(timeout).then(() => {
      if(this.window < this.maxWindowSize && tries > 1){
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
      debug("Start consumer.");
      this.consumer.on("message", message => this._onMessage(message));
      await this.consumer.connect();
      this.consumer.consume(null, true, true); //parse message values as json, dont await this (will only fire on first message)
      return true;
    }
    catch(error){
      debug("Start consumer error.", error);
      return false;
    }
  }

  async adjustSubscription(topics = []){
    debug("Adjust subscription.", topics);
    //TODO async might be removed

    if(this.consumer){
      await this.consumer.consumer.subscribe(topics);
      return true;
    }

    return false;
  }

  close(){
    debug("Close consumer.");
    if(this.consumer){
      return this.consumer.close();
    }
  }

}

module.exports = ConsumerInstance;
