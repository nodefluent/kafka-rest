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
      partitions: formatPartitions(topic.partitions)
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
    return formatPartitions(topic.partitions);
  }

  asBrokers(){
    return {
      brokers: this.raw.brokers.map(broker => broker.id)
    };
  }
}

const formatPartitions = (partitions) => {
  return partitions.map((p)=> {
    p.partition=p.id;
    p.replicas = p.replicas.map((r)=>({ broker: r, in_sync: p.isrs.indexOf(r) !== -1, leader: r === p.leader }));
    delete p.id;
    delete p.isrs;
    return p;
  });
};

module.exports = Metadata;
