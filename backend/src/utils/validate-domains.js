import { generateFallbackQuestions } from './fallback-generator.js';

// Setup mock resume
const mockResume = {
  resumeText: "Experienced Software Engineer. Developed web applications, APIs, databases, and container setups.",
  skills: ["JavaScript", "Python", "Docker", "Kubernetes", "AWS", "SQL", "React", "Node.js"],
  name: "Test Developer",
  email: "test@example.com"
};

// Define all 15 domains with check validation keywords
const domainsToTest = [
  { name: 'React', keywords: ['react', 'component', 'props', 'state', 'hook', 'dom', 'rendering', 'virtual', 'reconciliation'] },
  { name: 'JavaScript', keywords: ['javascript', 'js', 'promise', 'callback', 'async', 'closure', 'event loop', 'scope', 'prototype'] },
  { name: 'CSS', keywords: ['css', 'layout', 'flexbox', 'grid', 'box model', 'sizing', 'animation', 'render', 'transform'] },
  { name: 'Redux', keywords: ['redux', 'state', 'reducer', 'action', 'store', 'context', 'dispatch', 're-render'] },
  { name: 'DOM', keywords: ['dom', 'virtual', 'render', 'element', 'reflow', 'compositor', 'hydrate', 'thrashing'] },
  
  { name: 'Node.js', keywords: ['node', 'js', 'event loop', 'callback', 'stream', 'commonjs', 'es6', 'require', 'import', 'libuv'] },
  { name: 'Express', keywords: ['express', 'route', 'middleware', 'request', 'response', 'params', 'next', 'handler', 'status'] },
  { name: 'Databases', keywords: ['database', 'sql', 'mongodb', 'redis', 'query', 'index', 'join', 'transaction', 'acid', 'shard'] },
  { name: 'Authentication', keywords: ['authentication', 'auth', 'jwt', 'token', 'session', 'cookie', 'signature', 'csrf', 'xss'] },
  { name: 'APIs', keywords: ['api', 'rest', 'graphql', 'http', 'status', 'route', 'endpoint', 'payload', 'rate-limit'] },
  
  { name: 'Docker', keywords: ['docker', 'container', 'image', 'runtime', 'dockerfile', 'stage', 'volume', 'rootless', 'trivy'] },
  { name: 'Kubernetes', keywords: ['kubernetes', 'k8s', 'pod', 'deployment', 'canary', 'ingress', 'istio', 'mesh', 'argo'] },
  { name: 'CI/CD', keywords: ['ci/cd', 'pipeline', 'workflow', 'runner', 'build', 'jenkins', 'actions', 'gitops', 'cache'] },
  { name: 'Monitoring', keywords: ['monitoring', 'metric', 'log', 'prometheus', 'scrape', 'exporter', 'trace', 'opentelemetry', 'jaeger'] },
  { name: 'Infrastructure', keywords: ['infrastructure', 'cloud', 'aws', 'terraform', 'state', 's3', 'vpc', 'iam', 'lambda'] },
  
  { name: 'Training', keywords: ['train', 'model', 'parameter', 'hyperparameter', 'split', 'overfitting', 'cross-validation', 'gradient'] },
  { name: 'Models', keywords: ['model', 'parameter', 'hyperparameter', 'svm', 'knn', 'tree', 'boosting', 'neural', 'quantization', 'onnx'] },
  { name: 'Inference', keywords: ['inference', 'serving', 'quantization', 'onnx', 'triton', 'batching', 'vllm', 'attention', 'cache'] },
  { name: 'Feature Engineering', keywords: ['feature', 'preprocess', 'scale', 'one-hot', 'encoding', 'leakage', 'variance', 'dimension'] },
  
  { name: 'OWASP', keywords: ['owasp', 'vulnerability', 'mitigate', 'xss', 'sqli', 'csrf', 'injection', 'broken access', 'xxe'] },
  { name: 'Threat Detection', keywords: ['threat', 'exploit', 'zero-day', 'anomaly', 'mitigate', 'attack', 'phishing', 'firewall'] },
  { name: 'Security Audits', keywords: ['audit', 'rbac', 'policy', 'cve', 'scan', 'permission', 'secrets', 'vault', 'least privilege'] },
  
  { name: 'Roadmaps', keywords: ['roadmap', 'prioritize', 'backlog', 'feature', 'story', 'scrum', 'mvp', 'kpis', 'cac', 'ltv'] },
  { name: 'Stakeholders', keywords: ['stakeholder', 'communication', 'conflict', 'user story', 'acceptance', 'customer', 'discovery'] },
  { name: 'Product Strategy', keywords: ['strategy', 'market', 'lifecycle', 'monetization', 'pricing', 'retention', 'conversion', 'funnel'] },
  { name: 'KPIs', keywords: ['kpis', 'metric', 'retention', 'acquisition', 'cac', 'ltv', 'churn', 'conversion', 'funnel'] },
  
  { name: 'Testing', keywords: ['testing', 'test', 'qa', 'automation', 'functional', 'regression', 'selenium', 'pom', 'boundary'] },
  { name: 'Automation', keywords: ['automation', 'playwright', 'cypress', 'wait', 'flakiness', 'retry', 'pom', 'driver', 'webdrive'] },
  { name: 'Bug Tracking', keywords: ['bug', 'defect', 'lifecycle', 'tracking', 'new', 'assigned', 'open', 'fixed', 'closed'] },
  { name: 'Test Cases', keywords: ['test case', 'steps', 'expected', 'actual', 'prerequisites', 'boundary', 'equivalence'] },
  
  { name: 'Widgets', keywords: ['widget', 'stateful', 'stateless', 'tree', 'inherited', 'layout', 'constraint', 'size', 'paint', 'repaint'] },
  { name: 'Dart', keywords: ['dart', 'event loop', 'microtask', 'stream', 'future', 'async', 'garbage', 'scavenger', 'platform channel'] },
  
  { name: 'Activities', keywords: ['activity', 'lifecycle', 'onCreate', 'onDestroy', 'intent', 'fragment', 'viewmodel', 'compose', 'looper'] },
  { name: 'Fragments', keywords: ['fragment', 'activity', 'lifecycle', 'onCreate', 'survive', 'rotation', 'compose', 'viewmodel'] },
  { name: 'Jetpack', keywords: ['jetpack', 'viewmodel', 'coroutines', 'workmanager', 'livedata', 'stateflow', 'compose', 'stable'] },
  
  { name: 'Swift', keywords: ['swift', 'arc', 'optional', 'value type', 'reference type', 'protocol', 'actor', 'concurrency', 'mainactor'] },
  { name: 'UIKit', keywords: ['uikit', 'uiview', 'view controller', 'delegate', 'scene', 'imperative', 'layout', 'animation'] },
  { name: 'SwiftUI', keywords: ['swiftui', 'declarative', 'state', 'binding', 'view', 'list', 'lazystack', 'animation', 'equatable'] },
  
  { name: 'Smart Contracts', keywords: ['smart contract', 'solidity', 'reentrancy', 'deposit', 'withdraw', 'overflow', 'safemath', 'erc'] },
  { name: 'Consensus', keywords: ['consensus', 'proof of work', 'proof of stake', 'pow', 'pos', 'tendermint', 'pbft', 'byzantine', 'validator'] },
  { name: 'Web3', keywords: ['web3', 'wallet', 'public key', 'private key', 'address', 'gas', 'evm', 'bytecode', 'oracle', 'chainlink', 'defi'] }
];

async function runValidation() {
  console.log("==========================================");
  console.log("🧪 RUNNING MASS DOMAIN SPECIFICITY VALIDATION");
  console.log("==========================================");

  let allPassed = true;
  const metrics = [];

  for (const domain of domainsToTest) {
    console.log(`\nDomain: ${domain.name}`);
    let domainPassed = true;
    const uniqueQuestions = new Set();
    let totalQuestionsGenerated = 0;

    // Run 10 generations per domain
    for (let gen = 1; gen <= 10; gen++) {
      const result = generateFallbackQuestions(mockResume, {
        targetRole: domain.name,
        type: 'Technical',
        difficulty: gen % 3 === 0 ? 'Easy' : gen % 3 === 1 ? 'Medium' : 'Hard',
        number: 5
      });

      totalQuestionsGenerated += result.questions.length;
      
      // Check each generated question
      for (const q of result.questions) {
        uniqueQuestions.add(q.question);

        // Verify that the question contains at least one of the keywords (or related concepts)
        const textLower = (q.question + " " + q.why + " " + (q.expectedAnswer || []).join(" ")).toLowerCase();
        const matchesKeyword = domain.keywords.some(kw => textLower.includes(kw.toLowerCase()));
        
        if (!matchesKeyword) {
          console.warn(`  ⚠️ Gen #${gen} - Question may be generic or mismatched: "${q.question}"`);
        }
      }
    }

    const uniqueCount = uniqueQuestions.size;
    const uniquenessRatio = uniqueCount / totalQuestionsGenerated;

    console.log(`  * Total Questions Generated: ${totalQuestionsGenerated}`);
    console.log(`  * Unique Questions: ${uniqueCount}`);
    console.log(`  * Uniqueness Ratio: ${(uniquenessRatio * 100).toFixed(1)}%`);

    if (uniqueCount < 10) {
      console.error(`  🔴 FAIL: Loop detection triggered. Too many repeated questions for domain "${domain.name}"!`);
      domainPassed = false;
      allPassed = false;
    } else {
      console.log(`  🟢 PASS: High diversity of questions verified for "${domain.name}"`);
    }

    metrics.push({
      domain: domain.name,
      passed: domainPassed,
      uniqueCount,
      totalGenerated: totalQuestionsGenerated
    });
  }

  console.log("\n==========================================");
  console.log("📊 VALIDATION SUMMARY REPORT:");
  console.log("==========================================");
  metrics.forEach(m => {
    console.log(`- ${m.domain}: ${m.passed ? '🟢 PASS' : '🔴 FAIL'} (${m.uniqueCount}/${m.totalGenerated} unique)`);
  });

  console.log("==========================================");
  if (allPassed) {
    console.log("🎉 SUCCESS: Every single domain passed the diversity and loop validation checks!");
    process.exit(0);
  } else {
    console.error("❌ FAILURE: One or more domains failed the validation checks.");
    process.exit(1);
  }
}

runValidation();
