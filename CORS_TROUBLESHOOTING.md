# CORS Troubleshooting Guide

## ✅ CORS Configuration Applied

The S3 bucket `oeabucket` now has the following CORS configuration:

```json
{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://ymca-self-reporting-frontend.herokuapp.com",
    "https://ymca-frontend-only.herokuapp.com",
    "https://ymca-backend-c1a73b2f2522.herokuapp.com"
  ],
  "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-version-id"],
  "MaxAgeSeconds": 86400
}
```

## 🔧 Troubleshooting Steps

### 1. Clear Browser Cache
**Most Important Step!** CORS errors are heavily cached by browsers.

**Chrome/Edge:**
- Press `F12` to open DevTools
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

**Firefox:**
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**Safari:**
- Press `Cmd+Option+E` to empty cache
- Press `Cmd+Option+R` to hard reload

### 2. Test CORS Configuration
Open browser console and run this test:

```javascript
// Test CORS configuration
fetch('https://oeabucket.s3.amazonaws.com/', {
  method: 'HEAD',
  mode: 'cors'
})
.then(response => {
  console.log('✅ CORS working!', response);
})
.catch(error => {
  console.error('❌ CORS still blocked:', error);
});
```

### 3. Check Network Tab
1. Open DevTools → Network tab
2. Try uploading a file
3. Look for:
   - **Red requests** (blocked by CORS)
   - **OPTIONS requests** (preflight requests)
   - **Response headers** with CORS info

### 4. Verify Origin
Make sure your frontend is running on one of the allowed origins:
- `http://localhost:3000` ✅
- `http://localhost:3001` ✅
- `http://127.0.0.1:3000` ✅
- `http://127.0.0.1:3001` ✅

### 5. Test with curl (No CORS)
Test the presigned URL directly:

```bash
# Get a fresh presigned URL
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

# Use the returned URL to test upload
curl -X PUT "PRESIGNED_URL_HERE" \
  -H "Content-Type: application/pdf" \
  --data-binary @test-file.pdf
```

## 🚨 Common Issues & Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header"
**Solution:** Clear browser cache completely and try again.

### Issue 2: "Preflight request doesn't pass access control check"
**Solution:** The CORS configuration is correct. This might be a browser cache issue.

### Issue 3: "CORS policy blocks the request"
**Solution:** 
1. Verify you're on the correct origin (localhost:3000)
2. Clear browser cache
3. Try incognito/private browsing mode

### Issue 4: Still getting CORS errors after cache clear
**Solution:** 
1. Wait 5-10 minutes for S3 CORS changes to propagate
2. Try a different browser
3. Check if you're behind a corporate firewall/proxy

## 🧪 Testing Checklist

- [ ] Browser cache cleared
- [ ] Running on localhost:3000
- [ ] DevTools Network tab shows no red requests
- [ ] CORS test script runs successfully
- [ ] Presigned URL generation works
- [ ] File upload completes without CORS errors

## 🔄 Fallback System

If CORS issues persist, the system has a fallback mechanism:

1. **Primary**: Direct S3 upload with presigned URLs
2. **Fallback**: Local Next.js API upload (already working)

The fallback ensures uploads work regardless of CORS configuration.

## 📞 Support

If CORS issues persist after following these steps:

1. **Check browser console** for specific error messages
2. **Test in incognito mode** to rule out extensions
3. **Try different browser** (Chrome, Firefox, Safari)
4. **Check network connectivity** and firewall settings

## 🎯 Expected Behavior

After CORS is properly configured:
- ✅ No CORS errors in browser console
- ✅ Direct S3 uploads work
- ✅ Faster upload performance
- ✅ Better user experience

The system is designed to work with or without CORS, so uploads will succeed either way!
