<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Energy API
  <br>
  <br>
</h1>

Standardized API for reading and storing metered data. Built on top of the InfluxDB time-series database.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fenergywebfoundation%2Fenergy-api%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/energywebfoundation/energy-api/goto?ref=master)

## Features

- time-series unit conversion on store - currently supports `Wh,kWh,MWh,GWh`
- consecutive reads difference calculation - for e.g can be used to get production ts based on reads
- date ranges, limits and paging
- resolution conversion - TBD
- aggregation functions - TBD

## Projects

This repository contains 3 items that serve different purpose.

### Specification

OpenAPI specs file can be found in `specs/schema.yaml`. This can also be browsed by visiting https://energywebfoundation.github.io/energy-api/specs/

### Reference implementation using InfluxDB

[![npm](https://img.shields.io/npm/v/@energyweb/energy-api-influxdb.svg)](https://www.npmjs.com/package/@energyweb/energy-api-influxdb)

Reference implementation package can be found in `packages/energy-api-influxdb`. This project is also available as NPM package in case you wish to use it in your Energy API implementation.

### Example application

This can be found in `packages/energy-api-app`. The purpose of this application is to depict example integration using reference implementation.

## Development

```
yarn
yarn build
```

## Configuration

### Environment

`.env`

```
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=admin:admin
INFLUXDB_ORG=
INFLUXDB_BUCKET=energy/autogen

# Optional for influxdb-init.sh script
INFLUXDB_DB=energy
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

## Example queries

### Storing meter reads

The POST request below will store:

- 3 smart meter reads with values equal to 120kWh (unit: 1 means kWh), 250kWh and 400kWh for device with device id `device1`

```
curl --location --request POST 'http://localhost:3000/meter-reads/device1' \
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

### Query meter reads

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

### Query difference

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

## How to build your own application using @energyweb/energy-api-influxdb

` @energyweb/energy-api-influxdb` NPM package exposes the reference implementation using InfluxDB as data layer for storing and quering meter reads.

- `ReadsService` - a service that implements communication with InfluxDB
- `BaseReadsController` - an abstract controller that can be used in your application

An example application controller build using Nest.JS framework and `@energyweb/energy-api-influxdb`. For full example refer to `packages/energy-api-app`

```typescript
import {
  BaseReadsController,
  FilterDTO,
  Measurement,
  ReadDTO,
  ReadsService,
} from "@energyweb/energy-api-influxdb";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";

@Controller("meter-reads")
export class ReadsController extends BaseReadsController {
  constructor(readsService: ReadsService) {
    super(readsService);
  }

  @Get("/:meter")
  public async getReads(
    @Param("meter") meterId: string,
    @Query() filter: FilterDTO
  ) {
    return super.getReads(meterId, filter);
  }

  @Get("/:meter/difference")
  public async getReadsDifference(
    @Param("meter") meterId: string,
    @Query() filter: FilterDTO
  ) {
    return super.getReadsDifference(meterId, filter);
  }

  @Post("/:meter")
  public async storeReads(
    @Param("meter") meterId: string,
    @Body() measurement: Measurement
  ) {
    await super.storeReads(meterId, measurement);
  }
}
```
