import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test02@gmail.com', password: 'test02' })
  });
  const data = await res.json();
  return data.data?.token;
}

async function test() {
  const token = await login();
  console.log("Logged in. Token:", token ? "OK" : "FAILED");

  // Test Cover Letter Standalone (no resume ID)
  console.log("\nTesting standalone cover letter (no resume ID)...");
  const clRes = await fetch(`${BASE_URL}/resumes/standalone/cover-letter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      companyName: 'TestCorp',
      roleTitle: 'QA Engineer',
      jobDescription: 'Testing applications and systems',
      tone: 'Professional',
      resumeText: 'Experienced tester of frontend and backend web applications.'
    })
  });
  console.log("Status:", clRes.status);
  console.log("Body:", await clRes.json());

  // Test Interview Questions Standalone (no resume ID)
  console.log("\nTesting standalone interview questions (no resume ID)...");
  const intRes = await fetch(`${BASE_URL}/resumes/standalone/interview-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      targetRole: 'QA Engineer',
      interviewType: 'Technical',
      difficulty: 'Easy',
      questionCount: 5,
      resumeText: 'Experienced tester of frontend and backend web applications.'
    })
  });
  console.log("Status:", intRes.status);
  console.log("Body:", await intRes.json());
}

test().catch(console.error);
