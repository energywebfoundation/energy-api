import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

import { RangeFilterDTO } from './range-filter.dto';

const DEFAULT_LIMIT = 10000;
const DEFAULT_OFFSET = 0;

export class FilterDTO extends RangeFilterDTO {
  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  @Max(10000)
  @ApiPropertyOptional({
    type: 'integer',
    default: DEFAULT_LIMIT,
    minimum: 0,
    maximum: 10000,
  })
  limit = DEFAULT_LIMIT;

  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ type: 'integer', default: DEFAULT_OFFSET, minimum: 0 })
  offset = DEFAULT_OFFSET;
}
