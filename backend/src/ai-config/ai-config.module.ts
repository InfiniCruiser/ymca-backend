import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiConfigController } from './ai-config.controller';
import { AiConfigService } from './ai-config.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiConfigController],
  providers: [AiConfigService],
  exports: [AiConfigService]
})
export class AiConfigModule {}
