import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsLegacyController } from './submissions-legacy.controller';
import { SubmissionsService } from './submissions.service';
import { DraftService } from './draft.service';
import { Submission } from './entities/submission.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, FileUpload]),
    PerformanceModule,
  ],
  controllers: [SubmissionsLegacyController],
  providers: [SubmissionsService, DraftService],
  exports: [SubmissionsService, DraftService],
})
export class SubmissionsLegacyModule {}
