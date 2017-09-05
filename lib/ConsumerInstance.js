"use strict";

class ConsumerInstance {

  constructor(consumer, maxWindowSize = 1000){
    this.consumer = consumer;
    this.maxWindowSize = maxWindowSize;
    this.window = [];
  }

  _onMessage(message){

    if(this.window >= this.maxWindowSize){
      this.window.shift();
    }

    this.window.push(message);
  }

  getMessages(){
    //TODO commit and remove on read?
    return this.window;
  }

  reset(){
    this.window = [];
  }

  async start(){
    this.consumer.on("message", message => this._onMessage(message));
    await this.consumer.connect();
    this.consumer.consume(null, true, true); //parse message values as json, dont await this (will only fire on first message)
    return true;
  }

  async adjustSubscription(topics = []){

    //TODO async might be removed

    if(this.consumer){
      this.consumer.consumer.subscribe(topics);
      return true;
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
