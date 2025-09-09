import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload, UploadType, FileMetadata } from './entities/file-upload.entity';
import { 
  GeneratePresignedUrlDto, 
  CompleteUploadDto, 
  FileUploadResponseDto, 
  FileUploadQueryDto,
  FileUploadListResponseDto,
  FileUploadStatsDto
} from './dto';

@Injectable()
export class FileUploadsService {
  private s3Client: S3Client;
  private bucketName: string;
  private maxFileSize: number;
  private allowedFileTypes: string[];

  constructor(
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
    private configService: ConfigService,
  ) {
    // Initialize S3 client
    this.s3Client = new S3Client({
      endpoint: this.configService.get('S3_ENDPOINT'),
      region: this.configService.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_KEY'),
      },
      forcePathStyle: this.configService.get('S3_FORCE_PATH_STYLE', 'true') === 'true',
    });

    this.bucketName = this.configService.get('S3_BUCKET', 'ymca-evidence');
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE', '10485760')); // 10MB default
    this.allowedFileTypes = this.configService.get('ALLOWED_FILE_TYPES', 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif').split(',');
  }

  async generatePresignedUrl(
    generatePresignedUrlDto: GeneratePresignedUrlDto,
    userId: string
  ): Promise<FileUploadResponseDto> {
    // Validate file types and sizes
    this.validateFiles(generatePresignedUrlDto.files);

    // Generate unique upload ID
    const uploadId = uuidv4();

    // Create S3 keys for each file
    const presignedUrls = await Promise.all(
      generatePresignedUrlDto.files.map(async (file, index) => {
        const s3Key = this.generateS3Key(
          generatePresignedUrlDto.organizationId,
          generatePresignedUrlDto.periodId,
          generatePresignedUrlDto.categoryId,
          generatePresignedUrlDto.uploadType,
          uploadId,
          file.originalName
        );

        // Generate presigned URL
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          ContentType: file.type,
          ContentLength: file.size,
        });

        const url = await getSignedUrl(this.s3Client, command, { 
          expiresIn: 3600 // 1 hour
        });

        return {
          fileIndex: index,
          url,
          fields: {
            key: s3Key,
            bucket: this.bucketName,
          },
        };
      })
    );

    // Create file upload record in database
    const fileUpload = this.fileUploadRepository.create({
      organizationId: generatePresignedUrlDto.organizationId,
      userId,
      periodId: generatePresignedUrlDto.periodId,
      categoryId: generatePresignedUrlDto.categoryId,
      uploadType: generatePresignedUrlDto.uploadType,
      uploadId,
      files: generatePresignedUrlDto.files.map((file, index) => ({
        originalName: file.originalName,
        s3Key: presignedUrls[index].fields.key,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      })),
      submissionId: generatePresignedUrlDto.submissionId,
      status: 'pending',
      uploadedAt: new Date(),
    });

    await this.fileUploadRepository.save(fileUpload);

    return {
      uploadId,
      presignedUrls,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
    };
  }

  async completeUpload(
    completeUploadDto: CompleteUploadDto,
    userId: string
  ): Promise<FileUpload> {
    // Find the upload record
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { uploadId: completeUploadDto.uploadId, userId },
    });

    if (!fileUpload) {
      throw new NotFoundException('Upload record not found');
    }

    // Update the files with actual S3 keys and mark as completed
    const updatedFiles: FileMetadata[] = completeUploadDto.files.map((file, index) => ({
      ...file,
      s3Key: fileUpload.files[index]?.s3Key || '',
      uploadedAt: new Date().toISOString(),
    }));

    fileUpload.files = updatedFiles;
    fileUpload.status = 'completed';
    fileUpload.uploadedAt = new Date();

    return this.fileUploadRepository.save(fileUpload);
  }

  async findAll(
    query: FileUploadQueryDto,
    userId: string,
    userOrganizationId: string
  ): Promise<FileUploadListResponseDto> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Always filter by user's organization for security
    where.organizationId = userOrganizationId;

    if (filters.periodId) {
      where.periodId = filters.periodId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.uploadType) {
      where.uploadType = filters.uploadType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [uploads, totalCount] = await this.fileUploadRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { uploadedAt: 'DESC' },
      relations: ['user', 'organization'],
    });

    return {
      uploads,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getUploadStats(
    organizationId: string,
    periodId?: string
  ): Promise<FileUploadStatsDto> {
    const where: any = { organizationId, status: 'completed' };
    
    if (periodId) {
      where.periodId = periodId;
    }

    const uploads = await this.fileUploadRepository.find({
      where,
      order: { uploadedAt: 'DESC' },
    });

    // Calculate stats
    const totalFiles = uploads.reduce((sum, upload) => sum + upload.fileCount, 0);
    const totalSize = uploads.reduce((sum, upload) => sum + upload.totalSize, 0);
    
    // Get unique categories
    const categories = [...new Set(uploads.map(upload => upload.categoryId))];
    const totalCategories = categories.length;
    
    // Count completed categories (categories with at least one upload)
    const completedCategories = categories.length;

    // Calculate progress by category
    const categoryProgress: Record<string, any> = {};
    
    categories.forEach(categoryId => {
      const categoryUploads = uploads.filter(upload => upload.categoryId === categoryId);
      const mainFiles = categoryUploads
        .filter(upload => upload.uploadType === UploadType.MAIN)
        .reduce((sum, upload) => sum + upload.fileCount, 0);
      const secondaryFiles = categoryUploads
        .filter(upload => upload.uploadType === UploadType.SECONDARY)
        .reduce((sum, upload) => sum + upload.fileCount, 0);
      
      const lastUploaded = categoryUploads.length > 0 
        ? categoryUploads[0].uploadedAt.toISOString()
        : new Date().toISOString();

      categoryProgress[categoryId] = {
        mainFiles,
        secondaryFiles,
        lastUploaded,
      };
    });

    return {
      totalCategories,
      completedCategories,
      totalFiles,
      totalSize,
      categoryProgress,
    };
  }

  async findOne(id: string, userId: string, userOrganizationId: string): Promise<FileUpload> {
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { id, organizationId: userOrganizationId },
      relations: ['user', 'organization', 'submission'],
    });

    if (!fileUpload) {
      throw new NotFoundException('File upload not found');
    }

    return fileUpload;
  }

  async remove(id: string, userId: string, userOrganizationId: string): Promise<void> {
    const fileUpload = await this.findOne(id, userId, userOrganizationId);
    
    // TODO: Delete files from S3
    // This would require implementing S3 delete functionality
    
    await this.fileUploadRepository.remove(fileUpload);
  }

  private validateFiles(files: any[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    for (const file of files) {
      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalName} exceeds maximum size of ${this.maxFileSize} bytes`
        );
      }

      // Validate file type
      if (!this.allowedFileTypes.includes(file.type)) {
        throw new BadRequestException(
          `File type ${file.type} is not allowed. Allowed types: ${this.allowedFileTypes.join(', ')}`
        );
      }

      // Validate required fields
      if (!file.originalName || !file.size || !file.type) {
        throw new BadRequestException('File must have originalName, size, and type');
      }
    }
  }

  private generateS3Key(
    organizationId: string,
    periodId: string,
    categoryId: string,
    uploadType: UploadType,
    uploadId: string,
    originalName: string
  ): string {
    // Generate a clean filename with UUID to avoid conflicts
    const fileExtension = originalName.split('.').pop();
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uuid = uuidv4();
    const filename = `${cleanName}_${uuid}.${fileExtension}`;

    return `${organizationId}/${periodId}/${categoryId}/${uploadType}/${uploadId}/${filename}`;
  }
}
