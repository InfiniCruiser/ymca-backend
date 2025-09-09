import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { PeriodCompletion } from './entities/period-completion.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { FileUploadsModule } from '../file-uploads/file-uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeriodCompletion, FileUpload]),
    forwardRef(() => FileUploadsModule),
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
