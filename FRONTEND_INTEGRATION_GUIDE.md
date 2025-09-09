# Frontend Integration Guide - S3 File Upload System

## 🎯 Overview

The YMCA backend now supports secure file uploads using S3 presigned URLs. This allows direct uploads to S3 while maintaining security and tracking through the backend.

## 🔗 API Base URL

```
Production: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1
```

## 📋 Required Environment Variables

Add these to your frontend environment:

```env
NEXT_PUBLIC_API_URL=https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1
```

## 🚀 Integration Flow

### 1. Request Upload Permission

**Endpoint:** `POST /api/v1/file-uploads/presigned-url`

```typescript
interface GeneratePresignedUrlRequest {
  organizationId: string;        // UUID of the organization
  periodId: string;             // e.g., "2024-Q1"
  categoryId: string;           // e.g., "strategic-plan"
  uploadType: "main" | "secondary";
  files: Array<{
    originalName: string;       // e.g., "strategic-plan.pdf"
    size: number;              // File size in bytes
    type: string;              // MIME type, e.g., "application/pdf"
  }>;
  submissionId?: string;        // Optional: link to submission
}
```

**Example Request:**
```typescript
const response = await fetch(`${API_URL}/file-uploads/presigned-url`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}` // When auth is implemented
  },
  body: JSON.stringify({
    organizationId: "123e4567-e89b-12d3-a456-426614174000",
    periodId: "2024-Q1",
    categoryId: "strategic-plan",
    uploadType: "main",
    files: [
      {
        originalName: "strategic-plan.pdf",
        size: 1024000,
        type: "application/pdf"
      }
    ]
  })
});

const { uploadId, presignedUrls, expiresAt } = await response.json();
```

**Response:**
```typescript
interface GeneratePresignedUrlResponse {
  uploadId: string;
  presignedUrls: Array<{
    fileIndex: number;
    url: string;               // Presigned S3 URL
    fields: {
      key: string;             // S3 object key
      bucket: string;          // S3 bucket name
    };
  }>;
  expiresAt: string;          // ISO timestamp
}
```

### 2. Upload Files to S3

**Direct upload to S3 using presigned URLs:**

```typescript
async function uploadFileToS3(file: File, presignedUrl: string): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

// Upload all files
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const { url } = presignedUrls[i];
  
  try {
    await uploadFileToS3(file, url);
    console.log(`File ${i + 1} uploaded successfully`);
  } catch (error) {
    console.error(`Failed to upload file ${i + 1}:`, error);
    throw error;
  }
}
```

### 3. Confirm Upload Completion

**Endpoint:** `POST /api/v1/file-uploads/complete`

```typescript
const completeResponse = await fetch(`${API_URL}/file-uploads/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}` // When auth is implemented
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

const uploadRecord = await completeResponse.json();
```

## 🎨 Complete React Component Example

```typescript
import React, { useState } from 'react';

interface FileUploadProps {
  organizationId: string;
  periodId: string;
  categoryId: string;
  uploadType: 'main' | 'secondary';
  onUploadComplete?: (uploadId: string) => void;
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  organizationId,
  periodId,
  categoryId,
  uploadType,
  onUploadComplete
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Request presigned URLs
      const presignedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file-uploads/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${jwtToken}` // When auth is implemented
        },
        body: JSON.stringify({
          organizationId,
          periodId,
          categoryId,
          uploadType,
          files: files.map(file => ({
            originalName: file.name,
            size: file.size,
            type: file.type
          }))
        })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URLs');
      }

      const { uploadId, presignedUrls } = await presignedResponse.json();

      // Step 2: Upload files to S3
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { url } = presignedUrls[i];
        
        await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      // Step 3: Confirm completion
      const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file-uploads/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${jwtToken}` // When auth is implemented
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

      if (!completeResponse.ok) {
        throw new Error('Failed to confirm upload');
      }

      onUploadComplete?.(uploadId);
      setFiles([]);
      setProgress(0);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
      />
      
      {files.length > 0 && (
        <div>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
          
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          
          {uploading && (
            <div>
              <progress value={progress} max={100} />
              <span>{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## 📊 Additional API Endpoints

### Get Upload Statistics

```typescript
const stats = await fetch(`${API_URL}/file-uploads/stats?organizationId=${orgId}&periodId=${periodId}`);
const statsData = await stats.json();
// Returns: totalCategories, completedCategories, totalFiles, totalSize, categoryProgress
```

### List Uploads

```typescript
const uploads = await fetch(`${API_URL}/file-uploads?organizationId=${orgId}&periodId=${periodId}`);
const uploadsData = await uploads.json();
// Returns: uploads array with pagination
```

### Get Specific Upload

```typescript
const upload = await fetch(`${API_URL}/file-uploads/${uploadId}`);
const uploadData = await upload.json();
```

## 🔒 File Validation

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
- **Maximum file size:** 10MB (10,485,760 bytes)
- **Maximum files per upload:** 10

## ⚠️ Error Handling

### Common Error Responses

```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["File type application/zip is not allowed"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Access denied to organization",
  "error": "Forbidden"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Upload record not found",
  "error": "Not Found"
}
```

### Error Handling Example

```typescript
try {
  const response = await fetch(`${API_URL}/file-uploads/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload request failed');
  }

  const data = await response.json();
  return data;

} catch (error) {
  console.error('Upload error:', error);
  // Handle error appropriately
}
```

## 🔐 Authentication (Future)

Currently, the API doesn't require authentication, but it will be added. When implemented:

1. **Include JWT token** in Authorization header
2. **Extract user info** from token (userId, organizationId)
3. **Validate permissions** for organization access

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwtToken}`
}
```

## 📁 S3 File Organization

Files are organized in S3 with this structure:
```
bucket/
├── {organizationId}/
│   ├── {periodId}/
│   │   ├── {categoryId}/
│   │   │   ├── {uploadType}/
│   │   │   │   ├── {uploadId}/
│   │   │   │   │   └── filename.pdf
```

## 🧪 Testing

### Test the API

```bash
# Test presigned URL generation
curl -X POST https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/file-uploads/presigned-url \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "periodId": "2024-Q1",
    "categoryId": "test-category",
    "uploadType": "main",
    "files": [{
      "originalName": "test.pdf",
      "size": 1024,
      "type": "application/pdf"
    }]
  }'
```

### Swagger Documentation

Visit: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs

## 🚀 Ready to Use!

The file upload system is fully functional and ready for integration. The backend handles:
- ✅ Secure presigned URL generation
- ✅ File validation and size limits
- ✅ Database tracking and organization isolation
- ✅ S3 file organization and storage
- ✅ Upload progress and completion tracking

**Questions?** Contact the backend team or refer to the Swagger documentation at `/api/docs`.
