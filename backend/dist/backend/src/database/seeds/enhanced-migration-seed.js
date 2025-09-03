"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedDatabaseSeeder = void 0;
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const submission_entity_1 = require("../../submissions/entities/submission.entity");
const performance_calculation_entity_1 = require("../../performance/entities/performance-calculation.entity");
class EnhancedDatabaseSeeder {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async seed() {
        console.log('🌱 Starting enhanced database seeding with OEA data structure...');
        try {
            const organizations = await this.seedOrganizations();
            const users = await this.seedUsers(organizations);
            const submissions = await this.seedSubmissions(organizations, users);
            await this.seedOEAPerformanceCalculations(organizations, submissions);
            console.log('✅ Enhanced database seeding completed successfully!');
        }
        catch (error) {
            console.error('❌ Enhanced database seeding failed:', error);
            throw error;
        }
    }
    async seedOrganizations() {
        console.log('📋 Seeding organizations...');
        const organizationRepository = this.dataSource.getRepository(organization_entity_1.Organization);
        const organizations = [
            {
                name: 'XYZ YMCA',
                code: 'XYZ',
                type: organization_entity_1.OrganizationType.LOCAL_Y,
                address: '123 Main St',
                city: 'Anytown',
                state: 'ST',
                zipCode: '12345',
                phone: '(555) 123-4567',
                website: 'https://www.xyz-ymca.org',
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
                            frequency: 'weekly',
                            daysBeforeDue: [7, 3, 1]
                        }
                    }
                }
            },
            {
                name: 'St. Louis Y',
                code: 'STLOUIS',
                type: organization_entity_1.OrganizationType.LOCAL_Y,
                address: '456 Oak Ave',
                city: 'St. Louis',
                state: 'MO',
                zipCode: '63101',
                phone: '(314) 555-0123',
                website: 'https://www.stlouis-ymca.org',
                settings: {
                    timezone: 'America/Chicago',
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
                            frequency: 'weekly',
                            daysBeforeDue: [7, 3, 1]
                        }
                    }
                }
            },
            {
                name: 'Charlotte YMCA',
                code: 'CHARLOTTE',
                type: organization_entity_1.OrganizationType.LOCAL_Y,
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
                            frequency: 'weekly',
                            daysBeforeDue: [7, 3, 1]
                        }
                    }
                }
            },
            {
                name: 'YMCA of Greater Los Angeles',
                code: 'LA',
                type: organization_entity_1.OrganizationType.LOCAL_Y,
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
                            frequency: 'weekly',
                            daysBeforeDue: [7, 3, 1]
                        }
                    }
                }
            },
            {
                name: 'YMCA of Metropolitan Chicago',
                code: 'CHICAGO',
                type: organization_entity_1.OrganizationType.LOCAL_Y,
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
                            frequency: 'weekly',
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
            }
            else {
                savedOrganizations.push(existingOrg);
                console.log(`ℹ️  Organization already exists: ${existingOrg.name}`);
            }
        }
        return savedOrganizations;
    }
    async seedUsers(organizations) {
        console.log('👥 Seeding users...');
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
        const users = [
            {
                email: 'admin@xyz-ymca.org',
                firstName: 'Admin',
                lastName: 'User',
                organizationId: organizations[0].id,
                role: 'ASSOCIATION_ADMIN',
                programAreas: ['Child Protection', 'Governance'],
                locations: ['Main Branch'],
                isActive: true
            },
            {
                email: 'admin@stlouis-ymca.org',
                firstName: 'St. Louis',
                lastName: 'Admin',
                organizationId: organizations[1].id,
                role: 'ASSOCIATION_ADMIN',
                programAreas: ['Risk Mitigation', 'Engagement'],
                locations: ['Downtown Branch'],
                isActive: true
            },
            {
                email: 'john.doe@ymca.org',
                firstName: 'John',
                lastName: 'Doe',
                organizationId: organizations[2].id,
                role: 'PROGRAM_OWNER',
                programAreas: ['Child Protection', 'Governance'],
                locations: ['Main Branch'],
                isActive: true
            },
            {
                email: 'jane.smith@ymca.org',
                firstName: 'Jane',
                lastName: 'Smith',
                organizationId: organizations[3].id,
                role: 'ASSOCIATION_ADMIN',
                programAreas: ['Risk Mitigation', 'Engagement'],
                locations: ['Downtown Branch'],
                isActive: true
            },
            {
                email: 'mike.johnson@ymca.org',
                firstName: 'Mike',
                lastName: 'Johnson',
                organizationId: organizations[4].id,
                role: 'BOARD_LIAISON',
                programAreas: ['Governance', 'Strategic Planning'],
                locations: ['Central Branch'],
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
            }
            else {
                savedUsers.push(existingUser);
                console.log(`ℹ️  User already exists: ${existingUser.firstName} ${existingUser.lastName}`);
            }
        }
        return savedUsers;
    }
    async seedSubmissions(organizations, users) {
        console.log('📝 Seeding submissions...');
        const submissionRepository = this.dataSource.getRepository(submission_entity_1.Submission);
        const submissions = [];
        const periods = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'];
        for (const organization of organizations) {
            const orgUser = users.find(u => u.organizationId === organization.id);
            for (const period of periods) {
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
                }
                else {
                    submissions.push(existingSubmission);
                    console.log(`ℹ️  Submission already exists: ${organization.code} - ${period}`);
                }
            }
        }
        return submissions;
    }
    generateRealisticResponses(orgCode, period) {
        const responses = {};
        responses['RM.CP.001'] = Math.random() > 0.1 ? 'Yes' : 'Qualified Yes';
        responses['RM.CP.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
        responses['RM.CP.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
        responses['GV.BO.001'] = Math.random() > 0.1 ? 'Yes' : 'Qualified Yes';
        responses['GV.BO.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
        responses['GV.BO.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
        responses['EG.ME.001'] = Math.random() > 0.1 ? 'Yes' : 'In Progress';
        responses['EG.ME.002'] = Math.random() > 0.15 ? 'Yes' : 'No';
        responses['EG.ME.003'] = Math.random() > 0.2 ? 'Yes' : 'In Progress';
        return responses;
    }
    async seedOEAPerformanceCalculations(organizations, submissions) {
        console.log('📊 Seeding OEA performance calculations...');
        const performanceRepository = this.dataSource.getRepository(performance_calculation_entity_1.PerformanceCalculation);
        const oeaData = {
            'XYZ': {
                id: 'xyz',
                name: 'XYZ YMCA',
                totalPoints: 34,
                maxPoints: 80,
                overallSupportDesignation: 'Y-USA Support',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 0,
                                maxPoints: 4,
                                performance: 'low',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 9,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 5,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 24,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 0,
                                maxPoints: 12,
                                performance: 'low',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 0,
                                maxPoints: 12,
                                performance: 'low',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 0,
                                maxPoints: 8,
                                performance: 'low',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 6,
                        maxPoints: 40,
                        supportDesignation: 'Y-USA Support'
                    }
                }
            },
            'STLOUIS': {
                id: 'stlouis',
                name: 'St. Louis Y',
                totalPoints: 62,
                maxPoints: 80,
                overallSupportDesignation: 'Independent Improvement',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 7,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 10,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 33,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 8,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 9,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 29,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    }
                }
            },
            'CHARLOTTE': {
                id: 'charlotte',
                name: 'Charlotte YMCA',
                totalPoints: 71,
                maxPoints: 80,
                overallSupportDesignation: 'Independent Improvement',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 8,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 12,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 8,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 40,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 12,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 12,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 8,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 4,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 40,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    }
                }
            },
            'LA': {
                id: 'la',
                name: 'YMCA of Greater Los Angeles',
                totalPoints: 58,
                maxPoints: 80,
                overallSupportDesignation: 'Independent Improvement',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 7,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 11,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 7,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 34,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 10,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 10,
                                maxPoints: 12,
                                performance: 'high',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 32,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    }
                }
            },
            'NYC': {
                id: 'nyc',
                name: 'YMCA of Greater New York',
                totalPoints: 45,
                maxPoints: 80,
                overallSupportDesignation: 'Y-USA Support',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 8,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 5,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 26,
                        maxPoints: 40,
                        supportDesignation: 'Y-USA Support'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 6,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 6,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 4,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 20,
                        maxPoints: 40,
                        supportDesignation: 'Y-USA Support'
                    }
                }
            },
            'CHICAGO': {
                id: 'chicago',
                name: 'YMCA of Metropolitan Chicago',
                totalPoints: 52,
                maxPoints: 80,
                overallSupportDesignation: 'Independent Improvement',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 7,
                                maxPoints: 8,
                                performance: 'high',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 9,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 6,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 30,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 8,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 8,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 5,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 3,
                                maxPoints: 4,
                                performance: 'high',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 26,
                        maxPoints: 40,
                        supportDesignation: 'Independent Improvement'
                    }
                }
            },
            'SF': {
                id: 'sf',
                name: 'YMCA of San Francisco',
                totalPoints: 38,
                maxPoints: 80,
                overallSupportDesignation: 'Y-USA Support',
                performanceSnapshot: {
                    operationalPerformance: {
                        category: 'Operational Performance',
                        metrics: [
                            {
                                name: 'Membership and Program Growth',
                                points: 1,
                                maxPoints: 4,
                                performance: 'low',
                                description: 'Measures the growth percentage of the association\'s total impact compared to the prior year/based on market share'
                            },
                            {
                                name: 'Staff Retention',
                                points: 1,
                                maxPoints: 4,
                                performance: 'low',
                                description: 'Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year'
                            },
                            {
                                name: 'Grace Score',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'Measures an organization\'s commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations'
                            },
                            {
                                name: 'Risk Mitigation Score',
                                points: 5,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework'
                            },
                            {
                                name: 'Governance Score',
                                points: 7,
                                maxPoints: 12,
                                performance: 'moderate',
                                description: 'Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles'
                            },
                            {
                                name: 'Engagement Score',
                                points: 4,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement'
                            }
                        ],
                        totalPoints: 20,
                        maxPoints: 40,
                        supportDesignation: 'Y-USA Support'
                    },
                    financialPerformance: {
                        category: 'Financial Performance',
                        metrics: [
                            {
                                name: 'Months of Liquidity',
                                points: 4,
                                maxPoints: 12,
                                performance: 'low',
                                description: 'A measurement of how many months of cash a Y has in relation to its monthly expenses'
                            },
                            {
                                name: 'Operating Margin',
                                points: 4,
                                maxPoints: 12,
                                performance: 'low',
                                description: 'A measurement of the percentage an association\'s operating revenues exceed its operating expenses'
                            },
                            {
                                name: 'Debt Ratio',
                                points: 3,
                                maxPoints: 8,
                                performance: 'moderate',
                                description: 'A measurement of the extent to which the Y relies on debt financing'
                            },
                            {
                                name: 'Operating Revenue Mix',
                                points: 2,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement that reflects the balance of operating revenue streams'
                            },
                            {
                                name: 'Charitable Revenue',
                                points: 3,
                                maxPoints: 4,
                                performance: 'moderate',
                                description: 'A measurement of the percentage of charitable revenue an association receives relative to its operating revenue'
                            }
                        ],
                        totalPoints: 16,
                        maxPoints: 40,
                        supportDesignation: 'Y-USA Support'
                    }
                }
            }
        };
        for (const organization of organizations) {
            const orgSubmissions = submissions.filter(s => s.organizationId === organization.id);
            const oeaOrgData = oeaData[organization.code];
            for (const submission of orgSubmissions) {
                const performance = oeaOrgData
                    ? this.createOEAFromData(oeaOrgData, submission.periodId)
                    : this.calculatePerformanceFromSubmission(submission);
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
                    console.log(`✅ Created OEA performance calculation: ${organization.code} - ${submission.periodId}`);
                }
                else {
                    console.log(`ℹ️  Performance calculation already exists: ${organization.code} - ${submission.periodId}`);
                }
            }
        }
    }
    createOEAFromData(oeaData, period) {
        const operational = oeaData.performanceSnapshot.operationalPerformance;
        const financial = oeaData.performanceSnapshot.financialPerformance;
        const membershipGrowth = operational.metrics.find(m => m.name === 'Membership and Program Growth')?.points || 0;
        const staffRetention = operational.metrics.find(m => m.name === 'Staff Retention')?.points || 0;
        const graceScore = operational.metrics.find(m => m.name === 'Grace Score')?.points || 0;
        const riskMitigation = operational.metrics.find(m => m.name === 'Risk Mitigation Score')?.points || 0;
        const governance = operational.metrics.find(m => m.name === 'Governance Score')?.points || 0;
        const engagement = operational.metrics.find(m => m.name === 'Engagement Score')?.points || 0;
        const monthsOfLiquidity = financial.metrics.find(m => m.name === 'Months of Liquidity')?.points || 0;
        const operatingMargin = financial.metrics.find(m => m.name === 'Operating Margin')?.points || 0;
        const debtRatio = financial.metrics.find(m => m.name === 'Debt Ratio')?.points || 0;
        const operatingRevenueMix = financial.metrics.find(m => m.name === 'Operating Revenue Mix')?.points || 0;
        const charitableRevenue = financial.metrics.find(m => m.name === 'Charitable Revenue')?.points || 0;
        const operationalTotal = operational.totalPoints;
        const financialTotal = financial.totalPoints;
        const totalPoints = oeaData.totalPoints;
        const percentageScore = (totalPoints / oeaData.maxPoints) * 100;
        let performanceCategory = 'moderate';
        if (percentageScore >= 70)
            performanceCategory = 'high';
        else if (percentageScore < 40)
            performanceCategory = 'low';
        return {
            membershipGrowthScore: membershipGrowth,
            staffRetentionScore: staffRetention,
            graceScore: graceScore,
            riskMitigationScore: riskMitigation,
            governanceScore: governance,
            engagementScore: engagement,
            monthsOfLiquidityScore: monthsOfLiquidity,
            operatingMarginScore: operatingMargin,
            debtRatioScore: debtRatio,
            operatingRevenueMixScore: operatingRevenueMix,
            charitableRevenueScore: charitableRevenue,
            operationalTotalPoints: operationalTotal,
            financialTotalPoints: financialTotal,
            totalPoints: totalPoints,
            percentageScore: percentageScore,
            performanceCategory: performanceCategory,
            supportDesignation: oeaData.overallSupportDesignation,
            operationalSupportDesignation: operational.supportDesignation,
            financialSupportDesignation: financial.supportDesignation
        };
    }
    calculatePerformanceFromSubmission(submission) {
        const responses = submission.responses;
        let membershipGrowthScore = 0;
        let staffRetentionScore = 0;
        let graceScore = 0;
        let riskMitigationScore = 0;
        let governanceScore = 0;
        let engagementScore = 0;
        if (responses['RM.CP.001'] === 'Yes')
            riskMitigationScore += 2;
        if (responses['RM.CP.002'] === 'Yes')
            riskMitigationScore += 2;
        if (responses['RM.CP.003'] === 'Yes')
            riskMitigationScore += 2;
        if (responses['GV.BO.001'] === 'Yes')
            governanceScore += 3;
        if (responses['GV.BO.002'] === 'Yes')
            governanceScore += 3;
        if (responses['GV.BO.003'] === 'Yes')
            governanceScore += 3;
        if (responses['EG.ME.001'] === 'Yes')
            engagementScore += 2;
        if (responses['EG.ME.002'] === 'Yes')
            engagementScore += 2;
        if (responses['EG.ME.003'] === 'Yes')
            engagementScore += 2;
        membershipGrowthScore = Math.floor(Math.random() * 4) + 1;
        staffRetentionScore = Math.floor(Math.random() * 4) + 1;
        graceScore = Math.floor(Math.random() * 4) + 1;
        const monthsOfLiquidityScore = Math.floor(Math.random() * 12) + 1;
        const operatingMarginScore = Math.floor(Math.random() * 12) + 1;
        const debtRatioScore = Math.floor(Math.random() * 8) + 1;
        const operatingRevenueMixScore = Math.floor(Math.random() * 4) + 1;
        const charitableRevenueScore = Math.floor(Math.random() * 4) + 1;
        const operationalTotalPoints = membershipGrowthScore + staffRetentionScore + graceScore +
            riskMitigationScore + governanceScore + engagementScore;
        const financialTotalPoints = monthsOfLiquidityScore + operatingMarginScore + debtRatioScore +
            operatingRevenueMixScore + charitableRevenueScore;
        const totalPoints = operationalTotalPoints + financialTotalPoints;
        const percentageScore = (totalPoints / 80) * 100;
        let performanceCategory = 'moderate';
        if (percentageScore >= 70)
            performanceCategory = 'high';
        else if (percentageScore < 40)
            performanceCategory = 'low';
        return {
            membershipGrowthScore,
            staffRetentionScore,
            graceScore,
            riskMitigationScore,
            governanceScore,
            engagementScore,
            monthsOfLiquidityScore,
            operatingMarginScore,
            debtRatioScore,
            operatingRevenueMixScore,
            charitableRevenueScore,
            operationalTotalPoints,
            financialTotalPoints,
            totalPoints,
            percentageScore,
            performanceCategory,
            supportDesignation: 'Independent Improvement',
            operationalSupportDesignation: 'Independent Improvement',
            financialSupportDesignation: 'Independent Improvement'
        };
    }
}
exports.EnhancedDatabaseSeeder = EnhancedDatabaseSeeder;
//# sourceMappingURL=enhanced-migration-seed.js.map