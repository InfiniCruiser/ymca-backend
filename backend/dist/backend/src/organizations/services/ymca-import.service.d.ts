import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
interface YMCACSVRow {
    [key: string]: string;
}
export declare class YMCAImportService {
    private organizationRepository;
    private readonly logger;
    constructor(organizationRepository: Repository<Organization>);
    importYMCAData(csvFilePath?: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
    }>;
    private getCSVValue;
    private processYMCARow;
    private createOrganizationFromRow;
    private updateOrganizationFromRow;
    private generateCode;
    private mapFacilityType;
    private mapBudgetRange;
    private mapMemberGroup;
    private mapYStatus;
    private mapYType;
    private mapStateToCode;
    private parseDate;
    updateOrganizationCoordinates(associationNumber: string, latitude: number, longitude: number, organizationName?: string): Promise<boolean>;
    updateOrganizationFromCSV(organization: Organization, row: YMCACSVRow): Promise<boolean>;
}
export {};
