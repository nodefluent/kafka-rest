"use strict";

class Metadata {

  constructor(raw){
    this.raw = raw;
  }

  asTopicList(){
    return this.raw.topics.map(topic => topic.name);
  }

  asTopicDescription(topicName){

    let topic = null;
    for(let i = 0; i < this.raw.topics.length; i++){
      if(this.raw.topics[i].name === topicName){
        topic = this.raw.topics[i];
        break;
      }
    }

    return {
      name: topic.name,
      configs:{
      },
      partitions: topic.partitions
    };
  }

  asTopicPartitions(topicName){

    let topic = null;
    for(let i = 0; i < this.raw.topics.length; i++){
      if(this.raw.topics[i].name === topicName){
        topic = this.raw.topics[i];
        break;
      }
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
