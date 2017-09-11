"use strict";

const {NConsumer, NProducer} = require("sinek");
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

  async getConsumer(name, topics = [], earliestElseLatest = false, maxWindowSize = 100, messageFormat){
    debug("Get consumer.", {name, topics, earliestElseLatest, maxWindowSize, messageFormat});
    if(this.consumers[name]){
      return this.consumers[name];
    }

    const config = Object.assign({}, this.config.consumer);
    if(!config.tconf){
      config.tconf = {};
    }
    config.tconf["auto.offset.reset"] = earliestElseLatest ? "earliest" : "latest";
    config["group.id"] = name;

    const consumer = new NConsumer(topics, config);
    consumer.on("error", error => this.config.logger.error(error));
    consumer.on("message", message => this.config.logger.info("kafka message", message, earliestElseLatest));

    //wrap consumer to get a grip on a message window
    const consumerInstance = new ConsumerInstance(consumer, maxWindowSize, messageFormat);

    await consumerInstance.start();
    this.consumers[name] = consumerInstance;
    setTimeout(() => this.removeConsumer(name), config.autoremove);

    return consumerInstance;
  }

  removeConsumer(name){
    debug("Remove consumer.", {name});
    if(!this.consumers[name]){
      return false;
    }

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
