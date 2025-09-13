export declare enum OrganizationType {
    LOCAL_Y = "LOCAL_Y",
    REGIONAL = "REGIONAL",
    NATIONAL = "NATIONAL"
}
export declare enum YMCAStatus {
    OPEN = "Open",
    CLOSED = "Closed",
    MERGED = "Merged"
}
export declare enum YMCAType {
    CORPORATE_ASSOCIATION = "Corporate Association",
    INDEPENDENT_CAMP = "Independent Camp or Conference Center"
}
export declare enum FacilityType {
    FACILITY = "Facility",
    NON_FACILITY = "Non-Facility",
    RESIDENT_CAMP = "Resident Camp"
}
export declare enum BudgetRange {
    UNDER_650K = "Under $650,000",
    SIX_FIFTY_TO_1M = "$650,001-$1,000,000",
    ONE_TO_2M = "$1,000,001-$2,000,000",
    TWO_TO_4M = "$2,000,001-$4,000,000",
    FOUR_TO_14M = "$4,000,001-$14,000,000",
    OVER_14M = "Over $14,000,000"
}
export declare enum MemberGroup {
    SMALL_MID_SIZE = "Small & Mid Size",
    MID_MAJOR = "Mid-Major",
    YNAN = "YNAN"
}
export declare class Organization {
    id: string;
    name: string;
    code?: string;
    associationNumber?: string;
    type: OrganizationType;
    parentId?: string;
    doingBusinessAs?: string;
    facilityType?: FacilityType;
    isAssociation: boolean;
    isChartered: boolean;
    isLearningCenter: boolean;
    charterStatus?: string;
    charterDate?: Date;
    associationBranchCount: number;
    budgetRange?: BudgetRange;
    crmProvider?: string;
    closedDate?: Date;
    closureReason?: string;
    completedMergeDate?: Date;
    latitude?: number;
    longitude?: number;
    level?: string;
    memberGroup?: MemberGroup;
    nwmParticipant: boolean;
    learningRegion?: string;
    yStatus?: YMCAStatus;
    yType?: YMCAType;
    yessParticipant: boolean;
    alliancePartner?: string;
    financeSystem?: string;
    affiliateGroup?: string;
    potentialPilotInvite: boolean;
    invited: boolean;
    inviteResponse?: string;
    receivedDavidQ: boolean;
    participatedInPilot1: boolean;
    notes?: string;
    ceoName?: string;
    address?: string;
    address1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    settings: {
        timezone: string;
        fiscalYearStart: string;
        defaultFrameworkVersion: string;
        allowEvidenceReuse: boolean;
        requireBoardApproval: boolean;
        autoFinalize: boolean;
        notificationSettings: {
            email: boolean;
            slack: boolean;
            reminders: {
                enabled: boolean;
                frequency: 'daily' | 'weekly';
                daysBeforeDue: number[];
            };
        };
    };
    isActive: boolean;
    lastActiveAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    parent?: Organization;
    children?: Organization[];
}
