# Node Kafka REST API

wip :fire:

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
	"topics": ["peters-topic"]
}'

# fetch data

curl -X GET \
  http://localhost:8082/consumers/peter/instances/peter/records \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json'

# close and remove consumer


ks-third-a3b92e34-7e43-44bc-aa87-03117690e975
```
