import {
  BaseReadsController,
  FilterDTO,
  Measurement,
  ReadDTO,
  ReadsService,
} from '@energyweb/energy-api-influxdb';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('meter-reads')
@ApiTags('meter-reads')
export class ReadsController extends BaseReadsController {
  constructor(readsService: ReadsService) {
    super(readsService);
  }

  @Get('/:meter')
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ReadDTO],
    description: 'Returns time-series of meter reads',
  })
  public async getReads(
    @Param('meter') meterId: string,
    @Query() filter: FilterDTO,
  ) {
    return super.getReads(meterId, filter);
  }

  @Get('/:meter/difference')
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ReadDTO],
    description:
      'Returns time-series of difference between subsequent meter reads',
  })
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
