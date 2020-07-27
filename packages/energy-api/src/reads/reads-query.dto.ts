import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ReadsQueryDTO {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  @Max(10000)
  limit?: number;

  @IsOptional()
  @Transform((v: string) => parseInt(v), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  offset?: number;
}
