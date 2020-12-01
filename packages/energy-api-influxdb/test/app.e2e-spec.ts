import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ReadsService } from '../src';
import { ReadsController } from './reads.controller';
import { request } from './request';

describe('ReadsController (e2e)', () => {
  let app: INestApplication;

  const configService = new ConfigService({
    INFLUXDB_URL: 'http://localhost:8086',
    INFLUXDB_TOKEN: 'admin:admin',
    INFLUXDB_ORG: 'org',
    INFLUXDB_BUCKET: 'energy/autogen',
  });

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [ReadsController],
      providers: [ReadsService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/reads (GET)', async () => {
    await request(app)
      .get('/meter-reads/M1')
      .query({
        start: new Date('2020-01-01').toISOString(),
        end: new Date('2020-01-02').toISOString(),
      })
      .expect(200)
      .expect([]);
  });
});
