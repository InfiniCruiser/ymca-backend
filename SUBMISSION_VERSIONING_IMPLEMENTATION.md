# Submission Versioning Implementation

## Overview

We have successfully implemented a comprehensive submission versioning system that allows organizations to create multiple versions of their submissions within a period, with proper file snapshot management and grading integration.

## Key Features Implemented

### 1. **Submission States & Versioning**
- **Draft Mode**: Users can edit responses and files freely
- **Submitted State**: Once submitted, submissions are locked and cannot be modified
- **Version Tracking**: Each submission gets a version number (1, 2, 3, etc.)
- **Latest Flag**: Only the most recent submission is marked as `isLatest: true`

### 2. **File Snapshot Strategy**
- **Draft Files**: Remain editable and are not linked to any submission
- **Submitted Files**: Create immutable snapshots when submission is made
- **File History**: Original files are preserved with `originalUploadId` reference
- **Storage Integrity**: Submitted files can never be accidentally modified

### 3. **Auto-Submit on Period End**
- **Automatic Processing**: All remaining drafts are automatically submitted when period ends
- **Timestamp Tracking**: `autoSubmittedAt` field tracks when auto-submission occurred
- **File Snapshots**: Auto-submitted drafts also get file snapshots created

### 4. **Grading Integration**
- **Latest Submission Only**: Graders always review the latest submitted version
- **Submission Linking**: Review submissions are linked to specific submission versions
- **Version Tracking**: Grading history includes submission version information

## Database Schema Changes

### New Submission Fields
```sql
-- submissions table
version INT DEFAULT 1                    -- Version number (1, 2, 3, etc.)
parentSubmissionId UUID                  -- Links to previous version
isLatest BOOLEAN DEFAULT true            -- True for most recent submission
status ENUM('draft', 'submitted', 'locked') -- Submission state
submittedAt TIMESTAMP                    -- When manually submitted
autoSubmittedAt TIMESTAMP                -- When auto-submitted at period end
```

### New File Upload Fields
```sql
-- file_uploads table
isSnapshot BOOLEAN DEFAULT false         -- True for submitted file copies
originalUploadId UUID                    -- Links back to original draft file
snapshotCreatedAt TIMESTAMP              -- When snapshot was created
```

### New Review Submission Field
```sql
-- review_submissions table
submissionId UUID                        -- Links to specific submission version
```

## API Endpoints

### New Submission Endpoints
- `POST /api/v1/submissions` - Create draft or submit immediately
- `POST /api/v1/submissions/submit` - Submit a draft submission
- `GET /api/v1/submissions/latest` - Get latest submission for org/period
- `GET /api/v1/submissions/history` - Get submission history for org/period
- `GET /api/v1/submissions/draft` - Get current draft for org/period
- `POST /api/v1/submissions/auto-submit/:periodId` - Auto-submit all drafts for period

### Enhanced Existing Endpoints
- `PUT /api/v1/submissions/:id` - Update draft submissions only
- `GET /api/v1/submissions/:id` - Get specific submission with version info

## Workflow Examples

### 1. **First Submission**
```
1. User creates draft → version 1, status: DRAFT
2. User submits → version 1, status: SUBMITTED, files snapshotted
3. New draft created → version 2, status: DRAFT
```

### 2. **Multiple Iterations**
```
1. User edits draft → version 2, status: DRAFT
2. User submits → version 2, status: SUBMITTED, files snapshotted
3. New draft created → version 3, status: DRAFT
4. User submits again → version 3, status: SUBMITTED, files snapshotted
```

### 3. **Period End Auto-Submit**
```
1. Period ends with draft → version 3, status: DRAFT
2. Auto-submit triggered → version 3, status: SUBMITTED, autoSubmittedAt set
3. Files snapshotted automatically
```

## Business Rules Implemented

✅ **File Snapshot on Submit**: Submitted files are immutable copies  
✅ **No Submission Limits**: Organizations can submit unlimited versions  
✅ **Auto-submit on Period End**: Remaining drafts are automatically submitted  
✅ **No Withdrawal**: Once submitted, submissions cannot be withdrawn  
⏳ **Grader Notifications**: Future enhancement (not implemented yet)

## Database Indexes

For optimal query performance:
- `IDX_submissions_org_period_latest` - Fast latest submission lookups
- `IDX_submissions_org_period_version` - Version history queries
- `IDX_submissions_status` - Status-based filtering
- `IDX_file_uploads_submission_snapshot` - File retrieval by submission

## Migration Files

- `010-add-submission-versioning.ts` - Adds versioning fields and indexes
- `011-add-submission-link-to-review.ts` - Links reviews to submissions

## Testing

A test script `test-submission-versioning.js` has been created to verify:
- New database columns exist
- Indexes are properly created
- Enum values are correct
- Database schema is ready for the new system

## Next Steps

1. **Run Migrations**: Apply database migrations to production
2. **Frontend Integration**: Update frontend to use new API endpoints
3. **Testing**: Test the complete workflow with real data
4. **Grader Notifications**: Implement grader notification system (future)
5. **File Cleanup**: Consider cleanup policies for old draft files

## Benefits

- **Data Integrity**: Submitted data can never be accidentally modified
- **Audit Trail**: Complete history of all submission attempts
- **User Flexibility**: Organizations can iterate as much as needed
- **Grader Simplicity**: Always review the latest version
- **Compliance**: Clear separation between draft and submitted states
- **Performance**: Optimized queries with proper indexing

This implementation provides a robust, scalable solution for submission versioning that meets all the specified requirements while maintaining data integrity and providing excellent user experience.
