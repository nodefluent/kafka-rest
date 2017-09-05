"use strict";

class Metadata {

  constructor(raw){
    this.raw = raw;
  }

  asTopicList(){
    return this.raw.topics.map(topic => topic.name);
  }

  asTopicDescription(topicName){

    if(!this.raw.topics || !this.raw.topics.length){
      return {};
    }

    let topic = null;
    for(let i = 0; i < this.raw.topics.length; i++){
      if(this.raw.topics[i].name === topicName){
        topic = this.raw.topics[i];
        break;
      }
    }

    if(!topic){
      return {};
    }

    return {
      name: topic.name,
      configs:{
      },
      partitions: topic.partitions
    };
  }

  asTopicPartitions(topicName){

    if(!this.raw.topics || !this.raw.topics.length){
      return {};
    }

    let topic = null;
    for(let i = 0; i < this.raw.topics.length; i++){
      if(this.raw.topics[i].name === topicName){
        topic = this.raw.topics[i];
        break;
      }
    }

    if(!topic){
      return {};
    }

    return topic.partitions;
  }

  asBrokers(){
    return {
      brokers: this.raw.brokers.map(broker => broker.id)
    };
  }
}

module.exports = Metadata;
