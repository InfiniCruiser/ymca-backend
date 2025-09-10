import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { PeriodCompletion } from './entities/period-completion.entity';
import { PeriodConfiguration } from './entities/period-configuration.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PeriodValidationGuard } from './guards/period-validation.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeriodCompletion, PeriodConfiguration, FileUpload]),
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService, PeriodValidationGuard],
  exports: [PeriodsService, PeriodValidationGuard],
})
export class PeriodsModule {}
