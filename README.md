# Node Kafka REST API

wip :fire:

> NOTE: the goal of this project is to mimic confluent/kafka-rest-proxy to offer a faster interface to topic data for applications
like kafka-topics-ui, as kafka-rest-proxy troubles with larger message payloads or a large amount of messages on the topic.

## Quick start
- Run kafka-setup: `yarn run kafka:start`
- Open kafka topics ui: `http://localhost:8000`

## Curling the API

#### Get topics

```shell
curl -X GET \
  http://localhost:8082/topics \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "name": "peter",
    "format": "json",
    "auto.offset.reset": "earliest"
  }'
```

#### Get topic infos

```shell
curl -X GET \
  http://localhost:8082/topics/peters-topic \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "name": "peter",
    "format": "json",
    "auto.offset.reset": "earliest"
  }'
```

#### Create a consumer

```shell
curl -X POST \
  http://localhost:8082/consumers/peter \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "name": "peter",
    "format": "json",
    "auto.offset.reset": "earliest"
  }'
```

#### Use consumer to subscribe to topic

```shell
curl -X POST \
  http://localhost:8082/consumers/peter/instances/peter/subscription \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "topics": ["peters-topic", "ks-fourth-4b63a506-4e46-4c78-a0b2-24922a1124db"]
  }'
```

#### Fetch data

```shell
curl -X GET \
  http://localhost:8082/consumers/peter/instances/peter/records \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json'
```

#### Close and remove consumer

```shell
curl -X DELETE \
  http://localhost:8082/consumers/peter/instances/peter \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json'
```

## Using Docker

If you want to customize any Kafka REST parameters, simply add them as environment variables, e.g.:
- To set the **http.port** parameter set the environment to `KAFKA_REST_HTTP_PORT: 8082`.
- To turn on **debug** mode for consumer and producer set `KAFKA_REST_DEBUG: "all"`.
- To set the **group.id** only for consumer set the environment to `KAFKA_REST_CONSUMER_GROUP_ID: "kafka-rest-consumer-group"`.

The full list and descriptions of config parameters can be found [here](https://github.com/edenhill/librdkafka/blob/0.9.5.x/CONFIGURATION.md).

Check out our docker compose example:

```yaml
---
version: "2"
services:
  zookeeper:
    image: wurstmeister/zookeeper:latest
    ports:
      - 2181:2181

  kafka:
    image: wurstmeister/kafka:0.10.2.1
    ports:
      - "9092:9092"
    links:
      - zookeeper
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_PORT: 9092
      KAFKA_ADVERTISED_HOST_NAME: "kafka"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092"
      KAFKA_LISTENERS: "PLAINTEXT://:9092"
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_CREATE_TOPICS: "test:1:1"
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"

  kafka-rest:
    image: nodefluent/kafka-rest
    ports:
      - 8082:8082
    links:
      - kafka
      - zookeeper
    depends_on:
      - kafka
      - zookeeper
    environment:
      KAFKA_REST_DEBUG: "all"
      KAFKA_REST_HTTP_PORT: 8082
      KAFKA_REST_CONSUMER_METADATA_BROKER_LIST: "kafka:9092"
      KAFKA_REST_PRODUCER_METADATA_BROKER_LIST: "kafka:9092"

  kafka-topics-ui:
    image: landoop/kafka-topics-ui
    ports:
      - 8000:8000
    links:
      - kafka-rest
    depends_on:
      - kafka-rest
    environment:
      KAFKA_REST_PROXY_URL: "http://kafka-rest:8082"
      PROXY: "true"
```
