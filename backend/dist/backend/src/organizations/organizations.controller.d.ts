import { OrganizationsService } from './organizations.service';
import { YMCAImportService } from './services/ymca-import.service';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    private readonly ymcaImportService;
    constructor(organizationsService: OrganizationsService, ymcaImportService: YMCAImportService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<Organization>;
    findAll(): Promise<Organization[]>;
    findOne(id: string): Promise<Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization>;
    remove(id: string): Promise<void>;
    getChildren(id: string): Promise<Organization[]>;
    getParent(id: string): Promise<Organization | null>;
    importYMCAData(): Promise<{
        imported: number;
        updated: number;
        errors: number;
    }>;
    importYMCADataFromFile(file: Express.Multer.File): Promise<{
        imported: number;
        updated: number;
        errors: number;
    }>;
}
