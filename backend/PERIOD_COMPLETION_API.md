# Period Completion API Documentation

## Overview

The Period Completion API allows users to track and manage the completion status of reporting periods. It integrates with the file upload system to automatically track progress and provides endpoints for marking periods as complete and reopening them within a 14-day window.

## Key Features

- ✅ **Automatic Progress Tracking**: Tracks completion based on main file uploads per category
- ✅ **14-Day Reopening Window**: Allows reopening completed periods within 14 days of first upload
- ✅ **Partial Completion Support**: Supports partial completion (e.g., 15/17 categories)
- ✅ **Submission ID Generation**: Generates unique submission IDs on first file upload
- ✅ **Notification System**: Ready for email/webhook notifications on completion

## API Endpoints

### 1. Mark Period Complete

**Endpoint:** `POST /api/v1/periods/mark-complete`

**Description:** Marks a period as complete after validating completion criteria.

**Request Body:**
```typescript
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "userId": "uuid"
}
```

**Response:**
```typescript
{
  "success": true,
  "submissionId": "sub-2024-Q1-1234567890",
  "status": "complete",
  "completedCategories": 17,
  "totalCategories": 17,
  "canReopen": true,
  "reopeningDeadline": "2024-01-15T00:00:00Z",
  "message": "Period marked as complete successfully",
  "missingCategories": [],
  "firstUploadDate": "2024-01-01T10:00:00Z",
  "completedAt": "2024-01-01T15:30:00Z"
}
```

**Status Codes:**
- `200`: Success
- `404`: Period completion record not found
- `400`: Invalid request or period cannot be completed

### 2. Reopen Period

**Endpoint:** `POST /api/v1/periods/reopen`

**Description:** Reopens a completed period if within the 14-day window.

**Request Body:**
```typescript
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "userId": "uuid"
}
```

**Response:**
```typescript
{
  "success": true,
  "submissionId": "sub-2024-Q1-1234567890",
  "status": "incomplete",
  "completedCategories": 0,
  "totalCategories": 17,
  "canReopen": true,
  "reopeningDeadline": "2024-01-15T00:00:00Z",
  "message": "Period reopened successfully. You can now upload additional files.",
  "firstUploadDate": "2024-01-01T10:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `404`: Period completion record not found
- `400`: Period cannot be reopened (14-day deadline passed)

### 3. Get Period Status

**Endpoint:** `GET /api/v1/periods/{periodId}/status`

**Description:** Retrieves the current status and progress of a period.

**Request Body:**
```typescript
{
  "organizationId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```typescript
{
  "periodId": "2024-Q1",
  "status": "partial",
  "completedCategories": 15,
  "totalCategories": 17,
  "progressPercentage": 88,
  "missingCategories": ["category-16", "category-17"],
  "canReopen": true,
  "reopeningDeadline": "2024-01-15T00:00:00Z",
  "firstUploadDate": "2024-01-01T10:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `404`: Period completion record not found

## Database Schema

### Period Completions Table

```sql
CREATE TABLE period_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizationId UUID NOT NULL,
  periodId VARCHAR(255) NOT NULL,
  userId UUID NOT NULL,
  submissionId VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('incomplete', 'partial', 'complete') DEFAULT 'incomplete',
  totalCategories INT DEFAULT 17,
  completedCategories INT DEFAULT 0,
  firstUploadDate TIMESTAMP NULL,
  completedAt TIMESTAMP NULL,
  canReopen BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes:**
- `IDX_period_completions_organization_period` on `(organizationId, periodId)`
- `IDX_period_completions_submission` on `(submissionId)`
- `IDX_period_completions_first_upload` on `(firstUploadDate)`

## Business Logic

### Completion Criteria

1. **Main Uploads Required**: Only `main` uploads count toward completion
2. **Secondary Uploads Optional**: `secondary` uploads are optional
3. **Partial Completion Allowed**: Users can complete with fewer than 17 categories
4. **File Validation**: No file type/size validation during completion check

### 14-Day Reopening Window

1. **Start Date**: 14-day window starts from `firstUploadDate` (first file upload)
2. **Multiple Completions**: Users can mark complete multiple times within 14 days
3. **Deadline Calculation**: `firstUploadDate + 14 days`
4. **Reopening**: Resets status to 'incomplete' but keeps original deadline

### Submission ID Generation

1. **Format**: `sub-{periodId}-{timestamp}`
2. **Generation**: Created on first file upload
3. **Uniqueness**: Unique across all periods
4. **Persistence**: Stored in `period_completions` table

## Integration with File Uploads

### Automatic Tracking

The system automatically tracks progress when files are uploaded:

1. **First Upload**: Creates period completion record with `submissionId`
2. **Subsequent Uploads**: Updates completion counts
3. **Status Updates**: Automatically updates status based on completion criteria

### File Upload Service Integration

```typescript
// In FileUploadsService.completeUpload()
const isFirstUpload = existingUploads === 1;

await this.periodsService.createOrUpdatePeriodCompletion(
  fileUpload.organizationId,
  fileUpload.periodId,
  fileUpload.userId,
  isFirstUpload
);
```

## Frontend Integration

### 1. Progress Display

```typescript
// Get period status
const response = await fetch(`/api/v1/periods/${periodId}/status`, {
  method: 'GET',
  body: JSON.stringify({ organizationId, userId })
});

const { completedCategories, totalCategories, progressPercentage } = response;
```

### 2. Mark Complete Button

```typescript
// Mark period complete
const response = await fetch('/api/v1/periods/mark-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ organizationId, periodId, userId })
});

if (response.success) {
  // Show success message
  // Update UI to show completed status
}
```

### 3. Reopening Interface

```typescript
// Check if can reopen
const { canReopen, reopeningDeadline } = await getPeriodStatus(periodId);

if (canReopen) {
  // Show "Reopen Period" button
  // Display countdown to deadline
}
```

### 4. Real-time Progress Updates

```typescript
// Update progress after file uploads
const uploadResponse = await uploadFiles(files);
if (uploadResponse.success) {
  // Refresh period status
  const status = await getPeriodStatus(periodId);
  updateProgressUI(status);
}
```

## Error Handling

### Common Error Scenarios

1. **Period Not Found**: User hasn't uploaded any files yet
2. **Deadline Passed**: 14-day window has expired
3. **Invalid Organization**: Organization ID doesn't match
4. **Network Errors**: Handle API failures gracefully

### Error Response Format

```typescript
{
  "statusCode": 400,
  "message": "Period cannot be reopened. 14-day deadline has passed.",
  "error": "Bad Request"
}
```

## Testing

### Test Scenarios

1. **First Upload**: Verify submission ID generation
2. **Progress Tracking**: Test completion count updates
3. **Mark Complete**: Test completion validation
4. **Reopening**: Test 14-day window logic
5. **Deadline Expiry**: Test deadline enforcement

### Sample Test Data

```typescript
const testData = {
  organizationId: "123e4567-e89b-12d3-a456-426614174000",
  periodId: "2024-Q1",
  userId: "123e4567-e89b-12d3-a456-426614174001"
};
```

## Deployment

### Migration

Run the database migration to create the `period_completions` table:

```bash
npx typeorm migration:run -d dist/backend/src/database/data-source.js
```

### Environment Variables

No additional environment variables required. The system uses existing database and file upload configurations.

## Future Enhancements

### Notification System

The system is ready for notification integration:

1. **Email Notifications**: Send completion emails to users
2. **Webhook Triggers**: Call external systems on completion
3. **Dashboard Alerts**: Update admin dashboards
4. **Audit Logging**: Log all completion events

### Advanced Features

1. **Custom Deadlines**: Allow custom reopening windows
2. **Bulk Operations**: Mark multiple periods complete
3. **Analytics**: Track completion patterns and trends
4. **Approval Workflow**: Add approval steps for completion

## Support

For questions or issues with the Period Completion API:

1. Check the API documentation
2. Review error messages and status codes
3. Test with sample data
4. Contact the backend team for assistance

The system is designed to be robust and user-friendly, with clear error messages and comprehensive status tracking.
