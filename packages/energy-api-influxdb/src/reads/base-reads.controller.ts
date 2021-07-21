import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  AggregateFilterDTO,
  FilterDTO,
  MeasurementDTO,
  StartPeriodDTO,
} from './dto';
import { ReadsService } from './reads.service';

@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller()
export abstract class BaseReadsController {
  constructor(private readonly readsService: ReadsService) {}

  @Get('/:meter')
  public async getReads(
    @Param('meter') meterId: string,
    @Query() filter: FilterDTO,
  ) {
    const res = await this.readsService.find(meterId, filter);
    return res;
  }

  @Get('/:meter/difference')
  public async getReadsDifference(
    @Param('meter') meterId: string,
    @Query() filter: FilterDTO,
  ) {
    const res = await this.readsService.findDifference(meterId, filter);
    return res;
  }

  @Get('/:meter/aggregate')
  public async getReadsAggregates(
    @Param('meter') meterId: string,
    @Query() filter: AggregateFilterDTO,
  ) {
    const res = await this.readsService.aggregate(meterId, filter);
    return res;
  }

  @Get('/:meter/last')
  public async getLastRead(
    @Param('meter') meterId: string,
    @Query() filter: StartPeriodDTO,
  ) {
    const res = await this.readsService.findLastRead(meterId, filter?.start);
    return res;
  }

  @Post('/:meter')
  public async storeReads(
    @Param('meter') meterId: string,
    @Body() measurement: MeasurementDTO,
  ) {
    await this.readsService.store(meterId, measurement);
  }
}
