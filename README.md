# Node Kafka REST API

wip :fire:

> NOTE: the goal of this project is to mimic confluent/kafka-rest-proxy to offer a faster interface to topic data for applications
like kafka-topics-ui, as kafka-rest-proxy troubles with larger message payloads or a large amount of messages on the topic.

## Quick start
- Run kafka-setup: `yarn run kafka:start`
- Open kafka topics ui: `http://localhost:8000`

## Curling the API

```

# get topics

curl -X GET \
  http://localhost:8082/topics \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"name": "peter",
	"format": "json",
	"auto.offset.reset": "earliest"
}'

# get topic infos

curl -X GET \
  http://localhost:8082/topics/peters-topic \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"name": "peter",
	"format": "json",
	"auto.offset.reset": "earliest"
}'

# create a consumer

curl -X POST \
  http://localhost:8082/consumers/peter \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"name": "peter",
	"format": "json",
	"auto.offset.reset": "earliest"
}'

# use consumer to subscribe to topic

curl -X POST \
  http://localhost:8082/consumers/peter/instances/peter/subscription \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"topics": ["peters-topic", "ks-fourth-4b63a506-4e46-4c78-a0b2-24922a1124db"]
}'

# fetch data

curl -X GET \
  http://localhost:8082/consumers/peter/instances/peter/records \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json'

# close and remove consumer

curl -X DELETE \
  http://localhost:8082/consumers/peter/instances/peter \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"name": "peter",
	"format": "json",
	"auto.offset.reset": "earliest"
}'

```
