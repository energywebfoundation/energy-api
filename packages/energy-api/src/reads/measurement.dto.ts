import { Unit } from './unit.enum';
import {
  IsEnum,
  IsDate,
  ValidateNested,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReadDTO {
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsNumber()
  @IsPositive()
  value: number;
}

export class Measurement {
  @ValidateNested()
  @Type(() => ReadDTO)
  reads: ReadDTO[];

  @IsEnum(Unit)
  unit: Unit;
}
