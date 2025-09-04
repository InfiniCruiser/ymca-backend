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
const performance_service_1 = require("../performance/performance.service");
let SubmissionsService = class SubmissionsService {
    constructor(submissionsRepository, performanceService) {
        this.submissionsRepository = submissionsRepository;
        this.performanceService = performanceService;
    }
    async create(createSubmissionDto) {
        const queryRunner = this.submissionsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const submission = this.submissionsRepository.create({
                ...createSubmissionDto,
                completed: true,
            });
            const savedSubmission = await queryRunner.manager.save(submission_entity_1.Submission, submission);
            console.log(`✅ Submission saved to database: ${savedSubmission.id}`);
            try {
                await this.performanceService.calculateAndSavePerformance(savedSubmission, queryRunner);
                console.log(`✅ Performance calculated for submission: ${savedSubmission.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to calculate performance for submission ${savedSubmission.id}:`, error);
            }
            await queryRunner.commitTransaction();
            console.log(`✅ Transaction committed for submission: ${savedSubmission.id}`);
            return savedSubmission;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`❌ Transaction rolled back for submission creation:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
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
            try {
                await this.performanceService.calculateAndSavePerformance(updatedSubmission);
                console.log(`✅ Performance recalculated for updated submission: ${updatedSubmission.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to recalculate performance for submission ${updatedSubmission.id}:`, error);
            }
        }
        return updatedSubmission;
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        performance_service_1.PerformanceService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map