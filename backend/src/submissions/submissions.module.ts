import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsLegacyController } from './submissions-legacy.controller';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    PerformanceModule,
  ],
  controllers: [SubmissionsController, SubmissionsLegacyController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
