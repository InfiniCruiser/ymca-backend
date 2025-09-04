import { Repository, QueryRunner } from 'typeorm';
import { PerformanceCalculation } from './entities/performance-calculation.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { AiConfigService } from '../ai-config/ai-config.service';
export declare class PerformanceService {
    private performanceCalculationRepository;
    private aiConfigService;
    private readonly logger;
    constructor(performanceCalculationRepository: Repository<PerformanceCalculation>, aiConfigService: AiConfigService);
    calculateAndSavePerformance(submission: Submission, queryRunner?: QueryRunner): Promise<PerformanceCalculation>;
    private calculatePerformanceFromSubmission;
    getBenchmarkInfo(): {
        membershipGrowth: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        staffRetention: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        graceScore: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        monthsOfLiquidity: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        operatingMargin: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        debtRatio: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        operatingRevenueMix: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
        charitableRevenue: {
            formula: string;
            benchmarks: {
                range: string;
                score: number;
            }[];
        };
    };
    findAll(): Promise<PerformanceCalculation[]>;
    findByOrganization(organizationId: string): Promise<PerformanceCalculation[]>;
    findLatestByOrganization(organizationId: string): Promise<PerformanceCalculation | null>;
    findById(id: string): Promise<PerformanceCalculation | null>;
    findByPeriod(period: string): Promise<PerformanceCalculation[]>;
    getSupportDesignations(): Promise<{
        designation: string;
        count: number;
    }[]>;
    getPerformanceSummary(): Promise<{
        totalOrganizations: number;
        averageScore: number;
        supportDesignations: {
            designation: string;
            count: number;
        }[];
        recentCalculations: PerformanceCalculation[];
    }>;
    private generateAIAnalysis;
}
