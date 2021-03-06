"use strict";

const {NProducer} = require("sinek");
const debug = require("debug")("kafka-rest:kafka");

const Metadata = require("./Metadata.js");
const ConsumerInstance = require("./ConsumerInstance.js");

class Kafka {

  constructor(config = {}){
    this.config = config;

    if(!this.config.logger || !this.config.logger.error){
      this.config.logger = {
        error: () => {}
      };
    }

    //store references
    this.producer = null;
    this.consumers = {};
  }

  async getMetadata(topics = []){

    const producer = await this.getProducer();
    const metadata = await (new Promise((resolve, reject) => {

      producer.producer.getMetadata(topics, (error, metadata) => {

        if(error){
          return reject(error);
        }

        resolve(metadata);
      });
    }));
    debug("Got metadata.", metadata);

    return new Metadata(metadata);
  }

  async getProducer(){
    debug("Get producer.");
    if(this.producer){
      return this.producer;
    }

    const producer = new NProducer(this.config.producer);
    producer.on("error", error => this.config.logger.error(error));
    await producer.connect();
    this.producer = producer;
    return producer;
  }

  //TODO beautify params..
  async getConsumer(name, topics = [], earliestElseLatest = false, maxWindowSize = 100, messageFormat = "", opts = {}){
    debug("Get consumer.", {name, topics, earliestElseLatest, maxWindowSize, messageFormat, opts});

    if(this.consumers[name]){
      return this.consumers[name];
    }

    const config = Object.assign({}, this.config.consumer);
    if(!config.tconf){
      config.tconf = {};
    }
    config.tconf["auto.offset.reset"] = earliestElseLatest ? "earliest" : "latest";

    const {clientId, consumerGroup} = opts;
    config["group.id"] = consumerGroup;
    config["client.id"] = clientId;

    //wrap consumer to get a grip on a message window
    const consumerInstance = new ConsumerInstance(config, maxWindowSize, messageFormat, earliestElseLatest);
    await consumerInstance.start();
    this.consumers[name] = consumerInstance;
    setTimeout(() => this.removeConsumer(name), config.autoremove);

    return consumerInstance;
  }

  removeConsumer(name){

    if(!this.consumers[name]){
      return false;
    }

    debug("Remove consumer.", {name});
    this.consumers[name].close();
    delete this.consumers[name];
    return true;
  }

  closeAll(){
    debug("Close all.");
    if(this.producer){
      this.producer.close();
    }

    Object.keys(this.consumers).forEach(consumer => {
      if(consumer){
        try {
          consumer.close();
        } catch(e){
          //empty
        }
      }
    });

    this.producer = null;
    this.consumers = null;
  }
}

module.exports = Kafka;
