# S3 File Upload Configuration

## Environment Variables

Add these to your `.env` file:

```bash
# ============================================================================
# AWS S3 Storage Configuration
# ============================================================================

# For Development (MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=ymca-evidence
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# For Production (AWS S3)
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=your-aws-access-key-id
# S3_SECRET_KEY=your-aws-secret-access-key
# S3_BUCKET=ymca-evidence-prod
# S3_REGION=us-east-1
# S3_FORCE_PATH_STYLE=false

# ============================================================================
# File Upload Configuration
# ============================================================================

# Maximum file size in bytes (10MB = 10485760 bytes)
MAX_FILE_SIZE=10485760

# Allowed file types (comma-separated MIME types)
ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

# Presigned URL expiration time in seconds (3600 = 1 hour)
S3_PRESIGNED_URL_EXPIRES=3600

# Maximum number of files per upload
MAX_FILES_PER_UPLOAD=10
```

## Development Setup (MinIO)

1. **Install MinIO** (if not already installed):
   ```bash
   # Using Docker
   docker run -p 9000:9000 -p 9001:9001 \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

2. **Create bucket**:
   - Go to http://localhost:9001
   - Login with minioadmin/minioadmin
   - Create bucket named `ymca-evidence`

## Production Setup (AWS S3)

1. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Create bucket named `ymca-evidence-prod`
   - Set appropriate region

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-frontend-domain.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **Create IAM User/Role**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::ymca-evidence-prod/*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket"
         ],
         "Resource": "arn:aws:s3:::ymca-evidence-prod"
       }
     ]
   }
   ```

## API Endpoints

The following endpoints are now available:

- `POST /api/v1/file-uploads/presigned-url` - Generate presigned URLs
- `POST /api/v1/file-uploads/complete` - Complete upload process
- `GET /api/v1/file-uploads` - List uploads with filtering
- `GET /api/v1/file-uploads/stats` - Get upload statistics
- `GET /api/v1/file-uploads/:id` - Get specific upload
- `DELETE /api/v1/file-uploads/:id` - Delete upload

## Frontend Integration

The frontend team can now integrate using the presigned URL flow:

1. Request presigned URLs from backend
2. Upload files directly to S3 using presigned URLs
3. Confirm completion with backend
4. Track progress and handle errors

See the Swagger documentation at `/api/docs` for complete API details.
