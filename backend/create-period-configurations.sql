-- Create period_configurations table
CREATE TABLE IF NOT EXISTS period_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "periodId" VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "gracePeriodEndDate" TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'grace_period', 'closed')),
    "isActive" BOOLEAN DEFAULT true,
    "totalCategories" INTEGER DEFAULT 17,
    description TEXT,
    settings JSON,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_period_configurations_periodId" ON period_configurations ("periodId");
CREATE INDEX IF NOT EXISTS "IDX_period_configurations_status" ON period_configurations (status);
CREATE INDEX IF NOT EXISTS "IDX_period_configurations_dates" ON period_configurations ("startDate", "endDate");

-- Insert seed data
INSERT INTO period_configurations ("periodId", label, "startDate", "endDate", "gracePeriodEndDate", status, "isActive", "totalCategories", description) VALUES
('2024-Q1', 'Q1 2024', '2024-01-01T00:00:00Z', '2024-03-31T23:59:59Z', '2024-04-14T23:59:59Z', 'closed', false, 17, 'First Quarter 2024 - Closed'),
('2024-Q2', 'Q2 2024', '2024-04-01T00:00:00Z', '2024-06-30T23:59:59Z', '2024-07-14T23:59:59Z', 'closed', false, 17, 'Second Quarter 2024 - Closed'),
('2024-Q3', 'Q3 2024', '2024-07-01T00:00:00Z', '2024-09-30T23:59:59Z', '2024-10-14T23:59:59Z', 'closed', false, 17, 'Third Quarter 2024 - Closed'),
('2024-Q4', 'Q4 2024', '2024-10-01T00:00:00Z', '2024-12-31T23:59:59Z', '2025-01-14T23:59:59Z', 'active', true, 17, 'Fourth Quarter 2024 - Currently Active'),
('2025-Q1', 'Q1 2025', '2025-01-01T00:00:00Z', '2025-03-31T23:59:59Z', '2025-04-14T23:59:59Z', 'upcoming', true, 17, 'First Quarter 2025 - Upcoming'),
('2025-Q2', 'Q2 2025', '2025-04-01T00:00:00Z', '2025-06-30T23:59:59Z', '2025-07-14T23:59:59Z', 'upcoming', true, 17, 'Second Quarter 2025 - Upcoming'),
('2025-Q3', 'Q3 2025', '2025-07-01T00:00:00Z', '2025-09-30T23:59:59Z', '2025-10-14T23:59:59Z', 'upcoming', true, 17, 'Third Quarter 2025 - Upcoming'),
('2025-Q4', 'Q4 2025', '2025-10-01T00:00:00Z', '2025-12-31T23:59:59Z', '2026-01-14T23:59:59Z', 'upcoming', true, 17, 'Fourth Quarter 2025 - Upcoming')
ON CONFLICT ("periodId") DO NOTHING;
