# 🔐 Authentication API Documentation

## Overview
Complete JWT-based authentication system for the YMCA Backend with support for regular users and testers.

## 🔧 Backend Integration Points

### **Authentication Endpoints**

#### **1. Login Endpoint**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PROGRAM_OWNER",
    "organizationId": "org-uuid",
    "isTester": false,
    "testerGroup": null
  }
}
```

#### **2. Tester Login Endpoint**
```http
POST /api/auth/tester-login
Content-Type: application/json

{
  "email": "alice.johnson@testalpha.ymca",
  "password": "TestPassword123!"
}
```

**Response:** Same as regular login, but with `isTester: true`

#### **3. Token Verification**
```http
POST /api/auth/verify
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PROGRAM_OWNER",
    "organizationId": "org-uuid",
    "isTester": false
  }
}
```

#### **4. Token Refresh**
```http
POST /api/auth/refresh
Authorization: Bearer <jwt_token>
```

**Response:** Same as login response with new token

#### **5. Logout Endpoint**
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Logged out successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### **6. User Profile**
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PROGRAM_OWNER",
  "organizationId": "org-uuid",
  "isTester": false,
  "testerGroup": null,
  "organization": {
    "id": "org-uuid",
    "name": "Charlotte YMCA",
    "code": "CHARLOTTE"
  }
}
```

## 🔑 JWT Token Structure

The JWT payload contains:
```json
{
  "email": "user@example.com",
  "sub": "user-uuid",
  "role": "PROGRAM_OWNER",
  "organizationId": "org-uuid",
  "isTester": false,
  "iat": 1642248000,
  "exp": 1642334400
}
```

## 🧪 Tester Credentials

### **Test Organizations:**
- **Test YMCA Alpha** (7 users)
- **Test YMCA Beta** (7 users)  
- **Test YMCA Gamma** (6 users)

### **Sample Tester Accounts:**
| Email | Password | Organization | Tester Group |
|-------|----------|--------------|--------------|
| alice.johnson@testalpha.ymca | TestPassword123! | Test YMCA Alpha | Alpha Group A |
| bob.smith@testalpha.ymca | TestPassword123! | Test YMCA Alpha | Alpha Group A |
| henry.anderson@testbeta.ymca | TestPassword123! | Test YMCA Beta | Beta Group A |
| olivia.martinez@testgamma.ymca | TestPassword123! | Test YMCA Gamma | Gamma Group A |

*All 20 testers use the same password: `TestPassword123!`*

## 🛡️ Security Features

### **JWT Configuration:**
- **Secret**: Configurable via `JWT_SECRET` environment variable
- **Expiration**: 24 hours
- **Algorithm**: HS256

### **Password Security:**
- **Hashing**: bcrypt with salt rounds
- **Validation**: Strong password requirements

### **Access Control:**
- **Testers**: Access to all periods regardless of status
- **Regular Users**: Standard period access controls
- **Role-based**: Different permissions based on user role

## 🔄 Frontend Integration

### **Login Flow:**
```javascript
// 1. Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token, user } = await response.json();

// 2. Store token
localStorage.setItem('access_token', access_token);

// 3. Use token in requests
const apiResponse = await fetch('/api/periods/active', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### **Token Refresh Flow:**
```javascript
// Refresh token before expiration
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const { access_token: newToken } = await refreshResponse.json();
localStorage.setItem('access_token', newToken);
```

### **Logout Flow:**
```javascript
// Logout
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}` }
});
localStorage.removeItem('access_token');
```

## 🚨 Error Responses

### **401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### **400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Period ID is required for this operation.",
  "error": "Bad Request"
}
```

## 📝 Environment Variables

```bash
# Required
JWT_SECRET=your-super-secret-jwt-key

# Optional (with defaults)
JWT_EXPIRES_IN=24h
```

## 🔍 Testing

### **Test the endpoints:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.johnson@testalpha.ymca","password":"TestPassword123!"}'

# Verify token
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**✅ All authentication endpoints are now implemented and ready for frontend integration!**
