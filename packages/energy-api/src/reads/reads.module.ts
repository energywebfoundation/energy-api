import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ReadsController } from './reads.controller';
import { ReadsService } from './reads.service';

@Module({
  imports: [ConfigModule],
  controllers: [ReadsController],
  providers: [ReadsService],
})
export class ReadsModule {}
