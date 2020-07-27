<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Energy API
  <br>
  <br>
</h1>

Standardized API for reading and storing metered data. Built on top of the InfluxDB time-series database.

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
