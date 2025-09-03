import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType, YMCAStatus, YMCAType, FacilityType, BudgetRange, MemberGroup } from '../entities/organization.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// CSV column mapping based on actual CSV structure
interface YMCACSVRow {
  [key: string]: string;
}

@Injectable()
export class YMCAImportService {
  private readonly logger = new Logger(YMCAImportService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async importYMCAData(csvFilePath?: string): Promise<{ imported: number; updated: number; errors: number }> {
    const filePath = csvFilePath || path.join(process.cwd(), '..', 'docs', 'Final Pilot Ys - Y Profile.csv');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found at: ${filePath}`);
    }

    const results: YMCACSVRow[] = [];
    let imported = 0;
    let updated = 0;
    let errors = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data: YMCACSVRow) => results.push(data))
        .on('end', async () => {
          this.logger.log(`Processing ${results.length} YMCA associations from CSV...`);

          for (const row of results) {
            try {
              // Debug: Log the first few rows to see what's being read
              if (imported + updated + errors < 3) {
                this.logger.log(`Debug - Row ${imported + updated + errors + 1}:`, {
                  associationNumber: this.getCSVValue(row, 0),
                  name: this.getCSVValue(row, 1),
                  latitude: this.getCSVValue(row, 29),
                  longitude: this.getCSVValue(row, 31)
                });
              }
              
              const result = await this.processYMCARow(row);
              if (result === 'imported') imported++;
              else if (result === 'updated') updated++;
            } catch (error) {
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

  private getCSVValue(row: YMCACSVRow, index: number): string {
    const values = Object.values(row);
    return values[index]?.trim() || '';
  }

  private async processYMCARow(row: YMCACSVRow): Promise<'imported' | 'updated'> {
    const associationNumber = this.getCSVValue(row, 0); // Association Number is the first column
    const associationName = this.getCSVValue(row, 1); // Association Name is the second column
    
    if (!associationNumber || associationNumber === '') {
      throw new Error('Association Number is required');
    }

    // First try to find by association number
    let organization = await this.organizationRepository.findOne({
      where: { associationNumber }
    });

    // If not found by association number, try to find by name (for existing orgs without association numbers)
    if (!organization && associationName) {
      organization = await this.organizationRepository.findOne({
        where: { name: associationName }
      });
      
      // If found by name, update the association number
      if (organization) {
        this.logger.log(`Found organization by name: ${associationName}, updating association number to: ${associationNumber}`);
      }
    }

    if (organization) {
      // Update existing organization
      this.updateOrganizationFromRow(organization, row);
      await this.organizationRepository.save(organization);
      return 'updated';
    } else {
      // Create new organization
      organization = this.createOrganizationFromRow(row);
      await this.organizationRepository.save(organization);
      return 'imported';
    }
  }

  private createOrganizationFromRow(row: YMCACSVRow): Organization {
    const organization = new Organization();
    
    // Basic information
    organization.associationNumber = this.getCSVValue(row, 0); // Association Number
    organization.name = this.getCSVValue(row, 1); // Association Name
    organization.code = this.generateCode(this.getCSVValue(row, 1)); // Association Name
    organization.type = OrganizationType.LOCAL_Y;
    
    // Charter date
    const charterDateStr = this.getCSVValue(row, 16);
    if (charterDateStr && charterDateStr !== 'null') {
      organization.charterDate = this.parseDate(charterDateStr);
    }
    
    // Latitude and Longitude
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
    
    // Set all other fields
    this.updateOrganizationFromRow(organization, row);
    
    // Default settings
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

  private updateOrganizationFromRow(organization: Organization, row: YMCACSVRow): void {
    // Update fields that might have changed
    organization.name = this.getCSVValue(row, 1) || organization.name;
    organization.doingBusinessAs = this.getCSVValue(row, 24) || organization.doingBusinessAs;
    organization.facilityType = this.mapFacilityType(this.getCSVValue(row, 25)) || organization.facilityType;
    organization.isAssociation = this.getCSVValue(row, 26).toLowerCase() === 'yes';
    organization.isChartered = this.getCSVValue(row, 27).toLowerCase() === 'yes';
    organization.isLearningCenter = this.getCSVValue(row, 28).toLowerCase() === 'yes';
    organization.charterStatus = this.getCSVValue(row, 15) || organization.charterStatus;
    
    // Charter date
    const charterDateStr = this.getCSVValue(row, 16);
    if (charterDateStr && charterDateStr !== 'null') {
      organization.charterDate = this.parseDate(charterDateStr) || organization.charterDate;
    }
    
    // Association Branch Count with error handling
    try {
      const branchCountStr = this.getCSVValue(row, 17);
      if (branchCountStr && branchCountStr !== 'null' && !isNaN(parseInt(branchCountStr))) {
        const branchCount = parseInt(branchCountStr);
        if (branchCount >= 0) { // Ensure it's a valid non-negative number
          organization.associationBranchCount = branchCount;
        }
      }
    } catch (error) {
      this.logger.warn(`Could not parse branch count for ${this.getCSVValue(row, 1)}: ${this.getCSVValue(row, 17)}`);
    }
    
    organization.budgetRange = this.mapBudgetRange(this.getCSVValue(row, 18)) || organization.budgetRange;
    organization.crmProvider = this.getCSVValue(row, 19) || organization.crmProvider;
    
    // Closed date
    const closedDateStr = this.getCSVValue(row, 20);
    if (closedDateStr && closedDateStr !== 'null') {
      organization.closedDate = this.parseDate(closedDateStr) || organization.closedDate;
    }
    
    organization.closureReason = this.getCSVValue(row, 21) || organization.closureReason;
    
    // Completed merge date
    const mergeDateStr = this.getCSVValue(row, 23);
    if (mergeDateStr && mergeDateStr !== 'null') {
      organization.completedMergeDate = this.parseDate(mergeDateStr) || organization.completedMergeDate;
    }
    
    // Latitude and Longitude
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
    
    // Update pilot program data
    organization.potentialPilotInvite = this.getCSVValue(row, 2).toLowerCase() === 'yes';
    organization.invited = this.getCSVValue(row, 3).toLowerCase() === 'yes';
    organization.inviteResponse = this.getCSVValue(row, 4) || organization.inviteResponse;
    organization.receivedDavidQ = this.getCSVValue(row, 41).toLowerCase() === 'yes';
    organization.participatedInPilot1 = this.getCSVValue(row, 42).toLowerCase() === 'yes';
    organization.notes = this.getCSVValue(row, 43) || organization.notes;
    
    // Update contact information
    organization.ceoName = this.getCSVValue(row, 14) || organization.ceoName;
    organization.address = this.getCSVValue(row, 5) || organization.address;
    organization.address1 = this.getCSVValue(row, 6) || organization.address1;
    organization.city = this.getCSVValue(row, 7) || organization.city;
    
    // Map full state names to 2-char state codes
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

  private generateCode(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase()
      .substring(0, 20);
  }

  private mapFacilityType(facilityType: string): FacilityType | null {
    if (!facilityType) return null;
    
    switch (facilityType.trim()) {
      case 'Facility': return FacilityType.FACILITY;
      case 'Non-Facility': return FacilityType.NON_FACILITY;
      case 'Resident Camp': return FacilityType.RESIDENT_CAMP;
      default: return null;
    }
  }

  private mapBudgetRange(budgetRange: string): BudgetRange | null {
    if (!budgetRange) return null;
    
    switch (budgetRange.trim()) {
      case 'Under $650,000': return BudgetRange.UNDER_650K;
      case '$650,001-$1,000,000': return BudgetRange.SIX_FIFTY_TO_1M;
      case '$1,000,001-$2,000,000': return BudgetRange.ONE_TO_2M;
      case '$2,000,001-$4,000,000': return BudgetRange.TWO_TO_4M;
      case '$4,000,001-$14,000,000': return BudgetRange.FOUR_TO_14M;
      case 'Over $14,000,000': return BudgetRange.OVER_14M;
      default: return null;
    }
  }

  private mapMemberGroup(memberGroup: string): MemberGroup | null {
    if (!memberGroup) return null;
    
    switch (memberGroup.trim()) {
      case 'Small & Mid Size': return MemberGroup.SMALL_MID_SIZE;
      case 'Mid-Major': return MemberGroup.MID_MAJOR;
      case 'YNAN': return MemberGroup.YNAN;
      default: return null;
    }
  }

  private mapYStatus(yStatus: string): YMCAStatus | null {
    if (!yStatus) return null;
    
    switch (yStatus.trim()) {
      case 'Open': return YMCAStatus.OPEN;
      case 'Closed': return YMCAStatus.CLOSED;
      case 'Merged': return YMCAStatus.MERGED;
      default: return null;
    }
  }

  private mapYType(yType: string): YMCAType | null {
    if (!yType) return null;
    
    switch (yType.trim()) {
      case 'Corporate Association': return YMCAType.CORPORATE_ASSOCIATION;
      case 'Independent Camp or Conference Center': return YMCAType.INDEPENDENT_CAMP;
      default: return null;
    }
  }

  private mapStateToCode(stateName: string): string | null {
    if (!stateName) return null;
    
    const stateMap: { [key: string]: string } = {
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

  private parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null;
    
    // Check for corrupted date strings
    if (dateString.includes('NaN') || dateString.includes('0NaN')) {
      this.logger.warn(`Skipping corrupted date string: "${dateString}"`);
      return null;
    }
    
    try {
      // Handle MM/DD/YYYY format specifically
      if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [month, day, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      return new Date(dateString);
    } catch (error) {
      this.logger.warn(`Failed to parse date: "${dateString}"`, error);
      return null;
    }
  }

  async updateOrganizationCoordinates(associationNumber: string, latitude: number, longitude: number, organizationName?: string): Promise<boolean> {
    try {
      // First try to find by association number
      let organization = await this.organizationRepository.findOne({
        where: { associationNumber }
      });

      // If not found by association number, try to find by name
      if (!organization && organizationName) {
        organization = await this.organizationRepository.findOne({
          where: { name: organizationName }
        });
      }

      if (organization) {
        organization.latitude = latitude;
        organization.longitude = longitude;
        organization.associationNumber = associationNumber; // Also update the association number
        await this.organizationRepository.save(organization);
        this.logger.log(`Updated coordinates for ${organization.name}: ${latitude}, ${longitude}`);
        return true;
      } else {
        this.logger.warn(`Organization with association number ${associationNumber} or name ${organizationName} not found`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error updating coordinates for association ${associationNumber}:`, error);
      return false;
    }
  }

  async updateOrganizationFromCSV(organization: Organization, row: YMCACSVRow): Promise<boolean> {
    try {
      // Update association number
      organization.associationNumber = this.getCSVValue(row, 0) || organization.associationNumber;
      
      // Update name (should already match, but just in case)
      organization.name = this.getCSVValue(row, 1) || organization.name;
      
      // Update all other fields using the existing updateOrganizationFromRow method
      this.updateOrganizationFromRow(organization, row);
      
      // Save the updated organization
      await this.organizationRepository.save(organization);
      
      this.logger.log(`Updated all fields for ${organization.name} from CSV`);
      return true;
    } catch (error) {
      this.logger.error(`Error updating organization ${organization.name} from CSV:`, error);
      return false;
    }
  }
}
