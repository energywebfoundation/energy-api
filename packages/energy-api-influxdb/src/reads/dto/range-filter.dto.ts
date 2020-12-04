import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Validate } from 'class-validator';

import { IsBeforeConstraint } from '../../validators/is-before';

export class RangeFilterDTO {
  @IsDateString()
  @Validate(IsBeforeConstraint, ['end'])
  @ApiProperty({ format: 'date-time', example: '2020-01-01T00:00:00Z' })
  start: string;

  @IsDateString()
  @ApiProperty({ format: 'date-time', example: '2020-01-02T00:00:00Z' })
  end: string;
}
