import { PerformanceService } from './performance.service';
import { YMCAPerformanceSimulationService } from './services/ymca-performance-simulation.service';
import { PerformanceCalculation } from './entities/performance-calculation.entity';
export declare class PerformanceController {
    private readonly performanceService;
    private readonly simulationService;
    constructor(performanceService: PerformanceService, simulationService: YMCAPerformanceSimulationService);
    findAll(): Promise<PerformanceCalculation[]>;
    createFromFrontend(createPerformanceDto: any): Promise<PerformanceCalculation>;
    getSummary(): Promise<{
        totalOrganizations: number;
        averageScore: number;
        supportDesignations: {
            designation: string;
            count: number;
        }[];
        recentCalculations: PerformanceCalculation[];
    }>;
    getSupportDesignations(): Promise<{
        designation: string;
        count: number;
    }[]>;
    getBenchmarks(): Promise<{
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
    }>;
    getGraceMetrics(organizationId: string): Promise<{
        organizationId: string;
        graceScore: number;
        engagementLevel: string;
        lastUpdated: string;
        dataSource: string;
        beta: boolean;
        note: string;
    }>;
    private getEngagementLevel;
    findByOrganization(organizationId: string): Promise<PerformanceCalculation[]>;
    findLatestByOrganization(organizationId: string): Promise<PerformanceCalculation | null>;
    findByPeriod(period: string): Promise<PerformanceCalculation[]>;
    findBySubmissionId(submissionId: string): Promise<PerformanceCalculation | null>;
    findById(id: string): Promise<PerformanceCalculation | null>;
    generateSimulations(): Promise<{
        message: string;
        generatedCount: number;
    }>;
    testOrganizations(): Promise<{
        message: string;
        totalCount: number;
        ymcaCount: number;
    }>;
}
