import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceCalculation } from './entities/performance-calculation.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { YMCAPerformanceSimulationService } from './services/ymca-performance-simulation.service';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceCalculation, Organization]),
    AiConfigModule
  ],
  providers: [PerformanceService, YMCAPerformanceSimulationService],
  controllers: [PerformanceController],
  exports: [PerformanceService, YMCAPerformanceSimulationService],
})
export class PerformanceModule {}
