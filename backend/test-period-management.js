const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

async function testPeriodManagement() {
  console.log('🧪 Testing Period Management System...\n');

  try {
    // Test 1: Get active period
    console.log('1️⃣ Testing GET /periods/active...');
    const activePeriodResponse = await axios.get(`${BASE_URL}/periods/active`);
    console.log('✅ Active Period:', activePeriodResponse.data);
    console.log('');

    // Test 2: Get all period configurations
    console.log('2️⃣ Testing GET /periods/configurations...');
    const configsResponse = await axios.get(`${BASE_URL}/periods/configurations`);
    console.log('✅ Period Configurations:', configsResponse.data.length, 'configurations found');
    configsResponse.data.forEach(config => {
      console.log(`   - ${config.periodId}: ${config.status} (${config.label})`);
    });
    console.log('');

    // Test 3: Get specific period configuration
    console.log('3️⃣ Testing GET /periods/configurations/2024-Q4...');
    const specificConfigResponse = await axios.get(`${BASE_URL}/periods/configurations/2024-Q4`);
    console.log('✅ 2024-Q4 Configuration:', specificConfigResponse.data);
    console.log('');

    // Test 4: Test grading service with active period
    console.log('4️⃣ Testing grading service with active period...');
    const gradingResponse = await axios.get(`${BASE_URL}/grading/organizations`);
    console.log('✅ Grading Organizations Response:', gradingResponse.data);
    console.log('');

    // Test 5: Test period validation (should work with active period)
    console.log('5️⃣ Testing period validation with active period...');
    const activePeriod = activePeriodResponse.data;
    const fileUploadTest = {
      organizationId: 'test-org-id',
      periodId: activePeriod.periodId,
      categoryId: 'test-category',
      uploadType: 'main',
      files: [{
        originalName: 'test.pdf',
        size: 1024,
        type: 'application/pdf'
      }]
    };
    
    try {
      // This should fail with validation error since we don't have a real organization
      await axios.post(`${BASE_URL}/file-uploads/generate-presigned-url`, fileUploadTest);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Period validation working - got expected validation error');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    console.log('🎉 All period management tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
testPeriodManagement();
