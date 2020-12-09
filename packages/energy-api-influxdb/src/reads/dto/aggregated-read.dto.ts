import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AggregatedReadDTO {
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2020-01-01T00:00:00Z',
    description: 'Measurement start timestamp',
  })
  start: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2020-01-02T00:00:00Z',
    description: 'Measurement stop timestamp',
  })
  stop: Date;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    type: 'integer',
    example: 10000000,
    description: 'Measurement value in Wh',
  })
  value: number;
}
