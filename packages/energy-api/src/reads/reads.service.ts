import { Injectable, Logger } from '@nestjs/common';
import { Measurement } from './measurement.dto';
import { ReadsQueryDTO } from './reads-query.dto';
import { ConfigService } from '@nestjs/config';
import { ClientOptions, InfluxDB, Point } from '@influxdata/influxdb-client';
import { Unit } from './unit.enum';

@Injectable()
export class ReadsService {
  private readonly logger = new Logger(ReadsService.name);

  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = `${this.configService.get<string>('INFLUXDB_DB')}/autogen`;
  }

  public async store(meterId: string, measurement: Measurement) {
    const multiplier = this.getMultiplier(measurement.unit);

    const points = measurement.reads.map(m =>
      new Point('read')
        .tag('meter', meterId)
        .intField('read', m.value * multiplier)
        .timestamp(new Date(m.timestamp)),
    );

    const writer = this.dbWriter;

    writer.writePoints(points);
    await writer.close();
  }

  public async find(meterId: string, filter: ReadsQueryDTO) {
    try {
      const query = this.findByMeterQuery(meterId, filter);

      const data = await this.dbReader.collectRows<{
        _time: string;
        _value: string;
      }>(query);

      return data.map(record => [record._time, record._value]);
    } catch (e) {
      this.logger.error(e.message);
    }

    return [];
  }

  public async findDifference(meterId: string, filter: ReadsQueryDTO) {
    try {
      const query = `${this.findByMeterQuery(meterId, filter)}
      |> difference()
      `;

      const data = await this.dbReader.collectRows<{
        _time: string;
        _value: string;
      }>(query);

      return data.map(record => [record._time, record._value]);
    } catch (e) {
      this.logger.error(e.message);
    }

    return [];
  }

  private findByMeterQuery(meterId: string, filter: ReadsQueryDTO) {
    return `
    from(bucket: "${this.bucket}")
    |> range(start: ${filter.start}, stop: ${filter.end})
    |> limit(n: ${filter.limit ?? 10000}, offset: ${filter.offset ?? 0})
    |> filter(fn: (r) => r.meter == "${meterId}" and r._field == "read")
    `;
  }

  private get dbWriter() {
    return this.db.getWriteApi('', this.bucket);
  }

  private get dbReader() {
    return this.db.getQueryApi('');
  }

  private get db() {
    const clientOptions: ClientOptions = {
      url: this.configService.get<string>('INFLUXDB_URL'),
      token: `${this.configService.get<string>(
        'INFLUXDB_USER',
      )}:${this.configService.get<string>('INFLUXDB_USER_PASSWORD')}`,
    };

    return new InfluxDB(clientOptions);
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
