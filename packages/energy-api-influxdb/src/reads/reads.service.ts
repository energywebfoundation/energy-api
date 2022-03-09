import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  AggregatedReadDTO,
  AggregateFilterDTO,
  FilterDTO,
  MeasurementDTO,
  ReadDTO,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { ClientOptions, InfluxDB, Point } from '@influxdata/influxdb-client';
import { Unit } from './unit.enum';
import { AllowedDurationType } from './allowed-duration.type';
import { addMilliseconds } from '../date.utils';

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

  public async store(meterId: string, measurement: MeasurementDTO) {
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

  public async aggregate(
    meterId: string,
    filter: AggregateFilterDTO,
  ): Promise<AggregatedReadDTO[]> {
    try {
      const query = `
      from(bucket: "${this.bucket}")
      ${this.getRangeFilter(filter.start, filter.end)}
      |> filter(fn: (r) => r.meter == "${meterId}" and r._field == "read")
      ${filter.difference ? '|> difference()' : ''}
      |> window(every: ${filter.window})
      |> ${filter.aggregate}()
      `;

      return this.executeAggregated(query);
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  public async find(meterId: string, filter: FilterDTO): Promise<ReadDTO[]> {
    try {
      const query = this.findByMeterQuery(meterId, filter);

      return this.execute(query);
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  public async findLatestRead(
    meterId: string,
    startDuration?: AllowedDurationType,
  ): Promise<ReadDTO> {
    try {
      const query = this.findLatestReadByMeterQuery(meterId, startDuration);

      const reads = await this.execute(query);
      if (reads.length === 0) {
        throw new NotFoundException(
          `Unable to get the latest reading. There are no readings yet for meter ${meterId}`,
        );
      }
      return reads[0];
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  public async findDifference(
    meterId: string,
    filter: FilterDTO,
  ): Promise<ReadDTO[]> {
    try {
      const query = `${this.findByMeterQuery(meterId, filter)}
      |> difference()
      `;

      return this.execute(query);
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  private findByMeterQuery(meterId: string, filter: FilterDTO): string {
    return `
    from(bucket: "${this.bucket}")
    ${this.getRangeFilter(filter.start, filter.end)}
    |> limit(n: ${filter.limit}, offset: ${filter.offset})
    |> filter(fn: (r) => r.meter == "${meterId}" and r._field == "read")
    `;
  }

  private getRangeFilter(start: string, end: string): string {
    const endPlusOneMs = addMilliseconds(new Date(end), 1);

    // Range doesn't include "end" into results for backward compatibility range is used
    // and then dates are filtered by "filter" function to include "end" into results
    return `
      |> range(start: ${start}, stop: ${endPlusOneMs.toISOString()})
      |> filter(fn: (r) => r._time >= ${start} and r._time <= ${end})
    `;
  }

  public findLatestReadByMeterQuery(
    meterId: string,
    startDuration?: AllowedDurationType,
  ): string {
    const start = startDuration ? `-${startDuration}` : '-1d';
    return `
    from(bucket: "${this.bucket}")
    |> range(start: ${start}, stop: now())
    |> filter(fn: (r) => r.meter == "${meterId}" and r._field == "read")
    |> last()
    `;
  }

  private async execute(query: string): Promise<ReadDTO[]> {
    const data = await this.dbReader.collectRows<{
      _time: string;
      _value: string;
    }>(query);

    return data.map((record) => ({
      timestamp: new Date(record._time),
      value: Number(record._value),
    }));
  }

  private async executeAggregated(query: string): Promise<AggregatedReadDTO[]> {
    const data = await this.dbReader.collectRows<{
      _start: string;
      _stop: string;
      _value: string;
    }>(query);

    return data.map((record) => ({
      start: new Date(record._start),
      stop: new Date(record._stop),
      value: Number(record._value),
    }));
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
