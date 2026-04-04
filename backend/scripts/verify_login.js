const axios = require('axios');

const verifyLogin = async () => {
  try {
    console.log('Attempting login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'reception@hms.com',
      password: 'password123'
    });
    console.log('Login Step 1 Success:', loginRes.data.msg);

    console.log('Attempting OTP verification...');
    const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email: 'reception@hms.com',
      otp: '111111'
    });
    console.log('Verification Success! Token received:', verifyRes.data.token ? 'YES' : 'NO');
    console.log('User Role:', verifyRes.data.user.role);
    
    if (verifyRes.data.user.role === 'reception') {
      console.log('VERIFICATION PASSED: Receptionist can log in.');
    } else {
      console.log('VERIFICATION FAILED: Role mismatch.');
    }
  } catch (err) {
    console.error('VERIFICATION FAILED:', err.response?.data || err.message);
  }
};

verifyLogin();
