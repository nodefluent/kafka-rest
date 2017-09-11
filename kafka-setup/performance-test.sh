#!/bin/bash
CONSUMER_PREFIX="peter"
TOPIC="test"

for index in {0..5}
do
  echo
  echo "Create ${CONSUMER_PREFIX}-${index}."
  curl -X POST \
    "http://localhost:8082/consumers/${CONSUMER_PREFIX}-${index}" \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -d '{
      "name": "peter",
      "format": "json",
      "auto.offset.reset": "earliest"
    }'

  curl -X POST \
    http://localhost:8082/consumers/${CONSUMER_PREFIX}-${index}/instances/${CONSUMER_PREFIX}-${index}/subscription \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -d "{
      \"topics\": [\"${TOPIC}\"]
    }"
done

echo
echo "Wait for 10 seconds..."
sleep 10

for index in {0..5}
do
  echo
  echo "Get records from ${CONSUMER_PREFIX}-${index}."
  curl -X GET \
    http://localhost:8082/consumers/${CONSUMER_PREFIX}-${index}/instances/${CONSUMER_PREFIX}-${index}/records \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json'
done

echo "Remove all consumers? [y/N]"
read answer
if echo "$answer" | grep -iq "^y" ;then
  for index in {0..5}
  do
    curl -X DELETE \
      http://localhost:8082/consumers/${CONSUMER_PREFIX}-${index}/instances/${CONSUMER_PREFIX}-${index} \
      -H 'cache-control: no-cache' \
      -H 'content-type: application/json'
  done
fi
