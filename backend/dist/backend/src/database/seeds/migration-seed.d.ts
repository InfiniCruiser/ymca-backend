import { DataSource } from 'typeorm';
export declare class DatabaseSeeder {
    private dataSource;
    constructor(dataSource: DataSource);
    seed(): Promise<void>;
    private seedOrganizations;
    private seedUsers;
    private seedSubmissions;
    private generateRealisticResponses;
    private seedPerformanceCalculations;
    private calculatePerformanceFromSubmission;
}
