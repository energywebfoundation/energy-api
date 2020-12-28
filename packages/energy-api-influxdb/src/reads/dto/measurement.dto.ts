import { Unit } from '../unit.enum';
import { IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReadDTO } from './';

export class MeasurementDTO {
  @ValidateNested()
  @ApiProperty({ type: () => [ReadDTO] })
  reads: ReadDTO[];

  @IsEnum(Unit)
  @ApiProperty({ enum: Unit, enumName: 'Unit' })
  unit: Unit;
}
