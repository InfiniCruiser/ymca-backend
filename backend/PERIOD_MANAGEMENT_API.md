# Period Management API Documentation

## Overview

The Period Management API provides centralized control over reporting periods, ensuring consistency across the YMCA Self-Reporting Portal system. This system enforces period validation on the backend, preventing manipulation and ensuring data integrity.

## 🚀 Production Status

**✅ LIVE IN PRODUCTION** - The period management system is fully deployed and operational.

- **Base URL**: `https://ymca-backend-c1a73b2f2522.herokuapp.com`
- **Current Active Period**: `2025-Q3` (Q3 2025)
- **Status**: Active (21 days remaining, 77.75% progress)
- **Grace Period End**: October 14, 2025
- **Can Accept Submissions**: ✅ Yes

## Quick Reference

### Essential Endpoints for Frontend Teams

```bash
# Get current active period (USE THIS INSTEAD OF FRONTEND CALCULATION)
GET /api/v1/periods/active

# Get all period configurations
GET /api/v1/periods/configurations

# Grading API (now uses active period automatically)
GET /api/v1/grading/organizations
```

## Key Features

- ✅ **Backend-Enforced Period Control**: Single source of truth for active periods
- ✅ **Automatic Period Transitions**: Automatic status updates based on dates
- ✅ **14-Day Grace Periods**: Extended submission window after period end
- ✅ **Period Validation**: Built-in validation for all period-dependent operations
- ✅ **Database Configuration**: Persistent period configurations with full lifecycle management

## API Endpoints

### 1. Get Active Period

**Endpoint:** `GET /api/v1/periods/active`

**Description:** Returns the currently active period that accepts submissions.

**Response:**
```typescript
{
  "periodId": "2025-Q3",
  "label": "Q3 2025",
  "status": "active",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-09-30T23:59:59.000Z",
  "gracePeriodEndDate": "2025-10-14T23:59:59.000Z",
  "daysRemaining": 21,
  "progressPercentage": 77.75,
  "canAcceptSubmissions": true,
  "totalCategories": 17,
  "description": "Third Quarter 2025 - Upcoming",
  "settings": null
}
```

**Status Codes:**
- `200`: Success
- `404`: No active period found

### 2. Get All Period Configurations

**Endpoint:** `GET /api/v1/periods/configurations`

**Description:** Returns all period configurations ordered by start date.

**Response:**
```typescript
[
  {
    "id": "uuid",
    "periodId": "2024-Q4",
    "label": "Q4 2024",
    "startDate": "2024-10-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "gracePeriodEndDate": "2025-01-14T23:59:59Z",
    "status": "active",
    "isActive": true,
    "totalCategories": 17,
    "description": "Fourth Quarter 2024 - Currently Active",
    "settings": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 3. Get Period Configuration by ID

**Endpoint:** `GET /api/v1/periods/configurations/{periodId}`

**Description:** Returns a specific period configuration.

**Parameters:**
- `periodId` (path): Period ID in format YYYY-QN (e.g., 2024-Q4)

**Response:** Same as individual period configuration object above.

**Status Codes:**
- `200`: Success
- `404`: Period configuration not found

### 4. Create Period Configuration

**Endpoint:** `POST /api/v1/periods/configurations`

**Description:** Creates a new period configuration.

**Request Body:**
```typescript
{
  "periodId": "2025-Q1",
  "label": "Q1 2025",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "isActive": true,
  "totalCategories": 17,
  "description": "First Quarter 2025 - Upcoming",
  "settings": {}
}
```

**Response:** Created period configuration object.

**Status Codes:**
- `201`: Created successfully
- `400`: Invalid request data

### 5. Update Period Configuration

**Endpoint:** `PUT /api/v1/periods/configurations/{id}`

**Description:** Updates an existing period configuration.

**Parameters:**
- `id` (path): Configuration UUID

**Request Body:** Same as create, but all fields optional.

**Response:** Updated period configuration object.

**Status Codes:**
- `200`: Updated successfully
- `404`: Configuration not found
- `400`: Invalid request data

## Period Status Lifecycle

### Status Transitions

1. **upcoming** → **active**: When current date reaches start date
2. **active** → **grace_period**: When current date passes end date
3. **grace_period** → **closed**: When current date passes grace period end date

### Automatic Updates

Period statuses are automatically updated when:
- Any period-related API is called
- The system starts up
- Period configurations are modified

## Integration with Other Services

### Grading Service

The grading service now automatically uses the active period:

```typescript
// Before: Hardcoded period
GET /api/v1/grading/organizations?periodId=2024-Q1

// After: Uses active period automatically (2025-Q3)
GET /api/v1/grading/organizations
// Backend automatically determines active period
```

### File Upload Service

File uploads are validated against the active period:

```typescript
// All file uploads must use a valid, accessible period
POST /api/v1/file-uploads/generate-presigned-url
{
  "organizationId": "uuid",
  "periodId": "2025-Q3", // Must be active or in grace period
  "categoryId": "board-meeting-minutes",
  "uploadType": "main",
  "files": [...]
}
```

## Period Validation

### Built-in Validation

All period-dependent operations automatically validate:
- Period exists in configuration
- Period is currently accepting submissions (active or grace period)
- Period format is valid (YYYY-QN)

### Error Responses

```typescript
// Invalid period
{
  "statusCode": 400,
  "message": "Period 2024-Q1 is not currently accepting submissions or reviews.",
  "error": "Bad Request"
}

// Period not found
{
  "statusCode": 404,
  "message": "Period configuration for 2024-Q1 not found.",
  "error": "Not Found"
}
```

## Database Schema

### Period Configurations Table

```sql
CREATE TABLE period_configurations (
    id UUID PRIMARY KEY,
    periodId VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    gracePeriodEndDate TIMESTAMP NOT NULL,
    status ENUM('upcoming', 'active', 'grace_period', 'closed') DEFAULT 'upcoming',
    isActive BOOLEAN DEFAULT true,
    totalCategories INT DEFAULT 17,
    description TEXT,
    settings JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Migration and Seeding

### Running Migrations

```bash
# Run the period configurations migration
npm run migration:run
```

### Seeding Period Data

```bash
# Seed period configurations
npm run seed
```

The seed data includes:
- 2024 quarters (Q1-Q4 all closed)
- 2025 quarters (Q1-Q2 closed, Q3 active, Q4 upcoming)
- Automatic grace period calculations

## Production Examples

### Current Active Period Response
```bash
curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/periods/active
```

```json
{
  "periodId": "2025-Q3",
  "label": "Q3 2025",
  "status": "active",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-09-30T23:59:59.000Z",
  "gracePeriodEndDate": "2025-10-14T23:59:59.000Z",
  "daysRemaining": 21,
  "progressPercentage": 77.74753353305324,
  "canAcceptSubmissions": true,
  "totalCategories": 17,
  "description": "Third Quarter 2025 - Upcoming",
  "settings": null
}
```

### Grading API with Active Period
```bash
curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/grading/organizations
```

```json
{
  "periodId": "2025-Q3",
  "organizations": [
    {
      "organizationId": "uuid",
      "organizationName": "Example YMCA",
      "periodId": "2025-Q3",
      "status": "pending",
      "totalCategories": 17,
      "gradedCategories": 0,
      "lastUploaded": "2025-09-10T12:29:10.808Z",
      "dueDate": null,
      "assignedReviewer": null
    }
  ],
  "totalCount": 109,
  "hasMore": false
}
```

## Frontend Integration

### Recommended Frontend Changes

1. **Remove frontend period calculation logic**
2. **Fetch active period from backend**:

```javascript
// Frontend code
async function loadActivePeriod() {
  try {
    const response = await fetch('/api/v1/periods/active');
    const periodData = await response.json();
    
    // Update UI with active period info
    document.getElementById('periodId').textContent = periodData.periodId;
    document.getElementById('timeLeft').textContent = `${periodData.daysRemaining}d left`;
    document.getElementById('status').textContent = periodData.status;
    
    return periodData.periodId;
  } catch (error) {
    console.error('Failed to load active period:', error);
    // Handle error appropriately
  }
}
```

3. **Use active period in API calls**:

```javascript
// Use the active period from backend
const activePeriod = await loadActivePeriod();

// All API calls now use the backend-determined period
const uploadRequest = {
  organizationId: "uuid",
  periodId: activePeriod, // From backend
  categoryId: "board-meeting-minutes",
  uploadType: "main"
};
```

## Security Benefits

### Backend Enforcement

- **Prevents manipulation**: Users cannot change periodId to access other periods
- **Centralized validation**: Single source of truth for period rules
- **Audit trail**: All period operations are logged and validated
- **Data isolation**: Guaranteed separation between periods

### Access Control

- **Period transitions**: Backend controls when periods open/close
- **Grace periods**: Automatic 14-day extension after period end
- **Status validation**: All operations validate against current period status

## Testing

### Test Script

Run the included test script to verify the implementation:

```bash
node test-period-management.js
```

### Manual Testing

1. **Test active period endpoint**:
   ```bash
   curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/periods/active
   ```

2. **Test period validation**:
   ```bash
   curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/grading/organizations
   # Should automatically use active period (2025-Q3)
   ```

3. **Test invalid period**:
   ```bash
   curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/grading/organizations?periodId=2024-Q1
   # Should return validation error if period is closed
   ```

## Future Enhancements

### Planned Features

1. **Admin Interface**: Web-based period management
2. **Notification System**: Email alerts for period transitions
3. **Audit Logging**: Detailed logs of period-related operations
4. **Custom Grace Periods**: Configurable grace period lengths
5. **Period Templates**: Pre-configured period setups

### Configuration Options

- Grace period duration (currently 14 days)
- Automatic status updates (currently on API calls)
- Period validation rules
- Notification settings
