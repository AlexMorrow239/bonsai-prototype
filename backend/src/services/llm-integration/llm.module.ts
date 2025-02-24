import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LlmService } from './llm.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
