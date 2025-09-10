import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { 
  DocumentCategoryGrade, 
  ReviewSubmission, 
  ReviewHistory 
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentCategoryGrade,
      ReviewSubmission,
      ReviewHistory
    ]),
    ConfigModule
  ],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService]
})
export class GradingModule {}
