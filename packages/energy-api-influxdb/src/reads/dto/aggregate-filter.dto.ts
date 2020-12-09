import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches } from 'class-validator';

import { Aggregate } from '../aggregate.enum';
import { RangeFilterDTO } from './range-filter.dto';

export class AggregateFilterDTO extends RangeFilterDTO {
  @IsString()
  @Matches(/^\d+(m|h|d|w|mo|y)$/)
  @ApiProperty({
    type: String,
    example: '1mo',
    description:
      'An aggregation window duration. Possible values: m = minute, h=hours, d=days, w=weeks, mo=months, y=years for e.g 1d, 15m, 3mo, 1y',
  })
  window: string;

  @IsEnum(Aggregate)
  @ApiProperty({ enum: Aggregate, enumName: 'Aggregate' })
  aggregate: Aggregate;
}
