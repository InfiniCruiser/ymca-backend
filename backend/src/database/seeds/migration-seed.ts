import { DataSource } from 'typeorm';
import { Organization, OrganizationType } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { PerformanceCalculation } from '../../performance/entities/performance-calculation.entity';
import { seedPeriodConfigurations } from './period-configurations.seed';
import { seedTestOrganizations } from './test-organizations.seed';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      // Seed period configurations first
      await seedPeriodConfigurations(this.dataSource);
      
      // Seed test organizations and users
      await seedTestOrganizations(this.dataSource);
      
      // Seed organizations
      const organizations = await this.seedOrganizations();
      
      // Seed users
      const users = await this.seedUsers(organizations);
      
      // Seed submissions
      const submissions = await this.seedSubmissions(organizations, users);
      
      // Seed performance calculations
      await this.seedPerformanceCalculations(organizations, submissions);

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedOrganizations(): Promise<Organization[]> {
    console.log('📋 Seeding organizations...');

    const organizationRepository = this.dataSource.getRepository(Organization);

    const organizations = [
      {
        name: 'Charlotte YMCA',
        code: 'CHARLOTTE',
        type: OrganizationType.LOCAL_Y,
        address: '400 E Morehead St',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28202',
        phone: '(704) 716-6100',
        website: 'https://www.ymcacharlotte.org',
        settings: {
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
              frequency: 'weekly' as const,
              daysBeforeDue: [7, 3, 1]
            }
          }
        }
      },
      {
        name: 'YMCA of Greater Los Angeles',
        code: 'LA',
        type: OrganizationType.LOCAL_Y,
        address: '401 S Hope St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90071',
        phone: '(213) 639-2999',
        website: 'https://www.ymcala.org',
        settings: {
          timezone: 'America/Los_Angeles',
          fiscalYearStart: '07-01',
          defaultFrameworkVersion: '1.0',
          allowEvidenceReuse: true,
          requireBoardApproval: true,
          autoFinalize: false,
          notificationSettings: {
            email: true,
            slack: true,
            reminders: {
              enabled: true,
              frequency: 'weekly' as const,
              daysBeforeDue: [7, 3, 1]
            }
          }
        }
      },
      {
        name: 'YMCA of Metropolitan Chicago',
        code: 'CHICAGO',
        type: OrganizationType.LOCAL_Y,
        address: '1030 W Van Buren St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60607',
        phone: '(312) 912-2600',
        website: 'https://www.ymcachicago.org',
        settings: {
          timezone: 'America/Chicago',
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
              frequency: 'weekly' as const,
              daysBeforeDue: [7, 3, 1]
            }
          }
        }
      },
      {
        name: 'YMCA of Greater New York',
        code: 'NYC',
        type: OrganizationType.LOCAL_Y,
        address: '5 W 63rd St',
        city: 'New York',
        state: 'NY',
        zipCode: '10023',
        phone: '(212) 875-4100',
        website: 'https://www.ymcanyc.org',
        settings: {
          timezone: 'America/New_York',
          fiscalYearStart: '07-01',
          defaultFrameworkVersion: '1.0',
          allowEvidenceReuse: true,
          requireBoardApproval: true,
          autoFinalize: false,
          notificationSettings: {
            email: true,
            slack: true,
            reminders: {
              enabled: true,
              frequency: 'weekly' as const,
              daysBeforeDue: [7, 3, 1]
            }
          }
        }
      },
      {
        name: 'YMCA of San Francisco',
        code: 'SF',
        type: OrganizationType.LOCAL_Y,
        address: '1660 Mission St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        phone: '(415) 777-9622',
        website: 'https://www.ymcasf.org',
        settings: {
          timezone: 'America/Los_Angeles',
          fiscalYearStart: '07-01',
          defaultFrameworkVersion: '1.0',
          allowEvidenceReuse: true,
          requireBoardApproval: true,
          autoFinalize: false,
          notificationSettings: {
            email: true,
            slack: true,
            reminders: {
              enabled: true,
              frequency: 'weekly' as const,
              daysBeforeDue: [7, 3, 1]
            }
          }
        }
      }
    ];

    const savedOrganizations = [];
    for (const orgData of organizations) {
      const existingOrg = await organizationRepository.findOne({
        where: { code: orgData.code }
      });

      if (!existingOrg) {
        const organization = organizationRepository.create(orgData);
        const savedOrg = await organizationRepository.save(organization);
        savedOrganizations.push(savedOrg);
        console.log(`✅ Created organization: ${savedOrg.name}`);
      } else {
        savedOrganizations.push(existingOrg);
        console.log(`ℹ️  Organization already exists: ${existingOrg.name}`);
      }
    }

    return savedOrganizations;
  }

  private async seedUsers(organizations: Organization[]): Promise<User[]> {
    console.log('👥 Seeding users...');

    const userRepository = this.dataSource.getRepository(User);

    const users = [
      {
        email: 'john.doe@ymca.org',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: organizations[0].id, // Charlotte YMCA
        role: 'PROGRAM_OWNER',
        programAreas: ['Child Protection', 'Governance'],
        locations: ['Main Branch'],
        isActive: true
      },
      {
        email: 'jane.smith@ymca.org',
        firstName: 'Jane',
        lastName: 'Smith',
        organizationId: organizations[1].id, // LA YMCA
        role: 'ASSOCIATION_ADMIN',
        programAreas: ['Risk Mitigation', 'Engagement'],
        locations: ['Downtown Branch'],
        isActive: true
      },
      {
        email: 'mike.johnson@ymca.org',
        firstName: 'Mike',
        lastName: 'Johnson',
        organizationId: organizations[2].id, // Chicago YMCA
        role: 'BOARD_LIAISON',
        programAreas: ['Governance', 'Strategic Planning'],
        locations: ['Central Branch'],
        isActive: true
      },
      {
        email: 'sarah.wilson@ymca.org',
        firstName: 'Sarah',
        lastName: 'Wilson',
        organizationId: organizations[3].id, // NYC YMCA
        role: 'PROGRAM_OWNER',
        programAreas: ['Child Protection', 'Member Engagement'],
        locations: ['Manhattan Branch'],
        isActive: true
      },
      {
        email: 'david.brown@ymca.org',
        firstName: 'David',
        lastName: 'Brown',
        organizationId: organizations[4].id, // SF YMCA
        role: 'ASSOCIATION_ADMIN',
        programAreas: ['Risk Mitigation', 'Governance'],
        locations: ['Mission Branch'],
        isActive: true
      }
    ];

    const savedUsers = [];
    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        const savedUser = await userRepository.save(user);
        savedUsers.push(savedUser);
        console.log(`✅ Created user: ${savedUser.firstName} ${savedUser.lastName}`);
      } else {
        savedUsers.push(existingUser);
        console.log(`ℹ️  User already exists: ${existingUser.firstName} ${existingUser.lastName}`);
      }
    }

    return savedUsers;
  }

  private async seedSubmissions(organizations: Organization[], users: User[]): Promise<Submission[]> {
    console.log('📝 Seeding submissions...');

    const submissionRepository = this.dataSource.getRepository(Submission);

    // Generate realistic survey responses for each organization
    const submissions = [];
    const periods = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'];

    for (const organization of organizations) {
      const orgUser = users.find(u => u.organizationId === organization.id);
      
      for (const period of periods) {
        // Generate realistic responses based on OPC framework questions
        const responses = this.generateRealisticResponses(organization.code, period);
        
        const submission = {
          periodId: `${organization.code}-${period}`,
          totalQuestions: 48,
          responses: responses,
          completed: true,
          submittedBy: orgUser?.id || 'unknown',
          organizationId: organization.id
        };

        const existingSubmission = await submissionRepository.findOne({
          where: { periodId: submission.periodId }
        });

        if (!existingSubmission) {
          const savedSubmission = submissionRepository.create(submission);
          const saved = await submissionRepository.save(savedSubmission);
          submissions.push(saved);
          console.log(`✅ Created submission: ${organization.code} - ${period}`);
        } else {
          submissions.push(existingSubmission);
          console.log(`ℹ️  Submission already exists: ${organization.code} - ${period}`);
        }
      }
    }

    return submissions;
  }

  private generateRealisticResponses(orgCode: string, period: string): Record<string, any> {
    // Generate realistic responses based on organization and period
    const responses: Record<string, any> = {};
    
    // Child Protection questions (RM.CP.*)
    responses['RM.CP.001'] = Math.random() > 0.1 ? 'Yes' : 'Qualified Yes';
    responses['RM.CP.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
    responses['RM.CP.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
    
    // Governance questions (GV.*)
    responses['GV.BO.001'] = Math.random() > 0.1 ? 'Yes' : 'Qualified Yes';
    responses['GV.BO.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
    responses['GV.BO.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
    
    // Engagement questions (EG.*)
    responses['EG.ME.001'] = Math.random() > 0.1 ? 'Yes' : 'In Progress';
    responses['EG.ME.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
    responses['EG.ME.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
    
    // Add more realistic responses for all 48 questions
    // This is a simplified version - you'd want to add all OPC questions
    
    return responses;
  }

  private async seedPerformanceCalculations(organizations: Organization[], submissions: Submission[]) {
    console.log('📊 Seeding performance calculations...');

    const performanceRepository = this.dataSource.getRepository(PerformanceCalculation);

    for (const organization of organizations) {
      const orgSubmissions = submissions.filter(s => s.organizationId === organization.id);
      
      for (const submission of orgSubmissions) {
        // Calculate performance based on submission responses
        const performance = this.calculatePerformanceFromSubmission(submission);
        
        const existingCalculation = await performanceRepository.findOne({
          where: { 
            organizationId: organization.id,
            period: submission.periodId
          }
        });

        if (!existingCalculation) {
          const calculation = performanceRepository.create({
            organizationId: organization.id,
            submissionId: submission.id,
            period: submission.periodId,
            ...performance
          });

          const saved = await performanceRepository.save(calculation);
          console.log(`✅ Created performance calculation: ${organization.code} - ${submission.periodId}`);
        } else {
          console.log(`ℹ️  Performance calculation already exists: ${organization.code} - ${submission.periodId}`);
        }
      }
    }
  }

  private calculatePerformanceFromSubmission(submission: Submission) {
    const responses = submission.responses;
    
    // Calculate scores based on responses
    let membershipGrowthScore = 0;
    let staffRetentionScore = 0;
    let forAllScore = 0;
    let riskMitigationScore = 0;
    let governanceScore = 0;
    let engagementScore = 0;

    // Calculate risk mitigation score (Child Protection questions)
    if (responses['RM.CP.001'] === 'Yes') riskMitigationScore += 10;
    if (responses['RM.CP.002'] === 'Yes') riskMitigationScore += 10;
    if (responses['RM.CP.003'] === 'Yes') riskMitigationScore += 10;

    // Calculate governance score
    if (responses['GV.BO.001'] === 'Yes') governanceScore += 10;
    if (responses['GV.BO.002'] === 'Yes') governanceScore += 10;
    if (responses['GV.BO.003'] === 'Yes') governanceScore += 10;

    // Calculate engagement score
    if (responses['EG.ME.001'] === 'Yes') engagementScore += 10;
    if (responses['EG.ME.002'] === 'Yes') engagementScore += 10;
    if (responses['EG.ME.003'] === 'Yes') engagementScore += 10;

    // Add some variation for other metrics
    membershipGrowthScore = Math.floor(Math.random() * 20) + 10; // 10-30
    staffRetentionScore = Math.floor(Math.random() * 20) + 10; // 10-30
    forAllScore = Math.floor(Math.random() * 20) + 10; // 10-30

    const totalPoints = membershipGrowthScore + staffRetentionScore + forAllScore + 
                       riskMitigationScore + governanceScore + engagementScore;
    const percentageScore = (totalPoints / 100) * 100;

    let performanceCategory = 'moderate';
    if (percentageScore >= 70) performanceCategory = 'high';
    else if (percentageScore < 40) performanceCategory = 'low';

    return {
      membershipGrowthScore,
      staffRetentionScore,
      forAllScore,
      riskMitigationScore,
      governanceScore,
      engagementScore,
      totalPoints,
      percentageScore,
      performanceCategory
    };
  }
}
