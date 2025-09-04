import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsLegacyController } from './submissions-legacy.controller';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    PerformanceModule,
  ],
  controllers: [SubmissionsLegacyController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsLegacyModule {}
