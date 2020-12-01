import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Measurement, ReadDTO } from './measurement.dto';
import { FilterDTO } from './filter.dto';
import { ConfigService } from '@nestjs/config';
import { ClientOptions, InfluxDB, Point } from '@influxdata/influxdb-client';
import { Unit } from './unit.enum';

@Injectable()
export class ReadsService implements OnModuleInit {
  private readonly logger = new Logger(ReadsService.name);

  private bucket: string;
  private organization: string;

  private config: ClientOptions;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit() {
    const url = this.configService.get<string>('INFLUXDB_URL');
    const token = this.configService.get<string>('INFLUXDB_TOKEN');
    const organization = this.configService.get<string>('INFLUXDB_ORG') ?? '';
    const bucket = this.configService.get<string>('INFLUXDB_BUCKET');

    if (!url) {
      throw new Error('Missing INFLUXDB_URL parameter');
    }
    if (!token) {
      throw new Error('Missing INFLUXDB_TOKEN parameter');
    }
    if (!bucket) {
      throw new Error('Missing INFLUXDB_BUCKET parameter');
    }

    this.logger.debug(`Using InfluxDB instance on ${url}`);

    this.bucket = bucket;
    this.organization = organization;

    this.config = {
      url,
      token,
    };
  }

  public async store(meterId: string, measurement: Measurement) {
    const multiplier = this.getMultiplier(measurement.unit);

    const points = measurement.reads.map((m) =>
      new Point('read')
        .tag('meter', meterId)
        .intField('read', m.value * multiplier)
        .timestamp(new Date(m.timestamp)),
    );

    const writer = this.dbWriter;

    writer.writePoints(points);
    await writer.close();
  }

  public async find(meterId: string, filter: FilterDTO) {
    try {
      const query = this.findByMeterQuery(meterId, filter);

      const data = await this.dbReader.collectRows<{
        _time: string;
        _value: string;
      }>(query);

      return data.map(
        (record) =>
          ({
            timestamp: new Date(record._time),
            value: Number(record._value),
          } as ReadDTO),
      );
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  public async findDifference(meterId: string, filter: FilterDTO) {
    try {
      const query = `${this.findByMeterQuery(meterId, filter)}
      |> difference()
      `;

      const data = await this.dbReader.collectRows<{
        _time: string;
        _value: string;
      }>(query);

      return data.map(
        (record) =>
          ({
            timestamp: new Date(record._time),
            value: Number(record._value),
          } as ReadDTO),
      );
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  private findByMeterQuery(meterId: string, filter: FilterDTO) {
    return `
    from(bucket: "${this.bucket}")
    |> range(start: ${filter.start}, stop: ${filter.end})
    |> limit(n: ${filter.limit}, offset: ${filter.offset})
    |> filter(fn: (r) => r.meter == "${meterId}" and r._field == "read")
    `;
  }

  private get dbWriter() {
    return new InfluxDB(this.config).getWriteApi(
      this.organization,
      this.bucket,
    );
  }

  private get dbReader() {
    return new InfluxDB(this.config).getQueryApi(this.organization);
  }

  private getMultiplier(unit: Unit) {
    switch (unit) {
      case Unit.Wh:
        return 1;
      case Unit.kWh:
        return 10 ** 3;
      case Unit.MWh:
        return 10 ** 6;
      case Unit.GWh:
        return 10 ** 9;
    }
  }
}