# Participant Portal - Period ID Implementation Guide

## Quick Reference

### Period ID Format
```
YYYY-QN (e.g., 2024-Q1, 2024-Q2, 2024-Q3, 2024-Q4)
```

### Current Default
```
2024-Q1
```

## Required Changes for Participant Portal

### 1. Update File Upload APIs

#### Before (Current)
```javascript
// File upload request
const uploadRequest = {
  organizationId: "uuid",
  categoryId: "board-meeting-minutes",
  uploadType: "main"
};
```

#### After (Required)
```javascript
// File upload request with periodId
const uploadRequest = {
  organizationId: "uuid",
  periodId: "2024-Q1",  // ADD THIS
  categoryId: "board-meeting-minutes",
  uploadType: "main"
};
```

### 2. Update API Endpoints

#### File Upload Endpoints
```javascript
// Generate presigned URL
POST /api/v1/file-uploads/generate-presigned-url
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",  // REQUIRED
  "categoryId": "board-meeting-minutes",
  "uploadType": "main"
}

// Complete upload
POST /api/v1/file-uploads/complete-upload
{
  "organizationId": "uuid",
  "periodId": "2024-Q1",  // REQUIRED
  "categoryId": "board-meeting-minutes",
  "uploadType": "main",
  "uploadId": "upload-123",
  "files": [...]
}
```

#### Document Retrieval Endpoints
```javascript
// Get all uploads for organization
GET /api/v1/file-uploads?organizationId=uuid&periodId=2024-Q1

// Get specific upload
GET /api/v1/file-uploads/{uploadId}?periodId=2024-Q1
```

### 3. Frontend Implementation

#### Period Selection Component
```javascript
// Period selector component
const PeriodSelector = ({ currentPeriod, onPeriodChange }) => {
  const periods = [
    '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4',
    '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4'
  ];

  return (
    <select value={currentPeriod} onChange={(e) => onPeriodChange(e.target.value)}>
      {periods.map(period => (
        <option key={period} value={period}>{period}</option>
      ))}
    </select>
  );
};
```

#### Validation Function
```javascript
const validatePeriodId = (periodId) => {
  const regex = /^\d{4}-Q[1-4]$/;
  if (!regex.test(periodId)) {
    throw new Error('Invalid periodId format. Expected: YYYY-QN (e.g., 2024-Q1)');
  }
  return true;
};
```

#### API Service Updates
```javascript
class FileUploadService {
  constructor() {
    this.currentPeriod = '2024-Q1'; // Default period
  }

  setPeriod(periodId) {
    validatePeriodId(periodId);
    this.currentPeriod = periodId;
  }

  async generatePresignedUrl(organizationId, categoryId, uploadType) {
    const response = await fetch('/api/v1/file-uploads/generate-presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId,
        periodId: this.currentPeriod,  // Include periodId
        categoryId,
        uploadType
      })
    });
    return response.json();
  }

  async completeUpload(organizationId, categoryId, uploadType, uploadId, files) {
    const response = await fetch('/api/v1/file-uploads/complete-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId,
        periodId: this.currentPeriod,  // Include periodId
        categoryId,
        uploadType,
        uploadId,
        files
      })
    });
    return response.json();
  }

  async getUploads(organizationId) {
    const response = await fetch(
      `/api/v1/file-uploads?organizationId=${organizationId}&periodId=${this.currentPeriod}`
    );
    return response.json();
  }
}
```

### 4. State Management

#### Redux/Context Example
```javascript
// Period context
const PeriodContext = createContext();

export const PeriodProvider = ({ children }) => {
  const [currentPeriod, setCurrentPeriod] = useState('2024-Q1');

  const updatePeriod = (periodId) => {
    validatePeriodId(periodId);
    setCurrentPeriod(periodId);
    // Optionally save to localStorage
    localStorage.setItem('currentPeriod', periodId);
  };

  return (
    <PeriodContext.Provider value={{ currentPeriod, updatePeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

// Usage in components
const { currentPeriod, updatePeriod } = useContext(PeriodContext);
```

### 5. URL Structure Updates

#### S3 Key Pattern
```
uploads/{organizationId}/{periodId}/{categoryId}/{uploadType}/{uploadId}/{filename}
```

#### Example S3 Keys
```
uploads/00af3129-a5e8-4e32-bd1f-c03e28dc5ef2/2024-Q1/board-meeting-minutes/main/upload-123/document.pdf
uploads/00af3129-a5e8-4e32-bd1f-c03e28dc5ef2/2024-Q1/aquatics-safety-third-party/additional/upload-456/report.pdf
```

## Testing Checklist

### ✅ Required Tests
- [ ] File upload with periodId parameter
- [ ] File retrieval with periodId parameter
- [ ] Period validation (valid/invalid formats)
- [ ] Period switching functionality
- [ ] Data isolation between periods
- [ ] Default period behavior
- [ ] Error handling for missing periodId

### ✅ Test Cases
```javascript
// Valid periodId formats
'2024-Q1' ✅
'2024-Q2' ✅
'2024-Q3' ✅
'2024-Q4' ✅

// Invalid periodId formats
'2024-Q5' ❌
'2024-Q0' ❌
'2024-Q' ❌
'2024Q1' ❌
'24-Q1' ❌
'2024-1' ❌
```

## Migration Steps

### 1. Update API Calls
- Add `periodId` parameter to all file upload API calls
- Update document retrieval API calls
- Test with current default period (`2024-Q1`)

### 2. Add Period Selection UI
- Add period selector component
- Update state management
- Add validation

### 3. Update Existing Data
- Migrate existing uploads to `2024-Q1` period
- Update any hardcoded references
- Test backward compatibility

### 4. Deploy and Test
- Deploy changes
- Test with management portal
- Verify data consistency

## Error Handling

### Common Errors
```json
// Missing periodId
{
  "statusCode": 400,
  "message": "periodId is required",
  "error": "Bad Request"
}

// Invalid periodId format
{
  "statusCode": 400,
  "message": "Invalid periodId format. Expected: YYYY-QN (e.g., 2024-Q1)",
  "error": "Bad Request"
}
```

### Frontend Error Handling
```javascript
try {
  const result = await fileUploadService.generatePresignedUrl(orgId, categoryId, uploadType);
  // Handle success
} catch (error) {
  if (error.message.includes('periodId')) {
    // Handle periodId validation error
    showError('Please select a valid reporting period');
  } else {
    // Handle other errors
    showError('Upload failed. Please try again.');
  }
}
```

## Contact Information

- **Backend Team**: [Backend Repository](https://github.com/InfiniCruiser/ymca-backend)
- **API Documentation**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs
- **Management Portal**: Already implemented and tested

---

**Priority**: High  
**Deadline**: ASAP  
**Status**: Ready for Implementation
