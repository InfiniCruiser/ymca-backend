import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodCompletion } from './entities/period-completion.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { MarkPeriodCompleteDto, ReopenPeriodDto, PeriodStatusResponseDto, PeriodProgressResponseDto } from './dto/period-completion.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(PeriodCompletion)
    private periodCompletionRepository: Repository<PeriodCompletion>,
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
  ) {}

  async markPeriodComplete(dto: MarkPeriodCompleteDto): Promise<PeriodStatusResponseDto> {
    const { organizationId, periodId, userId } = dto;

    // 1. Get or create period completion record
    let periodCompletion = await this.periodCompletionRepository.findOne({
      where: { organizationId, periodId, userId }
    });

    if (!periodCompletion) {
      throw new NotFoundException('Period completion record not found. Please upload at least one file first.');
    }

    // 2. Calculate actual completion status
    const uploadCounts = await this.getMainUploadCountsByCategory(periodId, organizationId);
    const actualCompletedCategories = Object.keys(uploadCounts).length;

    // 3. Determine completion status
    let status = 'incomplete';
    if (actualCompletedCategories >= periodCompletion.totalCategories) {
      status = 'complete';
    } else if (actualCompletedCategories > 0) {
      status = 'partial';
    }

    // 4. Check if can reopen (within 14 days of first upload)
    const canReopen = this.canReopenPeriod(periodCompletion.firstUploadDate);
    const reopeningDeadline = this.calculateReopeningDeadline(periodCompletion.firstUploadDate);

    // 5. Update completion record
    periodCompletion.status = status;
    periodCompletion.completedCategories = actualCompletedCategories;
    periodCompletion.completedAt = status === 'complete' ? new Date() : null;
    periodCompletion.canReopen = canReopen;

    await this.periodCompletionRepository.save(periodCompletion);

    // 6. Get missing categories
    const missingCategories = this.getMissingCategories(actualCompletedCategories, periodCompletion.totalCategories);

    // 7. Trigger notifications if complete
    if (status === 'complete') {
      await this.triggerCompletionNotifications(periodCompletion);
    }

    return {
      success: true,
      submissionId: periodCompletion.submissionId,
      status: status as 'incomplete' | 'partial' | 'complete',
      completedCategories: actualCompletedCategories,
      totalCategories: periodCompletion.totalCategories,
      canReopen,
      reopeningDeadline,
      message: `Period ${status}: ${actualCompletedCategories}/${periodCompletion.totalCategories} categories completed`,
      missingCategories,
      firstUploadDate: periodCompletion.firstUploadDate.toISOString(),
      completedAt: periodCompletion.completedAt?.toISOString(),
    };
  }

  async reopenPeriod(dto: ReopenPeriodDto): Promise<PeriodStatusResponseDto> {
    const { organizationId, periodId, userId } = dto;

    const periodCompletion = await this.periodCompletionRepository.findOne({
      where: { organizationId, periodId, userId }
    });

    if (!periodCompletion) {
      throw new NotFoundException('Period completion record not found.');
    }

    if (!periodCompletion.canReopen) {
      throw new BadRequestException('Period cannot be reopened. 14-day deadline has passed.');
    }

    // Reset completion status
    periodCompletion.status = 'incomplete';
    periodCompletion.completedAt = null;
    periodCompletion.completedCategories = 0;

    await this.periodCompletionRepository.save(periodCompletion);

    return {
      success: true,
      submissionId: periodCompletion.submissionId,
      status: 'incomplete',
      completedCategories: 0,
      totalCategories: periodCompletion.totalCategories,
      canReopen: true,
      reopeningDeadline: this.calculateReopeningDeadline(periodCompletion.firstUploadDate),
      message: 'Period reopened successfully. You can now upload additional files.',
      firstUploadDate: periodCompletion.firstUploadDate.toISOString(),
    };
  }

  async getPeriodStatus(organizationId: string, periodId: string, userId: string): Promise<PeriodProgressResponseDto> {
    const periodCompletion = await this.periodCompletionRepository.findOne({
      where: { organizationId, periodId, userId }
    });

    if (!periodCompletion) {
      throw new NotFoundException('Period completion record not found.');
    }

    const uploadCounts = await this.getMainUploadCountsByCategory(periodId, organizationId);
    const actualCompletedCategories = Object.keys(uploadCounts).length;
    const progressPercentage = Math.round((actualCompletedCategories / periodCompletion.totalCategories) * 100);

    const canReopen = this.canReopenPeriod(periodCompletion.firstUploadDate);
    const reopeningDeadline = this.calculateReopeningDeadline(periodCompletion.firstUploadDate);
    const missingCategories = this.getMissingCategories(actualCompletedCategories, periodCompletion.totalCategories);

    return {
      periodId,
      status: periodCompletion.status as 'incomplete' | 'partial' | 'complete',
      completedCategories: actualCompletedCategories,
      totalCategories: periodCompletion.totalCategories,
      progressPercentage,
      missingCategories,
      canReopen,
      reopeningDeadline,
      firstUploadDate: periodCompletion.firstUploadDate.toISOString(),
    };
  }

  async createOrUpdatePeriodCompletion(
    organizationId: string,
    periodId: string,
    userId: string,
    isFirstUpload: boolean = false
  ): Promise<PeriodCompletion> {
    let periodCompletion = await this.periodCompletionRepository.findOne({
      where: { organizationId, periodId, userId }
    });

    if (!periodCompletion) {
      // Create new period completion record
      periodCompletion = this.periodCompletionRepository.create({
        organizationId,
        periodId,
        userId,
        submissionId: `sub-${periodId}-${Date.now()}`,
        status: 'incomplete',
        totalCategories: 17,
        completedCategories: 0,
        firstUploadDate: isFirstUpload ? new Date() : null,
        canReopen: true,
      });
    } else if (isFirstUpload && !periodCompletion.firstUploadDate) {
      // Update first upload date if this is the first upload
      periodCompletion.firstUploadDate = new Date();
    }

    return await this.periodCompletionRepository.save(periodCompletion);
  }

  private async getMainUploadCountsByCategory(periodId: string, organizationId: string): Promise<Record<string, number>> {
    const results = await this.fileUploadRepository
      .createQueryBuilder('fu')
      .select('fu.categoryId, COUNT(*) as uploadCount')
      .where('fu.periodId = :periodId', { periodId })
      .andWhere('fu.organizationId = :organizationId', { organizationId })
      .andWhere('fu.uploadType = :uploadType', { uploadType: 'main' })
      .andWhere('fu.status = :status', { status: 'completed' })
      .groupBy('fu.categoryId')
      .getRawMany();

    const uploadCounts: Record<string, number> = {};
    results.forEach(result => {
      uploadCounts[result.categoryId] = parseInt(result.uploadCount);
    });

    return uploadCounts;
  }

  private canReopenPeriod(firstUploadDate: Date): boolean {
    if (!firstUploadDate) return true;
    
    const now = new Date();
    const daysSinceFirstUpload = Math.floor((now.getTime() - firstUploadDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceFirstUpload <= 14;
  }

  private calculateReopeningDeadline(firstUploadDate: Date): string {
    if (!firstUploadDate) return '';
    
    const deadline = new Date(firstUploadDate);
    deadline.setDate(deadline.getDate() + 14);
    return deadline.toISOString();
  }

  private getMissingCategories(completedCategories: number, totalCategories: number): string[] {
    const missingCategories: string[] = [];
    const categoryIds = Array.from({ length: totalCategories }, (_, i) => `category-${i + 1}`);
    
    // This is a simplified version - in reality, you'd query the actual missing categories
    // For now, we'll return a placeholder
    if (completedCategories < totalCategories) {
      const missingCount = totalCategories - completedCategories;
      for (let i = 0; i < missingCount; i++) {
        missingCategories.push(`category-${completedCategories + i + 1}`);
      }
    }
    
    return missingCategories;
  }

  private async triggerCompletionNotifications(periodCompletion: PeriodCompletion): Promise<void> {
    // TODO: Implement notification system
    // This could include:
    // - Email notifications
    // - Webhook calls to external systems
    // - Dashboard alerts
    // - Audit logging
    
    console.log(`Period completion notification triggered for ${periodCompletion.submissionId}`);
    
    // Example webhook call (implement based on your needs):
    // await this.webhookService.triggerCompletionWebhook(periodCompletion);
    
    // Example email notification (implement based on your needs):
    // await this.emailService.sendCompletionEmail(periodCompletion);
  }
}
