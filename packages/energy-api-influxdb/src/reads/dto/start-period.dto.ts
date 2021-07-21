import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AllowedDurationType } from '../allowed-duration.type';

export class StartPeriodDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    example: '1d',
    description:
      'Start date since the last stored read. Must be one of these values: 1y, 1mo, 1w, 1d, 1h, 30m, 15m',
  })
  start: AllowedDurationType;
}
