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
let SubmissionsService = class SubmissionsService {
    constructor(submissionsRepository, fileUploadRepository, dataSource, performanceService) {
        this.submissionsRepository = submissionsRepository;
        this.fileUploadRepository = fileUploadRepository;
        this.dataSource = dataSource;
        this.performanceService = performanceService;
    }
    async create(createSubmissionDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { organizationId, periodId, isDraft = true } = createSubmissionDto;
            const latestSubmission = await queryRunner.manager.findOne(submission_entity_1.Submission, {
                where: { organizationId, periodId },
                order: { version: 'DESC' }
            });
            const nextVersion = latestSubmission ? latestSubmission.version + 1 : 1;
            if (latestSubmission) {
                await queryRunner.manager.update(submission_entity_1.Submission, { organizationId, periodId }, { isLatest: false });
            }
            const submission = queryRunner.manager.create(submission_entity_1.Submission, {
                ...createSubmissionDto,
                version: nextVersion,
                parentSubmissionId: latestSubmission?.id,
                isLatest: true,
                status: isDraft ? submission_status_enum_1.SubmissionStatus.DRAFT : submission_status_enum_1.SubmissionStatus.SUBMITTED,
                completed: !isDraft,
                submittedAt: isDraft ? undefined : new Date(),
            });
            const savedSubmission = await queryRunner.manager.save(submission_entity_1.Submission, submission);
            if (!isDraft) {
                await this.createFileSnapshots(queryRunner, savedSubmission.id, organizationId, periodId);
            }
            await queryRunner.commitTransaction();
            console.log(`✅ ${isDraft ? 'Draft' : 'Submission'} created: ${savedSubmission.id} (v${nextVersion})`);
            return savedSubmission;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`❌ Error creating submission:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async submitDraft(submitDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { submissionId, submittedBy } = submitDto;
            const draftSubmission = await queryRunner.manager.findOne(submission_entity_1.Submission, {
                where: { id: submissionId, status: submission_status_enum_1.SubmissionStatus.DRAFT }
            });
            if (!draftSubmission) {
                throw new Error(`Draft submission with ID ${submissionId} not found`);
            }
            await queryRunner.manager.update(submission_entity_1.Submission, submissionId, {
                status: submission_status_enum_1.SubmissionStatus.SUBMITTED,
                completed: true,
                submittedAt: new Date(),
                submittedBy,
            });
            await this.createFileSnapshots(queryRunner, submissionId, draftSubmission.organizationId, draftSubmission.periodId);
            const newDraft = await this.create({
                periodId: draftSubmission.periodId,
                responses: draftSubmission.responses,
                submittedBy: draftSubmission.submittedBy,
                organizationId: draftSubmission.organizationId,
                isDraft: true,
            });
            await queryRunner.commitTransaction();
            console.log(`✅ Draft submitted: ${submissionId}, new draft created: ${newDraft.id}`);
            return await this.findOne(submissionId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`❌ Error submitting draft:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createFileSnapshots(queryRunner, submissionId, organizationId, periodId) {
        const draftFiles = await queryRunner.manager.find(file_upload_entity_1.FileUpload, {
            where: {
                organizationId,
                periodId,
                isSnapshot: false,
                submissionId: null,
            }
        });
        for (const file of draftFiles) {
            const snapshot = queryRunner.manager.create(file_upload_entity_1.FileUpload, {
                ...file,
                id: undefined,
                submissionId,
                isSnapshot: true,
                originalUploadId: file.id,
                snapshotCreatedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await queryRunner.manager.save(file_upload_entity_1.FileUpload, snapshot);
        }
        console.log(`📸 Created ${draftFiles.length} file snapshots for submission ${submissionId}`);
    }
    async findAll() {
        return this.submissionsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.submissionsRepository.findOne({ where: { id } });
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
                status: submission_status_enum_1.SubmissionStatus.DRAFT,
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
    async update(id, updateSubmissionDto) {
        const submission = await this.findOne(id);
        if (!submission) {
            throw new Error(`Submission with ID ${id} not found`);
        }
        Object.assign(submission, updateSubmissionDto);
        const updatedSubmission = await this.submissionsRepository.save(submission);
        if (updateSubmissionDto.responses) {
            console.log(`ℹ️ Submission updated, frontend will recalculate performance scores: ${updatedSubmission.id}`);
        }
        return updatedSubmission;
    }
    async autoSubmitDraftsForPeriod(periodId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const draftSubmissions = await queryRunner.manager.find(submission_entity_1.Submission, {
                where: {
                    periodId,
                    status: submission_status_enum_1.SubmissionStatus.DRAFT,
                    isLatest: true
                }
            });
            const submittedSubmissions = [];
            for (const draft of draftSubmissions) {
                await queryRunner.manager.update(submission_entity_1.Submission, draft.id, {
                    status: submission_status_enum_1.SubmissionStatus.SUBMITTED,
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
        performance_service_1.PerformanceService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map