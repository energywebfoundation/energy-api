#!/bin/bash

docker run --rm \
      --env-file ./.env \
      -v $PWD/influxdb-local:/var/lib/influxdb \
      influxdb /init-influxdb.sh