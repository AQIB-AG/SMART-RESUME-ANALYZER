
const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('Testing Auth API...');
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    first_name: 'Test',
    last_name: 'User'
  };

  try {
    // Test Register
    console.log('1. Testing Register...');
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    console.log('Register Body:', registerData);

    if (!registerRes.ok) throw new Error(registerData.error || 'Register failed');

    // Test Login
    console.log('2. Testing Login...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Body:', loginData);
    
    if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testAuth();
