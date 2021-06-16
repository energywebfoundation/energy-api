import { Unit } from '../unit.enum';
import { IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReadDTO } from './';

export class MeasurementDTO {
  @ValidateNested()
  @Type(() => ReadDTO)
  @ApiProperty({ type: () => [ReadDTO] })
  reads: ReadDTO[];

  @IsEnum(Unit)
  @ApiProperty({ enum: Unit, enumName: 'Unit' })
  unit: Unit;
}
