# File Upload API Documentation

## Overview

The YMCA backend now includes a comprehensive file upload system using S3 presigned URLs for secure, direct uploads. This system integrates with your existing authentication and organization structure.

## API Endpoints

### 1. Generate Presigned URLs

**POST** `/api/v1/file-uploads/presigned-url`

Generate secure presigned URLs for direct S3 uploads.

#### Request Body
```json
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "categoryId": "strategic-plan",
  "uploadType": "main",
  "files": [
    {
      "originalName": "strategic-plan.pdf",
      "size": 1024000,
      "type": "application/pdf"
    }
  ],
  "submissionId": "uuid" // optional
}
```

#### Response
```json
{
  "success": true,
  "uploadId": "uuid",
  "presignedUrls": [
    {
      "fileIndex": 0,
      "url": "https://s3.amazonaws.com/bucket/path?signature=...",
      "fields": {
        "key": "org123/period456/strategic-plan/main/uuid/filename.pdf",
        "bucket": "ymca-evidence"
      }
    }
  ],
  "expiresAt": "2024-01-15T11:00:00Z"
}
```

### 2. Complete Upload

**POST** `/api/v1/file-uploads/complete`

Mark file uploads as completed after successful S3 upload.

#### Request Body
```json
{
  "uploadId": "uuid",
  "files": [
    {
      "originalName": "strategic-plan.pdf",
      "s3Key": "org123/period456/strategic-plan/main/uuid/filename.pdf",
      "size": 1024000,
      "type": "application/pdf"
    }
  ]
}
```

#### Response
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "periodId": "2024-Q1",
  "categoryId": "strategic-plan",
  "uploadType": "main",
  "uploadId": "uuid",
  "files": [...],
  "status": "completed",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 3. List Uploads

**GET** `/api/v1/file-uploads`

Retrieve file uploads with optional filtering.

#### Query Parameters
- `organizationId` (optional): Filter by organization
- `periodId` (optional): Filter by period
- `categoryId` (optional): Filter by category
- `uploadType` (optional): Filter by type (main/secondary)
- `status` (optional): Filter by status (pending/uploading/completed/failed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Response
```json
{
  "uploads": [...],
  "totalCount": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### 4. Get Upload Statistics

**GET** `/api/v1/file-uploads/stats`

Get aggregated statistics about file uploads.

#### Query Parameters
- `organizationId` (required): Organization ID
- `periodId` (optional): Period ID

#### Response
```json
{
  "totalCategories": 17,
  "completedCategories": 5,
  "totalFiles": 12,
  "totalSize": 52428800,
  "categoryProgress": {
    "strategic-plan": {
      "mainFiles": 2,
      "secondaryFiles": 1,
      "lastUploaded": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 5. Get Specific Upload

**GET** `/api/v1/file-uploads/:id`

Retrieve a specific file upload by ID.

#### Response
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "periodId": "2024-Q1",
  "categoryId": "strategic-plan",
  "uploadType": "main",
  "uploadId": "uuid",
  "files": [...],
  "status": "completed",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "user": {...},
  "organization": {...},
  "submission": {...}
}
```

### 6. Delete Upload

**DELETE** `/api/v1/file-uploads/:id`

Delete a file upload record and associated S3 files.

#### Response
- **204 No Content** on success

## Frontend Integration Flow

### 1. Request Upload Permission
```typescript
const response = await fetch('/api/v1/file-uploads/presigned-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    organizationId: user.organizationId,
    periodId: '2024-Q1',
    categoryId: 'strategic-plan',
    uploadType: 'main',
    files: [
      {
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    ]
  })
});

const { uploadId, presignedUrls } = await response.json();
```

### 2. Upload to S3
```typescript
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const { url, fields } = presignedUrls[i];
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Add any additional fields if required
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  await fetch(url, {
    method: 'PUT',
    body: file
  });
}
```

### 3. Confirm Completion
```typescript
await fetch('/api/v1/file-uploads/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    uploadId,
    files: files.map((file, index) => ({
      originalName: file.name,
      s3Key: presignedUrls[index].fields.key,
      size: file.size,
      type: file.type
    }))
  })
});
```

## File Validation

### Allowed File Types
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `image/jpeg`
- `image/png`
- `image/gif`
- `text/plain`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### File Size Limits
- Maximum file size: 10MB (10,485,760 bytes)
- Maximum files per upload: 10

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File type application/zip is not allowed",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied to organization",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Upload record not found",
  "error": "Not Found"
}
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## S3 Configuration

### Development (MinIO)
- Endpoint: `http://localhost:9000`
- Bucket: `ymca-evidence`
- Credentials: `minioadmin` / `minioadmin`

### Production (AWS S3)
- Endpoint: `https://s3.amazonaws.com`
- Bucket: `ymca-evidence-prod`
- Credentials: Your AWS IAM credentials

## Swagger Documentation

Complete API documentation is available at:
- Development: `http://localhost:3001/api/docs`
- Production: `https://your-domain.com/api/docs`

## Testing

You can test the file upload system using the provided test script:

```bash
cd backend
npm run build
node test-file-uploads.js
```

## Support

For questions or issues with the file upload API, please contact the backend team or refer to the Swagger documentation.
