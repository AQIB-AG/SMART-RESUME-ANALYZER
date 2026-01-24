
const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('🔍 Starting Auth Debugging...');
  
  const testUser = {
    email: `debug_user_${Date.now()}@example.com`,
    password: 'password123',
    first_name: 'Debug',
    last_name: 'User'
  };

  try {
    // 1. Test Registration
    console.log(`\n1️⃣ Testing Registration for ${testUser.email}...`);
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status}`);
    console.log('Response:', JSON.stringify(registerData, null, 2));

    if (!registerRes.ok) {
        console.error('❌ Registration Failed!');
        return;
    }

    // 2. Test Duplicate Registration (to verify "User already exists")
    console.log(`\n2️⃣ Testing Duplicate Registration...`);
    const duplicateRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const duplicateData = await duplicateRes.json();
    console.log(`Status: ${duplicateRes.status}`);
    if (duplicateRes.status === 409) {
        console.log('✅ Correctly handled duplicate user.');
    } else {
        console.error('❌ Unexpected status for duplicate user:', duplicateRes.status);
    }

    // 3. Test Login
    console.log(`\n3️⃣ Testing Login...`);
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);
    console.log('Response:', JSON.stringify(loginData, null, 2));
    
    if (loginRes.ok && loginData.data.token) {
        console.log('✅ Login Successful & Token Received');
    } else {
        console.error('❌ Login Failed');
    }

  } catch (error) {
    console.error('❌ Network/Script Error:', error);
  }
}

testAuth();
