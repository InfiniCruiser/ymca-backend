import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PeriodCompletion } from './entities/period-completion.entity';
import { PeriodConfiguration } from './entities/period-configuration.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { MarkPeriodCompleteDto, ReopenPeriodDto, PeriodStatusResponseDto, PeriodProgressResponseDto } from './dto/period-completion.dto';
import { CreatePeriodConfigurationDto, UpdatePeriodConfigurationDto, ActivePeriodResponseDto, PeriodConfigurationResponseDto } from './dto/period-management.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(PeriodCompletion)
    private periodCompletionRepository: Repository<PeriodCompletion>,
    @InjectRepository(PeriodConfiguration)
    private periodConfigurationRepository: Repository<PeriodConfiguration>,
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
      firstUploadDate: periodCompletion.firstUploadDate?.toISOString() || new Date().toISOString(),
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
      firstUploadDate: periodCompletion.firstUploadDate?.toISOString() || new Date().toISOString(),
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
      firstUploadDate: periodCompletion.firstUploadDate?.toISOString() || new Date().toISOString(),
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

  // ============================================================================
  // PERIOD CONFIGURATION MANAGEMENT
  // ============================================================================

  async getActivePeriod(): Promise<ActivePeriodResponseDto> {
    // First, update all period statuses based on current date
    await this.updatePeriodStatuses();

    // Find the currently active period
    const activePeriod = await this.periodConfigurationRepository.findOne({
      where: [
        { status: 'active', isActive: true },
        { status: 'grace_period', isActive: true }
      ],
      order: { startDate: 'DESC' }
    });

    if (!activePeriod) {
      throw new NotFoundException('No active period found. Please configure a period.');
    }

    return this.mapToActivePeriodResponse(activePeriod);
  }

  async createPeriodConfiguration(dto: CreatePeriodConfigurationDto): Promise<PeriodConfigurationResponseDto> {
    // Calculate grace period end date (14 days after end date)
    const endDate = new Date(dto.endDate);
    const gracePeriodEndDate = new Date(endDate);
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 14);

    // Determine initial status based on dates
    const now = new Date();
    const startDate = new Date(dto.startDate);
    let status: 'upcoming' | 'active' | 'grace_period' | 'closed' = 'upcoming';

    if (now >= startDate && now <= endDate) {
      status = 'active';
    } else if (now > endDate && now <= gracePeriodEndDate) {
      status = 'grace_period';
    } else if (now > gracePeriodEndDate) {
      status = 'closed';
    }

    // Determine if this period should be active
    const shouldBeActive = dto.isActive === true || (dto.isActive === undefined && status === 'active');
    
    const periodConfig = this.periodConfigurationRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      gracePeriodEndDate,
      status,
      totalCategories: dto.totalCategories || 17,
      isActive: shouldBeActive,
    });

    const savedConfig = await this.periodConfigurationRepository.save(periodConfig);
    
    // If this period is being set as active, deactivate all other periods
    if (savedConfig.isActive) {
      await this.periodConfigurationRepository.update(
        { isActive: true, id: Not(savedConfig.id) },
        { isActive: false }
      );
    }
    
    return this.mapToPeriodConfigurationResponse(savedConfig);
  }

  async updatePeriodConfiguration(id: string, dto: UpdatePeriodConfigurationDto): Promise<PeriodConfigurationResponseDto> {
    const periodConfig = await this.periodConfigurationRepository.findOne({
      where: { id }
    });

    if (!periodConfig) {
      throw new NotFoundException('Period configuration not found.');
    }

    // Update fields
    Object.assign(periodConfig, dto);

    // Recalculate grace period if end date changed
    if (dto.endDate) {
      const endDate = new Date(dto.endDate);
      const gracePeriodEndDate = new Date(endDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 14);
      periodConfig.gracePeriodEndDate = gracePeriodEndDate;
    }

    // Update status if dates changed
    if (dto.startDate || dto.endDate) {
      periodConfig.status = this.calculatePeriodStatus(
        new Date(periodConfig.startDate),
        new Date(periodConfig.endDate),
        periodConfig.gracePeriodEndDate
      );
    }

    const savedConfig = await this.periodConfigurationRepository.save(periodConfig);
    
    // If this period is being set as active, deactivate all other periods
    if (savedConfig.isActive) {
      await this.periodConfigurationRepository.update(
        { isActive: true, id: Not(savedConfig.id) },
        { isActive: false }
      );
    }
    
    return this.mapToPeriodConfigurationResponse(savedConfig);
  }

  async getAllPeriodConfigurations(): Promise<PeriodConfigurationResponseDto[]> {
    const configs = await this.periodConfigurationRepository.find({
      order: { startDate: 'DESC' }
    });

    return configs.map(config => this.mapToPeriodConfigurationResponse(config));
  }

  async fixActivePeriods(): Promise<void> {
    // Find the period with status 'active' and set it as the only active period
    const activePeriod = await this.periodConfigurationRepository.findOne({
      where: { status: 'active' }
    });

    if (activePeriod) {
      // Deactivate all periods first
      await this.periodConfigurationRepository.update(
        { isActive: true },
        { isActive: false }
      );
      
      // Activate only the period with status 'active'
      await this.periodConfigurationRepository.update(
        { id: activePeriod.id },
        { isActive: true }
      );
    } else {
      // If no period has status 'active', deactivate all periods
      await this.periodConfigurationRepository.update(
        { isActive: true },
        { isActive: false }
      );
    }
  }

  async getPeriodConfiguration(periodId: string): Promise<PeriodConfigurationResponseDto> {
    const config = await this.periodConfigurationRepository.findOne({
      where: { periodId }
    });

    if (!config) {
      throw new NotFoundException(`Period configuration for ${periodId} not found.`);
    }

    return this.mapToPeriodConfigurationResponse(config);
  }

  async validatePeriodAccess(periodId: string, user?: any): Promise<boolean> {
    // Testers have access to all periods
    if (user && (user.role === 'TESTER' || user.isTester)) {
      return true;
    }

    const periodConfig = await this.periodConfigurationRepository.findOne({
      where: { periodId }
    });

    if (!periodConfig) {
      return false;
    }

    return periodConfig.canAcceptSubmissions;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async updatePeriodStatuses(): Promise<void> {
    const now = new Date();
    const configs = await this.periodConfigurationRepository.find();

    for (const config of configs) {
      const newStatus = this.calculatePeriodStatus(
        config.startDate,
        config.endDate,
        config.gracePeriodEndDate
      );

      if (config.status !== newStatus) {
        config.status = newStatus;
        await this.periodConfigurationRepository.save(config);
      }
    }
  }

  private calculatePeriodStatus(
    startDate: Date,
    endDate: Date,
    gracePeriodEndDate: Date
  ): 'upcoming' | 'active' | 'grace_period' | 'closed' {
    const now = new Date();

    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else if (now > endDate && now <= gracePeriodEndDate) {
      return 'grace_period';
    } else {
      return 'closed';
    }
  }

  private mapToActivePeriodResponse(config: PeriodConfiguration): ActivePeriodResponseDto {
    return {
      periodId: config.periodId,
      label: config.label,
      status: config.status,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      gracePeriodEndDate: config.gracePeriodEndDate.toISOString(),
      daysRemaining: config.daysRemaining,
      progressPercentage: config.progressPercentage,
      canAcceptSubmissions: config.canAcceptSubmissions,
      totalCategories: config.totalCategories,
      description: config.description,
      settings: config.settings,
    };
  }

  private mapToPeriodConfigurationResponse(config: PeriodConfiguration): PeriodConfigurationResponseDto {
    return {
      id: config.id,
      periodId: config.periodId,
      label: config.label,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      gracePeriodEndDate: config.gracePeriodEndDate.toISOString(),
      status: config.status,
      isActive: config.isActive,
      totalCategories: config.totalCategories,
      description: config.description,
      settings: config.settings,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  async getAvailablePeriods() {
    try {
      console.log('🔍 Fetching available periods for frontend selection');
      
      // Get all period configurations
      const configurations = await this.periodConfigurationRepository.find({
        order: { startDate: 'DESC' }
      });

      // Map to frontend-friendly format
      const availablePeriods = configurations.map(config => ({
        periodId: config.periodId,
        label: config.label,
        status: config.status,
        startDate: config.startDate.toISOString(),
        endDate: config.endDate.toISOString(),
        gracePeriodEndDate: config.gracePeriodEndDate.toISOString(),
        daysRemaining: config.daysRemaining,
        progressPercentage: config.progressPercentage,
        canAcceptSubmissions: config.canAcceptSubmissions,
        totalCategories: config.totalCategories,
        description: config.description,
        isActive: config.isActive
      }));

      console.log(`✅ Found ${availablePeriods.length} available periods`);
      return availablePeriods;
      
    } catch (error) {
      console.error('❌ Error fetching available periods:', error);
      throw error;
    }
  }
}
