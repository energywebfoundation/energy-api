import { IsDate, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReadDTO {
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2020-01-01T00:00:00Z',
    description: 'Measurement timestamp',
  })
  timestamp: Date;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    type: 'integer',
    example: 10000000,
    description: 'Measurement value in Wh',
  })
  value: number;
}
