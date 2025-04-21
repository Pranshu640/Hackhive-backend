const axios = require('axios');

const testProjectApi = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTdjNWNjMzA1ZTRiNTgxYWU2MjQwMiIsImlhdCI6MTcxMTc1NzEyMCwiZXhwIjoxNzE5NTMzMTIwfQ.zYwTbAmv8Jp88Zh7JcsT5GVbZOLfnOgA_KzBUJjN6fE'; // use your token

  try {
    // Test getting project by ID
    console.log('Testing get project by ID...');
    const projectId = '67e85c5f6066004fac78db12'; // use your project ID
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error getting project:', error.response?.data || error.message);
  }
};

testProjectApi(); 