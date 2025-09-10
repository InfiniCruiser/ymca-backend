const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1/grading';

async function testGradingAPIs() {
  console.log('🧪 Testing Grading APIs...\n');

  try {
    // Test 1: Get organizations
    console.log('1. Testing GET /organizations');
    const orgsResponse = await axios.get(`${BASE_URL}/organizations?periodId=2024-Q1`);
    console.log('✅ Organizations retrieved:', orgsResponse.data);
    console.log('');

    // Test 2: Get organization categories
    console.log('2. Testing GET /organizations/{orgId}/categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/organizations/org-1/categories?periodId=2024-Q1`);
    console.log('✅ Categories retrieved:', categoriesResponse.data);
    console.log('');

    // Test 3: Get documents
    console.log('3. Testing GET /documents/{orgId}/{categoryId}');
    const documentsResponse = await axios.get(`${BASE_URL}/documents/org-1/strategic-plan?periodId=2024-Q1`);
    console.log('✅ Documents retrieved:', documentsResponse.data);
    console.log('');

    // Test 4: Submit grades
    console.log('4. Testing POST /organizations/{orgId}/grades');
    const submitGradesData = {
      periodId: '2024-Q1',
      grades: [
        {
          categoryId: 'strategic-plan',
          score: 8,
          reasoning: 'Strategic plan demonstrates clear alignment with community needs and includes measurable objectives. Implementation timeline is realistic and well-structured.',
          reviewerId: 'john.smith@yusa.org'
        },
        {
          categoryId: 'board-meeting-minutes',
          score: 6,
          reasoning: 'Meeting minutes are present but lack detail on financial oversight discussions. Risk monitoring is mentioned but not thoroughly documented.',
          reviewerId: 'john.smith@yusa.org'
        }
      ],
      reviewerId: 'john.smith@yusa.org'
    };
    
    const gradesResponse = await axios.post(`${BASE_URL}/organizations/org-1/grades`, submitGradesData);
    console.log('✅ Grades submitted:', gradesResponse.data);
    console.log('');

    // Test 5: Get final score
    console.log('5. Testing GET /organizations/{orgId}/final-score');
    const finalScoreResponse = await axios.get(`${BASE_URL}/organizations/org-1/final-score?periodId=2024-Q1`);
    console.log('✅ Final score retrieved:', finalScoreResponse.data);
    console.log('');

    // Test 6: Get progress
    console.log('6. Testing GET /organizations/{orgId}/progress');
    const progressResponse = await axios.get(`${BASE_URL}/organizations/org-1/progress?periodId=2024-Q1`);
    console.log('✅ Progress retrieved:', progressResponse.data);
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testGradingAPIs();
