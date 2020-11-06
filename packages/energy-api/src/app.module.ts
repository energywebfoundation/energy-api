import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ReadsModule } from './reads/reads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),
    ReadsModule,
  ],
})
export class AppModule {}
