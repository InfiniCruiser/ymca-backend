import { Repository } from 'typeorm';
import { Organization, OrganizationType } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
export declare class OrganizationsService {
    private readonly organizationRepository;
    constructor(organizationRepository: Repository<Organization>);
    create(createOrganizationDto: CreateOrganizationDto): Promise<Organization>;
    findAll(): Promise<Organization[]>;
    findOne(id: string): Promise<Organization>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization>;
    remove(id: string): Promise<void>;
    getChildren(id: string): Promise<Organization[]>;
    getParent(id: string): Promise<Organization | null>;
    findByType(type: OrganizationType): Promise<Organization[]>;
    count(): Promise<number>;
    getHierarchy(): Promise<Organization[]>;
}
