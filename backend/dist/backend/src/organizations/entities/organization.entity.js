"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = exports.MemberGroup = exports.BudgetRange = exports.FacilityType = exports.YMCAType = exports.YMCAStatus = exports.OrganizationType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
var OrganizationType;
(function (OrganizationType) {
    OrganizationType["LOCAL_Y"] = "LOCAL_Y";
    OrganizationType["REGIONAL"] = "REGIONAL";
    OrganizationType["NATIONAL"] = "NATIONAL";
})(OrganizationType || (exports.OrganizationType = OrganizationType = {}));
var YMCAStatus;
(function (YMCAStatus) {
    YMCAStatus["OPEN"] = "Open";
    YMCAStatus["CLOSED"] = "Closed";
    YMCAStatus["MERGED"] = "Merged";
})(YMCAStatus || (exports.YMCAStatus = YMCAStatus = {}));
var YMCAType;
(function (YMCAType) {
    YMCAType["CORPORATE_ASSOCIATION"] = "Corporate Association";
    YMCAType["INDEPENDENT_CAMP"] = "Independent Camp or Conference Center";
})(YMCAType || (exports.YMCAType = YMCAType = {}));
var FacilityType;
(function (FacilityType) {
    FacilityType["FACILITY"] = "Facility";
    FacilityType["NON_FACILITY"] = "Non-Facility";
    FacilityType["RESIDENT_CAMP"] = "Resident Camp";
})(FacilityType || (exports.FacilityType = FacilityType = {}));
var BudgetRange;
(function (BudgetRange) {
    BudgetRange["UNDER_650K"] = "Under $650,000";
    BudgetRange["SIX_FIFTY_TO_1M"] = "$650,001-$1,000,000";
    BudgetRange["ONE_TO_2M"] = "$1,000,001-$2,000,000";
    BudgetRange["TWO_TO_4M"] = "$2,000,001-$4,000,000";
    BudgetRange["FOUR_TO_14M"] = "$4,000,001-$14,000,000";
    BudgetRange["OVER_14M"] = "Over $14,000,000";
})(BudgetRange || (exports.BudgetRange = BudgetRange = {}));
var MemberGroup;
(function (MemberGroup) {
    MemberGroup["SMALL_MID_SIZE"] = "Small & Mid Size";
    MemberGroup["MID_MAJOR"] = "Mid-Major";
    MemberGroup["YNAN"] = "YNAN";
})(MemberGroup || (exports.MemberGroup = MemberGroup = {}));
let Organization = class Organization {
    constructor() {
        this.isAssociation = true;
        this.isChartered = true;
        this.isLearningCenter = false;
        this.associationBranchCount = 0;
        this.nwmParticipant = false;
        this.yessParticipant = false;
        this.potentialPilotInvite = false;
        this.invited = false;
        this.receivedDavidQ = false;
        this.participatedInPilot1 = false;
    }
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Organization.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Organization.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "associationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrganizationType,
        default: OrganizationType.LOCAL_Y
    }),
    (0, class_validator_1.IsEnum)(OrganizationType),
    __metadata("design:type", String)
], Organization.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "doingBusinessAs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FacilityType,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "facilityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isAssociation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isChartered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isLearningCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "charterStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Organization.prototype, "charterDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Organization.prototype, "associationBranchCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BudgetRange,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "budgetRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "crmProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Organization.prototype, "closedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "closureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Organization.prototype, "completedMergeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], Organization.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], Organization.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MemberGroup,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "memberGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "nwmParticipant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "learningRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: YMCAStatus,
        default: YMCAStatus.OPEN
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "yStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: YMCAType,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "yType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "yessParticipant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "alliancePartner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "financeSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "affiliateGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "potentialPilotInvite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "invited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "inviteResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "receivedDavidQ", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "participatedInPilot1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "ceoName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "address1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "fax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Organization.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], Organization.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Organization.prototype, "lastActiveAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parentId' }),
    __metadata("design:type", Organization)
], Organization.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Organization, org => org.parent),
    __metadata("design:type", Array)
], Organization.prototype, "children", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)('organizations'),
    (0, typeorm_1.Index)(['code'], { unique: true }),
    (0, typeorm_1.Index)(['associationNumber'], { unique: true })
], Organization);
//# sourceMappingURL=organization.entity.js.map