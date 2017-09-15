"use strict";

const Promise = require("bluebird");
const NZookeeper = require("zookeeper");
const debug = require("debug")("kafka-rest:zookeeper");

class Zookeeper {

  constructor(config = {}){

    const {host: connect, timeout} = config;

    this.zk = new NZookeeper({
      connect,
      timeout: timeout || 200000,
      debug_level: NZookeeper.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false
    });
  }

  connect(){
    return new Promise((resolve, reject) => {
      this.zk.connect(error => {

        if(error){
          return reject(error);
        }

        debug("zk session established", this.zk.client_id);
        resolve();
      });
    });
  }

  getTopics(){
    return new Promise((resolve, reject) => {
      this.zk.a_get_children("/config/topics", null, (error, msg, list) => {

        debug("zookeeper topics", msg);

        if(!error && msg !== "ok"){
          return reject(error || "bad message: " + msg);
        }

        resolve(list);
      });
    });
  }

  getTopicConfiguration(topic){
    return new Promise((resolve, reject) => {
      this.zk.a_get(`/config/topics/${topic}`, null, (error, msg, stat, data) => {

        debug("zookeeper topic config response", msg, stat);

        if(!error && msg !== "ok"){
          return reject(error || "bad message: " + msg);
        }

        let config = {};
        try {
          config = data.toString("utf8");
          config = JSON.parse(config);
        } catch(error){
          debug("failed to parse zookeeper data", error);
          return reject(error);
        }

        resolve(config);
      });
    });
  }

  close(){
    if(this.zk){
      debug("closing zookeeper");
      return this.zk.close();
    }
  }

}

module.exports = Zookeeper;
