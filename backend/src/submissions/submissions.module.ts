import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { CeoApprovalController } from './ceo-approval.controller';
import { CeoApprovalService } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';
import { Draft } from './entities/draft.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Draft, FileUpload]),
    PerformanceModule,
  ],
  controllers: [SubmissionsController, DraftController, CeoApprovalController],
  providers: [SubmissionsService, DraftService, CeoApprovalService],
  exports: [SubmissionsService, DraftService, CeoApprovalService],
})
export class SubmissionsModule {}
