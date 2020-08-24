import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FilterDTO } from './filter.dto';
import { Measurement } from './measurement.dto';
import { ReadsService } from './reads.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('reads')
export class ReadsController {
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

  @Post('/:meter')
  public async storeReads(
    @Param('meter') meterId: string,
    @Body() measurement: Measurement,
  ) {
    await this.readsService.store(meterId, measurement);
  }
}
