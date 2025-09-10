import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, FileUpload]),
    PerformanceModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
