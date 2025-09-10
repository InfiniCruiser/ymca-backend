import { DataSource } from 'typeorm';
import { PeriodConfiguration } from '../../periods/entities/period-configuration.entity';

export async function seedPeriodConfigurations(dataSource: DataSource): Promise<void> {
  const periodConfigRepository = dataSource.getRepository(PeriodConfiguration);

  // Check if we already have period configurations
  const existingConfigs = await periodConfigRepository.count();
  if (existingConfigs > 0) {
    console.log('Period configurations already exist, skipping seed...');
    return;
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // Create period configurations for current year and next year
  const periodConfigs = [
    // 2024 Quarters
    {
      periodId: '2024-Q1',
      label: 'Q1 2024',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-03-31T23:59:59Z'),
      status: 'closed' as const,
      isActive: false,
      totalCategories: 17,
      description: 'First Quarter 2024 - Closed',
    },
    {
      periodId: '2024-Q2',
      label: 'Q2 2024',
      startDate: new Date('2024-04-01T00:00:00Z'),
      endDate: new Date('2024-06-30T23:59:59Z'),
      status: 'closed' as const,
      isActive: false,
      totalCategories: 17,
      description: 'Second Quarter 2024 - Closed',
    },
    {
      periodId: '2024-Q3',
      label: 'Q3 2024',
      startDate: new Date('2024-07-01T00:00:00Z'),
      endDate: new Date('2024-09-30T23:59:59Z'),
      status: 'closed' as const,
      isActive: false,
      totalCategories: 17,
      description: 'Third Quarter 2024 - Closed',
    },
    {
      periodId: '2024-Q4',
      label: 'Q4 2024',
      startDate: new Date('2024-10-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      status: 'active' as const,
      isActive: true,
      totalCategories: 17,
      description: 'Fourth Quarter 2024 - Currently Active',
    },
    // 2025 Quarters
    {
      periodId: '2025-Q1',
      label: 'Q1 2025',
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2025-03-31T23:59:59Z'),
      status: 'upcoming' as const,
      isActive: true,
      totalCategories: 17,
      description: 'First Quarter 2025 - Upcoming',
    },
    {
      periodId: '2025-Q2',
      label: 'Q2 2025',
      startDate: new Date('2025-04-01T00:00:00Z'),
      endDate: new Date('2025-06-30T23:59:59Z'),
      status: 'upcoming' as const,
      isActive: true,
      totalCategories: 17,
      description: 'Second Quarter 2025 - Upcoming',
    },
    {
      periodId: '2025-Q3',
      label: 'Q3 2025',
      startDate: new Date('2025-07-01T00:00:00Z'),
      endDate: new Date('2025-09-30T23:59:59Z'),
      status: 'upcoming' as const,
      isActive: true,
      totalCategories: 17,
      description: 'Third Quarter 2025 - Upcoming',
    },
    {
      periodId: '2025-Q4',
      label: 'Q4 2025',
      startDate: new Date('2025-10-01T00:00:00Z'),
      endDate: new Date('2025-12-31T23:59:59Z'),
      status: 'upcoming' as const,
      isActive: true,
      totalCategories: 17,
      description: 'Fourth Quarter 2025 - Upcoming',
    },
  ];

  // Calculate grace period end dates (14 days after end date)
  const configsWithGracePeriods = periodConfigs.map(config => {
    const gracePeriodEndDate = new Date(config.endDate);
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 14);
    
    return {
      ...config,
      gracePeriodEndDate,
    };
  });

  // Create and save period configurations
  for (const configData of configsWithGracePeriods) {
    const periodConfig = periodConfigRepository.create(configData);
    await periodConfigRepository.save(periodConfig);
    console.log(`✅ Created period configuration: ${configData.periodId} - ${configData.label}`);
  }

  console.log(`🎯 Successfully seeded ${configsWithGracePeriods.length} period configurations`);
}
