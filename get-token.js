const axios = require('axios');

const getToken = async () => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
      email: 'pranshubansal603@gmail.com',
      password: 'password123'  // replace with actual password
    });
    
    console.log('Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    return null;
  }
};

getToken(); 