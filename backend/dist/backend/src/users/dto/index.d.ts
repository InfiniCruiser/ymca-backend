export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    role: string;
    programAreas?: string[];
    locations?: string[];
    isActive?: boolean;
}
export declare class UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    programAreas?: string[];
    locations?: string[];
    isActive?: boolean;
}
