import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { Organization } from '../organizations/entities/organization.entity';
import { 
  DocumentCategoryGrade, 
  ReviewSubmission, 
  ReviewHistory 
} from './entities';
import { PeriodsModule } from '../periods/periods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentCategoryGrade,
      ReviewSubmission,
      ReviewHistory,
      Organization
    ]),
    ConfigModule,
    PeriodsModule
  ],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService]
})
export class GradingModule {}
