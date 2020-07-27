#!/bin/bash

docker run  \
      --name energy-influxdb \
      -d \
      -p 8086:8086 \
      -v $PWD/influxdb-local:/var/lib/influxdb \
      -v $PWD/influxdb.conf:/etc/influxdb/influxdb.conf:ro \
      influxdb