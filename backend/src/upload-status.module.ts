import { Module } from '@nestjs/common';
import { UploadStatusController } from './upload-status.controller';
import { FileUploadsModule } from './file-uploads/file-uploads.module';

@Module({
  imports: [FileUploadsModule],
  controllers: [UploadStatusController],
})
export class UploadStatusModule {}
