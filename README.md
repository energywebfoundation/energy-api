<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Energy API
  <br>
  <br>
</h1>

Standardized API for reading and storing metered data. Built on top of the InfluxDB time-series database.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fenergywebfoundation%2Fenergy-api%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/energywebfoundation/energy-api/goto?ref=master)[![npm](https://img.shields.io/npm/v/@energyweb/energy-api.svg)]

## Features

- timeseries unit conversion on store - currently supports `Wh,kWh,MWh,GWh`
- consecutive reads difference calculation - for e.g can be used to get production ts based on reads
- date ranges, limits and paging
- resolution conversion - TBD
- aggregation functions - TBD

## Development

```
yarn
yarn build
```

## Configuration

### Environment

`.env`

```
INFLUXDB_DB=energy
INFLUXDB_URL=http://localhost:8086
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=admin
INFLUXDB_USER=api
INFLUXDB_USER_PASSWORD=secretpassword
```

### Influx DB installation

Scripts available in the repository requires Docker to be installed on the target machine.

1. ./influxdb-init.sh - one time init script to bootstrap InfluxDB configuration
2. ./influxdb-run.sh - start script

## Running

1. Start API using yarn command
```
yarn start
```
2. Navigate to http://localhost:3000/api/#/ for API documentationp

## Example queries

### Storing

The POST request below will store:

- 3 smart meter reads with values equal to 120kWh (unit: 1 means kWh), 250kWh and 400kWh for device with device id `device1`

```
curl --location --request POST 'http://localhost:3000/reads/device1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "unit": 1,
    "reads": [
        {
            "timestamp": "2020-07-20T00:00:00.000Z",
            "value": 125
        },
        {
            "timestamp": "2020-07-21T00:00:00.000Z",
            "value": 250
        },
        {
            "timestamp": "2020-07-22T00:00:00.000Z",
            "value": 400
        }
    ]
}'
```

For more information refer to http://localhost:3000/api/#/default/ReadsController_storeReads

### Reading

#### Reads

The GET request below will return previously stored 3 smart meter reads for device with device id `device1`

```
curl --location --request GET 'http://localhost:3000/reads/device1?start=2020-07-20T00:00:00.000Z&end=2020-07-23T00:00:00.000Z'
```

will return

```
[
      {
          "timestamp": "2020-07-20T00:00:00.000Z",
          "value": 125
      },
      {
          "timestamp": "2020-07-21T00:00:00.000Z",
          "value": 250
      },
      {
          "timestamp": "2020-07-22T00:00:00.000Z",
          "value": 400
      }
  ]
```

For more information refer to http://localhost:3000/api/#/default/ReadsController_getReads


#### Production

The GET request below will return relative values from given time period for device with device id `device1`

```
curl --location --request GET 'http://localhost:3000/reads/device1/difference?start=2020-07-20T00:00:00.000Z&end=2020-07-23T00:00:00.000Z'
```

will return

```
[
    {
        "timestamp": "2020-07-21T00:00:00.000Z",
        "value": 125000
    },
    {
        "timestamp": "2020-07-22T00:00:00.000Z",
        "value": 150000
    }
]
```

For more information refer to http://localhost:3000/api/#/default/ReadsController_getReadsDifference
