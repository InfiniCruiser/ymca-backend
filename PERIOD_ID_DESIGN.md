# Period ID Design Specification

## Overview
This document outlines the `periodId` parameter design and usage across the YMCA Self-Reporting Portal system to ensure consistency between the participant portal and management portal.

## Period ID Format

### Standard Format
```
YYYY-QN
```
Where:
- `YYYY` = 4-digit year
- `QN` = Quarter number (Q1, Q2, Q3, Q4)

### Examples
- `2024-Q1` - First quarter of 2024
- `2024-Q2` - Second quarter of 2024
- `2024-Q3` - Third quarter of 2024
- `2024-Q4` - Fourth quarter of 2024

## Usage Across APIs

### 1. Participant Portal APIs

#### File Upload APIs
```http
POST /api/v1/file-uploads/generate-presigned-url
Content-Type: application/json

{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "categoryId": "board-meeting-minutes",
  "uploadType": "main"
}
```

```http
POST /api/v1/file-uploads/complete-upload
Content-Type: application/json

{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "categoryId": "board-meeting-minutes",
  "uploadType": "main",
  "uploadId": "upload-123",
  "files": [...]
}
```

#### Document Retrieval APIs
```http
GET /api/v1/file-uploads?organizationId=uuid&periodId=2024-Q1
GET /api/v1/file-uploads/{uploadId}?periodId=2024-Q1
```

### 2. Management Portal APIs

#### Grading APIs
```http
GET /api/v1/grading/organizations?periodId=2024-Q1
GET /api/v1/grading/organizations/{orgId}/categories?periodId=2024-Q1
GET /api/v1/grading/documents/{orgId}/{categoryId}?periodId=2024-Q1
GET /api/v1/grading/organizations/{orgId}/final-score?periodId=2024-Q1
```

#### Document Access APIs
```http
GET /api/v1/grading/documents/view/{orgId}/{periodId}/{categoryId}/{uploadType}/{uploadId}/{filename}
GET /api/v1/grading/documents/download/{orgId}/{periodId}/{categoryId}/{uploadType}/{uploadId}/{filename}
```

## Database Storage

### File Uploads Table
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY,
    organizationId UUID NOT NULL,
    periodId VARCHAR(255) NOT NULL,  -- Format: YYYY-QN
    categoryId VARCHAR(255) NOT NULL,
    uploadType VARCHAR(50) NOT NULL,
    uploadId VARCHAR(255) NOT NULL,
    files JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Grading Tables
```sql
CREATE TABLE document_category_grades (
    id UUID PRIMARY KEY,
    organizationId UUID NOT NULL,
    periodId VARCHAR(255) NOT NULL,  -- Format: YYYY-QN
    categoryId VARCHAR(255) NOT NULL,
    score DECIMAL(3,1) NOT NULL,
    reasoning TEXT NOT NULL,
    reviewerId VARCHAR(255) NOT NULL,
    reviewedAt TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Validation Rules

### Frontend Validation
```javascript
const PERIOD_ID_REGEX = /^\d{4}-Q[1-4]$/;

function validatePeriodId(periodId) {
  if (!PERIOD_ID_REGEX.test(periodId)) {
    throw new Error('Invalid periodId format. Expected: YYYY-QN (e.g., 2024-Q1)');
  }
  
  const [year, quarter] = periodId.split('-');
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (yearNum < 2020 || yearNum > currentYear + 1) {
    throw new Error('Invalid year in periodId. Must be between 2020 and next year.');
  }
  
  return true;
}
```

### Backend Validation
```typescript
import { IsString, Matches, Length } from 'class-validator';

export class PeriodIdDto {
  @IsString()
  @Matches(/^\d{4}-Q[1-4]$/, {
    message: 'periodId must be in format YYYY-QN (e.g., 2024-Q1)'
  })
  @Length(7, 7)
  periodId: string;
}
```

## Current Period Logic

### Default Period
- **Current Default**: `2024-Q1`
- **Logic**: Use the current quarter of the current year
- **Fallback**: If no periodId provided, default to current quarter

### Period Selection
```javascript
function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  let quarter;
  if (month <= 3) quarter = 'Q1';
  else if (month <= 6) quarter = 'Q2';
  else if (month <= 9) quarter = 'Q3';
  else quarter = 'Q4';
  
  return `${year}-${quarter}`;
}
```

## URL Structure

### S3 Key Pattern
```
uploads/{organizationId}/{periodId}/{categoryId}/{uploadType}/{uploadId}/{filename}
```

### Example S3 Keys
```
uploads/00af3129-a5e8-4e32-bd1f-c03e28dc5ef2/2024-Q1/board-meeting-minutes/main/upload-123/document.pdf
uploads/00af3129-a5e8-4e32-bd1f-c03e28dc5ef2/2024-Q1/aquatics-safety-third-party/additional/upload-456/report.pdf
```

## API Response Examples

### Organizations with Period Context
```json
{
  "periodId": "2024-Q1",
  "organizations": [
    {
      "organizationId": "00af3129-a5e8-4e32-bd1f-c03e28dc5ef2",
      "organizationName": "Kettle Moraine YMCA Inc.",
      "periodId": "2024-Q1",
      "status": "pending",
      "totalCategories": 17,
      "gradedCategories": 0,
      "lastUploaded": "2025-09-10T11:53:00.967Z"
    }
  ]
}
```

### Document Access with Period Context
```json
{
  "uploadId": "upload-123",
  "categoryId": "board-meeting-minutes",
  "organizationId": "00af3129-a5e8-4e32-bd1f-c03e28dc5ef2",
  "periodId": "2024-Q1",
  "files": [
    {
      "originalName": "board-meeting-minutes-document.pdf",
      "s3Key": "00af3129-a5e8-4e32-bd1f-c03e28dc5ef2/2024-Q1/board-meeting-minutes/main/upload-123/document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "uploadedAt": "2025-09-10T11:53:07.710Z"
    }
  ]
}
```

## Implementation Guidelines

### 1. Always Include periodId
- **Required**: All API calls must include `periodId` parameter
- **Query Parameter**: Use `?periodId=2024-Q1` for GET requests
- **Request Body**: Include in POST/PUT request bodies
- **URL Path**: Include in URL path for document access endpoints

### 2. Consistent Validation
- Validate format on both frontend and backend
- Provide clear error messages for invalid formats
- Default to current quarter if not provided

### 3. Database Queries
- Always filter by `periodId` in database queries
- Use proper indexing on `periodId` columns
- Ensure data isolation between periods

### 4. Error Handling
```json
{
  "statusCode": 400,
  "message": "Invalid periodId format. Expected: YYYY-QN (e.g., 2024-Q1)",
  "error": "Bad Request"
}
```

## Migration Notes

### Existing Data
- Existing file uploads without `periodId` should be migrated to `2024-Q1`
- Update any hardcoded period references
- Ensure backward compatibility during transition

### Testing
- Test with various periodId formats
- Verify data isolation between periods
- Test period transitions (Q1 → Q2, etc.)

## Contact Information

For questions about this design specification:
- **Backend Team**: [Backend Repository](https://github.com/InfiniCruiser/ymca-backend)
- **API Documentation**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs

---

**Last Updated**: September 10, 2025  
**Version**: 1.0  
**Status**: Active
