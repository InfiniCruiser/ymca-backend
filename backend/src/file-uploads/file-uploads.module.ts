import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadsController } from './file-uploads.controller';
import { FileUploadsService } from './file-uploads.service';
import { FileUpload } from './entities/file-upload.entity';
import { PeriodCompletion } from '../periods/entities/period-completion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload, PeriodCompletion]),
  ],
  controllers: [FileUploadsController],
  providers: [FileUploadsService],
  exports: [FileUploadsService],
})
export class FileUploadsModule {}
