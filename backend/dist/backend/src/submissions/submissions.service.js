"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const submission_entity_1 = require("./entities/submission.entity");
const submission_status_enum_1 = require("./entities/submission-status.enum");
const file_upload_entity_1 = require("../file-uploads/entities/file-upload.entity");
const performance_service_1 = require("../performance/performance.service");
const draft_service_1 = require("./draft.service");
let SubmissionsService = class SubmissionsService {
    constructor(submissionsRepository, fileUploadRepository, dataSource, performanceService, draftService) {
        this.submissionsRepository = submissionsRepository;
        this.fileUploadRepository = fileUploadRepository;
        this.dataSource = dataSource;
        this.performanceService = performanceService;
        this.draftService = draftService;
    }
    async create(createSubmissionDto) {
        const { organizationId, periodId, isDraft = true, submittedBy } = createSubmissionDto;
        if (!organizationId || !periodId || !submittedBy) {
            throw new common_1.BadRequestException('organizationId, periodId, and submittedBy are required');
        }
        if (isDraft) {
            return this.draftService.upsertActiveDraft(organizationId, submittedBy, periodId, {
                responses: createSubmissionDto.responses,
                submittedBy
            });
        }
        else {
            const draft = await this.draftService.upsertActiveDraft(organizationId, submittedBy, periodId, {
                responses: createSubmissionDto.responses,
                submittedBy
            });
            return this.draftService.submitDraft(organizationId, submittedBy, periodId);
        }
    }
    async submitDraft(submitDto) {
        const { submissionId, submittedBy } = submitDto;
        if (!submissionId) {
            throw new common_1.BadRequestException('submissionId is required');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(submissionId)) {
            throw new common_1.BadRequestException(`Invalid submissionId format: ${submissionId}`);
        }
        const draftSubmission = await this.submissionsRepository.findOne({
            where: { id: submissionId, status: submission_status_enum_1.SubmissionStatus.OPEN }
        });
        if (!draftSubmission) {
            throw new common_1.BadRequestException(`Draft submission with ID ${submissionId} not found`);
        }
        return this.draftService.submitDraft(draftSubmission.organizationId, submittedBy || draftSubmission.submittedBy, draftSubmission.periodId);
    }
    async createNewDraft(createSubmissionDto) {
        const { organizationId, periodId, submittedBy, responses } = createSubmissionDto;
        if (!organizationId || !periodId || !submittedBy) {
            throw new common_1.BadRequestException('organizationId, periodId, and submittedBy are required');
        }
        return this.draftService.startFresh(organizationId, submittedBy, periodId, {
            responses
        });
    }
    async createFileSnapshots(queryRunner, submissionId, organizationId, periodId) {
        console.log(`📸 Starting file snapshot creation for submission ${submissionId}...`);
        const draftSubmission = await queryRunner.manager.findOne(submission_entity_1.Submission, {
            where: { id: submissionId }
        });
        if (!draftSubmission) {
            console.log(`❌ Draft submission ${submissionId} not found for file snapshotting`);
            return;
        }
        const fileS3Keys = [];
        if (draftSubmission.responses && draftSubmission.responses.categories) {
            Object.values(draftSubmission.responses.categories).forEach((category) => {
                if (category.files && Array.isArray(category.files)) {
                    category.files.forEach((file) => {
                        if (file.s3Key) {
                            fileS3Keys.push(file.s3Key);
                        }
                    });
                }
            });
        }
        console.log(`📸 Found ${fileS3Keys.length} files in draft submission to snapshot`);
        if (fileS3Keys.length === 0) {
            console.log(`📸 No files to snapshot for submission ${submissionId}`);
            return;
        }
        const allFiles = await queryRunner.manager.find(file_upload_entity_1.FileUpload, {
            where: {
                organizationId,
                periodId,
                isSnapshot: false,
                submissionId: null,
            }
        });
        const draftFiles = allFiles.filter(fileUpload => {
            return fileUpload.files.some(file => fileS3Keys.includes(file.s3Key));
        });
        console.log(`📸 Found ${draftFiles.length} files to snapshot`);
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < draftFiles.length; i += batchSize) {
            batches.push(draftFiles.slice(i, i + batchSize));
        }
        console.log(`📸 Processing ${batches.length} batches of ${batchSize} files each`);
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`📸 Processing batch ${i + 1}/${batches.length} (${batch.length} files)`);
            const snapshots = batch.map(file => queryRunner.manager.create(file_upload_entity_1.FileUpload, {
                ...file,
                id: undefined,
                submissionId,
                isSnapshot: true,
                originalUploadId: file.id,
                snapshotCreatedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            await queryRunner.manager.save(file_upload_entity_1.FileUpload, snapshots);
            console.log(`📸 Batch ${i + 1} saved successfully`);
        }
        console.log(`📸 Created ${draftFiles.length} file snapshots for submission ${submissionId}`);
    }
    async findAll() {
        return this.submissionsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const submission = await this.submissionsRepository.findOne({ where: { id } });
        if (submission && submission.responses?.categories) {
            const s3SubmissionId = this.extractSubmissionIdFromS3Key(submission.responses.categories);
            if (s3SubmissionId) {
                submission.s3SubmissionId = s3SubmissionId;
            }
        }
        return submission;
    }
    extractSubmissionIdFromS3Key(categories) {
        for (const categoryId in categories) {
            const category = categories[categoryId];
            if (category?.files && Array.isArray(category.files)) {
                for (const file of category.files) {
                    if (file.s3Key && typeof file.s3Key === 'string') {
                        const parts = file.s3Key.split('/');
                        if (parts.length >= 5) {
                            const potentialSubmissionId = parts[4];
                            if (potentialSubmissionId && potentialSubmissionId.length === 36) {
                                return potentialSubmissionId;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    async findByPeriodId(periodId) {
        return this.submissionsRepository.find({
            where: { periodId },
            order: { createdAt: 'DESC' },
        });
    }
    async findLatestSubmission(organizationId, periodId) {
        return this.submissionsRepository.findOne({
            where: { organizationId, periodId, isLatest: true },
            order: { version: 'DESC' }
        });
    }
    async findSubmissionHistory(organizationId, periodId) {
        return this.submissionsRepository.find({
            where: { organizationId, periodId },
            order: { version: 'DESC' }
        });
    }
    async findDraftSubmission(organizationId, periodId) {
        return this.submissionsRepository.findOne({
            where: {
                organizationId,
                periodId,
                status: submission_status_enum_1.SubmissionStatus.OPEN,
                isLatest: true
            }
        });
    }
    async getSubmissionStats() {
        const total = await this.submissionsRepository.count();
        const completed = await this.submissionsRepository.count({
            where: { completed: true },
        });
        return {
            total,
            completed,
            pending: total - completed,
        };
    }
    async getDashboardStats(organizationId) {
        try {
            console.log(`🔍 Fetching dashboard stats for organization: ${organizationId}`);
            const submissions = await this.submissionsRepository.find({
                where: { organizationId },
                order: { createdAt: 'DESC' },
            });
            console.log(`📊 Found ${submissions.length} submissions for organization`);
            const performanceCalculations = await this.performanceService.findByOrganization(organizationId);
            console.log(`📈 Found ${performanceCalculations.length} performance calculations for organization`);
            const totalSubmissions = submissions.length;
            const completedSubmissions = submissions.filter(s => s.completed).length;
            const activePeriods = new Set(submissions.map(s => s.periodId)).size;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const overdueResponses = submissions.filter(s => !s.completed && new Date(s.createdAt) < thirtyDaysAgo).length;
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const pendingReviews = submissions.filter(s => s.completed && new Date(s.createdAt) >= sevenDaysAgo).length;
            let complianceScore = 0;
            if (performanceCalculations.length > 0) {
                const latestCalculations = performanceCalculations.slice(0, 3);
                const totalScore = latestCalculations.reduce((sum, calc) => {
                    const score = typeof calc.percentageScore === 'string'
                        ? parseFloat(calc.percentageScore)
                        : (calc.percentageScore || 0);
                    return sum + score;
                }, 0);
                complianceScore = Math.round(totalScore / latestCalculations.length);
            }
            const result = {
                activePeriods,
                overdueResponses,
                pendingReviews,
                complianceScore,
                totalSubmissions,
                completedSubmissions,
                organizationId,
                lastUpdated: new Date().toISOString(),
            };
            console.log(`✅ Dashboard stats calculated:`, result);
            return result;
        }
        catch (error) {
            console.error(`❌ Error in getDashboardStats for organization ${organizationId}:`, error);
            throw error;
        }
    }
    async getPeriodStats(organizationId, periodId) {
        try {
            console.log(`🔍 Fetching period stats for organization: ${organizationId}, period: ${periodId}`);
            const submissions = await this.submissionsRepository.find({
                where: { organizationId, periodId },
                order: { createdAt: 'DESC' },
            });
            const draftSubmissions = submissions.filter(s => s.status === submission_status_enum_1.SubmissionStatus.OPEN);
            const submittedSubmissions = submissions.filter(s => s.status === submission_status_enum_1.SubmissionStatus.LOCKED);
            const lockedSubmissions = submissions.filter(s => s.status === submission_status_enum_1.SubmissionStatus.LOCKED);
            const allCategories = submissions.map(s => s.responses?.categoryId).filter(Boolean);
            const uniqueCategories = [...new Set(allCategories)];
            const draftCategories = [...new Set(draftSubmissions.map(s => s.responses?.categoryId).filter(Boolean))];
            const submittedCategories = [...new Set(submittedSubmissions.map(s => s.responses?.categoryId).filter(Boolean))];
            const latestSubmissions = [];
            for (const category of uniqueCategories) {
                const categorySubmissions = submissions
                    .filter(s => s.responses?.categoryId === category)
                    .sort((a, b) => b.version - a.version);
                if (categorySubmissions.length > 0) {
                    latestSubmissions.push(categorySubmissions[0]);
                }
            }
            let totalFiles = 0;
            let totalSize = 0;
            for (const submission of submissions) {
                if (submission.responses?.files) {
                    totalFiles += submission.responses.files.length;
                    totalSize += submission.responses.files.reduce((sum, file) => sum + (file.size || 0), 0);
                }
            }
            const result = {
                periodId,
                organizationId,
                totalSubmissions: submissions.length,
                draftSubmissions: draftSubmissions.length,
                submittedSubmissions: submittedSubmissions.length,
                lockedSubmissions: lockedSubmissions.length,
                totalCategories: uniqueCategories.length,
                draftCategories: draftCategories.length,
                submittedCategories: submittedCategories.length,
                categories: uniqueCategories,
                draftCategoriesList: draftCategories,
                submittedCategoriesList: submittedCategories,
                latestSubmissions: latestSubmissions.map(s => ({
                    id: s.id,
                    categoryId: s.responses?.categoryId,
                    status: s.status,
                    version: s.version,
                    isLatest: s.isLatest,
                    createdAt: s.createdAt,
                    submittedAt: s.submittedAt,
                    fileCount: s.responses?.files?.length || 0
                })),
                totalFiles,
                totalSize,
                lastUpdated: new Date().toISOString(),
            };
            console.log(`✅ Period stats calculated:`, {
                periodId,
                totalSubmissions: result.totalSubmissions,
                draftSubmissions: result.draftSubmissions,
                submittedSubmissions: result.submittedSubmissions,
                categories: result.categories.length
            });
            return result;
        }
        catch (error) {
            console.error(`❌ Error in getPeriodStats for organization ${organizationId}, period ${periodId}:`, error);
            throw error;
        }
    }
    async update(id, updateSubmissionDto) {
        console.log(`🔄 Updating submission ${id} with:`, JSON.stringify(updateSubmissionDto, null, 2));
        try {
            const submission = await this.findOne(id);
            if (!submission) {
                throw new Error(`Submission with ID ${id} not found`);
            }
            Object.assign(submission, updateSubmissionDto);
            console.log(`💾 Saving updated submission ${id}...`);
            const updatedSubmission = await this.submissionsRepository.save(submission);
            console.log(`✅ Submission ${id} updated successfully`);
            if (updateSubmissionDto.responses) {
                console.log(`ℹ️ Submission updated, frontend will recalculate performance scores: ${updatedSubmission.id}`);
            }
            return updatedSubmission;
        }
        catch (error) {
            console.error(`❌ Error updating submission ${id}:`, error);
            throw error;
        }
    }
    async autoSubmitDraftsForPeriod(periodId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const draftSubmissions = await queryRunner.manager.find(submission_entity_1.Submission, {
                where: {
                    periodId,
                    status: submission_status_enum_1.SubmissionStatus.OPEN,
                    isLatest: true
                }
            });
            const submittedSubmissions = [];
            for (const draft of draftSubmissions) {
                await queryRunner.manager.update(submission_entity_1.Submission, draft.id, {
                    status: submission_status_enum_1.SubmissionStatus.LOCKED,
                    completed: true,
                    submittedAt: new Date(),
                    autoSubmittedAt: new Date(),
                });
                await this.createFileSnapshots(queryRunner, draft.id, draft.organizationId, draft.periodId);
                submittedSubmissions.push(await queryRunner.manager.findOne(submission_entity_1.Submission, { where: { id: draft.id } }));
            }
            await queryRunner.commitTransaction();
            console.log(`🔄 Auto-submitted ${submittedSubmissions.length} drafts for period ${periodId}`);
            return {
                submittedCount: submittedSubmissions.length,
                submissions: submittedSubmissions
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`❌ Error auto-submitting drafts for period ${periodId}:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteDraft(submissionId) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(submissionId)) {
                throw new common_1.BadRequestException(`Invalid submission ID format. Expected UUID, got: ${submissionId}. Please use a valid submission ID.`);
            }
            const submission = await this.submissionsRepository.findOne({
                where: { id: submissionId }
            });
            if (!submission) {
                throw new Error(`Submission with ID ${submissionId} not found`);
            }
            if (submission.status !== submission_status_enum_1.SubmissionStatus.OPEN) {
                throw new Error(`Cannot discard submitted submission. Only draft submissions can be discarded.`);
            }
            await this.submissionsRepository.update(submissionId, {
                status: submission_status_enum_1.SubmissionStatus.ARCHIVED,
                discardedAt: new Date(),
                discardedBy: submission.submittedBy
            });
            console.log(`🗑️ Discarded draft submission: ${submissionId} by ${submission.submittedBy}`);
            return {
                message: `Draft submission ${submissionId} discarded successfully`
            };
        }
        catch (error) {
            console.error(`❌ Error deleting draft submission ${submissionId}:`, error);
            throw error;
        }
    }
    async startFreshDraft(organizationId, userId, periodId) {
        try {
            return await this.submissionsRepository.manager.transaction(async (manager) => {
                await manager.update(submission_entity_1.Submission, {
                    organizationId,
                    submittedBy: userId,
                    periodId,
                    status: submission_status_enum_1.SubmissionStatus.OPEN
                }, {
                    status: submission_status_enum_1.SubmissionStatus.ARCHIVED
                });
                const maxVersionResult = await manager
                    .createQueryBuilder(submission_entity_1.Submission, 'submission')
                    .select('MAX(submission.version)', 'maxVersion')
                    .where('submission.organizationId = :organizationId', { organizationId })
                    .andWhere('submission.submittedBy = :userId', { userId })
                    .andWhere('submission.periodId = :periodId', { periodId })
                    .getRawOne();
                const nextVersion = (maxVersionResult?.maxVersion || 0) + 1;
                const newDraft = manager.create(submission_entity_1.Submission, {
                    organizationId,
                    submittedBy: userId,
                    periodId,
                    version: nextVersion,
                    status: submission_status_enum_1.SubmissionStatus.OPEN,
                    responses: {},
                    completed: false,
                    isLatest: true
                });
                const savedDraft = await manager.save(newDraft);
                const s3SubmissionId = this.extractSubmissionIdFromS3Key(savedDraft.responses?.categories);
                console.log(`🔄 Started fresh draft for org ${organizationId}, user ${userId}, period ${periodId}, version ${nextVersion}`);
                return {
                    id: savedDraft.id,
                    version: savedDraft.version,
                    status: savedDraft.status,
                    s3SubmissionId: s3SubmissionId || undefined
                };
            });
        }
        catch (error) {
            console.error('❌ Error starting fresh draft:', error);
            throw error;
        }
    }
    async clearAll() {
        try {
            const count = await this.submissionsRepository.count();
            await this.submissionsRepository.clear();
            console.log(`🧹 Cleared ${count} submissions`);
            return {
                message: `Successfully cleared ${count} submissions`,
                deletedCount: count
            };
        }
        catch (error) {
            console.error('❌ Error clearing submissions:', error);
            throw error;
        }
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(submission_entity_1.Submission)),
    __param(1, (0, typeorm_1.InjectRepository)(file_upload_entity_1.FileUpload)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        performance_service_1.PerformanceService,
        draft_service_1.DraftService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map