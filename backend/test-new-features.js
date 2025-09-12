#!/usr/bin/env node

/**
 * Test script for new backend features:
 * 1. 25MB file size limit
 * 2. PowerPoint file support
 * 3. Start Fresh endpoint
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api/v1`;

// Test data
const TEST_ORG_ID = '6bf6ad25-884e-41a9-bb43-9ad153f4c2ff';
const TEST_PERIOD_ID = '2025-Q3';
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE}/auth/tester-login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.access_token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFileSizeLimit() {
  try {
    console.log('\n📏 Testing 25MB file size limit...');
    
    // Create a mock file that's larger than 25MB
    const largeFile = {
      originalName: 'large-file.pdf',
      size: 30 * 1024 * 1024, // 30MB
      type: 'application/pdf'
    };
    
    const response = await axios.post(`${API_BASE}/file-uploads/presigned-url`, {
      organizationId: TEST_ORG_ID,
      periodId: TEST_PERIOD_ID,
      categoryId: 'test-category',
      uploadType: 'main',
      files: [largeFile]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ File size limit test failed - should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.code === 'LIMIT_FILE_SIZE') {
      console.log('✅ File size limit working correctly');
      console.log(`   Max size: ${error.response.data.maxMB}MB`);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testPowerPointSupport() {
  try {
    console.log('\n📊 Testing PowerPoint file support...');
    
    const pptFile = {
      originalName: 'presentation.pptx',
      size: 5 * 1024 * 1024, // 5MB
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    const response = await axios.post(`${API_BASE}/file-uploads/presigned-url`, {
      organizationId: TEST_ORG_ID,
      periodId: TEST_PERIOD_ID,
      categoryId: 'test-category',
      uploadType: 'main',
      files: [pptFile]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ PowerPoint file accepted');
    return true;
  } catch (error) {
    if (error.response?.data?.code === 'UNSUPPORTED_MEDIA_TYPE') {
      console.log('❌ PowerPoint files not supported');
      return false;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testStartFreshEndpoint() {
  try {
    console.log('\n🔄 Testing Start Fresh endpoint...');
    
    const response = await axios.post(`${API_BASE}/submissions/start-fresh?orgId=${TEST_ORG_ID}&periodId=${TEST_PERIOD_ID}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201 && response.data.id && response.data.version) {
      console.log('✅ Start Fresh endpoint working');
      console.log(`   New draft ID: ${response.data.id}`);
      console.log(`   Version: ${response.data.version}`);
      console.log(`   Status: ${response.data.status}`);
      if (response.data.s3SubmissionId) {
        console.log(`   S3 Submission ID: ${response.data.s3SubmissionId}`);
      }
      return true;
    } else {
      console.log('❌ Invalid response format');
      return false;
    }
  } catch (error) {
    console.error('❌ Start Fresh test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing new backend features...\n');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Run tests
  const results = {
    fileSizeLimit: await testFileSizeLimit(),
    powerpointSupport: await testPowerPointSupport(),
    startFresh: await testStartFreshEndpoint()
  };
  
  // Summary
  console.log('\n📊 Test Results:');
  console.log(`   File Size Limit (25MB): ${results.fileSizeLimit ? '✅' : '❌'}`);
  console.log(`   PowerPoint Support: ${results.powerpointSupport ? '✅' : '❌'}`);
  console.log(`   Start Fresh Endpoint: ${results.startFresh ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);
}

// Run the tests
runTests().catch(console.error);
