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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var YMCAImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YMCAImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("../entities/organization.entity");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
let YMCAImportService = YMCAImportService_1 = class YMCAImportService {
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
        this.logger = new common_1.Logger(YMCAImportService_1.name);
    }
    async importYMCAData(csvFilePath) {
        const filePath = csvFilePath || path.join(process.cwd(), '..', 'docs', 'Final Pilot Ys - Y Profile.csv');
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found at: ${filePath}`);
        }
        const results = [];
        let imported = 0;
        let updated = 0;
        let errors = 0;
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                this.logger.log(`Processing ${results.length} YMCA associations from CSV...`);
                for (const row of results) {
                    try {
                        if (imported + updated + errors < 3) {
                            this.logger.log(`Debug - Row ${imported + updated + errors + 1}:`, {
                                associationNumber: this.getCSVValue(row, 0),
                                name: this.getCSVValue(row, 1),
                                latitude: this.getCSVValue(row, 29),
                                longitude: this.getCSVValue(row, 31)
                            });
                        }
                        const result = await this.processYMCARow(row);
                        if (result === 'imported')
                            imported++;
                        else if (result === 'updated')
                            updated++;
                    }
                    catch (error) {
                        const values = Object.values(row);
                        this.logger.error(`Error processing row for ${values[1]}:`, error.message);
                        errors++;
                    }
                }
                this.logger.log(`Import completed: ${imported} imported, ${updated} updated, ${errors} errors`);
                resolve({ imported, updated, errors });
            })
                .on('error', reject);
        });
    }
    getCSVValue(row, index) {
        const values = Object.values(row);
        return values[index]?.trim() || '';
    }
    async processYMCARow(row) {
        const associationNumber = this.getCSVValue(row, 0);
        const associationName = this.getCSVValue(row, 1);
        if (!associationNumber || associationNumber === '') {
            throw new Error('Association Number is required');
        }
        let organization = await this.organizationRepository.findOne({
            where: { associationNumber }
        });
        if (!organization && associationName) {
            organization = await this.organizationRepository.findOne({
                where: { name: associationName }
            });
            if (organization) {
                this.logger.log(`Found organization by name: ${associationName}, updating association number to: ${associationNumber}`);
            }
        }
        if (organization) {
            this.updateOrganizationFromRow(organization, row);
            await this.organizationRepository.save(organization);
            return 'updated';
        }
        else {
            organization = this.createOrganizationFromRow(row);
            await this.organizationRepository.save(organization);
            return 'imported';
        }
    }
    createOrganizationFromRow(row) {
        const organization = new organization_entity_1.Organization();
        organization.associationNumber = this.getCSVValue(row, 0);
        organization.name = this.getCSVValue(row, 1);
        organization.code = this.generateCode(this.getCSVValue(row, 1));
        organization.type = organization_entity_1.OrganizationType.LOCAL_Y;
        const charterDateStr = this.getCSVValue(row, 16);
        if (charterDateStr && charterDateStr !== 'null') {
            organization.charterDate = this.parseDate(charterDateStr);
        }
        const latitudeStr = this.getCSVValue(row, 29);
        const longitudeStr = this.getCSVValue(row, 31);
        if (latitudeStr && latitudeStr !== '' && latitudeStr !== 'null' && !isNaN(parseFloat(latitudeStr))) {
            organization.latitude = parseFloat(latitudeStr);
            this.logger.log(`Setting latitude: ${organization.latitude} for ${this.getCSVValue(row, 1)}`);
        }
        if (longitudeStr && longitudeStr !== '' && longitudeStr !== 'null' && !isNaN(parseFloat(longitudeStr))) {
            organization.longitude = parseFloat(longitudeStr);
            this.logger.log(`Setting longitude: ${organization.longitude} for ${this.getCSVValue(row, 1)}`);
        }
        this.updateOrganizationFromRow(organization, row);
        organization.settings = {
            timezone: 'America/New_York',
            fiscalYearStart: '07-01',
            defaultFrameworkVersion: '1.0',
            allowEvidenceReuse: true,
            requireBoardApproval: true,
            autoFinalize: false,
            notificationSettings: {
                email: true,
                slack: false,
                reminders: {
                    enabled: true,
                    frequency: 'weekly',
                    daysBeforeDue: [7, 3, 1]
                }
            }
        };
        organization.isActive = true;
        return organization;
    }
    updateOrganizationFromRow(organization, row) {
        organization.name = this.getCSVValue(row, 1) || organization.name;
        organization.doingBusinessAs = this.getCSVValue(row, 24) || organization.doingBusinessAs;
        organization.facilityType = this.mapFacilityType(this.getCSVValue(row, 25)) || organization.facilityType;
        organization.isAssociation = this.getCSVValue(row, 26).toLowerCase() === 'yes';
        organization.isChartered = this.getCSVValue(row, 27).toLowerCase() === 'yes';
        organization.isLearningCenter = this.getCSVValue(row, 28).toLowerCase() === 'yes';
        organization.charterStatus = this.getCSVValue(row, 15) || organization.charterStatus;
        const charterDateStr = this.getCSVValue(row, 16);
        if (charterDateStr && charterDateStr !== 'null') {
            organization.charterDate = this.parseDate(charterDateStr) || organization.charterDate;
        }
        try {
            const branchCountStr = this.getCSVValue(row, 17);
            if (branchCountStr && branchCountStr !== 'null' && !isNaN(parseInt(branchCountStr))) {
                const branchCount = parseInt(branchCountStr);
                if (branchCount >= 0) {
                    organization.associationBranchCount = branchCount;
                }
            }
        }
        catch (error) {
            this.logger.warn(`Could not parse branch count for ${this.getCSVValue(row, 1)}: ${this.getCSVValue(row, 17)}`);
        }
        organization.budgetRange = this.mapBudgetRange(this.getCSVValue(row, 18)) || organization.budgetRange;
        organization.crmProvider = this.getCSVValue(row, 19) || organization.crmProvider;
        const closedDateStr = this.getCSVValue(row, 20);
        if (closedDateStr && closedDateStr !== 'null') {
            organization.closedDate = this.parseDate(closedDateStr) || organization.closedDate;
        }
        organization.closureReason = this.getCSVValue(row, 21) || organization.closureReason;
        const mergeDateStr = this.getCSVValue(row, 23);
        if (mergeDateStr && mergeDateStr !== 'null') {
            organization.completedMergeDate = this.parseDate(mergeDateStr) || organization.completedMergeDate;
        }
        const latitudeStr = this.getCSVValue(row, 29);
        const longitudeStr = this.getCSVValue(row, 31);
        if (latitudeStr && latitudeStr !== '' && latitudeStr !== 'null' && !isNaN(parseFloat(latitudeStr))) {
            organization.latitude = parseFloat(latitudeStr);
        }
        if (longitudeStr && longitudeStr !== '' && longitudeStr !== 'null' && !isNaN(parseFloat(longitudeStr))) {
            organization.longitude = parseFloat(longitudeStr);
        }
        organization.level = this.getCSVValue(row, 30) || organization.level;
        organization.memberGroup = this.mapMemberGroup(this.getCSVValue(row, 32)) || organization.memberGroup;
        organization.nwmParticipant = this.getCSVValue(row, 33).toLowerCase() === 'yes';
        organization.learningRegion = this.getCSVValue(row, 34) || organization.learningRegion;
        organization.yStatus = this.mapYStatus(this.getCSVValue(row, 35)) || organization.yStatus;
        organization.yType = this.mapYType(this.getCSVValue(row, 36)) || organization.yType;
        organization.yessParticipant = this.getCSVValue(row, 37).toLowerCase() === 'yes';
        organization.alliancePartner = this.getCSVValue(row, 38) || organization.alliancePartner;
        organization.financeSystem = this.getCSVValue(row, 39) || organization.financeSystem;
        organization.affiliateGroup = this.getCSVValue(row, 40) || organization.affiliateGroup;
        organization.potentialPilotInvite = this.getCSVValue(row, 2).toLowerCase() === 'yes';
        organization.invited = this.getCSVValue(row, 3).toLowerCase() === 'yes';
        organization.inviteResponse = this.getCSVValue(row, 4) || organization.inviteResponse;
        organization.receivedDavidQ = this.getCSVValue(row, 41).toLowerCase() === 'yes';
        organization.participatedInPilot1 = this.getCSVValue(row, 42).toLowerCase() === 'yes';
        organization.notes = this.getCSVValue(row, 43) || organization.notes;
        organization.ceoName = this.getCSVValue(row, 14) || organization.ceoName;
        organization.address = this.getCSVValue(row, 5) || organization.address;
        organization.address1 = this.getCSVValue(row, 6) || organization.address1;
        organization.city = this.getCSVValue(row, 7) || organization.city;
        const stateName = this.getCSVValue(row, 8);
        if (stateName && stateName !== 'null') {
            organization.state = this.mapStateToCode(stateName);
        }
        organization.zipCode = this.getCSVValue(row, 9) || organization.zipCode;
        organization.phone = this.getCSVValue(row, 10) || organization.phone;
        organization.fax = this.getCSVValue(row, 11) || organization.fax;
        organization.email = this.getCSVValue(row, 12) || organization.email;
        organization.website = this.getCSVValue(row, 13) || organization.website;
    }
    generateCode(name) {
        return name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .toUpperCase()
            .substring(0, 20);
    }
    mapFacilityType(facilityType) {
        if (!facilityType)
            return null;
        switch (facilityType.trim()) {
            case 'Facility': return organization_entity_1.FacilityType.FACILITY;
            case 'Non-Facility': return organization_entity_1.FacilityType.NON_FACILITY;
            case 'Resident Camp': return organization_entity_1.FacilityType.RESIDENT_CAMP;
            default: return null;
        }
    }
    mapBudgetRange(budgetRange) {
        if (!budgetRange)
            return null;
        switch (budgetRange.trim()) {
            case 'Under $650,000': return organization_entity_1.BudgetRange.UNDER_650K;
            case '$650,001-$1,000,000': return organization_entity_1.BudgetRange.SIX_FIFTY_TO_1M;
            case '$1,000,001-$2,000,000': return organization_entity_1.BudgetRange.ONE_TO_2M;
            case '$2,000,001-$4,000,000': return organization_entity_1.BudgetRange.TWO_TO_4M;
            case '$4,000,001-$14,000,000': return organization_entity_1.BudgetRange.FOUR_TO_14M;
            case 'Over $14,000,000': return organization_entity_1.BudgetRange.OVER_14M;
            default: return null;
        }
    }
    mapMemberGroup(memberGroup) {
        if (!memberGroup)
            return null;
        switch (memberGroup.trim()) {
            case 'Small & Mid Size': return organization_entity_1.MemberGroup.SMALL_MID_SIZE;
            case 'Mid-Major': return organization_entity_1.MemberGroup.MID_MAJOR;
            case 'YNAN': return organization_entity_1.MemberGroup.YNAN;
            default: return null;
        }
    }
    mapYStatus(yStatus) {
        if (!yStatus)
            return null;
        switch (yStatus.trim()) {
            case 'Open': return organization_entity_1.YMCAStatus.OPEN;
            case 'Closed': return organization_entity_1.YMCAStatus.CLOSED;
            case 'Merged': return organization_entity_1.YMCAStatus.MERGED;
            default: return null;
        }
    }
    mapYType(yType) {
        if (!yType)
            return null;
        switch (yType.trim()) {
            case 'Corporate Association': return organization_entity_1.YMCAType.CORPORATE_ASSOCIATION;
            case 'Independent Camp or Conference Center': return organization_entity_1.YMCAType.INDEPENDENT_CAMP;
            default: return null;
        }
    }
    mapStateToCode(stateName) {
        if (!stateName)
            return null;
        const stateMap = {
            'Alabama': 'AL',
            'Alaska': 'AK',
            'Arizona': 'AZ',
            'Arkansas': 'AR',
            'California': 'CA',
            'Colorado': 'CO',
            'Connecticut': 'CT',
            'Delaware': 'DE',
            'Florida': 'FL',
            'Georgia': 'GA',
            'Hawaii': 'HI',
            'Idaho': 'ID',
            'Illinois': 'IL',
            'Indiana': 'IN',
            'Iowa': 'IA',
            'Kansas': 'KS',
            'Kentucky': 'KY',
            'Louisiana': 'LA',
            'Maine': 'ME',
            'Maryland': 'MD',
            'Massachusetts': 'MA',
            'Michigan': 'MI',
            'Minnesota': 'MN',
            'Mississippi': 'MS',
            'Missouri': 'MO',
            'Montana': 'MT',
            'Nebraska': 'NE',
            'Nevada': 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'New Mexico': 'NM',
            'New York': 'NY',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            'Ohio': 'OH',
            'Oklahoma': 'OK',
            'Oregon': 'OR',
            'Pennsylvania': 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            'Tennessee': 'TN',
            'Texas': 'TX',
            'Utah': 'UT',
            'Vermont': 'VT',
            'Virginia': 'VA',
            'Washington': 'WA',
            'West Virginia': 'WV',
            'Wisconsin': 'WI',
            'Wyoming': 'WY'
        };
        return stateMap[stateName] || null;
    }
    parseDate(dateString) {
        if (!dateString || dateString.trim() === '')
            return null;
        if (dateString.includes('NaN') || dateString.includes('0NaN')) {
            this.logger.warn(`Skipping corrupted date string: "${dateString}"`);
            return null;
        }
        try {
            if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [month, day, year] = dateString.split('/');
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            return new Date(dateString);
        }
        catch (error) {
            this.logger.warn(`Failed to parse date: "${dateString}"`, error);
            return null;
        }
    }
    async updateOrganizationCoordinates(associationNumber, latitude, longitude, organizationName) {
        try {
            let organization = await this.organizationRepository.findOne({
                where: { associationNumber }
            });
            if (!organization && organizationName) {
                organization = await this.organizationRepository.findOne({
                    where: { name: organizationName }
                });
            }
            if (organization) {
                organization.latitude = latitude;
                organization.longitude = longitude;
                organization.associationNumber = associationNumber;
                await this.organizationRepository.save(organization);
                this.logger.log(`Updated coordinates for ${organization.name}: ${latitude}, ${longitude}`);
                return true;
            }
            else {
                this.logger.warn(`Organization with association number ${associationNumber} or name ${organizationName} not found`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Error updating coordinates for association ${associationNumber}:`, error);
            return false;
        }
    }
    async updateOrganizationFromCSV(organization, row) {
        try {
            organization.associationNumber = this.getCSVValue(row, 0) || organization.associationNumber;
            organization.name = this.getCSVValue(row, 1) || organization.name;
            this.updateOrganizationFromRow(organization, row);
            await this.organizationRepository.save(organization);
            this.logger.log(`Updated all fields for ${organization.name} from CSV`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating organization ${organization.name} from CSV:`, error);
            return false;
        }
    }
};
exports.YMCAImportService = YMCAImportService;
exports.YMCAImportService = YMCAImportService = YMCAImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], YMCAImportService);
//# sourceMappingURL=ymca-import.service.js.map