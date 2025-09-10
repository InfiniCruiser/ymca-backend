import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { Organization } from '../organizations/entities/organization.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { 
  DocumentCategoryGrade, 
  ReviewSubmission, 
  ReviewHistory 
} from './entities';
import { PeriodsModule } from '../periods/periods.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { FileUploadsModule } from '../file-uploads/file-uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentCategoryGrade,
      ReviewSubmission,
      ReviewHistory,
      Organization,
      FileUpload
    ]),
    ConfigModule,
    PeriodsModule,
    SubmissionsModule,
    FileUploadsModule
  ],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService]
})
export class GradingModule {}
