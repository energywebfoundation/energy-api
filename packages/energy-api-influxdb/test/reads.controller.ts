import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import {
  BaseReadsController,
  FilterDTO,
  Measurement,
  ReadsService,
} from '../src';

@Controller('meter-reads')
export class ReadsController extends BaseReadsController {
  constructor(readsService: ReadsService) {
    super(readsService);
  }

  @Get('/:meter')
  public async getReads(
    @Param('meter') meterId: string,
    @Query() filter: FilterDTO,
  ) {
    return super.getReads(meterId, filter);
  }

  @Get('/:meter/difference')
  public async getReadsDifference(
    @Param('meter') meterId: string,
    @Query() filter: FilterDTO,
  ) {
    return super.getReadsDifference(meterId, filter);
  }

  @Post('/:meter')
  public async storeReads(
    @Param('meter') meterId: string,
    @Body() measurement: Measurement,
  ) {
    await super.storeReads(meterId, measurement);
  }
}
