# YMCA Backend API Documentation

## 📚 Complete API Documentation

This repository contains comprehensive API documentation for the YMCA Self-Reporting Portal backend system.

## 🚀 Live API Documentation

### Interactive Swagger UI
- **URL**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs
- **Description**: Interactive API documentation with live testing capabilities

### OpenAPI Specifications
- **JSON**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs-json
- **YAML**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs-yaml

## 📁 Local Documentation Files

### OpenAPI Specifications (Downloaded)
- `api-spec.json` - Complete OpenAPI 3.0 specification in JSON format
- `api-spec.yaml` - Complete OpenAPI 3.0 specification in YAML format

### Feature-Specific Documentation
- `PERIOD_MANAGEMENT_API.md` - Period management system documentation
- `GRADING_API.md` - Grading and review system documentation
- `FILE_UPLOAD_API.md` - File upload system documentation
- `PERIOD_COMPLETION_API.md` - Period completion tracking documentation

## 🔗 API Base URL

**Production**: `https://ymca-backend-c1a73b2f2522.herokuapp.com`

## 📋 Available API Modules

### Core Modules
- **Users** (`/api/v1/users`) - User management
- **Organizations** (`/api/v1/organizations`) - Organization management
- **Submissions** (`/api/v1/submissions`) - Survey submissions
- **Performance** (`/api/v1/performance-calculations`) - Performance calculations

### Specialized Modules
- **Periods** (`/api/v1/periods`) - Period management and configuration
- **Grading** (`/api/v1/grading`) - Document grading and review
- **File Uploads** (`/api/v1/file-uploads`) - File upload management
- **AI Config** (`/api/v1/ai-config`) - AI configuration and analysis

### Legacy Support
- **Legacy Submissions** (`/api/submissions`) - Legacy submission endpoints

## 🎯 Key Features

### Period Management System
- ✅ **Backend-enforced period control**
- ✅ **Automatic period transitions**
- ✅ **14-day grace periods**
- ✅ **Real-time period validation**

### Current Active Period
- **Period ID**: `2025-Q3`
- **Status**: Active (21 days remaining)
- **Grace Period End**: October 14, 2025
- **Can Accept Submissions**: ✅ Yes

## 🔧 API Usage Examples

### Get Active Period
```bash
curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/periods/active
```

### Get Organizations for Grading
```bash
curl https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/grading/organizations
```

### Health Check
```bash
curl https://ymca-backend-c1a73b2f2522.herokuapp.com/health
```

## 🛠️ Development Tools

### Swagger UI Features
- **Interactive Testing**: Test endpoints directly from the browser
- **Schema Validation**: Automatic request/response validation
- **Authentication**: Bearer token support
- **Export Options**: Download specifications in multiple formats

### API Testing
- **Postman Collection**: Import from OpenAPI specification
- **Insomnia**: Import from OpenAPI specification
- **curl Commands**: Ready-to-use examples in documentation

## 📖 Documentation Standards

### OpenAPI 3.0 Compliance
- Full OpenAPI 3.0 specification
- Comprehensive schema definitions
- Detailed endpoint documentation
- Request/response examples

### NestJS Integration
- Automatic documentation generation
- Decorator-based API documentation
- Type-safe DTOs and responses
- Real-time specification updates

## 🔄 Keeping Documentation Updated

The API documentation is automatically generated from the NestJS application code using:
- `@nestjs/swagger` decorators
- OpenAPI 3.0 specification
- Real-time updates on deployment

## 📞 Support

For API questions or issues:
1. Check the interactive Swagger UI first
2. Review the feature-specific documentation
3. Test endpoints using the provided examples
4. Contact the development team for additional support

## 🚀 Quick Start for Frontend Teams

1. **Bookmark the Swagger UI**: https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs
2. **Download the OpenAPI spec**: Use the JSON or YAML files for code generation
3. **Read the Period Management docs**: Essential for understanding the new period system
4. **Test the active period endpoint**: `GET /api/v1/periods/active`

---

*Last updated: September 10, 2025*
*API Version: 1.0*
*Environment: Production*
