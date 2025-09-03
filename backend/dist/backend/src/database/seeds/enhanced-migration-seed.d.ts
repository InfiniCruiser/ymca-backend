import { DataSource } from 'typeorm';
export declare class EnhancedDatabaseSeeder {
    private dataSource;
    constructor(dataSource: DataSource);
    seed(): Promise<void>;
    private seedOrganizations;
    private seedUsers;
    private seedSubmissions;
    private generateRealisticResponses;
    private seedOEAPerformanceCalculations;
    private createOEAFromData;
    private calculatePerformanceFromSubmission;
}
