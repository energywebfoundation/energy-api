import { Module } from '@nestjs/common';
import { ReadsController } from './reads.controller';
import { ReadsService } from './reads.service';

@Module({
  controllers: [ReadsController],
  providers: [ReadsService],
})
export class ReadsModule {}
