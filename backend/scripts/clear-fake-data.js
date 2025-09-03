const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function clearFakeData() {
  try {
    console.log('🧹 Clearing fake data...');
    
    // Clear submissions
    console.log('📝 Clearing submissions...');
    const submissions = await axios.get(`${API_BASE}/submissions`);
    console.log(`Found ${submissions.data.length} submissions to clear`);
    
    for (const submission of submissions.data) {
      try {
        await axios.delete(`${API_BASE}/submissions/${submission.id}`);
        console.log(`✅ Deleted submission ${submission.id}`);
      } catch (error) {
        console.log(`❌ Failed to delete submission ${submission.id}: ${error.message}`);
      }
    }
    
    // Clear performance calculations
    console.log('📊 Clearing performance calculations...');
    const performances = await axios.get(`${API_BASE}/performance-calculations`);
    console.log(`Found ${performances.data.length} performance records to clear`);
    
    for (const performance of performances.data) {
      try {
        await axios.delete(`${API_BASE}/performance-calculations/${performance.id}`);
        console.log(`✅ Deleted performance record ${performance.id}`);
      } catch (error) {
        console.log(`❌ Failed to delete performance record ${performance.id}: ${error.message}`);
      }
    }
    
    console.log('🎉 Fake data cleanup completed!');
    
    // Verify cleanup
    const remainingSubmissions = await axios.get(`${API_BASE}/submissions`);
    const remainingPerformances = await axios.get(`${API_BASE}/performance-calculations`);
    
    console.log(`📊 Remaining submissions: ${remainingSubmissions.data.length}`);
    console.log(`📊 Remaining performance records: ${remainingPerformances.data.length}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

clearFakeData();
