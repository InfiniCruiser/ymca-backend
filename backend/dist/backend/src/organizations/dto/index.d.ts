import { OrganizationType } from '../entities/organization.entity';
export declare class CreateOrganizationDto {
    name: string;
    code: string;
    type: OrganizationType;
    parentId?: string;
    settings?: Record<string, any>;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    website?: string;
}
export declare class UpdateOrganizationDto {
    name?: string;
    code?: string;
    type?: OrganizationType;
    parentId?: string;
    settings?: Record<string, any>;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    website?: string;
    isActive?: boolean;
}
