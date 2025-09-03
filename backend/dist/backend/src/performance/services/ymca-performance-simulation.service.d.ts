import { Repository } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { PerformanceCalculation } from '../entities/performance-calculation.entity';
export declare class YMCAPerformanceSimulationService {
    private organizationRepository;
    private performanceRepository;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>, performanceRepository: Repository<PerformanceCalculation>);
    generateSimulationsForAllYMCAs(): Promise<{
        message: string;
        generatedCount: number;
    }>;
    testOrganizationRepository(): Promise<{
        message: string;
        totalCount: number;
        ymcaCount: number;
    }>;
    private generateRealisticPerformance;
    private generateScoresBasedOnCharacteristics;
    private adjustScoresBasedOnCharacteristics;
    private randomScore;
    private determineSupportDesignation;
}
