import { DataSource } from 'typeorm';
import { Organization, OrganizationType, YMCAStatus, YMCAType, FacilityType, BudgetRange, MemberGroup } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedTestOrganizations(dataSource: DataSource): Promise<void> {
  const organizationRepository = dataSource.getRepository(Organization);
  const userRepository = dataSource.getRepository(User);

  console.log('🌱 Seeding test organizations and users...');

  // Create test organizations
  const testOrganizations = [
    {
      name: 'Test YMCA Alpha',
      code: 'TEST-ALPHA',
      associationNumber: 'TEST001',
      type: OrganizationType.LOCAL_Y,
      facilityType: FacilityType.FACILITY,
      budgetRange: BudgetRange.ONE_TO_2M,
      memberGroup: MemberGroup.SMALL_MID_SIZE,
      yStatus: YMCAStatus.OPEN,
      yType: YMCAType.CORPORATE_ASSOCIATION,
      isAssociation: true,
      isChartered: true,
      isActive: true,
      settings: {
        timezone: 'America/New_York',
        fiscalYearStart: '01-01',
        defaultFrameworkVersion: '2024',
        allowEvidenceReuse: true,
        requireBoardApproval: false,
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
      name: 'Test YMCA Beta',
      code: 'TEST-BETA',
      associationNumber: 'TEST002',
      type: OrganizationType.LOCAL_Y,
      facilityType: FacilityType.FACILITY,
      budgetRange: BudgetRange.TWO_TO_4M,
      memberGroup: MemberGroup.MID_MAJOR,
      yStatus: YMCAStatus.OPEN,
      yType: YMCAType.CORPORATE_ASSOCIATION,
      isAssociation: true,
      isChartered: true,
      isActive: true,
      settings: {
        timezone: 'America/Chicago',
        fiscalYearStart: '01-01',
        defaultFrameworkVersion: '2024',
        allowEvidenceReuse: true,
        requireBoardApproval: true,
        autoFinalize: false,
        notificationSettings: {
          email: true,
          slack: true,
          reminders: {
            enabled: true,
            frequency: 'daily' as const,
            daysBeforeDue: [14, 7, 3, 1]
          }
        }
      }
    },
    {
      name: 'Test YMCA Gamma',
      code: 'TEST-GAMMA',
      associationNumber: 'TEST003',
      type: OrganizationType.LOCAL_Y,
      facilityType: FacilityType.RESIDENT_CAMP,
      budgetRange: BudgetRange.UNDER_650K,
      memberGroup: MemberGroup.SMALL_MID_SIZE,
      yStatus: YMCAStatus.OPEN,
      yType: YMCAType.INDEPENDENT_CAMP,
      isAssociation: true,
      isChartered: true,
      isActive: true,
      settings: {
        timezone: 'America/Denver',
        fiscalYearStart: '01-01',
        defaultFrameworkVersion: '2024',
        allowEvidenceReuse: false,
        requireBoardApproval: false,
        autoFinalize: true,
        notificationSettings: {
          email: true,
          slack: false,
          reminders: {
            enabled: true,
            frequency: 'weekly' as const,
            daysBeforeDue: [7, 1]
          }
        }
      }
    }
  ];

  const createdOrganizations = [];
  for (const orgData of testOrganizations) {
    const existingOrg = await organizationRepository.findOne({
      where: { code: orgData.code }
    });

    if (!existingOrg) {
      const organization = organizationRepository.create(orgData as any);
      const savedOrg = await organizationRepository.save(organization);
      createdOrganizations.push(savedOrg);
      console.log(`✅ Created test organization: ${(savedOrg as any).name}`);
    } else {
      createdOrganizations.push(existingOrg);
      console.log(`ℹ️  Test organization already exists: ${existingOrg.name}`);
    }
  }

  // Create test users (20 total)
  const testUsers = [
    // Test YMCA Alpha users (7 users)
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group A' },
    { firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group A' },
    { firstName: 'Carol', lastName: 'Davis', email: 'carol.davis@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group B' },
    { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group B' },
    { firstName: 'Eva', lastName: 'Brown', email: 'eva.brown@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group C' },
    { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group C' },
    { firstName: 'Grace', lastName: 'Taylor', email: 'grace.taylor@testalpha.ymca', role: 'TESTER', testerGroup: 'Alpha Group C' },

    // Test YMCA Beta users (7 users)
    { firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group A' },
    { firstName: 'Ivy', lastName: 'Thomas', email: 'ivy.thomas@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group A' },
    { firstName: 'Jack', lastName: 'Jackson', email: 'jack.jackson@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group B' },
    { firstName: 'Kate', lastName: 'White', email: 'kate.white@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group B' },
    { firstName: 'Liam', lastName: 'Harris', email: 'liam.harris@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group C' },
    { firstName: 'Maya', lastName: 'Martin', email: 'maya.martin@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group C' },
    { firstName: 'Noah', lastName: 'Garcia', email: 'noah.garcia@testbeta.ymca', role: 'TESTER', testerGroup: 'Beta Group C' },

    // Test YMCA Gamma users (6 users)
    { firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.martinez@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group A' },
    { firstName: 'Paul', lastName: 'Robinson', email: 'paul.robinson@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group A' },
    { firstName: 'Quinn', lastName: 'Clark', email: 'quinn.clark@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group B' },
    { firstName: 'Ruby', lastName: 'Rodriguez', email: 'ruby.rodriguez@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group B' },
    { firstName: 'Sam', lastName: 'Lewis', email: 'sam.lewis@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group C' },
    { firstName: 'Tina', lastName: 'Lee', email: 'tina.lee@testgamma.ymca', role: 'TESTER', testerGroup: 'Gamma Group C' }
  ];

  // Hash password for all test users
  const defaultPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  for (let i = 0; i < testUsers.length; i++) {
    const userData = testUsers[i];
    const orgIndex = Math.floor(i / 7); // Distribute users across organizations
    const organization = createdOrganizations[orgIndex];

    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (!existingUser) {
      const user = userRepository.create({
        ...userData,
        organizationId: organization.id,
        isTester: true,
        isActive: true,
        passwordHash: hashedPassword,
        programAreas: ['Youth Development', 'Healthy Living', 'Social Responsibility'],
        locations: ['Main Branch']
      });

      const savedUser = await userRepository.save(user);
      console.log(`✅ Created test user: ${savedUser.fullName} (${savedUser.email}) - ${organization.name}`);
    } else {
      console.log(`ℹ️  Test user already exists: ${existingUser.fullName} (${existingUser.email})`);
    }
  }

  console.log('🎉 Test organizations and users seeding completed!');
  console.log(`📊 Created ${createdOrganizations.length} test organizations and ${testUsers.length} test users`);
  console.log(`🔑 Default password for all test users: ${defaultPassword}`);
}
