"use strict";

const {NConsumer, NProducer} = require("sinek");

const Metadata = require("./Metadata.js");

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

    return new Metadata(metadata);
  }

  async getProducer(){

    if(this.producer){
      return this.producer;
    }

    const producer = new NProducer(this.config.producer);
    producer.on("error", error => this.config.logger.error(error));
    await producer.connect();
    this.producer = producer;
    return producer;
  }

  async getConsumer(name, topics = [], earliestElseLatest = false){

    if(this.consumers[name]){
      return this.consumers[name];
    }

    const config = Object.assign({}, this.config.consumer);
    if(!config.tconf){
      config.tconf = {};
    }
    config.tconf["auto.offset.reset"] = earliestElseLatest ? "earliest" : "latest";

    const consumer = new NConsumer(topics, config);
    consumer.on("error", error => this.config.logger.error(error));
    await consumer.connect();
    this.consumers[name] = consumer;
    return consumer;
  }

  closeAll(){

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
