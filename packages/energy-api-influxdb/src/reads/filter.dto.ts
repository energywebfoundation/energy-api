import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Validate,
} from 'class-validator';
import { IsBeforeConstraint } from '../validators/is-before';

export class FilterDTO {
  @IsDateString()
  @Validate(IsBeforeConstraint, ['end'])
  @ApiProperty({ format: 'date-time', example: '2020-01-01T00:00:00Z' })
  start: string;

  @IsDateString()
  @ApiProperty({ format: 'date-time', example: '2020-01-02T00:00:00Z' })
  end: string;

  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  @Max(10000)
  @ApiPropertyOptional({
    type: 'integer',
    default: 10000,
    minimum: 0,
    maximum: 10000,
  })
  limit: 10000;

  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  @ApiPropertyOptional({ type: 'integer', default: 0, minimum: 0 })
  offset: 0;
}
