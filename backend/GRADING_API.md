# Grading Management API Documentation

## Overview

The Grading Management API provides endpoints for reviewing and grading document submissions from YMCA organizations. This system replaces the previous 42-question survey model with a document-based grading approach.

## Base URL

```
/api/v1/grading
```

## Authentication

Currently, the system uses open access (no authentication required). All endpoints are accessible via direct links.

## Document Categories

The system supports 17 document categories:

1. **board-meeting-minutes** - Trailing 12 months of Board Meeting Minutes
2. **aquatics-safety-third-party** - Aquatics Safety Third-Party Visit Documentation
3. **aquatics-safety-marketing** - Aquatics Safety Marketing Collateral
4. **strategic-plan** - Strategic Plan
5. **sublicense-agreement** - Sublicense Agreement
6. **membership-sops** - Membership Standard Operating Procedures (SOPs)
7. **aquatics-facility-assessment** - Aquatics Facility Self-Assessment Results
8. **membership-satisfaction-survey** - Membership Satisfaction Survey / Self Assessment
9. **membership-third-party-contract** - Membership Third-Party Contract
10. **risk-management-documents** - Risk Management Documents
11. **staff-performance-review** - Staff Performance Review Forms
12. **volunteer-spotlight** - Non-Policy Volunteer Spotlight Example
13. **volunteer-survey-results** - Non-Policy Volunteer Survey Results
14. **value-pricing-assessment** - Value, Pricing, and Business Model Assessment Plan
15. **community-partnerships** - List of Community Partnerships
16. **volunteer-training-materials** - Non-Policy Volunteer Training Materials
17. **community-benefit-documentation** - Community Benefit Documentation

## Grading Scale

- **Score Range**: 0-10 (decimal values allowed)
- **Final Score**: Average of all category scores
- **Performance Categories**:
  - High: 7.0-10.0
  - Moderate: 4.0-6.9
  - Low: 0.0-3.9

## API Endpoints

### Organization Management

#### Get Organizations
```http
GET /organizations?periodId=2024-Q1&status=pending&limit=10&offset=0
```

**Query Parameters:**
- `periodId` (optional): Filter by period
- `status` (optional): Filter by review status
- `assignedTo` (optional): Filter by assigned reviewer
- `limit` (optional): Number of results per page (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "periodId": "2024-Q1",
  "organizations": [
    {
      "organizationId": "uuid",
      "organizationName": "YMCA of Example City",
      "status": "pending",
      "totalCategories": 17,
      "gradedCategories": 0,
      "lastUploaded": "2024-01-15T10:30:00Z",
      "dueDate": null,
      "assignedReviewer": null
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

#### Get Organization Categories
```http
GET /organizations/{orgId}/categories?periodId=2024-Q1&includeGraded=true
```

**Query Parameters:**
- `periodId` (required): Period ID
- `includeGraded` (optional): Include already graded categories (default: true)

**Response:**
```json
{
  "organizationId": "uuid",
  "organizationName": "YMCA of Example City",
  "periodId": "2024-Q1",
  "categories": [
    {
      "categoryId": "strategic-plan",
      "categoryName": "Strategic Plan",
      "hasDocuments": true,
      "documentCount": 2,
      "totalSize": 2048000,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "grade": 8,
      "reasoning": "Strategic plan demonstrates clear alignment...",
      "reviewedAt": "2024-01-15T14:30:00Z",
      "reviewerId": "john.smith@yusa.org"
    }
  ]
}
```

### Document Access

#### Get Documents
```http
GET /documents/{orgId}/{categoryId}?periodId=2024-Q1
```

**Response:**
```json
{
  "uploadId": "uuid",
  "categoryId": "strategic-plan",
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "files": [
    {
      "originalName": "strategic-plan-2024.pdf",
      "s3Key": "org123/2024-Q1/strategic-plan/main/uuid/document.pdf",
      "size": 2048000,
      "type": "application/pdf",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Document View URL
```http
GET /documents/{orgId}/{categoryId}/view-url?periodId=2024-Q1
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/presigned-url...",
  "expiresAt": "2024-01-15T15:30:00Z"
}
```

#### Get Document Download URL
```http
GET /documents/{orgId}/{categoryId}/download-url?periodId=2024-Q1
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/download-url...",
  "expiresAt": "2024-01-15T15:30:00Z"
}
```

### Grading Operations

#### Submit Grades
```http
POST /organizations/{orgId}/grades
```

**Request Body:**
```json
{
  "periodId": "2024-Q1",
  "grades": [
    {
      "categoryId": "strategic-plan",
      "score": 8,
      "reasoning": "Strategic plan demonstrates clear alignment with community needs and includes measurable objectives. Implementation timeline is realistic and well-structured.",
      "reviewerId": "john.smith@yusa.org"
    }
  ],
  "reviewerId": "john.smith@yusa.org",
  "notes": "All categories reviewed and graded"
}
```

**Response:**
```json
{
  "success": true,
  "periodId": "2024-Q1",
  "organizationId": "uuid",
  "gradedCategories": 1,
  "totalCategories": 17,
  "overallProgress": "5.9%",
  "grades": [
    {
      "categoryId": "strategic-plan",
      "score": 8,
      "reasoning": "Strategic plan demonstrates clear alignment...",
      "reviewedAt": "2024-01-15T14:30:00Z",
      "reviewerId": "john.smith@yusa.org"
    }
  ]
}
```

#### Update Grade
```http
PUT /organizations/{orgId}/grades/{categoryId}
```

**Request Body:**
```json
{
  "score": 7,
  "reasoning": "Updated assessment: After reviewing additional documentation, the strategic plan shows stronger community engagement than initially noted.",
  "reviewerId": "john.smith@yusa.org"
}
```

#### Submit Review
```http
POST /organizations/{orgId}/submit
```

**Request Body:**
```json
{
  "periodId": "2024-Q1",
  "reviewerId": "john.smith@yusa.org",
  "notes": "All 17 categories have been reviewed and graded. Ready for final approval."
}
```

#### Approve Submission
```http
POST /organizations/{orgId}/approve
```

**Request Body:**
```json
{
  "periodId": "2024-Q1",
  "reviewerId": "john.smith@yusa.org",
  "approvalNotes": "Submission meets all requirements. Strategic plan is particularly strong with clear implementation timeline."
}
```

#### Reject Submission
```http
POST /organizations/{orgId}/reject
```

**Request Body:**
```json
{
  "periodId": "2024-Q1",
  "reviewerId": "john.smith@yusa.org",
  "rejectionReason": "Incomplete documentation",
  "rejectionNotes": "Missing aquatics safety documentation and risk management framework. Please resubmit with complete documentation."
}
```

### Final Scores

#### Get Final Score
```http
GET /organizations/{orgId}/final-score?periodId=2024-Q1
```

**Response:**
```json
{
  "organizationId": "uuid",
  "organizationName": "YMCA of Example City",
  "periodId": "2024-Q1",
  "finalScore": 7.2,
  "maxScore": 10.0,
  "percentageScore": 72,
  "performanceCategory": "high",
  "categoryBreakdown": [
    {
      "categoryId": "strategic-plan",
      "categoryName": "Strategic Plan",
      "score": 8,
      "reasoning": "Strategic plan demonstrates clear alignment...",
      "reviewerId": "john.smith@yusa.org",
      "reviewedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "calculatedAt": "2024-01-15T16:00:00Z"
}
```

#### Get Progress
```http
GET /organizations/{orgId}/progress?periodId=2024-Q1
```

**Response:**
```json
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",
  "totalCategories": 17,
  "gradedCategories": 8,
  "pendingCategories": 9,
  "overallGrade": 7.2,
  "reviewStatus": "in-review",
  "assignedReviewer": null,
  "dueDate": null,
  "progressByCategory": [
    {
      "categoryId": "strategic-plan",
      "categoryName": "Strategic Plan",
      "score": 8,
      "reasoning": "Strategic plan demonstrates clear alignment...",
      "reviewerId": "john.smith@yusa.org",
      "reviewedAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "All categories must be graded before submission",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Grade not found for this category",
  "error": "Not Found"
}
```

## Validation Rules

- **Score**: Must be between 0 and 10 (decimal values allowed)
- **Reasoning**: Required, minimum 50 characters
- **PeriodId**: Required for all organization-specific operations
- **ReviewerId**: Required for all grading operations

## Database Schema

The grading system uses three main tables:

1. **document_category_grades**: Stores individual category grades
2. **review_submissions**: Tracks submission status and final scores
3. **review_history**: Maintains audit trail of all actions

## Testing

Run the test script to verify API functionality:

```bash
node test-grading-apis.js
```

## Integration Notes

- The system integrates with existing S3 file storage
- Document URLs are generated using presigned URLs for security
- All actions are logged for audit purposes
- Final scores are calculated as simple averages (no category weights)
