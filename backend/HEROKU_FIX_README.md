# 🔧 Heroku Database Schema Fix

## Problem
Your Heroku backend is failing with the error:
```
QueryFailedError: column PerformanceCalculation.submissionId does not exist
```

This happens because the `performance_calculations` table is missing from your Heroku database, or it's missing the `submissionId` column.

## Root Cause
The `PerformanceCalculation` entity exists in your code, but the corresponding database table was never created. When the frontend tries to fetch dashboard stats, it calls the performance service which queries a non-existent table.

## Solution

### Option 1: Quick Fix (Recommended)
Run the database fix script directly on Heroku:

```bash
# SSH into your Heroku dyno
heroku run bash

# Navigate to the backend directory
cd backend

# Run the fix script
npm run db:fix-performance
```

### Option 2: Run from Local Machine
If you prefer to run it from your local machine:

```bash
# Make sure you have Heroku CLI installed and are logged in
heroku login

# Run the fix script remotely
heroku run "cd backend && npm run db:fix-performance" --app your-app-name
```

### Option 3: Manual Database Fix
If the scripts don't work, you can manually fix the database:

```sql
-- Connect to your Heroku Postgres database
-- Then run these commands:

-- Create the performance_calculations table
CREATE TABLE "performance_calculations" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "organizationId" uuid NOT NULL,
  "submissionId" uuid,
  "period" character varying(50) NOT NULL,
  "calculatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Operational Performance metrics
  "membershipGrowthScore" decimal(5,2),
  "staffRetentionScore" decimal(5,2),
  "graceScore" decimal(5,2),
  "riskMitigationScore" decimal(5,2),
  "governanceScore" decimal(5,2),
  "engagementScore" decimal(5,2),
  
  -- Financial Performance metrics
  "monthsOfLiquidityScore" decimal(5,2),
  "operatingMarginScore" decimal(5,2),
  "debtRatioScore" decimal(5,2),
  "operatingRevenueMixScore" decimal(5,2),
  "charitableRevenueScore" decimal(5,2),
  
  -- Aggregated scores
  "operationalTotalPoints" decimal(5,2),
  "financialTotalPoints" decimal(5,2),
  "totalPoints" decimal(5,2),
  "maxPoints" decimal(5,2) NOT NULL DEFAULT 80,
  "percentageScore" decimal(5,2),
  
  -- Performance category and support designation
  "performanceCategory" character varying(20),
  "supportDesignation" character varying(50),
  "operationalSupportDesignation" character varying(50),
  "financialSupportDesignation" character varying(50),
  
  -- Raw metric values
  "membershipGrowthValue" decimal(10,4),
  "staffRetentionValue" decimal(10,4),
  "graceScoreValue" decimal(10,4),
  "monthsOfLiquidityValue" decimal(10,4),
  "operatingMarginValue" decimal(10,4),
  "debtRatioValue" decimal(10,4),
  "operatingRevenueMixValue" decimal(10,4),
  "charitableRevenueValue" decimal(10,4),
  
  -- Calculation metadata
  "calculationMetadata" jsonb,
  
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PK_performance_calculations" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_performance_calculations_org_period" UNIQUE ("organizationId", "period")
);

-- Add foreign key constraints
ALTER TABLE "performance_calculations" 
ADD CONSTRAINT "FK_performance_calculations_organization" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;

ALTER TABLE "performance_calculations" 
ADD CONSTRAINT "FK_performance_calculations_submission" 
FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX "IDX_performance_calculations_organization" ON "performance_calculations" ("organizationId");
CREATE INDEX "IDX_performance_calculations_submission" ON "performance_calculations" ("submissionId");
CREATE INDEX "IDX_performance_calculations_period" ON "performance_calculations" ("period");
CREATE INDEX "IDX_performance_calculations_performance_category" ON "performance_calculations" ("performanceCategory");
```

## Verification

After running the fix, verify it worked:

```bash
# Check the database schema
npm run db:check-schema

# Or run it on Heroku
heroku run "cd backend && npm run db:check-schema" --app your-app-name
```

You should see:
- ✅ performance_calculations table exists
- ✅ submissionId column exists

## Prevention

To prevent this in the future:

1. **Always run migrations** when deploying to production
2. **Test your database schema** locally before deploying
3. **Use the migration system** instead of manual table creation
4. **Add database health checks** to your application startup

## Available Scripts

- `npm run db:check-schema` - Check current database schema
- `npm run db:fix-performance` - Fix the missing performance_calculations table
- `npm run db:migrate:heroku` - Run TypeORM migrations on Heroku

## Troubleshooting

If you still get errors:

1. **Check Heroku logs**: `heroku logs --tail --app your-app-name`
2. **Verify database connection**: Check your `DATABASE_URL` environment variable
3. **Check table permissions**: Ensure your database user has CREATE TABLE permissions
4. **Restart the dyno**: `heroku restart --app your-app-name`

## Support

If you continue to have issues, check:
- Heroku Postgres addon status
- Database connection string format
- Environment variables configuration
- Application startup logs
