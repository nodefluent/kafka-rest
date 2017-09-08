"use strict";
const Promise = require("bluebird");
const debug = require("debug")("kafka-rest:consumer-instance");

class ConsumerInstance {

  constructor(consumer, maxWindowSize = 1000, messageFormat){
    this.consumer = consumer;
    this.maxWindowSize = maxWindowSize;
    this.messageFormat = messageFormat;
    this.window = [];
  }

  _onMessage(message){
    debug("Got message.", message);

    if(this.messageFormat === "json" && message.value){
      try {
        message.value = JSON.parse(message.value);
      } catch(error){
        debug("Failed to JSON parse message value:", error);
      }
    }

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
      this.consumer.on("message", message => this._onMessage(message));
      await this.consumer.connect();
      this.consumer.consume(null, true, false);
      return true;
    }
    catch(error){
      return false;
    }
  }

  async adjustSubscription(topics = []){
    //TODO async might be removed

    if(this.consumer){
      try {
        //unsubscribe if we already subscribed, because next subscription will throw error
        debug("checking subscription status..");
        const subscribedTo = this.consumer.consumer.subscription();
        if(subscribedTo && !!subscribedTo.length){
          debug("unsubscribing:", subscribedTo);
          this.consumer.consumer.unsubscribe();
        }

        debug("subscribing..");
        this.consumer.consumer.subscribe(topics);
        return true;
      } catch(error){
        debug("error during subscription adaption:", error);
        return false;
      }
    }

    return false;
  }

  close(){
    if(this.consumer){
      return this.consumer.close();
    }
  }

}

module.exports = ConsumerInstance;
