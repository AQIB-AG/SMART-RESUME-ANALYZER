import { generateFallbackQuestions } from './src/utils/fallback-generator.js';

const dummyResume = {
  _id: "6a27e8d535d1c7aadeb80606",
  name: "Candidate",
  email: "test02@gmail.com",
  skills: [
    "javascript",
    "java",
    "nodejs",
    "react",
    "express",
    "html",
    "css",
    "mongodb",
    "rest",
    "api",
    "git",
    "ml"
  ],
  resumeText: `Email: agib@example.com
Phone: +91 9876543210

SUMMARY
Aspiring Full Stack Developer with experience in React, Node js, MongoDB, and Express.
SKILLS
JavaScript
React
Nodejs
Express.js
MongoDB
Git
HTML
css
EDUCATION
Bachelor of Technology
PROJECTS
Smart Resume Analyzer
- Built a resume analysis platform using React, Express, and MongoDB,
- Implemented ATS score analysis and resume parsing.
EXPERIENCE
Frontend Developer Intern
- Developed responsive web applications.
- Integrated REST APIs.`
};

function getQuestionTexts(res) {
  return res.questions.map(q => q.question);
}

function setsEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const s1 = new Set(arr1);
  const s2 = new Set(arr2);
  for (const item of s1) {
    if (!s2.has(item)) return false;
  }
  return true;
}

function runTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING SYSTEM DYNAMIC FALLBACK SELF-TESTS");
  console.log("==========================================");

  // TEST 1: Machine Learning Engineer, Technical, Easy
  const t1 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Machine Learning Engineer',
    type: 'Technical',
    difficulty: 'Easy',
    number: 5
  });
  const t1Questions = getQuestionTexts(t1);
  console.log("\n[TEST 1] Machine Learning Engineer (Technical, Easy):");
  t1Questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));

  // TEST 2: DevOps Engineer, Technical, Easy
  const t2 = generateFallbackQuestions(dummyResume, {
    targetRole: 'DevOps Engineer',
    type: 'Technical',
    difficulty: 'Easy',
    number: 5
  });
  const t2Questions = getQuestionTexts(t2);
  console.log("\n[TEST 2] DevOps Engineer (Technical, Easy):");
  t2Questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));

  // TEST 3: Cloud Engineer, Technical, Hard
  const t3 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Cloud Engineer',
    type: 'Technical',
    difficulty: 'Hard',
    number: 5
  });
  const t3Questions = getQuestionTexts(t3);
  console.log("\n[TEST 3] Cloud Engineer (Technical, Hard):");
  t3Questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));

  // TEST 4: Backend Developer, HR
  const t4 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Backend Developer',
    type: 'HR',
    difficulty: 'Medium',
    number: 5
  });
  const t4Questions = getQuestionTexts(t4);
  console.log("\n[TEST 4] Backend Developer (HR, Medium):");
  t4Questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));

  // TEST 5: Backend Developer, Mixed
  const t5 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Backend Developer',
    type: 'Mixed',
    difficulty: 'Medium',
    number: 5
  });
  const t5Questions = getQuestionTexts(t5);
  console.log("\n[TEST 5] Backend Developer (Mixed, Medium):");
  t5Questions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));

  // TEST 6: Click Regenerate 5 times on Backend Developer, Technical, Easy
  console.log("\n[TEST 6] Click Regenerate 5 times (Backend Developer, Technical, Easy):");
  const regenerations = [];
  for (let i = 0; i < 5; i++) {
    const reg = generateFallbackQuestions(dummyResume, {
      targetRole: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Easy',
      number: 5
    });
    const regQuestions = getQuestionTexts(reg);
    regenerations.push(regQuestions);
    console.log(`  * Run #${i+1}:`);
    regQuestions.forEach((q, j) => console.log(`    - ${q}`));
  }

  console.log("\n==========================================");
  console.log("📊 RUNNING SELF-TEST COMPLIANCE CHECKS");
  console.log("==========================================");

  let failed = false;

  // Check 1: Machine Learning == DevOps -> FAIL
  if (setsEqual(t1Questions, t2Questions)) {
    console.error("❌ FAIL: Machine Learning output is identical to DevOps output!");
    failed = true;
  } else {
    console.log("✅ PASS: Machine Learning output is distinct from DevOps output.");
  }

  // Check 2: HR == Technical -> FAIL
  const techOnlyT4 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Backend Developer',
    type: 'Technical',
    difficulty: 'Medium',
    number: 5
  });
  const techOnlyT4Questions = getQuestionTexts(techOnlyT4);
  if (setsEqual(t4Questions, techOnlyT4Questions)) {
    console.error("❌ FAIL: HR output is identical to Technical output!");
    failed = true;
  } else {
    console.log("✅ PASS: HR output is distinct from Technical output.");
  }

  // Check 3: Easy == Hard -> FAIL
  const easyT3 = generateFallbackQuestions(dummyResume, {
    targetRole: 'Cloud Engineer',
    type: 'Technical',
    difficulty: 'Easy',
    number: 5
  });
  const easyT3Questions = getQuestionTexts(easyT3);
  if (setsEqual(t3Questions, easyT3Questions)) {
    console.error("❌ FAIL: Easy difficulty output is identical to Hard difficulty output!");
    failed = true;
  } else {
    console.log("✅ PASS: Easy output is distinct from Hard output.");
  }

  // Check 4: Regenerate #1 == Regenerate #2 -> FAIL
  let matchFound = false;
  for (let i = 0; i < regenerations.length; i++) {
    for (let j = i + 1; j < regenerations.length; j++) {
      if (setsEqual(regenerations[i], regenerations[j])) {
        matchFound = true;
        console.error(`❌ FAIL: Regenerate Run #${i+1} is identical to Run #${j+1}!`);
      }
    }
  }

  if (matchFound) {
    failed = true;
  } else {
    console.log("✅ PASS: All 5 regeneration runs produced unique subsets/orderings of questions.");
  }

  if (failed) {
    console.error("\n🔴 SELF-TEST RUN FAILED. EXITING WITH STATUS 1.");
    process.exit(1);
  }

  console.log("\n🟢 ALL COMPLIANCE CHECKS PASSED SUCCESSFULLY. EXITING WITH STATUS 0.\n");
  process.exit(0);
}

runTests();
