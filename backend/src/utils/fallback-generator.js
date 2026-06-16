import { parseResumeText } from './resume-parser.js';

/**
 * Generates a fallback cover letter locally when AI inference is unavailable.
 */
export function generateFallbackCoverLetter(resume, options) {
  const { companyName = '', roleTitle = '', jobDescription = '', tone = 'Professional' } = options;
  const name = resume.name || 'Candidate';
  const email = resume.email || '';
  const skills = resume.skills || [];
  const parsed = parseResumeText(resume.resumeText);

  // Pick top skills
  const topSkills = skills.length > 0 ? skills.slice(0, 5).join(', ') : 'software development and engineering principles';

  // Format greeting
  const targetCompany = companyName ? companyName : 'your company';
  const targetRole = roleTitle ? roleTitle : 'the open position';
  const greeting = companyName ? `Dear ${companyName} Hiring Team,` : 'Dear Hiring Manager,';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Dynamic values depending on tone
  let intro = '';
  let whyRole = '';
  let skillHighlight = '';
  let valueAdd = '';
  let closing = '';

  // Tailor to Job Description if provided
  let jdHighlight = '';
  if (jobDescription) {
    const jdLower = jobDescription.toLowerCase();
    const matched = skills.filter(s => jdLower.includes(s.toLowerCase())).slice(0, 3);
    if (matched.length > 0) {
      jdHighlight = `I noticed your role places emphasis on expertise in ${matched.join(', ')}. Over the course of my career, I have successfully applied these exact technologies in production scenarios. `;
    }
  }

  // Pick a project to showcase
  const projectMention = parsed.projects.length > 0
    ? `For instance, in my project "${parsed.projects[0]}", I successfully resolved complex technical challenges while leveraging my skill set.`
    : 'I have consistently applied software design principles to build efficient and scalable software systems.';

  // Tone options
  if (tone === 'Enthusiastic') {
    intro = `I am absolutely thrilled to apply for the ${targetRole} position at ${targetCompany}. Having followed your achievements, I am incredibly inspired by your company's vision and would be honored to bring my energy and expertise to your engineering team.`;
    whyRole = `What excites me most about this opportunity is the chance to tackle complex problems in a highly collaborative setting. ${jdHighlight}I thrive in fast-paced environments where team alignment and innovative execution are prioritized.`;
    skillHighlight = `My technical toolkit is anchored in ${topSkills}. ${projectMention} I love dive-deep engineering challenges and take great pride in shipping robust, production-grade applications that deliver real impact.`;
    valueAdd = `I am eager to contribute my dedication, adaptability, and technical experience to your immediate goals. I am confident that my work ethic will be a strong asset to your team.`;
    closing = `I would jump at the chance to discuss how my qualifications align with your engineering needs in an interview. Thank you for your time, energy, and consideration!`;
  } else if (tone === 'Friendly') {
    intro = `I'm writing to express my interest in the ${targetRole} opening at ${targetCompany}. With my background in technology and a genuine passion for building great user experiences, I'd love to join your team.`;
    whyRole = `I really appreciate the collaborative culture and positive impact your company values. ${jdHighlight}It aligns perfectly with how I like to work, and I'm excited about the possibility of collaborating with you all.`;
    skillHighlight = `On the technical side, I work extensively with ${topSkills}. ${projectMention} I enjoy collaborating, learning new tools, and sharing what I know to help the team succeed.`;
    valueAdd = `Beyond coding, I bring a positive attitude, clear communication, and a focus on solving problems. I look forward to working with your team to build outstanding solutions.`;
    closing = `I'd love to connect for a chat or interview. Thank you so much for reviewing my application!`;
  } else if (tone === 'Formal') {
    intro = `Please accept this letter as my formal application for the position of ${targetRole} at ${targetCompany}. Given my qualifications and software engineering background, I am confident in my suitability for this role.`;
    whyRole = `Your organization's reputation for technical excellence presents an ideal environment for my professional skills. ${jdHighlight}I seek to apply my capabilities to support your strategic initiatives and ensure the quality of your systems.`;
    skillHighlight = `I possess specialized experience with ${topSkills}. ${projectMention} My approach to software development focuses on quality control, structured architecture, and systematic problem solving.`;
    valueAdd = `I offer a disciplined approach to software development, combined with a strong work ethic and a commitment to meeting deadlines. I aim to maintain high engineering standards in all deliverables.`;
    closing = `I look forward to the opportunity to discuss my qualifications in a formal interview. Thank you for your time and professional consideration.`;
  } else { // Professional
    intro = `I am writing to express my interest in the ${targetRole} position at ${targetCompany}. With a strong foundation in software engineering and practical experience with modern frameworks, I am well-prepared to contribute to your engineering goals.`;
    whyRole = `I am drawn to this position because it offers the opportunity to apply my problem-solving skills to real-world challenges. ${jdHighlight}I want to work with a team that values high engineering standards and collaborative execution.`;
    skillHighlight = `My expertise spans ${topSkills}. ${projectMention} I focus on writing clean, maintainable code, building responsive user interfaces, and designing solid backend systems.`;
    valueAdd = `My background has prepared me to collaborate across roles, understand complex requirements, and deliver reliable solutions. I am eager to help your team succeed.`;
    closing = `I would welcome the opportunity to discuss my qualifications in an interview. Thank you for your time and consideration.`;
  }

  const educationMention = parsed.education.length > 0
    ? `Additionally, my academic background in ${parsed.education.slice(0, 2).join(' and ')} has provided me with a solid theoretical foundation.`
    : '';

  return `${name}
${email}
Date: ${dateStr}

${greeting}

${intro}

${whyRole}

${skillHighlight}

${educationMention} ${valueAdd}

${closing}

Sincerely,

${name}`;
}

/**
 * Technical Question Pools mapped by specific role categories and difficulties
 */
const TECHNICAL_POOLS = {
  machine_learning: {
    Easy: [
      {
        question: "Explain how to perform element-wise array multiplication in NumPy using vectorization versus standard Python loops.",
        why: "Measures understanding of basic NumPy vectorized operations and computational efficiency.",
        expectedAnswer: [
          "NumPy utilizes contiguous memory arrays and compiled C code under the hood.",
          "Using `a * b` performs element-wise multiplication instantly without explicit loops.",
          "Standard python loops (`for x, y in zip(a, b)`) carry high object lookup overhead and interpreter latency."
        ]
      },
      {
        question: "How do you identify and handle missing values in a Pandas DataFrame (e.g. using isna, dropna, or fillna)?",
        why: "Tests baseline data cleaning capabilities in Pandas.",
        expectedAnswer: [
          "`df.isna()` or `df.isnull()` returns a boolean mask of missing cells.",
          "`df.dropna()` deletes rows or columns containing missing values.",
          "`df.fillna(value)` replaces missing values with constants, means, medians, or interpolation."
        ]
      },
      {
        question: "What is the purpose of a train-test split, and why should you never train your ML model on the test dataset?",
        why: "Checks understanding of model validation fundamentals and data leakage.",
        expectedAnswer: [
          "Train-test split evaluates model generalization performance on unseen data.",
          "Training on test data causes data leakage and optimistic bias.",
          "Makes the model look highly accurate during testing but fail in production."
        ]
      },
      {
        question: "What is overfitting in machine learning? Describe a visual indicator of overfitting during training.",
        why: "Checks baseline model evaluation and variance diagnostics.",
        expectedAnswer: [
          "Overfitting occurs when a model learns noise and details of the training set rather than the underlying distribution.",
          "Visual indicator: Training loss continuously decreases while Validation/Test loss stops decreasing and starts rising."
        ]
      },
      {
        question: "Explain the basic concept of K-Fold Cross-Validation at a high level.",
        why: "Checks foundational understanding of model evaluation robustness.",
        expectedAnswer: [
          "The dataset is split into K equal-sized partitions (folds).",
          "The model is trained K times, each time using K-1 folds for training and 1 fold for validation.",
          "Results are averaged to get a final performance estimate."
        ]
      },
      {
        question: "What is the difference between classification accuracy and precision?",
        why: "Checks baseline classification performance taxonomy.",
        expectedAnswer: [
          "Accuracy is overall correct predictions / total predictions.",
          "Precision is true positives / (true positives + false positives).",
          "Precision measures the accuracy of positive predictions (minimizing false alarms)."
        ]
      },
      {
        question: "What is the difference between a model parameter and a model hyperparameter?",
        why: "Checks baseline ML concepts.",
        expectedAnswer: [
          "Parameters are learned directly from the data during training (e.g., weights in linear regression).",
          "Hyperparameters are configured beforehand by the user to control the training process (e.g., learning rate, K in KNN)."
        ]
      },
      {
        question: "Explain how categorical variables can be converted to numerical data using one-hot encoding.",
        why: "Checks data preprocessing fundamentals.",
        expectedAnswer: [
          "One-hot encoding creates a binary column/indicator for each category.",
          "Only one column is active (value of 1) while others are 0.",
          "Avoids implying an ordinal relationship between categorical values."
        ]
      }
    ],
    Medium: [
      {
        question: "How does a decision tree determine its splits? Explain how standard scaling affects algorithms like SVM or KNN versus Decision Trees.",
        why: "Tests preprocessing requirements across algorithms.",
        expectedAnswer: [
          "Decision trees determine splits by maximizing Information Gain (Entropy reduction) or Gini Impurity reduction.",
          "Algorithms relying on distance calculations (SVM, KNN) require scaled features to prevent larger-scale variables from dominating.",
          "Decision trees split features independently, making them invariant to monotonic scaling transformations."
        ]
      },
      {
        question: "Explain the concept of gradient boosting in XGBoost. How does it build trees sequentially to minimize errors?",
        why: "Tests understanding of ensemble learning and gradient boosting internals.",
        expectedAnswer: [
          "Boosting is an ensemble method where trees are added sequentially to correct errors of previous trees.",
          "XGBoost fits a new weak learner to the pseudo-residuals (gradients) of the loss function.",
          "Uses second-order Taylor expansion for loss approximation, adding regularization terms (L1/L2) on trees to prevent overfitting."
        ]
      },
      {
        question: "What is Stratified K-Fold Cross-Validation, and when is it preferred over standard K-Fold?",
        why: "Checks advanced model validation methodology.",
        expectedAnswer: [
          "Stratified K-Fold ensures each fold contains approximately the same percentage of target class samples as the whole dataset.",
          "Highly preferred for highly imbalanced datasets.",
          "Prevents folds from having zero positive class labels during validation."
        ]
      },
      {
        question: "Explain the ROC-AUC metric. When is the Precision-Recall AUC (PR-AUC) curve a better metric for model performance?",
        why: "Tests capability to evaluate models under class imbalance.",
        expectedAnswer: [
          "ROC-AUC plots True Positive Rate vs False Positive Rate across classification thresholds.",
          "PR-AUC plots Precision vs Recall across classification thresholds.",
          "PR-AUC is much better under heavy class imbalance because it doesn't include True Negatives, which dominate FPR calculations."
        ]
      },
      {
        question: "Compare Grid Search and Random Search. Why does Random Search often find better hyperparameters faster?",
        why: "Checks hyperparameter optimization efficiency tradeoffs.",
        expectedAnswer: [
          "Grid search exhaustively searches all combinations of a predefined grid.",
          "Random search samples configurations randomly from a probability distribution.",
          "Random search is faster because it does not waste calculations testing uninfluential hyperparameters."
        ]
      },
      {
        question: "What is target encoding, and what precautions must you take to prevent data leakage?",
        why: "Tests advanced feature engineering skills.",
        expectedAnswer: [
          "Target encoding replaces category values with the mean target value of that category.",
          "Risk: Data leakage because target labels from the validation/test set can leak into feature values.",
          "Precautions: Calculate target mappings only on training folds, use smoothing parameters, or add noise."
        ]
      },
      {
        question: "What are the main steps to containerize a Python machine learning model using Docker and serve it via an API?",
        why: "Tests model deployment deployment knowledge.",
        expectedAnswer: [
          "Create a REST API wrapper (FastAPI, Flask) that loads the serialized model pickle/weights.",
          "Write a Dockerfile starting from a python base image, copy requirements, install dependencies, copy application code, and run server CMD.",
          "Optimize container size, use gunicorn/uvicorn, and isolate model weights load during container startup."
        ]
      },
      {
        question: "Explain L1 (Lasso) and L2 (Ridge) regularization. How do they penalize model weights to prevent overfitting?",
        why: "Checks model regularization mathematics.",
        expectedAnswer: [
          "L1 adds absolute value penalty of weights to loss, which drives uninfluential feature weights to 0 (feature selection).",
          "L2 adds squared value penalty of weights to loss, which shrinks all weights towards 0 but keeps them non-zero.",
          "Both restrict model capacity to prevent overfitting."
        ]
      }
    ],
    Hard: [
      {
        question: "How do you identify and mitigate covariate shift and concept drift in a production machine learning system?",
        why: "Tests production monitoring and model maintenance reasoning.",
        expectedAnswer: [
          "Covariate shift: input data distributions change over time (detect using PSI, Kolmogorov-Smirnov test).",
          "Concept drift: relationship between inputs and targets changes (detect by tracking performance degradation).",
          "Mitigate: set up alert metrics, retrain models on recent data, use online learning, or collect fresh labels."
        ]
      },
      {
        question: "How do you optimize high-throughput ML inference pipelines? Discuss model quantization, ONNX runtime, and batching.",
        why: "Tests performance optimization and deployment architecture.",
        expectedAnswer: [
          "Quantization: convert weights from float32 to float16 or int8 (reduces latency and size).",
          "ONNX: export models to a standardized graph format that executes on optimized runtime engines.",
          "Batching: use dynamic batching at the gateway layer (e.g. Triton Inference Server) to maximize GPU utilization."
        ]
      },
      {
        question: "How do you train tree-based models on datasets that exceed single-machine memory capacity? Discuss distributed frameworks.",
        why: "Tests distributed scaling capabilities on big data.",
        expectedAnswer: [
          "Use distributed data processing engines (Apache Spark) to process features.",
          "Leverage distributed gradient boosting frameworks like XGBoost on Ray, LightGBM on Spark, or Dask.",
          "Implement out-of-core training where trees are trained on chunks loaded incrementally from disk."
        ]
      },
      {
        question: "How do you perform cross-validation for time-series models without introducing lookahead bias?",
        why: "Tests knowledge of validation layouts in temporal datasets.",
        expectedAnswer: [
          "Do not use random K-Fold splits because they shuffle future records into past training sets (leakage).",
          "Use TimeSeriesSplit (rolling/expanding window validation).",
          "Train on data up to time T, validate on data from T+1 to T+k, then expand training range."
        ]
      },
      {
        question: "Explain Bayesian Optimization for hyperparameter tuning. How does it use acquisition functions to guide search?",
        why: "Tests advanced hyperparameter tuning math.",
        expectedAnswer: [
          "Bayesian optimization models hyperparameter space using a Gaussian Process surrogate model.",
          "Acquisition functions (Expected Improvement, UCB) evaluate surrogate model to decide where to sample next.",
          "Balances exploration (high uncertainty regions) and exploitation (known high performance regions)."
        ]
      },
      {
        question: "Design a real-time feature store architecture. How do you handle low-latency serving and sync with offline training?",
        why: "Tests ML systems design and database integrations.",
        expectedAnswer: [
          "Dual-storage system: Offline store (S3, Snowflake) for historical data and training, Online store (Redis, DynamoDB) for serving.",
          "Stream processing engine (Flink) updates the online store in real-time.",
          "Entity-based APIs (Feast) ensure identical feature definitions are used for both training and serving, preventing train-serve skew."
        ]
      },
      {
        question: "Under extreme class imbalance (e.g., 1 in 10,000), how do you design a robust validation set and loss function?",
        why: "Tests model design and loss optimization for imbalanced scenarios.",
        expectedAnswer: [
          "Validation: Use stratified splitting, hold out a large enough validation set to contain positive instances, and evaluate using PR-AUC and F-beta.",
          "Loss function: Use class-weighted cross-entropy, Focal Loss (penalizes easy negative examples), or cost-sensitive learning metrics."
        ]
      },
      {
        question: "Explain how to write custom estimators and transformers in scikit-learn that integrate into a parallel grid search pipeline.",
        why: "Tests scikit-learn extensibility and pipeline engineering.",
        expectedAnswer: [
          "Extend `BaseEstimator` and `TransformerMixin` classes from `sklearn.base`.",
          "Implement `fit(X, y)` returning `self` and `transform(X)` returning a transformed array.",
          "Avoid naming parameters in `__init__` with variable args, allowing grid search to clone and serialize them."
        ]
      }
    ]
  },
  ai: {
    Easy: [
      {
        question: "What is tokenization in Large Language Models? Explain how characters are grouped into subwords.",
        why: "Measures understanding of LLM text preprocessing and basic modeling inputs.",
        expectedAnswer: [
          "Tokenization splits raw text into integers (tokens) that an LLM can parse.",
          "Instead of grouping by single characters or entire words, it groups by subwords (e.g., 'helpful' becomes 'help' and 'ful').",
          "Saves vocabulary size while handling suffixes, prefixes, and typos efficiently."
        ]
      },
      {
        question: "What are text embeddings, and how do they represent semantic meaning in a vector space?",
        why: "Tests baseline knowledge of semantic text representation.",
        expectedAnswer: [
          "Embeddings convert text into dense, high-dimensional floating-point vectors.",
          "Vectors represent semantic meaning (closeness in vector space correlates with closeness in text meaning).",
          "Enables math calculations like cosine similarity to compare texts."
        ]
      },
      {
        question: "What is the difference between zero-shot prompting and few-shot prompting?",
        why: "Checks baseline prompt engineering concepts.",
        expectedAnswer: [
          "Zero-shot prompting asks the model to perform a task without giving any examples.",
          "Few-shot prompting provides one or more examples of inputs and desired outputs inside the prompt.",
          "Few-shot guides the model in formatting and contextual alignment."
        ]
      },
      {
        question: "What are the encoder and decoder components in the original Transformer architecture?",
        why: "Checks foundational deep learning model architecture.",
        expectedAnswer: [
          "Encoder processes input tokens and generates contextual embeddings.",
          "Decoder processes target outputs auto-regressively to generate subsequent tokens.",
          "BERT is encoder-only; GPT is decoder-only; T5 is encoder-decoder."
        ]
      },
      {
        question: "What is a vector database, and why is it used in generative AI applications?",
        why: "Checks foundational index storage for embeddings.",
        expectedAnswer: [
          "Specialized database designed to store, index, and query high-dimensional vector embeddings.",
          "Enables fast Approximate Nearest Neighbor (ANN) searches.",
          "Core component for retrieving context documents in RAG applications."
        ]
      },
      {
        question: "Explain the basic concept of Retrieval-Augmented Generation (RAG) in simple terms.",
        why: "Checks entry-level generative AI systems taxonomy.",
        expectedAnswer: [
          "RAG links LLMs to external data sources.",
          "Retrieves relevant text chunks matching a user query, merges them into the LLM context prompt, and generates responses.",
          "Reduces hallucinations and provides access to private or real-time data."
        ]
      },
      {
        question: "What is the difference between pre-training a foundation model and fine-tuning it?",
        why: "Checks baseline model training terminology.",
        expectedAnswer: [
          "Pre-training trains a model from scratch on raw text to learn grammar and general facts (unsupervised).",
          "Fine-tuning trains the pre-trained model on labeled, task-specific data to adjust behaviors (supervised)."
        ]
      },
      {
        question: "What are temperature and top-p sampling parameters, and how do they control LLM response creativity?",
        why: "Checks generation parameter controls.",
        expectedAnswer: [
          "Temperature scales output logits (lower temperature makes output deterministic, higher makes it creative/random).",
          "Top-p (nucleus sampling) restricts options to the cumulative probability threshold (e.g. top 90%).",
          "They are used to balance consistency and creativity."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain the self-attention mechanism in Transformers. How do query, key, and value vectors interact?",
        why: "Tests core transformer math and architecture.",
        expectedAnswer: [
          "Self-attention calculates contextual weight relations between all tokens in a sequence.",
          "Input embeddings are multiplied by matrices to yield Query (Q), Key (K), and Value (V) vectors.",
          "Attention weights are calculated via dot-product: Softmax( (Q * K^T) / sqrt(d_k) ) * V."
        ]
      },
      {
        question: "Describe different document chunking strategies (e.g., character, token, semantic). How does chunk overlap affect retrieval?",
        why: "Tests data pre-processing capabilities in search pipelines.",
        expectedAnswer: [
          "Character: splits text by fixed letter/char count (simplistic, breaks contexts).",
          "Token: splits by exact LLM subword token counts (prevents context window exhaustions).",
          "Semantic: splits by changes in text meaning or sentence boundaries.",
          "Chunk overlap ensures context is not split in half, keeping keyword relations intact."
        ]
      },
      {
        question: "Explain Parameter-Efficient Fine-Tuning (PEFT) and how LoRA reduces the number of trainable weights.",
        why: "Tests knowledge of LLM tuning optimization.",
        expectedAnswer: [
          "PEFT fine-tunes models by keeping base weights frozen and adding minor trainable adapters.",
          "LoRA (Low-Rank Adaptation) decomposes weight update delta matrices into two low-rank matrices (A and B).",
          "Reduces trainable parameters by 99%+, saving massive GPU VRAM during training."
        ]
      },
      {
        question: "Compare vector indexing strategies. What is the difference between exact flat searches and Approximate Nearest Neighbor (ANN)?",
        why: "Tests database lookup performance reasoning.",
        expectedAnswer: [
          "Flat index: performs exhaustive brute force search (exact cosine similarity), high lookup latency at scale.",
          "ANN (e.g. HNSW, IVF): uses graphs or clusters to quickly locate nearby vectors.",
          "ANN trades small precision drops for near-instant searches on millions of documents."
        ]
      },
      {
        question: "What is KV Caching, and how does it optimize generation speed in auto-regressive models?",
        why: "Tests model execution performance details.",
        expectedAnswer: [
          "During token generation, Key and Value vectors for past tokens are cached in memory.",
          "Avoids redundant matrix computations for previous prompt tokens in subsequent generation cycles.",
          "Accelerates inference speed significantly, transforming calculations from quadratic to linear scale."
        ]
      },
      {
        question: "What is Chain of Thought (CoT) prompting, and how does it improve reasoning performance?",
        why: "Tests prompt engineering optimization logic.",
        expectedAnswer: [
          "Prompting technique instructing the LLM to write step-by-step reasoning details before outputting final answers (e.g. 'Let's think step by step').",
          "Allows the model to allocate compute budget dynamically across intermediate tokens.",
          "Improves success rates on mathematical and logical reasoning tasks."
        ]
      },
      {
        question: "What is Byte Pair Encoding (BPE), and how does it handle out-of-vocabulary words?",
        why: "Checks tokenization mechanics.",
        expectedAnswer: [
          "Iteratively merges the most frequent pairs of bytes/characters into vocabulary tokens.",
          "Out-of-vocabulary words are broken down into single characters or byte-level representations.",
          "Ensures the tokenizer never encounters an unknown token error."
        ]
      },
      {
        question: "How do you evaluate embedding quality? Explain similarity metrics like cosine similarity and dot product.",
        why: "Checks mathematical evaluation metrics for semantic search.",
        expectedAnswer: [
          "Cosine similarity: measures angle cosine between vectors, ignoring magnitudes (normalized range -1 to 1).",
          "Dot product: measures alignment and magnitude (faster to calculate but requires normalized vectors).",
          "Evaluated using downstream benchmarks (MTEB) assessing search retrieval precision."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a production-grade RAG pipeline. How do you implement hybrid search (keyword + semantic) and re-ranking?",
        why: "Tests system architecture design for enterprise RAG applications.",
        expectedAnswer: [
          "Keyword search (BM25) and Semantic search (embeddings) execute queries in parallel.",
          "Results are merged using Reciprocal Rank Fusion (RRF).",
          "A Cross-Encoder model (re-ranker) evaluates semantic relevance of top documents relative to query.",
          "Reduces token usage and improves retrieval precision before sending context to LLM."
        ]
      },
      {
        question: "Explain QLoRA and quantization strategies. How does NF4 quantization allow fine-tuning on consumer hardware?",
        why: "Tests advanced LLM fine-tuning mathematics and GPU optimizations.",
        expectedAnswer: [
          "QLoRA quantizes base model weights into 4-bit NormalFloat4 (NF4) data types.",
          "Base model is frozen in 4-bit, and gradient updates are calculated in 16-bit LoRA adapter layers.",
          "Utilizes Double Quantization to shrink quant constants, saving memory.",
          "Enables tuning 70B parameter models on single consumer-grade GPUs."
        ]
      },
      {
        question: "Describe inference serving frameworks like vLLM. Explain paging mechanisms (PagedAttention) and continuous batching.",
        why: "Tests scalability of LLM serving systems under high concurrent load.",
        expectedAnswer: [
          "vLLM solves KV cache fragmentation using PagedAttention, which allocates KV caches in non-contiguous virtual blocks (similar to OS paging).",
          "Eliminates internal cache waste, freeing up RAM for higher concurrency.",
          "Continuous batching groups requests at the token level during iteration passes, avoiding delays from early-finishing requests."
        ]
      },
      {
        question: "Analyze the tradeoffs between HNSW and IVF-PQ vector indexing in terms of recall, index size, and query latency.",
        why: "Tests database architect level indexing tradeoffs.",
        expectedAnswer: [
          "HNSW: high search speeds and recall, but requires massive memory allocation to hold graph structures.",
          "IVF-PQ: partitions data and quantizes vectors, yielding small index sizes and fast loads, but suffers lower recall.",
          "Choose HNSW for small, high-precision datasets; choose IVF-PQ for large-scale, memory-constrained environments."
        ]
      },
      {
        question: "How do you protect LLM applications from prompt injection attacks and protect system prompts from leaking?",
        why: "Tests security engineering for AI architectures.",
        expectedAnswer: [
          "Enforce separation of system instructions and user contents (e.g. chat template structures).",
          "Implement guardrails using classification checkers (Llama Guard) to validate inputs and outputs.",
          "Incorporate semantic check gates to flag instructions attempting override patterns (e.g. 'ignore previous')."
        ]
      },
      {
        question: "Explain the mathematical calculation of Multi-Head Attention, and how FlashAttention optimizes it at the hardware level.",
        why: "Tests deep theoretical optimization mechanics.",
        expectedAnswer: [
          "Multi-head attention projects queries, keys, and values into multiple head subspaces, calculating attention in parallel.",
          "Standard attention writes large intermediate attention matrices to GPU High Bandwidth Memory (HBM).",
          "FlashAttention tiles inputs into GPU SRAM blocks, calculating softmax incrementally without saving full intermediate matrices.",
          "Significantly reduces memory read/write cycles, speeding up computation."
        ]
      },
      {
        question: "Compare RLHF (Reinforcement Learning from Human Feedback) and DPO (Direct Preference Optimization) for model alignment.",
        why: "Tests advanced model alignment and preference training math.",
        expectedAnswer: [
          "RLHF requires training a separate Reward Model, then optimizing the LLM using PPO reinforcement loops (complex and unstable).",
          "DPO derives the optimization objective analytically, optimizing the LLM directly on preference pairs.",
          "DPO bypasses the reward model entirely, rendering alignment faster and computationally simpler."
        ]
      },
      {
        question: "Explain speculative decoding. How does using a small draft model accelerate generation of a target LLM?",
        why: "Tests advanced LLM generation acceleration algorithms.",
        expectedAnswer: [
          "A small, fast draft model generates K candidate tokens auto-regressively.",
          "The large target LLM evaluates the K tokens in a single parallel forward pass.",
          "Tokens are accepted or rejected based on probability matching rules.",
          "Accelerates generation because parallel target evaluations bypass sequence latency limits."
        ]
      }
    ]
  },
  devops: {
    Easy: [
      {
        question: "What is the primary difference between a Docker container and a traditional Virtual Machine?",
        why: "Checks containerization vs VM architecture baseline.",
        expectedAnswer: [
          "Virtual Machines virtualize hardware and include a full guest OS, running via a hypervisor (heavy resource cost).",
          "Docker containers share the host OS kernel and isolate processes using namespaces and cgroups (lightweight, rapid start)."
        ]
      },
      {
        question: "What does CI/CD stand for, and why is it important in modern software development?",
        why: "Checks baseline deployment terminology.",
        expectedAnswer: [
          "Continuous Integration / Continuous Deployment.",
          "Automates code building, testing, and release configurations.",
          "Reduces manual deployment bugs, ensuring features ship fast and safely."
        ]
      },
      {
        question: "What are actions, workflows, and runners in GitHub Actions?",
        why: "Checks basic knowledge of GitHub workflow configs.",
        expectedAnswer: [
          "Workflow: automated YAML file declaring build/test jobs.",
          "Runner: the server process executing workflow commands.",
          "Action: reusable step components performing tasks (e.g. checkout, install node)."
        ]
      },
      {
        question: "How do you check active system processes and resource utilization in a Linux shell?",
        why: "Checks baseline terminal navigation.",
        expectedAnswer: [
          "`ps aux` or `ps -ef` list running processes.",
          "`top` or `htop` show real-time CPU and memory load.",
          "`df -h` and `free -m` display disk and RAM usage."
        ]
      },
      {
        question: "What is a reverse proxy, and how is Nginx used as one?",
        why: "Checks baseline web server architecture.",
        expectedAnswer: [
          "A server that sits in front of backend servers, forwarding client requests to them.",
          "Nginx acts as a single endpoint, handling client traffic, load balancing, and SSL termination."
        ]
      },
      {
        question: "What is the difference between an AWS EC2 instance and an AWS S3 bucket?",
        why: "Checks baseline cloud compute vs storage service.",
        expectedAnswer: [
          "EC2 provides virtual machines for compute tasks (runs servers).",
          "S3 provides object storage for files, assets, and data backups."
        ]
      },
      {
        question: "What is the purpose of logging and metric collection in infrastructure management?",
        why: "Checks monitoring baseline.",
        expectedAnswer: [
          "Logging tracks historical system events to trace error roots.",
          "Metric collection tracks resource utilization trends (CPU, network) to identify anomalies."
        ]
      },
      {
        question: "What is Infrastructure as Code (IaC) at a high level?",
        why: "Checks baseline cloud configuration taxonomy.",
        expectedAnswer: [
          "Managing cloud infrastructure using configuration files rather than manual UI clicks.",
          "Enables version control, review pipelines, and predictable resource builds."
        ]
      }
    ],
    Medium: [
      {
        question: "How do you construct a multi-stage Docker build to compile assets and output a secure, minimal runtime image?",
        why: "Tests container build optimization and security practices.",
        expectedAnswer: [
          "Use a temporary 'build' stage containing tools (e.g. node, compilers) to bundle resources.",
          "Use a clean, lightweight base image (e.g. Alpine, Distroless) for the final runtime stage.",
          "Copy only compile outputs (dist, node_modules production) to the final stage, eliminating build tools."
        ]
      },
      {
        question: "Explain the difference between a Pod and a Deployment in Kubernetes. How does a Deployment manage rolling updates?",
        why: "Tests core Kubernetes layout knowledge.",
        expectedAnswer: [
          "A Pod is the smallest deployable unit (holding containers sharing networks).",
          "A Deployment controls Pod replica states.",
          "Rolling updates launch new pods (v2) while slowly terminating old pods (v1), ensuring zero downtime."
        ]
      },
      {
        question: "How do you build a secure Jenkins pipeline that handles caching of node modules or maven packages?",
        why: "Tests CI/CD pipeline writing and acceleration skills.",
        expectedAnswer: [
          "Use Jenkins plugins (Pipeline Utility Steps) or docker volumes to persist dependency folders across builds.",
          "Restrict write access to credentials using `credentialsId` and environment wrapping.",
          "Incorporate pipeline stages inside container agents to isolate runner hosts."
        ]
      },
      {
        question: "How do you write a systemd service file to manage a custom node application daemon in Linux?",
        why: "Tests Linux system administration skills.",
        expectedAnswer: [
          "Create a `.service` file under `/etc/systemd/system/`.",
          "Define `[Service]` configurations: `ExecStart`, `WorkingDirectory`, `Restart=always`, and `User=nobody`.",
          "Manage daemon via `systemctl enable` and `systemctl start` commands."
        ]
      },
      {
        question: "How do you configure Nginx to load balance traffic across multiple backend nodes? What algorithms are available?",
        why: "Tests web server configuration skills.",
        expectedAnswer: [
          "Declare backend nodes inside the `upstream` directive block.",
          "Configure the target route using `proxy_pass http://upstream_name`.",
          "Algorithms: Round Robin, Least Connections, IP Hash, and Random."
        ]
      },
      {
        question: "Explain how VPC routing tables, subnets, and NAT Gateways work together to allow private instances to access the internet.",
        why: "Tests cloud networking infrastructure configurations.",
        expectedAnswer: [
          "Private instances reside in subnets with routes pointing local traffic inside the VPC.",
          "Outbound internet traffic (0.0.0.0/0) in private route tables points to a NAT Gateway.",
          "The NAT Gateway sits in a public subnet, translating private IPs to public IPs and forwarding requests to the Internet Gateway."
        ]
      },
      {
        question: "Explain the pull-based architecture of Prometheus. How does it scrape metrics from targets?",
        why: "Tests infrastructure telemetry collection patterns.",
        expectedAnswer: [
          "Prometheus pulls metrics by requesting HTTP `/metrics` endpoints on targets at defined scrape intervals.",
          "Targets use exporters (e.g. Node Exporter) to format system metrics into Prometheus format.",
          "Bypasses target firewalls since target nodes do not push connections out to Prometheus."
        ]
      },
      {
        question: "How does Terraform use state files to track infrastructure, and how do you implement state locking?",
        why: "Tests IaC deployment architecture controls.",
        expectedAnswer: [
          "Terraform saves infrastructure map details in a `terraform.tfstate` file.",
          "To enable team collaboration, store state files in remote storage (S3).",
          "Implement state locking (e.g. AWS DynamoDB) to prevent race conditions during concurrent runs."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a zero-downtime Canary release pipeline on Kubernetes using custom controllers or service meshes.",
        why: "Tests advanced release engineering design.",
        expectedAnswer: [
          "Deploy a service mesh (Istio) or ingress controller (Nginx Ingress) supporting weight routing.",
          "Define a Canary resource managed by a controller (Flagger, Argo Rollouts).",
          "Automate weight increments (e.g. 5% to 50%) while evaluating Prometheus metrics (error rate, latency).",
          "Automatically abort and rollback deployments to 100% stable version on metric alerts."
        ]
      },
      {
        question: "Describe the risks of state file exposure in Terraform. How do you secure state files in team environments?",
        why: "Tests IaC security and compliance.",
        expectedAnswer: [
          "State files contain passwords, API keys, and connection strings in plain text.",
          "Secure by locking down git directories (add state files to `.gitignore`).",
          "Store state files in remote encrypted backends (S3 with KMS key validation).",
          "Enforce least privilege access to remote backend buckets via IAM policies."
        ]
      },
      {
        question: "How do you implement automated rollback strategies in a gitops pipeline (e.g. using ArgoCD or Flux) when validation tests fail?",
        why: "Tests enterprise GitOps sync configurations.",
        expectedAnswer: [
          "ArgoCD tracks git target manifests. Rollback requires reverting configurations in Git.",
          "Integrate automated smoke test checks post-deploy. If checks fail, trigger a webhook.",
          "The webhook runs a git revert commit script on the repository, triggering ArgoCD to auto-heal."
        ]
      },
      {
        question: "How do you troubleshoot low-level network performance bottlenecks and packet drops in a production Linux environment?",
        why: "Tests system diagnostics under stress.",
        expectedAnswer: [
          "Inspect socket queue sizes using `ss -s` or `netstat -i`.",
          "Track network packet statistics and drops using `/proc/net/dev` and `ethtool`.",
          "Debug packet drops within kernel stack filters using eBPF probes (bpftrace) or `tcpdump` profiling."
        ]
      },
      {
        question: "Design a distributed tracing and observability pipeline for a microservices architecture using OpenTelemetry and Jaeger.",
        why: "Tests system logging architecture at scale.",
        expectedAnswer: [
          "Embed OpenTelemetry SDKs in services to generate trace context headers (W3C Trace Context).",
          "Forward telemetry data to local OpenTelemetry Collectors running as sidecars.",
          "The collector batches and forwards data to a Jaeger database backend (Elasticsearch, Cassandra) for indexing and visual searching."
        ]
      },
      {
        question: "Discuss the security considerations of container execution. How do you enforce rootless containers and scan for vulnerabilities?",
        why: "Tests container runtime security enforcement.",
        expectedAnswer: [
          "Enforce `USER nonroot` inside Dockerfile configurations to avoid escalations.",
          "Enable read-only root filesystems and drop linux capabilities (`CAP_SYS_ADMIN`).",
          "Integrate image scanners (Trivy, Anchore) in CI/CD build stages, blocking builds on critical vulnerabilities."
        ]
      },
      {
        question: "How do you optimize Nginx configurations to support millions of concurrent connections?",
        why: "Tests high volume web server tuning.",
        expectedAnswer: [
          "Tune Linux kernel limits: expand file descriptors (`sys.fs.file-max`) and ephemeral port range.",
          "Configure Nginx worker limits: `worker_connections 65535` and enable `multi_accept`.",
          "Optimize keepalive connection pools in backend upstream groups to reuse connections."
        ]
      },
      {
        question: "Design a disaster recovery plan (active-active) across two geographically separated AWS regions for a database-driven app.",
        why: "Tests global fault-tolerant cloud design.",
        expectedAnswer: [
          "Deploy compute workloads (ECS, EKS) in both regions behind a global load balancer (Route 53 latency routing).",
          "Use multi-region active-active databases (Amazon Aurora Global Database) with cross-region replica synchronization.",
          "Incorporate conflict resolution patterns at application levels (UUIDs, CRDTs) for concurrent writes."
        ]
      }
    ]
  },
  cloud: {
    Easy: [
      {
        question: "What is the difference between an IAM user, an IAM group, and an IAM role?",
        why: "Measures basic cloud access security concepts.",
        expectedAnswer: [
          "IAM User represents a specific individual or long-lived service API key.",
          "IAM Group is a collection of users inheriting identical permissions.",
          "IAM Role is a temporary security identity assumed by users, systems, or services."
        ]
      },
      {
        question: "What are Security Groups in AWS, and how do they differ from network access control lists (NACLs)?",
        why: "Checks baseline cloud firewall configurations.",
        expectedAnswer: [
          "Security Groups are stateful firewalls protecting instance interfaces, managing inbound/outbound allow rules.",
          "NACLs are stateless firewalls protecting subnet boundaries, requiring explicit allow and deny rules for both directions."
        ]
      },
      {
        question: "What is a VPC subnet, and what makes a subnet public vs private?",
        why: "Checks baseline cloud network topology.",
        expectedAnswer: [
          "A subnet is a segregated IP range within a Virtual Private Cloud (VPC).",
          "A public subnet has a route pointing outbound traffic to an Internet Gateway (IGW).",
          "A private subnet lacks a direct IGW route, utilizing NAT Gateways for outbound access."
        ]
      },
      {
        question: "What is a Load Balancer, and why is it used?",
        why: "Checks baseline load balancing taxonomy.",
        expectedAnswer: [
          "A device that distributes incoming application traffic across multiple target servers.",
          "Prevents single server exhaustion, increases availability, and performs health check failures."
        ]
      },
      {
        question: "What is AWS S3, and what are its primary storage classes?",
        why: "Checks baseline cloud storage terminology.",
        expectedAnswer: [
          "Simple Storage Service (highly durable object storage).",
          "Storage classes: S3 Standard (frequent access), S3 Infrequent Access (IA), and S3 Glacier (archival)."
        ]
      },
      {
        question: "What is Serverless computing, and what is AWS Lambda?",
        why: "Checks serverless computing taxonomy.",
        expectedAnswer: [
          "Computing model where cloud providers manage machine provisioning and scaling dynamically.",
          "AWS Lambda is an event-driven serverless function that executes code in response to triggers, billing only for compute time."
        ]
      },
      {
        question: "What is AWS CloudFormation at a high level?",
        why: "Checks cloud orchestration baseline.",
        expectedAnswer: [
          "Infrastructure as Code service to model and set up AWS resources via JSON or YAML templates.",
          "Enables repeatable, transactional cloud deployments."
        ]
      },
      {
        question: "What is the Principle of Least Privilege in cloud security?",
        why: "Checks baseline security configurations.",
        expectedAnswer: [
          "Enforcing permission configurations where users or systems get only the minimum access needed to complete tasks.",
          "Reduces security exposure surface."
        ]
      }
    ],
    Medium: [
      {
        question: "How do you configure cross-account access using IAM roles and trust policies?",
        why: "Tests multi-account cloud security configurations.",
        expectedAnswer: [
          "Create an IAM role in the trusting target account (Account B) with permissions.",
          "Configure the Role's Trust Policy to allow the trusted source account (Account A) root or user ARN.",
          "Grant user/roles in Account A permission to execute `AssumeRole` on the role ARN in Account B."
        ]
      },
      {
        question: "How do you configure AWS Auto Scaling Groups with dynamic scaling policies based on custom CPU or network metrics?",
        why: "Tests automated scaling configurations.",
        expectedAnswer: [
          "Create a Launch Template defining instance properties.",
          "Define target metric alarms in CloudWatch (e.g. CPU > 70%).",
          "Attach Target Tracking or Step Scaling policies to adjust replica counts on alarm fires."
        ]
      },
      {
        question: "Explain the difference between VPC Peering and AWS Transit Gateway. When should you transition to Transit Gateway?",
        why: "Tests advanced cloud routing designs.",
        expectedAnswer: [
          "VPC Peering creates a point-to-point connection between two VPCs (non-transitive).",
          "Transit Gateway acts as a centralized hub routing traffic across multiple VPCs (transitive).",
          "Transition to Transit Gateway when VPC count scales, avoiding complex mesh layouts."
        ]
      },
      {
        question: "Compare Application Load Balancers (ALB) and Network Load Balancers (NLB). When is NLB required?",
        why: "Tests network load balancing tradeoffs.",
        expectedAnswer: [
          "ALB routes Layer 7 HTTP/HTTPS traffic (supports paths, host headers, routing rules).",
          "NLB routes Layer 4 TCP/UDP traffic (ultra-low latency, handles millions of requests, maps static IPs).",
          "Choose NLB when static IP endpoints are required, or handling heavy non-HTTP network protocols."
        ]
      },
      {
        question: "How do you implement S3 bucket policies to securely restrict access to specific IP ranges or VPC endpoints?",
        why: "Tests cloud data security compliance.",
        expectedAnswer: [
          "Write a JSON bucket policy using `Deny` statements.",
          "Incorporate condition operators like `NotIpAddress` to block external sources.",
          "Use `StringNotEquals` condition matching `aws:sourceVpce` to restrict access strictly to VPC endpoints."
        ]
      },
      {
        question: "Explain AWS Lambda cold starts. How do you optimize execution environments and use provisioned concurrency?",
        why: "Tests serverless execution details.",
        expectedAnswer: [
          "Cold start occurs when a trigger launches a fresh container container instance (initialization delay).",
          "Optimize by minimizing package size, lazy loading dependencies, and using lighter runtimes (Python/Node).",
          "Use Provisioned Concurrency to keep a set of execution environments warm and ready."
        ]
      },
      {
        question: "What are CloudFormation parameters, outputs, and mappings? Explain drift detection.",
        why: "Tests cloud orchestration capabilities.",
        expectedAnswer: [
          "Parameters allow users to input dynamic values at deployment.",
          "Outputs return resource details (e.g. Load Balancer URL) to other stacks.",
          "Mappings are lookups (like region-to-AMI tables).",
          "Drift detection identifies manual modifications made outside the CloudFormation template."
        ]
      },
      {
        question: "Explain the strategies you would use to optimize AWS bills across compute and storage resources.",
        why: "Tests cloud financial optimization skills.",
        expectedAnswer: [
          "Identify and delete orphaned volumes, elastic IPs, and idle load balancers.",
          "Use AWS Compute Optimizer to right-size EC2 instance classes.",
          "Leverage S3 Intelligent-Tiering to automate lifecycle movements to glacier.",
          "Purchase Savings Plans or Reserved Instances for predictable workloads."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a highly available multi-account network architecture using Transit Gateway, VPC endpoints, and centralized egress.",
        why: "Tests enterprise cloud architect scale design.",
        expectedAnswer: [
          "Deploy an AWS Organizations structure with separate accounts (Production, Sandbox, Networking).",
          "Centralize egress traffic using NAT Gateways inside a shared Networking account.",
          "Attach VPCs to a central Transit Gateway with isolated route tables.",
          "Deploy interface VPC endpoints (PrivateLink) inside subnets, routing api calls internally."
        ]
      },
      {
        question: "Explain Service Control Policies (SCPs) in AWS Organizations. How do you implement permission guardrails at scale?",
        why: "Tests multi-account enterprise security controls.",
        expectedAnswer: [
          "SCPs are organizational policies restricting maximum permissions for member accounts (applies even to root).",
          "Do not grant permissions directly; rather, they act as filter guardrails.",
          "Write SCPs to deny root execution, restrict region choices, or block database deletions."
        ]
      },
      {
        question: "How do you handle complex CloudFormation rollbacks and resource deletion cycles in nested stacks?",
        why: "Tests advanced IaC lifecycle troubleshooting.",
        expectedAnswer: [
          "Nested stacks compile as a hierarchy; failure in one triggers parent rollbacks.",
          "Configure `DeletionPolicy: Retain` on critical databases to avoid data loss.",
          "Track stack resource states to identify blocked resources (e.g. SG holds VPC interface), manually clearing blocks to resume rollback."
        ]
      },
      {
        question: "Explain S3 Object Lock, replication, and KMS envelope encryption mechanisms.",
        why: "Tests compliance level cloud storage details.",
        expectedAnswer: [
          "S3 Object Lock enforces WORM (Write Once, Read Many), blocking object deletion or overrides.",
          "Replication (CRR) synchronizes objects to destination buckets across regions.",
          "KMS Envelope Encryption uses a Data Key generated by KMS to encrypt objects, encrypting the Data Key itself using a KMS Master Key."
        ]
      },
      {
        question: "Design an event-driven serverless architecture using EventBridge, SQS, SNS, and Lambda.",
        why: "Tests advanced serverless decoupled systems designs.",
        expectedAnswer: [
          "Events publish to Amazon EventBridge (event bus), matching rules to forward them.",
          "Queue events inside SQS to buffer and decouple Lambda processing bottlenecks.",
          "Fan out alerts to multiple subscribers using SNS.",
          "Configure DLQs (Dead Letter Queues) on Lambda/SQS to handle failing tasks."
        ]
      },
      {
        question: "Design a disaster recovery architecture with less than 5 minutes RTO and 1 minute RPO across regions.",
        why: "Tests mission-critical high availability design.",
        expectedAnswer: [
          "Deploy multi-region active-active architectures.",
          "Route traffic using Route 53 with health check failovers.",
          "Sync data dynamically using multi-region databases (DynamoDB Global Tables).",
          "Configure automated DNS switches to redirect users to healthy regions."
        ]
      },
      {
        question: "Discuss the mechanics of connection draining, session stickiness, and SSL termination at the load balancer layer.",
        why: "Tests load balancer traffic routing configurations.",
        expectedAnswer: [
          "Connection draining (deregistration delay) allows instances to finish processing in-flight requests before termination.",
          "Session stickiness binds client sessions to specific targets using cookies.",
          "SSL termination decrypts incoming HTTPS traffic at the load balancer, relieving backends from crypto overhead."
        ]
      },
      {
        question: "How do you design secure serverless functions accessing resources in private VPC subnets without exhausting IP allocations?",
        why: "Tests Lambda networking configurations.",
        expectedAnswer: [
          "Configure Lambda to run inside private subnets, attaching Elastic Network Interfaces (ENIs).",
          "AWS Hyperplane shares ENIs across executions, avoiding IP exhaustion.",
          "Configure route rules pointing outbound traffic to NAT Gateways to access public APIs."
        ]
      }
    ]
  },
  backend: {
    Easy: [
      {
        question: "List the standard HTTP status codes (200, 201, 400, 401, 403, 404, 500) and explain their meaning.",
        why: "Checks REST API response code definitions.",
        expectedAnswer: [
          "200 OK (success); 201 Created (resource created).",
          "400 Bad Request (syntax/validation fault); 401 Unauthorized (unauthenticated).",
          "403 Forbidden (access denied); 404 Not Found (missing resource).",
          "500 Internal Server Error (backend crash)."
        ]
      },
      {
        question: "What is middleware in Express.js? Write a simple logging middleware example.",
        why: "Checks Express pipeline handler basics.",
        expectedAnswer: [
          "Functions with access to req, res, and the next() callback.",
          "Can modify request parameters or terminate requests.",
          "Example: `(req, res, next) => { console.log(req.url); next(); }`"
        ]
      },
      {
        question: "Explain the difference between require (CommonJS) and import (ES6 modules) in Node.js.",
        why: "Checks Node module system baseline.",
        expectedAnswer: [
          "`require` is synchronous, dynamic, and evaluated at runtime.",
          "`import` is asynchronous, static, and resolved at compile time.",
          "ES6 modules (`import`) support tree shaking optimizations."
        ]
      },
      {
        question: "What is a document in MongoDB? How does it differ from a table row in SQL?",
        why: "Checks document storage basics.",
        expectedAnswer: [
          "MongoDB documents are JSON-like records (BSON) with dynamic schemas.",
          "SQL rows represent static entries in a structured schema with pre-defined tables."
        ]
      },
      {
        question: "Write a basic SQL query utilizing JOIN to fetch user data and user orders.",
        why: "Checks SQL query syntax.",
        expectedAnswer: [
          "`SELECT * FROM users JOIN orders ON users.id = orders.user_id`",
          "Uses foreign keys to link tables."
        ]
      },
      {
        question: "What is the difference between GET and POST requests?",
        why: "Checks baseline REST specifications.",
        expectedAnswer: [
          "GET retrieves data, keeping parameters in the URL query string (should be idempotent).",
          "POST sends data payload inside request bodies, creating/updating resources."
        ]
      },
      {
        question: "What is Redis, and what is it commonly used for?",
        why: "Checks caching baseline terminology.",
        expectedAnswer: [
          "In-memory key-value database.",
          "Commonly used for caching database queries, session storage, and rate limiting."
        ]
      },
      {
        question: "How do you extract route parameters in an Express.js handler?",
        why: "Checks Express route syntax.",
        expectedAnswer: [
          "Access via `req.params` (e.g. for `/users/:id`, get parameter using `req.params.id`)."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain the structure of a JSON Web Token. How does the server verify token signatures?",
        why: "Tests JWT authentication mechanics.",
        expectedAnswer: [
          "Consists of Header, Payload (claims), and Signature separated by dots.",
          "Header defines algorithm; Payload contains claims (user details).",
          "Server verifies by generating a hash using payload data and the local secret key, matching it against the signature."
        ]
      },
      {
        question: "How does error handling work in Express.js? What are the arguments required for an Express error-handling middleware?",
        why: "Tests Express pipeline error diagnostics.",
        expectedAnswer: [
          "Express routes errors automatically when `next(error)` is triggered.",
          "Error-handling middleware requires exactly 4 arguments: `(err, req, res, next)`.",
          "Must be registered at the very end of the routing stack."
        ]
      },
      {
        question: "How does the Node.js event-driven non-blocking I/O model work? Explain the Event Loop.",
        why: "Tests Node runtime execution knowledge.",
        expectedAnswer: [
          "Node runs single-threaded, offloading heavy I/O operations (file, network) to kernel/thread pools (libuv).",
          "The Event Loop schedules and executes callbacks when asynchronous tasks finish.",
          "Phases: timers, I/O callbacks, poll, check, close callbacks."
        ]
      },
      {
        question: "How do you write an aggregation pipeline in MongoDB to group and calculate average values?",
        why: "Tests MongoDB pipeline query skills.",
        expectedAnswer: [
          "Use the `db.collection.aggregate()` method passing stage blocks.",
          "Use the `$group` stage to define aggregation keys.",
          "Use accumulator operators (e.g. `average: { $avg: '$price' }`) to aggregate averages."
        ]
      },
      {
        question: "Compare indexes. How do indexes speed up database reads, and how do they impact write speeds?",
        why: "Tests database query optimization tradeoffs.",
        expectedAnswer: [
          "Indexes avoid collection scans by mapping data points sorted by index keys (B-Tree).",
          "Speeds up queries matching indexed filters/sorts.",
          "Slows down writes because the index tree must be updated on insert/update."
        ]
      },
      {
        question: "Explain the cache-aside caching pattern. How do you handle cache misses and updates?",
        why: "Tests application memory caching logic.",
        expectedAnswer: [
          "Read cache first. If a cache miss occurs, query the database, write data to cache, and return.",
          "Write/update database directly, then invalidate (delete) corresponding cache keys to maintain consistency."
        ]
      },
      {
        question: "How do you design RESTful routes for nested resources (e.g., comments belonging to specific posts)?",
        why: "Tests API routing design conventions.",
        expectedAnswer: [
          "Use structured paths: `/posts/:postId/comments` for list/create.",
          "Use `/posts/:postId/comments/:commentId` for update/delete."
        ]
      },
      {
        question: "What are database transactions? Explain ACID properties in the context of relational databases.",
        why: "Tests transactional consistency concepts.",
        expectedAnswer: [
          "Transactions group multiple queries into a single atomic work unit.",
          "ACID: Atomicity (all-or-nothing), Consistency (schema constraints), Isolation (no collision), Durability (persistent)."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a scalable notification system using message queues (e.g. RabbitMQ or Kafka) for asynchronous jobs.",
        why: "Tests distributed systems scalability configurations.",
        expectedAnswer: [
          "Stateless APIs publish notification events to a message broker (RabbitMQ/Kafka).",
          "Workers subscribe to queue topics in parallel, handling sending loops (email, push).",
          "Implement dead-letter queues (DLQ) for failed alerts and retry policies with exponential backoff."
        ]
      },
      {
        question: "Where should JWT access and refresh tokens be stored on the client side? Detail defenses against XSS and CSRF.",
        why: "Tests security architect level authorization controls.",
        expectedAnswer: [
          "Access tokens can be stored in-memory (JS variable) to protect against storage read loops.",
          "Refresh tokens should be stored in secure, HttpOnly, SameSite cookies to mitigate XSS access.",
          "Incorporate anti-CSRF headers or custom validation keys to defend cookie requests against CSRF."
        ]
      },
      {
        question: "Explain database sharding and horizontal scaling. How do you choose a sharding key?",
        why: "Tests data architect database scalability reasoning.",
        expectedAnswer: [
          "Sharding splits data horizontally across separate physical database nodes.",
          "A sharding key determines partition routing.",
          "Choose a high cardinality key (e.g., `tenant_id`, `user_id`) to ensure even distribution and prevent hotspots."
        ]
      },
      {
        question: "Describe Redis caching invalidation strategies. How do you resolve cache stampede (thundering herd) issues?",
        why: "Tests advanced caching failure diagnostics.",
        expectedAnswer: [
          "Invalidation: Time-To-Live (TTL) expiration, active deletion on updates, or LRU eviction.",
          "Cache stampede: multiple concurrent requests query database on cache miss, overloading the database.",
          "Resolve using distributed locks (Redlock) or background re-computation threads before keys expire."
        ]
      },
      {
        question: "How do you handle database race conditions and write locks using pessimistic versus optimistic locking?",
        why: "Tests concurrency controls under high transaction volumes.",
        expectedAnswer: [
          "Pessimistic locking blocks database records during reads (e.g., `SELECT FOR UPDATE`), preventing concurrent reads/writes.",
          "Optimistic locking tracks versions using attributes (e.g., `version`), failing updates if the version has changed.",
          "Pessimistic is preferred for high collision; optimistic for low collision environments."
        ]
      },
      {
        question: "Design a rate-limiting middleware for Express.js using a sliding window counter algorithm stored in Redis.",
        why: "Tests API gateway traffic shaping designs.",
        expectedAnswer: [
          "Use Redis sorted sets (`ZSET`) keyed by user IP.",
          "Add entries with active timestamps on request arrivals.",
          "Remove records older than window boundaries (`ZREMRANGEBYSCORE`).",
          "Count records (`ZCARD`) to block requests exceeding thresholds, returning HTTP 429."
        ]
      },
      {
        question: "Explain the memory architecture of Node.js. How do you diagnose and fix memory leaks using heap dumps?",
        why: "Tests Node server optimization and diagnostics.",
        expectedAnswer: [
          "Node divides memory into Stack (primitives) and Heap (objects, buffers).",
          "Diagnostics: Generate heap dumps using the `v8` module or `node-inspector`.",
          "Analyze dumps in Chrome DevTools to locate uncollected closures, global references, and active event listeners."
        ]
      },
      {
        question: "Analyze the design tradeoffs between REST and GraphQL. When should you choose one over the other?",
        why: "Tests backend API architecture design.",
        expectedAnswer: [
          "REST: simple to cache, standardized, but prone to over-fetching.",
          "GraphQL: client-controlled queries, single endpoints, but complex to cache and carries query parser overhead.",
          "Choose GraphQL for highly dynamic frontend interfaces; choose REST for resource-oriented, cached systems."
        ]
      }
    ]
  },
  frontend: {
    Easy: [
      {
        question: "What is the difference between props and state in React?",
        why: "Checks React data management baseline.",
        expectedAnswer: [
          "Props are read-only properties passed down from parent components.",
          "State represents mutable, local data managed internally by the component.",
          "Updating state triggers component re-renders."
        ]
      },
      {
        question: "Explain the CSS Box Model and how box-sizing: border-box changes layout behavior.",
        why: "Checks baseline CSS layouts.",
        expectedAnswer: [
          "Consists of Content, Padding, Border, and Margin.",
          "`border-box` includes padding and borders in the calculated width/height.",
          "Prevents layouts from expanding unexpectedly when adding padding."
        ]
      },
      {
        question: "What are the rules of React Hooks? How does the useState hook work?",
        why: "Checks React hook syntax basics.",
        expectedAnswer: [
          "Hooks must only be called at the top level of React functions (not inside loops or conditions).",
          "Hooks must only be called from React Function Components.",
          "`useState` returns a state variable and a setter function to trigger re-renders."
        ]
      },
      {
        question: "What is the Virtual DOM in React at a high level?",
        why: "Checks React reconciliation baseline.",
        expectedAnswer: [
          "Lightweight, in-memory representation of real DOM nodes.",
          "React updates virtual trees first, compares changes (diffing), and batches updates to the real DOM."
        ]
      },
      {
        question: "List three simple techniques to speed up page load times on a website.",
        why: "Checks baseline web performance concepts.",
        expectedAnswer: [
          "Compress and optimize images (WebP format).",
          "Minify and bundle JS and CSS files.",
          "Use lazy loading for off-screen media."
        ]
      },
      {
        question: "What is the difference between CSS flexbox and CSS grid?",
        why: "Checks baseline CSS layout types.",
        expectedAnswer: [
          "Flexbox is designed for one-dimensional layouts (rows OR columns).",
          "Grid is designed for two-dimensional layouts (rows AND columns)."
        ]
      },
      {
        question: "What is the purpose of the key prop when rendering lists of elements in React?",
        why: "Checks React rendering loop baseline.",
        expectedAnswer: [
          "Helps React track item identities across renders.",
          "Prevents complete DOM destruction and recreation, improving list update performance."
        ]
      },
      {
        question: "What is the purpose of the dependency array in the useEffect hook?",
        why: "Checks React lifecycle baseline.",
        expectedAnswer: [
          "Controls when the effect executes.",
          "If empty `[]`, runs once on mount. If contains variables, re-runs when those values change."
        ]
      }
    ],
    Medium: [
      {
        question: "Create a custom hook useLocalStorage to synchronize state with local storage.",
        why: "Tests React custom hook engineering capabilities.",
        expectedAnswer: [
          "Declare state initialized from `localStorage.getItem(key)`.",
          "Return state and a setter function.",
          "Wrap updates inside `useEffect` calling `localStorage.setItem(key, JSON.stringify(value))`."
        ]
      },
      {
        question: "Explain the reconciliation algorithm in React. What are Fiber nodes and how do they represent the render tree?",
        why: "Tests deep React execution internals.",
        expectedAnswer: [
          "Fiber introduces incremental rendering, splitting work into chunks.",
          "Fiber nodes represent units of work, forming a linked list tree.",
          "Enables pausing, resuming, and prioritizing UI renders (e.g. user input over loading spinners)."
        ]
      },
      {
        question: "Compare Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG).",
        why: "Tests web loading architecture tradeoffs.",
        expectedAnswer: [
          "SSR: HTML is rendered on the server on each request (better SEO, slower TTFB).",
          "CSR: blank HTML is sent, JS renders pages in browser (faster transitions, slower initial load).",
          "SSG: HTML is rendered once at build time (fastest load, but unsuitable for dynamic data)."
        ]
      },
      {
        question: "Explain when and why you would use useMemo and useCallback to optimize React components.",
        why: "Tests frontend execution tuning capabilities.",
        expectedAnswer: [
          "`useMemo` caches calculation outputs; `useCallback` caches function references.",
          "Use when passing functions/arrays to children optimized with `React.memo`.",
          "Avoid premature optimizations as cache tracking itself carries memory overhead."
        ]
      },
      {
        question: "Explain the differences between utility-first CSS frameworks (like Tailwind) and styled-components (CSS-in-JS).",
        why: "Tests UI design architecture tradeoffs.",
        expectedAnswer: [
          "Tailwind uses pre-defined class tokens, keeping bundles small and layouts consistent.",
          "styled-components writes CSS inside JS files, dynamic styles based on component props, but carries bundle and parsing runtime overhead."
        ]
      },
      {
        question: "What are controlled vs uncontrolled inputs in React forms?",
        why: "Tests React input state sync configurations.",
        expectedAnswer: [
          "Controlled: inputs have values bound to React state.",
          "Uncontrolled: inputs rely on DOM nodes accessed via refs.",
          "Controlled is preferred for dynamic validation and formatting."
        ]
      },
      {
        question: "What is hydration in SSR, and what causes hydration mismatch errors?",
        why: "Tests SSR integration troubleshooting capabilities.",
        expectedAnswer: [
          "Hydration is the process of attaching event listeners to server-rendered HTML in the browser.",
          "Mismatch occurs if client render tree differs from server HTML (e.g., date formats, browser extensions)."
        ]
      },
      {
        question: "Explain how layout thrashing occurs in browser rendering and how to prevent it.",
        why: "Tests browser rendering engine details.",
        expectedAnswer: [
          "Occurs when JS writes to the DOM, then reads layout properties (like `offsetHeight`) in quick succession, forcing reflow loops.",
          "Prevent by batching DOM reads and writes using requestAnimationFrame."
        ]
      }
    ],
    Hard: [
      {
        question: "How do you architect global state management in React? Discuss Context optimization versus Redux/Zustand.",
        why: "Tests frontend state management scaling layouts.",
        expectedAnswer: [
          "Context causes global re-render cascades because consumers update on any context value change.",
          "Optimize Context by separating state and dispatch, or using selector hooks.",
          "Redux/Zustand use selectors to trigger re-renders only when matched state slices change, scaling better."
        ]
      },
      {
        question: "Explain React Server Components (RSC) and how they differ from standard SSR.",
        why: "Tests modern React application architecture.",
        expectedAnswer: [
          "RSC executes and renders components strictly on the server, sending serialized virtual DOM to the client.",
          "Reduces client bundle sizes since dependencies are not shipped to client.",
          "Differs from SSR because RSC state is preserved on client navigations without re-hydration."
        ]
      },
      {
        question: "Design a micro-frontend architecture using Webpack Module Federation. How do you handle global state?",
        why: "Tests enterprise level frontend architecture.",
        expectedAnswer: [
          "Configure host (container) and remote bundles inside webpack federation options.",
          "Dynamic import remotes at runtime.",
          "Share state using custom events, window globals, or sharing state providers via shared modules config."
        ]
      },
      {
        question: "How do you optimize web applications for Core Web Vitals (CLS, INP, LCP)? Detail strategies for improving INP.",
        why: "Tests production optimization capabilities.",
        expectedAnswer: [
          "LCP: defer non-critical JS, preconnect, use CDN caching.",
          "CLS: set explicit sizes on images, prevent dynamic shifts.",
          "INP (Interaction to Next Paint): yield long JS tasks using scheduler API (`scheduler.yield`), avoiding main thread blockages during interactions."
        ]
      },
      {
        question: "Explain the difference between CSS animations and JS animations. How do you ensure animations run at 60 FPS?",
        why: "Tests performance layout animation scaling.",
        expectedAnswer: [
          "CSS animations run on compositor threads, avoiding main thread layout cycles.",
          "JS animations (e.g. Framer Motion) run on main thread, but requestAnimationFrame optimizes cycles.",
          "Ensure 60 FPS by only animating `transform` and `opacity` properties, offloading calculations to the GPU."
        ]
      },
      {
        question: "Explain how the React 18 concurrent renderer handles state update priorities using transitions (startTransition).",
        why: "Tests concurrent React rendering engines.",
        expectedAnswer: [
          "React 18 categories updates: urgent (typing) vs non-urgent (search lists).",
          "Wrap non-urgent updates inside `startTransition`.",
          "Allows React to yield rendering work back to browser for user inputs, avoiding screen freezes."
        ]
      },
      {
        question: "Design a bundle optimization pipeline. Discuss tree shaking, dynamic imports, and route-based code splitting.",
        why: "Tests bundle compilation configurations.",
        expectedAnswer: [
          "Configure bundlers to use ES modules to support static tree shaking.",
          "Split routes using `React.lazy` and `Suspense` loaders.",
          "Optimize chunk boundaries using bundler output settings (e.g. rollupOptions)."
        ]
      },
      {
        question: "How do you implement optimistic UI updates in frontend state to make network latency imperceptible?",
        why: "Tests client state UX synchronization.",
        expectedAnswer: [
          "On trigger, update state locally assuming request succeeds.",
          "Save previous state as rollback backup.",
          "If the API request fails, revert state to backup and display error toast."
        ]
      }
    ]
  },
  general: {
    Easy: [
      {
        question: "What is the DRY (Don't Repeat Yourself) principle and why is it important?",
        why: "Tests foundational software engineering conventions.",
        expectedAnswer: [
          "Enforces reducing code duplication.",
          "Ensures bugs are fixed in a single location, rendering code maintenance easy."
        ]
      },
      {
        question: "Explain the importance of Unit Testing in software development.",
        why: "Checks quality assurance fundamentals.",
        expectedAnswer: [
          "Validates functions behave as expected under isolated parameters.",
          "Catches regressions when refactoring codebases.",
          "Serves as documentation of code intentions."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain the Model-View-Controller (MVC) architecture.",
        why: "Tests baseline architecture structural design patterns.",
        expectedAnswer: [
          "Model manages raw database state and operations.",
          "View handles layout visualization.",
          "Controller maps requests, updates model state, and renders the view."
        ]
      },
      {
        question: "What is Dependency Injection (DI) and how does it improve code testability?",
        why: "Checks dependency decoupling patterns.",
        expectedAnswer: [
          "Classes receive dependency requirements externally rather than instantiating them directly.",
          "Enables developers to mock dependencies easily during unit testing."
        ]
      }
    ],
    Hard: [
      {
        question: "Explain the SOLID design principles. Walk through each letter.",
        why: "Tests OOP design principles and architectural patterns.",
        expectedAnswer: [
          "Single Responsibility (one reason to change).",
          "Open-Closed (open for extension, closed for modification).",
          "Liskov Substitution (subtypes must replace base classes).",
          "Interface Segregation (keep interfaces small and target-specific).",
          "Dependency Inversion (depend on abstractions, not concretions)."
        ]
      },
      {
        question: "Compare Monolithic and Microservices architectures. What are the engineering tradeoffs?",
        why: "Tests systems design tradeoffs.",
        expectedAnswer: [
          "Monolithic: fast build, simple deploy, low latency, but hard to scale separate modules.",
          "Microservices: independent deployments, isolated scaling, but introduces network latency and distributed transaction tracing complexity."
        ]
      }
    ]
  },
  cybersecurity: {
    Easy: [
      {
        question: "What is the difference between encryption and hashing?",
        why: "Tests fundamental data protection taxonomy.",
        expectedAnswer: [
          "Hashing is a one-way cryptographic function mapping data to a fixed-length signature.",
          "Encryption is a two-way function allowing recovery of original data via a decryption key.",
          "Hashing is used for integrity check (e.g. password storage); encryption for confidentiality."
        ]
      },
      {
        question: "Explain the concept of Multi-Factor Authentication (MFA).",
        why: "Checks security access controls knowledge.",
        expectedAnswer: [
          "Combines multiple independent credentials for verification.",
          "Categories: Something you know (password), something you have (token), and something you are (biometrics).",
          "Significantly increases access security beyond simple credentials."
        ]
      },
      {
        question: "What is phishing, and how can an organization protect itself against it?",
        why: "Checks threat vector awareness.",
        expectedAnswer: [
          "Social engineering attack where malicious actors impersonate legitimate entities via email/communication.",
          "Aims to trick users into sharing passwords, keys, or executing malware.",
          "Mitigation: User training, email filtering, and enforcing multi-factor authentication (MFA)."
        ]
      },
      {
        question: "Explain the purpose of a Firewall in network security.",
        why: "Checks network traffic isolation fundamentals.",
        expectedAnswer: [
          "Monitors and controls incoming/outgoing network traffic based on predefined security rules.",
          "Acts as a barrier between a trusted secure internal network and untrusted external networks.",
          "Can filter packets, inspect connections statefully, or work at the application layer."
        ]
      },
      {
        question: "What is the difference between a vulnerability and a threat?",
        why: "Checks basic risk management taxonomy.",
        expectedAnswer: [
          "A vulnerability is an inherent weakness in a system or software structure.",
          "A threat is any potential event or actor that can exploit a vulnerability to cause harm.",
          "Security risk is calculated as the intersection of vulnerabilities, threats, and asset value."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain SQL Injection (SQLi) and how to mitigate it.",
        why: "Tests application security vulnerabilities and secure coding.",
        expectedAnswer: [
          "Vulnerability where untrusted input is concatenated directly into SQL queries.",
          "Allows attackers to manipulate backend database queries, bypass auth, or modify/steal data.",
          "Mitigate using parameterized queries, prepared statements, and ORMs."
        ]
      },
      {
        question: "Describe the OWASP Top 10. Choose one risk and explain its mitigation in detail.",
        why: "Checks familiarity with web application security standard awareness.",
        expectedAnswer: [
          "Standard awareness document representing the most critical security risks for web applications.",
          "Example: Broken Access Control (users accessing resources outside their permissions).",
          "Mitigation: Enforce least privilege, deny access by default, and log access failures."
        ]
      },
      {
        question: "Explain Cross-Site Scripting (XSS) and differentiate between Stored, Reflected, and DOM-based XSS.",
        why: "Tests script injection vulnerability taxonomy.",
        expectedAnswer: [
          "Stored: malicious script is saved on server database and rendered on user screens.",
          "Reflected: script is reflected off the web server response (e.g. inside URL query parameters).",
          "DOM-based: vulnerability exists entirely in client-side script updating the page dynamic elements.",
          "Mitigate via context-aware output encoding, input sanitization, and Content Security Policy (CSP)."
        ]
      },
      {
        question: "What is a Man-in-the-Middle (MitM) attack, and how does HTTPS prevent it?",
        why: "Checks secure network transport protocols.",
        expectedAnswer: [
          "Attack where communication between two parties is secretly intercepted and possibly altered.",
          "HTTPS uses TLS/SSL protocols to encrypt the transport channel.",
          "Verifies server identities using certificates signed by trusted Certificate Authorities (CAs)."
        ]
      },
      {
        question: "How does a symmetric key cipher differ from an asymmetric key cipher? Give examples of each.",
        why: "Tests cryptography baseline controls.",
        expectedAnswer: [
          "Symmetric uses the same secret key for both encryption and decryption (e.g., AES, DES).",
          "Asymmetric uses a mathematically linked key pair: Public key for encrypting, Private key for decrypting (e.g., RSA, ECC).",
          "Symmetric is computationally faster; asymmetric solves secure key exchange problems."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a secure architecture to protect REST APIs against DDoS, credential stuffing, and data scraping.",
        why: "Tests security architecture design capability.",
        expectedAnswer: [
          "Deploy a Web Application Firewall (WAF) to block malicious request patterns and bot traffic.",
          "Implement rate-limiting (sliding window in Redis) and API rate gates.",
          "Enforce OAuth 2.0 / JWT authorization controls with short token expirations.",
          "Use IP reputation databases and challenge mechanisms (CAPTCHA) on auth endpoints."
        ]
      },
      {
        question: "How would you conduct a security audit on a microservices-based application cluster deployed in Kubernetes?",
        why: "Tests container network security configurations.",
        expectedAnswer: [
          "Audit Kubernetes RBAC configurations to ensure least privilege access controls.",
          "Enforce Network Policies to restrict pod-to-pod communication paths.",
          "Scan container images for vulnerability CVEs during build pipelines.",
          "Use secret managers (HashiCorp Vault) rather than base64 environment files."
        ]
      },
      {
        question: "Detail the differences between OAuth 2.0 authorization code grant flow with PKCE vs implicit grant flow.",
        why: "Tests advanced web authentication design safety.",
        expectedAnswer: [
          "Implicit grant sends tokens directly in redirect URLs, exposing them in browser histories (deprecated).",
          "PKCE (Proof Key for Code Exchange) uses dynamic verifier and challenge values to secure code exchanges.",
          "Protects public clients from authorization code interception attacks on callback URIs."
        ]
      },
      {
        question: "Explain how to mitigate XML External Entity (XXE) vulnerabilities in parser configurations.",
        why: "Tests secure parser configurations and injection mitigations.",
        expectedAnswer: [
          "XXE occurs when XML inputs parse external entity references resolving system files or local endpoints.",
          "Mitigation: Configure the XML parser parser options to disable External DTDs completely.",
          "Enforce disabling Entity Resolution and external schema files."
        ]
      },
      {
        question: "How does a zero-day exploit differ from a known vulnerability, and how do you implement defense-in-depth to mitigate zero-day risks?",
        why: "Tests advanced security engineering and threat mitigation.",
        expectedAnswer: [
          "Zero-day represents an unpatched, publicly unknown vulnerability with no signature checks.",
          "Mitigate via defense-in-depth: network segmentation, sandboxing, and runtime application self-protection (RASP).",
          "Establish anomaly-based behavior detection systems rather than simple static signature matching."
        ]
      }
    ]
  },
  blockchain: {
    Easy: [
      {
        question: "What is a blockchain, and what makes it immutable?",
        why: "Tests foundational distributed ledger concepts.",
        expectedAnswer: [
          "A decentralized, distributed digital ledger recording transactions across networks.",
          "Immutable because blocks are cryptographically linked using SHA-256 hashes.",
          "Changing a block requires recalculating hashes of all subsequent blocks, which is computationally infeasible."
        ]
      },
      {
        question: "Explain the difference between a public blockchain and a private blockchain.",
        why: "Checks blockchain architecture types.",
        expectedAnswer: [
          "Public: permissionless, open for anyone to write/verify transactions (e.g. Bitcoin, Ethereum).",
          "Private: permissioned, network access and validator rights controlled by single organization."
        ]
      },
      {
        question: "What is a cryptocurrency wallet, and what is the difference between a public key and a private key?",
        why: "Checks asymmetric cryptography understanding in Web3.",
        expectedAnswer: [
          "Wallet manages cryptographic key pairs (keys write transactions).",
          "Public key acts as address to receive funds.",
          "Private key signs outgoing transactions to authorize spends (must be kept secret)."
        ]
      },
      {
        question: "What is a smart contract at a high level?",
        why: "Checks entry-level smart contract taxonomy.",
        expectedAnswer: [
          "Self-executing code stored directly on the blockchain.",
          "Automatically executes actions when pre-defined conditions are met.",
          "Enables trustless transaction setups without intermediaries."
        ]
      },
      {
        question: "Explain what 'gas' represents in Ethereum transactions.",
        why: "Checks transaction execution mechanics.",
        expectedAnswer: [
          "Unit measuring the computational effort required to execute operations on Ethereum.",
          "Users pay gas fees to compensate validators for the CPU resources needed.",
          "Prevents infinite loop resource abuse attacks."
        ]
      }
    ],
    Medium: [
      {
        question: "Compare Proof of Work (PoW) and Proof of Stake (PoS) consensus mechanisms.",
        why: "Tests consensus protocol understanding.",
        expectedAnswer: [
          "PoW: validators solve complex mathematical puzzles requiring raw computing power (high energy cost).",
          "PoS: validators stake native currency to obtain probability of proposing next block (energy efficient).",
          "PoS introduces staking incentives and slashing penalties for malicious behavior."
        ]
      },
      {
        question: "What is a reentrancy attack in Solidity smart contracts, and how do you prevent it?",
        why: "Tests Solidity secure coding patterns.",
        expectedAnswer: [
          "Occurs when a contract calls external untrusted contracts before updating its internal balance state.",
          "The target re-enters the withdrawal function recursively, draining funds.",
          "Prevent using Checks-Effects-Interactions pattern or ReentrancyGuard adapters."
        ]
      },
      {
        question: "Explain ERC-20 and ERC-721 token standards.",
        why: "Tests Web3 token taxonomy.",
        expectedAnswer: [
          "ERC-20 standard defines interface for fungible (interchangeable) tokens.",
          "ERC-721 defines standard for non-fungible tokens (NFTs), where each token ID is unique."
        ]
      },
      {
        question: "What is a decentralized oracle (e.g. Chainlink), and why are oracles necessary for smart contracts?",
        why: "Tests external data validation integrations.",
        expectedAnswer: [
          "Oracles feed real-world, off-chain data (e.g. price feeds) into on-chain smart contracts.",
          "Necessary because blockchains are isolated networks and cannot query APIs directly.",
          "Decentralized oracles prevent single points of failure in data inputs."
        ]
      },
      {
        question: "What is the purpose of EVM (Ethereum Virtual Machine) and how does it execute bytecodes?",
        why: "Checks VM execution details.",
        expectedAnswer: [
          "EVM is a sandboxed, stack-based runtime executing transaction instructions on Ethereum.",
          "Compiles high-level Solidity to bytecodes (Opcodes like ADD, PUSH, SSTORE).",
          "Maintains state consistency across all node replicas globally."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a secure Solidity contract that handles deposit and withdrawal of funds, detailing defenses against integer overflow, reentrancy, and front-running.",
        why: "Tests advanced Web3 smart contract security design.",
        expectedAnswer: [
          "Use Solidity compiler versions >=0.8.0 to prevent standard math overflows.",
          "Incorporate Checks-Effects-Interactions layout or inherit from OpenZeppelin's ReentrancyGuard.",
          "Implement transaction gas limits and commit-reveal schemes to mitigate front-running attacks."
        ]
      },
      {
        question: "What are Zero-Knowledge Proofs (ZKPs), and how do zk-Rollups scale Ethereum L2 networks?",
        why: "Tests advanced blockchain scalability cryptographics.",
        expectedAnswer: [
          "ZKPs prove a computation is correct without revealing the private inputs.",
          "zk-Rollups execute transactions off-chain, bundling them into batches.",
          "A succinct proof (SNARK/STARK) is submitted on-chain for instant validation, saving gas."
        ]
      },
      {
        question: "Explain the differences between optimistic rollups and zk-rollups, specifically discussing challenge periods and transaction finality.",
        why: "Tests L2 scaling tradeoff analysis.",
        expectedAnswer: [
          "Optimistic assumes transactions are valid unless challenged; requires a 7-day dispute window (slower exit).",
          "ZK-rollups use mathematical proofs to verify batch validity instantly (instant finality).",
          "ZK is complex mathematically but scales better; Optimistic is simpler to compile EVM code."
        ]
      },
      {
        question: "How do flash loan attacks exploit decentralized finance (DeFi) protocols, and how do you mitigate them?",
        why: "Tests advanced security risk diagnostics on blockchain networks.",
        expectedAnswer: [
          "Flash loans borrow massive uncollateralized funds to return within the same block transaction.",
          "Attackers use funds to manipulate spot price feeds on low-liquidity AMM pools, draining assets.",
          "Mitigate using decentralized, multi-source TWAP oracles (Chainlink) rather than single spot pools."
        ]
      },
      {
        question: "Describe the consensus mechanism used in Tendermint or PBFT. How does it handle validator Byzantine failures?",
        why: "Tests core distributed systems and consensus engine theory.",
        expectedAnswer: [
          "Uses rounds of proposals, pre-votes, and pre-commits to decide blocks.",
          "Requires a 2/3 supermajority of active validators to commit transactions.",
          "Guarantees security and consensus safety as long as malicious nodes are < 1/3."
        ]
      }
    ]
  },
  flutter: {
    Easy: [
      {
        question: "What is Flutter, and how does it differ from React Native?",
        why: "Checks mobile development frameworks baseline.",
        expectedAnswer: [
          "Flutter is Google's UI toolkit that compiles directly to native canvas.",
          "React Native bridges JS files to translate UI into native OS widgets.",
          "Flutter avoids bridges, rendering layout animations faster."
        ]
      },
      {
        question: "What is the difference between a StatefulWidget and a StatelessWidget in Flutter?",
        why: "Checks core Flutter widget state concepts.",
        expectedAnswer: [
          "Stateless: configuration properties cannot change once rendered.",
          "Stateful: holds mutable state class surviving updates, triggered via `setState`."
        ]
      },
      {
        question: "What is the pubspec.yaml file used for in a Flutter project?",
        why: "Checks basic dependency configurations.",
        expectedAnswer: [
          "Declares third-party dependencies, assets, font directories, and packaging versions.",
          "Configures asset mappings to build bundle paths."
        ]
      },
      {
        question: "Explain the purpose of the main() function and runApp() in Flutter.",
        why: "Checks mobile compilation entrypoints.",
        expectedAnswer: [
          "`main()` is the standard Dart execution entrypoint.",
          "`runApp()` takes a widget, mounting it as the root of the rendering tree."
        ]
      },
      {
        question: "What is the difference between hot reload and hot restart?",
        why: "Checks development environment configurations.",
        expectedAnswer: [
          "Hot reload pushes updated code directly into Dart VM, keeping active state.",
          "Hot restart compiles code changes, resets the app state, and re-initializes."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain state management options in Flutter (e.g. Provider, Bloc, Riverpod). When would you choose one over another?",
        why: "Tests application state architecture skills.",
        expectedAnswer: [
          "Provider: simple setup utilizing InheritedWidget for context-based rebuilds.",
          "Bloc (Business Logic Component): uses streams to isolate UI from data flow patterns.",
          "Riverpod: compile-safe, does not rely on context lookups, easing unit testing.",
          "Choose Provider/Riverpod for small projects; choose Bloc for enterprise structures."
        ]
      },
      {
        question: "What is an InheritedWidget, and how does it propagate data down the widget tree?",
        why: "Tests widget inheritance internals.",
        expectedAnswer: [
          "Base class widget allowing descendants to request shared data.",
          "Registered in the framework, triggering updates to matching context elements on changes."
        ]
      },
      {
        question: "How does Flutter build layouts? Explain the constraint propagation rule ('Constraints go down. Sizes go up. Parent sets position.').",
        why: "Tests layout engine internals.",
        expectedAnswer: [
          "Parent widget hands down min/max constraints (width/height boundaries).",
          "Child calculates its size matching those constraints and passes it back up.",
          "Parent positions child inside its layout coordinates."
        ]
      },
      {
        question: "How do you handle asynchronous network calls in Flutter using Futures and Streams?",
        why: "Tests async Dart APIs.",
        expectedAnswer: [
          "Future: represents a single async return value (use FutureBuilder to render).",
          "Stream: represents sequence of async returns (use StreamBuilder to listen)."
        ]
      },
      {
        question: "What is Dart's event loop model, and how does it handle microtasks versus event queues?",
        why: "Tests Dart execution runtime internals.",
        expectedAnswer: [
          "Single-threaded Dart loop executing async events.",
          "Microtask queue holds high-priority tasks, run sequentially before standard event queue (which handles I/O, timers, and clicks)."
        ]
      }
    ],
    Hard: [
      {
        question: "How does Flutter's rendering pipeline work? Detail the roles of the Widget, Element, and RenderObject trees.",
        why: "Tests deep Flutter compiler and rendering engine internals.",
        expectedAnswer: [
          "Widget tree: lightweight configurations regenerated on build changes.",
          "Element tree: holds logic and acts as structural manager linking widgets to RenderObjects.",
          "RenderObject tree: handles calculations, coordinates layouts, and paints components."
        ]
      },
      {
        question: "How do you optimize Flutter performance under heavy lists or complex animations? Discuss RepaintBoundary and const constructors.",
        why: "Tests performance tuning and canvas rendering optimizations.",
        expectedAnswer: [
          "Use `ListView.builder` to dynamically instantiate visible elements.",
          "Incorporate `RepaintBoundary` wrappers to isolate complex animations into private paint layers.",
          "Apply `const` constructors on widgets to reuse compiler instances, bypassing redundant builds."
        ]
      },
      {
        question: "How does Dart's garbage collector work, and how does it optimize memory management for short-lived widgets?",
        why: "Tests Dart VM garbage collection internals.",
        expectedAnswer: [
          "Generational memory manager optimized for rapid allocations.",
          "Scavenger (young generation) handles short-lived objects (widgets) using copy-collection.",
          "Mark-sweep-compact (old generation) collects persistent state records safely."
        ]
      },
      {
        question: "Explain how to integrate native platform code in Flutter using Platform Channels (MethodChannel and EventChannel).",
        why: "Tests mobile hardware bridge and integration skills.",
        expectedAnswer: [
          "MethodChannel: sends request-response method calls asynchronously between Dart and Swift/Kotlin.",
          "EventChannel: creates event streams to broadcast continuous platform data (e.g. sensors).",
          "Enforce type matching rules across standard platform channels."
        ]
      },
      {
        question: "Design an offline-first mobile synchronization architecture in Flutter using SQLite/Hive and local encryption.",
        why: "Tests enterprise mobile systems design capabilities.",
        expectedAnswer: [
          "Store records locally using Hive/SQLite encrypted with keys stored in Keychain/KeyStore.",
          "Establish a sync queue interceptor tracking local mutations.",
          "Use network monitors to sync local changes to cloud endpoints on reconnects."
        ]
      }
    ]
  },
  android: {
    Easy: [
      {
        question: "What is Android Jetpack, and what is its purpose?",
        why: "Checks Android baseline developer libraries.",
        expectedAnswer: [
          "Collection of Android component libraries and architecture advice.",
          "Helps developers write clean code following Google recommendations.",
          "Ensures compatibility across diverse Android OS versions."
        ]
      },
      {
        question: "Explain the Android Activity Lifecycle and its core callback methods.",
        why: "Checks basic UI lifecycle flow.",
        expectedAnswer: [
          "States managed via: onCreate, onStart, onResume, onPause, onStop, onDestroy.",
          "Resume/Pause define visible interaction states; Destroy releases CPU resources."
        ]
      },
      {
        question: "What is an Intent in Android, and what is the difference between explicit and implicit intents?",
        why: "Checks application navigation routing basics.",
        expectedAnswer: [
          "Messaging object to request action from other app components.",
          "Explicit defines target component classes exactly.",
          "Implicit declares generic actions (e.g. open web link) letting OS select matching handlers."
        ]
      },
      {
        question: "What is the purpose of the AndroidManifest.xml file?",
        why: "Checks essential project structure knowledge.",
        expectedAnswer: [
          "Declares application components (activities, services, receivers).",
          "Requests OS permissions, listing hardware configurations needed."
        ]
      },
      {
        question: "What is the difference between a Fragment and an Activity?",
        why: "Checks UI modularity basics.",
        expectedAnswer: [
          "Activity represents a single screen with full system lifecycle.",
          "Fragment represents a modular UI portion hosted within an Activity."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain Android Jetpack Compose. How does declarative UI differ from XML layouts?",
        why: "Tests modern Android UI development setups.",
        expectedAnswer: [
          "Declarative Kotlin functions compile layout states directly, removing XML templates.",
          "Layout adjusts dynamically to state inputs, avoiding manual DOM-style adjustments."
        ]
      },
      {
        question: "What is ViewModel, and how does it survive configuration changes like screen rotations?",
        why: "Tests Android state persistence.",
        expectedAnswer: [
          "ViewModel holds UI-related state data in lifecycle-aware objects.",
          "Survives screen rotations because it is bound to the ViewModelStore, preserved across configurations."
        ]
      },
      {
        question: "How do you perform background operations in modern Android? Compare WorkManager, Coroutines, and Services.",
        why: "Tests background thread capabilities.",
        expectedAnswer: [
          "Coroutines: handles transient asynchronous actions within current execution scopes.",
          "WorkManager: schedules guaranteed, deferrable background actions surviving app restarts.",
          "Services: runs active processes running in background (foreground service with notifications)."
        ]
      },
      {
        question: "Explain Android's permissions model. How do runtime permissions differ from manifest permissions?",
        why: "Tests application security layouts.",
        expectedAnswer: [
          "Manifest permissions are listed inside Manifest (install-time checks).",
          "Dangerous permissions (location, camera) must be explicitly requested at runtime."
        ]
      },
      {
        question: "What is the difference between LiveData and StateFlow/SharedFlow in Kotlin/Android development?",
        why: "Tests asynchronous reactive flows in Android.",
        expectedAnswer: [
          "LiveData is bound to Android lifecycles, emitting values only to active view elements.",
          "StateFlow is a coroutine state holder emitting hot data streams, requiring active collection loops."
        ]
      }
    ],
    Hard: [
      {
        question: "Design an offline-first Android architecture utilizing MVVM, Room Database, Retrofit, and Repository pattern with Flow.",
        why: "Tests advanced Android architecture and caching setups.",
        expectedAnswer: [
          "Use Repository as single source of truth, reading data from Retrofit API.",
          "Store response caches inside local Room database.",
          "Expose Room queries as dynamic Kotlin Flow elements observed inside ViewModel."
        ]
      },
      {
        question: "Explain how memory leaks occur in Android. How do you identify leaks using LeakCanary, and how do you prevent them?",
        why: "Tests memory leaks diagnosis capability.",
        expectedAnswer: [
          "Leaks occur when short-lived context references are retained by static objects or background tasks.",
          "Use LeakCanary to inspect reference trees of uncollected activities.",
          "Prevent by avoiding static context variables, clearing binding refs in onDestroy."
        ]
      },
      {
        question: "Explain the internal workings of Android's Looper, Handler, and MessageQueue.",
        why: "Tests deep thread coordination theory.",
        expectedAnswer: [
          "MessageQueue holds incoming application commands.",
          "Looper runs infinite thread loop executing commands from the queue.",
          "Handler schedules and processes messages on the Looper's thread."
        ]
      },
      {
        question: "How do you optimize Jetpack Compose performance? Detail the concept of Recomposition and how the @Stable and remember annotations prevent unnecessary renders.",
        why: "Tests UI performance tuning.",
        expectedAnswer: [
          "Recomposition re-executes UI functions on state updates.",
          "Use `remember` to cache values across recomposition cycles.",
          "Annotate structures as `@Stable` to skip redraws when arguments match."
        ]
      },
      {
        question: "How does Android's sandboxing mechanism work? Discuss UID isolation, SELinux policies, and secure keystore storage.",
        why: "Tests platform-level security architecture knowledge.",
        expectedAnswer: [
          "Android assigns separate Linux User IDs (UID) to each application to isolate directories.",
          "SELinux policies restrict process access permissions at OS kernel level.",
          "Android Keystore saves keys inside Trusted Execution Environments (TEE) or secure hardware."
        ]
      }
    ]
  },
  ios: {
    Easy: [
      {
        question: "What is Swift, and what are its key features?",
        why: "Checks iOS baseline language concepts.",
        expectedAnswer: [
          "Modern compiled language designed by Apple for safe and fast execution.",
          "Key features: Optionals, type-safety, generics, and automatic ARC memory management."
        ]
      },
      {
        question: "Explain the differences between SwiftUI and UIKit.",
        why: "Checks UI development architecture types.",
        expectedAnswer: [
          "SwiftUI: declarative UI framework binding states directly to rendering.",
          "UIKit: event-driven, imperative framework using storyboards/programmatic views."
        ]
      },
      {
        question: "What is an Optional in Swift, and how do you safely unwrap it?",
        why: "Checks type-safety basics in Swift.",
        expectedAnswer: [
          "A type representing a value OR nil (none).",
          "Safely unwrap using `if let`, `guard let`, or nil coalescing `??`."
        ]
      },
      {
        question: "What is the role of the Info.plist file in iOS apps?",
        why: "Checks basic file configurations.",
        expectedAnswer: [
          "XML file storing configuration properties (bundle identifier, localizations, capability permissions)."
        ]
      },
      {
        question: "Explain the difference between a value type and a reference type in Swift.",
        why: "Checks memory allocation basics.",
        expectedAnswer: [
          "Value types (structs, enums) are copied on assignment (allocated on stack).",
          "Reference types (classes) share pointers to instances (allocated on heap)."
        ]
      }
    ],
    Medium: [
      {
        question: "What is Automatic Reference Counting (ARC) in Swift? How do reference cycles occur, and how do weak and unowned prevent them?",
        why: "Tests iOS memory management.",
        expectedAnswer: [
          "ARC tracks active reference counts of class instances, deallocating them on zero refs.",
          "Reference cycles occur when two classes hold strong references to each other.",
          "Prevent cycles by declaring one reference as `weak` or `unowned`."
        ]
      },
      {
        question: "Explain GCD (Grand Central Dispatch) and OperationQueue. Contrast concurrent vs serial queues.",
        why: "Tests concurrency controls.",
        expectedAnswer: [
          "GCD: C-level concurrency API managing tasks on thread pools.",
          "OperationQueue: object-oriented wrapper adding dependency controls.",
          "Serial queue runs one task at a time; concurrent runs multiple tasks in parallel."
        ]
      },
      {
        question: "What is the Combine framework, and how does it handle reactive asynchronous events?",
        why: "Tests iOS reactive APIs.",
        expectedAnswer: [
          "Declarative framework to process async events over time.",
          "Uses Publishers to emit data, Operators to transform, and Subscribers to receive values."
        ]
      },
      {
        question: "What are Swift protocols and protocol-oriented programming?",
        why: "Tests design architecture paradigms in Swift.",
        expectedAnswer: [
          "Protocols declare blueprints of methods, properties, and requirements.",
          "POP (Protocol-Oriented Programming) uses protocol extensions to implement default behaviors, bypassing rigid OOP inheritance hierarchies."
        ]
      },
      {
        question: "Explain how Swift Optionals and error handling with do-try-catch work.",
        why: "Tests Swift error resilience.",
        expectedAnswer: [
          "Optionals handle missing values cleanly.",
          "Methods throwing errors must be run inside `do-try-catch` blocks."
        ]
      }
    ],
    Hard: [
      {
        question: "Design an offline-first iOS architecture using MVVM, Swift Concurrency (async/await), CoreData/SwiftData, and URLSession.",
        why: "Tests advanced iOS architecture and local storage pipelines.",
        expectedAnswer: [
          "ViewModel coordinates asynchronous data operations via async/await.",
          "URLSession handles network traffic, writing payloads to SwiftData database.",
          "MainActor isolates state updates to push views safely on the main thread."
        ]
      },
      {
        question: "Describe Swift memory management details under the hood. How does Swift compiler inject retain/release calls, and how do capture lists work in closures?",
        why: "Tests iOS compiler execution mechanics.",
        expectedAnswer: [
          "ARC inserts `swift_retain` and `swift_release` instructions at compile time.",
          "Capture lists inside closures (e.g. `[weak self]`) intercept strong self references, preventing memory leaks."
        ]
      },
      {
        question: "How do you optimize SwiftUI list rendering and animation rendering to avoid frame drops? Discuss EquatableView and id parameter.",
        why: "Tests view layout rendering optimization.",
        expectedAnswer: [
          "Use LazyVStack / LazyHStack inside scroll containers.",
          "Pass explicit stable identifiers (`id`) to allow dynamic updates.",
          "Conform views to `Equatable` wrapping inside `EquatableView` to skip redundant layouts."
        ]
      },
      {
        question: "What is the difference between Actor and MainActor in Swift? Explain how actors serialize access to state to prevent data races.",
        why: "Tests safe modern concurrency.",
        expectedAnswer: [
          "Actors are reference types serializing access to internal mutable state, eliminating data races.",
          "MainActor is a global actor wrapping execution on the main thread (UI updates)."
        ]
      },
      {
        question: "Explain the iOS app lifecycle and transition states under UISceneDelegate (active, inactive, background, suspended).",
        why: "Tests platform lifecycle states.",
        expectedAnswer: [
          "UISceneDelegate delegates UI layouts to lifecycle states.",
          "Active: visible and interactive; Inactive: running but interrupted (notifications, calls).",
          "Background: running background tasks; Suspended: frozen by OS memory manager."
        ]
      }
    ]
  },
  qa: {
    Easy: [
      {
        question: "What is the difference between Manual Testing and Automation Testing?",
        why: "Checks QA baseline methodology.",
        expectedAnswer: [
          "Manual testing: human testers run checks step-by-step verifying inputs.",
          "Automation testing: developer scripts execute testing steps automatically."
        ]
      },
      {
        question: "What is a Bug Life Cycle in QA tracking?",
        why: "Checks bug tracking workflow baseline.",
        expectedAnswer: [
          "Sequence of states a bug moves through: New, Assigned, Open, Fixed, Retest, Verified, Closed."
        ]
      },
      {
        question: "Explain the difference between functional testing and non-functional testing.",
        why: "Checks testing scope taxonomy.",
        expectedAnswer: [
          "Functional validates application features against requirements (does it work?).",
          "Non-functional validates performance, security, and usability under stress (how does it run?)."
        ]
      },
      {
        question: "What is a Test Case, and what are its key components?",
        why: "Checks test documentation basics.",
        expectedAnswer: [
          "Set of steps and inputs to verify a specific execution.",
          "Components: Test Case ID, Description, Prerequisites, Steps, Expected Result, Actual Result."
        ]
      },
      {
        question: "What is regression testing, and when should you perform it?",
        why: "Checks release verification basics.",
        expectedAnswer: [
          "Verifying that new code edits have not broken existing, stable functionalities.",
          "Executed after major edits, bug fixes, or build deployments."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain the Test Automation Pyramid. Why should you have more unit tests than UI tests?",
        why: "Tests automation strategy reasoning.",
        expectedAnswer: [
          "Pyramid strategy: large unit test base, intermediate integration/API layers, minimal UI tests.",
          "Unit tests execute rapidly and cost less; UI tests are brittle and slow."
        ]
      },
      {
        question: "How does Selenium WebDriver communicate with the browser? What are the limitations of Selenium?",
        why: "Tests browser automation internals.",
        expectedAnswer: [
          "WebDriver uses JSON wire protocol or W3C protocols communicating directly via native drivers.",
          "Limitations: limited dynamic window alerts, cannot handle native mobile apps, desktop-only."
        ]
      },
      {
        question: "What is Page Object Model (POM) in test automation, and why is it preferred?",
        why: "Tests clean automation design patterns.",
        expectedAnswer: [
          "Design pattern representing web pages as classes holding selectors and interactions.",
          "Isolates test code logic from UI changes, simplifying long-term test suite maintenance."
        ]
      },
      {
        question: "What is CI/CD integration in testing? How do you run automated tests inside a pipeline?",
        why: "Tests CI/CD integration.",
        expectedAnswer: [
          "Running tests automatically on code pushes before deployment triggers.",
          "Integrate scripts (e.g. `npm test`) as gating stages in pipeline containers."
        ]
      },
      {
        question: "Explain the difference between boundary value analysis (BVA) and equivalence partitioning (EP).",
        why: "Tests test case design methodologies.",
        expectedAnswer: [
          "Equivalence Partitioning: groups input ranges into equivalent classes where behavior is similar.",
          "Boundary Value Analysis: designs test cases testing extreme values at range borders."
        ]
      }
    ],
    Hard: [
      {
        question: "Design an automated end-to-end testing pipeline using Playwright or Cypress integrated with GitHub Actions, detailing parallel execution, artifact reports, and retry configurations.",
        why: "Tests advanced automation pipeline architectures.",
        expectedAnswer: [
          "Configure test runner YAML executing on container nodes in parallel.",
          "Enable test retries to address sporadic flakiness.",
          "Add pipeline tasks uploading HTML report folders as artifacts on test failures."
        ]
      },
      {
        question: "How do you handle testing flakiness in UI automation? Discuss dynamic waits, element staleness, and database seeding.",
        why: "Tests UI automation error handling.",
        expectedAnswer: [
          "Apply explicit dynamic waits (waiting for selectors/network idle) instead of hard sleeps.",
          "Catch StaleElementExceptions reloading element bindings on redraws.",
          "Seed databases directly before runs to establish deterministic states."
        ]
      },
      {
        question: "How do you design a performance and load testing strategy using k6 or JMeter to validate response SLAs under 10k concurrent users?",
        why: "Tests load testing capabilities.",
        expectedAnswer: [
          "Write user behavior scripts (login, search, checkout).",
          "Configure execution phases: ramp-up, steady state load, and ramp-down.",
          "Define threshold SLAs (e.g. error rate < 1%, 95th percentile latency < 500ms)."
        ]
      },
      {
        question: "Explain contract testing (e.g. using Pact) in microservices architecture. How does it prevent integration failures?",
        why: "Tests integration testing patterns.",
        expectedAnswer: [
          "Defines schemas/agreements between consumer services and provider APIs.",
          "Consumer builds contract specifications verified locally.",
          "Provider runs checks validating compliance, ensuring breaking API updates are caught before releases."
        ]
      },
      {
        question: "What is the difference between white-box, black-box, and gray-box testing? Discuss code coverage analysis tools and mutation testing.",
        why: "Tests theoretical QA testing frameworks.",
        expectedAnswer: [
          "White-box: code structures are fully transparent; black-box: internal implementation is hidden.",
          "Gray-box: validates integrations with partial system knowledge.",
          "Use mutation testing to insert faults inside source code, validating if active test suites identify changes."
        ]
      }
    ]
  },
  product_management: {
    Easy: [
      {
        question: "What is a Product Roadmap, and what is its purpose?",
        why: "Checks product planning baseline.",
        expectedAnswer: [
          "Visual schedule of high-level features and priorities aligning with business objectives.",
          "Serves as single source of truth aligning stakeholders and engineering teams."
        ]
      },
      {
        question: "Explain the agile scrum process and the key ceremonies.",
        why: "Checks scrum management basics.",
        expectedAnswer: [
          "Iterative development approach split into sprints.",
          "Ceremonies: Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective."
        ]
      },
      {
        question: "What is an MVP (Minimum Viable Product), and why is it used?",
        why: "Checks product validation baseline.",
        expectedAnswer: [
          "Early product release containing just enough core capabilities to satisfy early adopters.",
          "Used to collect user feedback, validating product hypotheses quickly with minimal cost."
        ]
      },
      {
        question: "What is the difference between a Product Manager (PM) and a Project Manager?",
        why: "Checks role definition taxonomy.",
        expectedAnswer: [
          "Product Manager defines the product vision, strategy, and features (the 'what' and 'why').",
          "Project Manager coordinates delivery schedules, timelines, and resource tasks (the 'how' and 'when')."
        ]
      },
      {
        question: "What are KPIs (Key Performance Indicators), and why are they important?",
        why: "Checks product metrics baseline.",
        expectedAnswer: [
          "Quantifiable indicators measuring product or feature success against goals.",
          "Provide data-driven evidence of alignment with targets."
        ]
      }
    ],
    Medium: [
      {
        question: "How do you prioritize features for a product backlog? Explain prioritization frameworks like RICE or MoSCoW.",
        why: "Tests backlog management skills.",
        expectedAnswer: [
          "RICE: evaluates features using Reach, Impact, Confidence, and Effort calculations.",
          "MoSCoW: categorizes features into Must-have, Should-have, Could-have, and Won't-have.",
          "Enforce prioritizing customer value against implementation complexity."
        ]
      },
      {
        question: "How do you define and write user stories with clear Acceptance Criteria using Gherkin syntax?",
        why: "Tests backlog documentation skills.",
        expectedAnswer: [
          "User story: 'As a [user], I want to [action] so that [benefit]'.",
          "Gherkin acceptance criteria format: Given [precondition] When [action] Then [expected outcome]."
        ]
      },
      {
        question: "Explain the product lifecycle phases (Introduction, Growth, Maturity, Decline).",
        why: "Tests product lifecycle awareness.",
        expectedAnswer: [
          "Introduction: focus on product validation and early user acquisition.",
          "Growth: focus on market expansion, scaling features, and customer conversion.",
          "Maturity: focus on feature optimization, retention, and pricing models.",
          "Decline: focus on cost reduction or sunset planning."
        ]
      },
      {
        question: "How do you perform user research and run A/B testing to validate feature utility?",
        why: "Tests quantitative product validation.",
        expectedAnswer: [
          "Collect user feedback via surveys, user testing, and interviews.",
          "Deploy features as A/B splits, routing percentages of users to v1 and v2, analyzing metric changes."
        ]
      },
      {
        question: "What is product-market fit, and what indicators show you have achieved it?",
        why: "Tests market validation criteria.",
        expectedAnswer: [
          "State where a product satisfies strong customer demand.",
          "Indicators: high cohort retention rates, organic user acquisition, and positive NPS scores."
        ]
      }
    ],
    Hard: [
      {
        question: "How do you handle prioritization conflicts between sales requests, technical debt, and long-term product vision?",
        why: "Tests senior PM trade-off optimization.",
        expectedAnswer: [
          "Map sales requests to revenue impact and customer growth.",
          "Allocate a fixed budget portion of sprints to address refactoring and technical debt.",
          "Evaluate features using long-term roadmap alignment metrics."
        ]
      },
      {
        question: "Design a product monetization and pricing transition strategy from freemium to tiered subscription models without alienating active users.",
        why: "Tests strategic monetization design.",
        expectedAnswer: [
          "Keep legacy users grandfathered in their original free tiers temporarily.",
          "Introduce new, premium features restricted to paid tiers.",
          "Conduct cohort pricing experiments to determine tier price sensitivity before announcement."
        ]
      },
      {
        question: "Explain product analytics tracking setups. How do you design user cohort retention funnels using Amplitude or Mixpanel?",
        why: "Tests product telemetry design.",
        expectedAnswer: [
          "Instrument key user actions (e.g. signup, upload, generate) as event trackers.",
          "Establish funnels tracing conversions from landing to key generation actions.",
          "Create cohorts based on signup dates to analyze weekly retention curves."
        ]
      },
      {
        question: "How do you manage product development under high market uncertainty? Detail how you apply Dual-Track Agile (Discovery vs Delivery).",
        why: "Tests product discovery models.",
        expectedAnswer: [
          "Discovery track: runs customer research and user testing validation (checks desirability/viability).",
          "Delivery track: runs code building and release engineering tasks.",
          "Ensures engineering teams build only validated feature patterns."
        ]
      },
      {
        question: "Analyze customer acquisition cost (CAC) and customer lifetime value (LTV). What LTV:CAC ratio indicates a healthy business, and how do PMs optimize it?",
        why: "Tests metrics analytics.",
        expectedAnswer: [
          "Healthy LTV:CAC ratio is generally 3:1 or higher.",
          "Optimize LTV by improving onboarding, building high value feature retention loops, and upselling.",
          "Reduce CAC by improving organic search channels and referral loops."
        ]
      }
    ]
  },
  cloud: {
    Easy: [
      {
        question: "What is Cloud Computing? Define IaaS, PaaS, and SaaS.",
        why: "Checks cloud baseline concepts.",
        expectedAnswer: [
          "Delivery of computing services over the internet.",
          "IaaS: Infrastructure as a Service (EC2 instances).",
          "PaaS: Platform as a Service (Heroku).",
          "SaaS: Software as a Service (Google Workspace)."
        ]
      },
      {
        question: "Explain the concept of Virtual Private Cloud (VPC).",
        why: "Checks cloud networking basics.",
        expectedAnswer: [
          "Isolated private network space allocated inside public cloud providers.",
          "Allows clients to control subnets, IP layouts, and routing gateways."
        ]
      },
      {
        question: "What is Auto Scaling, and why is it used in cloud infrastructure?",
        why: "Checks cloud resource scaling basics.",
        expectedAnswer: [
          "Automatically adjusts server resource allocations matching workload demand.",
          "Saves infrastructure cost during low traffic; prevents server exhaustion on spikes."
        ]
      },
      {
        question: "What is a Content Delivery Network (CDN) and how does it speed up websites?",
        why: "Checks cloud CDN basics.",
        expectedAnswer: [
          "Distributed global edge servers caching static resources (images, JS).",
          "Routes traffic to the closest geographical node, saving bandwidth and latency."
        ]
      },
      {
        question: "What is Cloud Security's Shared Responsibility Model?",
        why: "Checks basic cloud security configurations.",
        expectedAnswer: [
          "Cloud provider secures physical server environments (security OF the cloud).",
          "Client secures software, databases, network connections, and configs (security IN the cloud)."
        ]
      }
    ],
    Medium: [
      {
        question: "Explain how VPC security groups differ from Network Access Control Lists (NACLs).",
        why: "Tests cloud network security controls.",
        expectedAnswer: [
          "Security Groups: stateful, apply at instances level, support allow rules only.",
          "NACLs: stateless, apply at subnet boundaries, support allow and deny rules."
        ]
      },
      {
        question: "What is Cloud storage tiering? Compare AWS S3 Standard, IA, Glacier, and Deep Archive.",
        why: "Tests cloud storage optimization.",
        expectedAnswer: [
          "S3 Standard: frequent access, low retrieval cost.",
          "S3 IA (Infrequent Access): cheaper storage, higher retrieval cost.",
          "S3 Glacier / Deep Archive: archival storage, extremely cheap storage, retrieval times range from minutes to hours."
        ]
      },
      {
        question: "How does DNS-based routing (e.g. Route 53) support latency-based, failover, and weighted routing?",
        why: "Tests cloud routing configurations.",
        expectedAnswer: [
          "Latency: directs users to regions yielding lowest network latency.",
          "Failover: automatically redirects users to secondary regions on primary health check failures.",
          "Weighted: routes percentages of traffic to different IP endpoints."
        ]
      },
      {
        question: "What is the purpose of Infrastructure as Code (IaC)? Contrast declarative vs imperative tools.",
        why: "Tests IaC deployment architecture.",
        expectedAnswer: [
          "Automating cloud infrastructure provisioning using configuration files.",
          "Declarative: defines target state exact configurations (Terraform).",
          "Imperative: declares execution commands to run (Ansible)."
        ]
      },
      {
        question: "What is IAM (Identity and Access Management)? Explain policies, roles, and groups.",
        why: "Tests cloud identity access controls.",
        expectedAnswer: [
          "IAM controls system access permissions.",
          "Policies: JSON files defining allowable actions on resources.",
          "Roles: temporary credentials assumed by users or compute services.",
          "Groups: clusters of users mapped to simplify permission assignments."
        ]
      }
    ],
    Hard: [
      {
        question: "Design a multi-region disaster recovery cloud architecture supporting Active-Active configuration with near-zero RPO and RTO.",
        why: "Tests advanced enterprise cloud network architectures.",
        expectedAnswer: [
          "Route global user traffic using Route 53 latency-based routing with active health checks.",
          "Deploy application clusters inside distinct regions behind Application Load Balancers.",
          "Configure global databases (DynamoDB Global Tables) replicating data bidirectionally."
        ]
      },
      {
        question: "How do you secure cloud keys and secrets inside microservice containers? Detail integrations using AWS Secrets Manager or HashiCorp Vault.",
        why: "Tests secure container architecture design.",
        expectedAnswer: [
          "Inject secrets dynamically at runtime rather than saving files inside container images.",
          "Inject secrets via sidecar containers or direct SDK calls.",
          "Enforce automatic secrets rotation configurations."
        ]
      },
      {
        question: "How do you design a cost-efficient serverless data analytics pipeline using S3, Athena, Glue, and QuickSight?",
        why: "Tests serverless data integrations.",
        expectedAnswer: [
          "Store bulk raw logs/files inside S3 buckets.",
          "Use AWS Glue crawlers to partition and generate table schemas.",
          "Run ad-hoc SQL queries using Amazon Athena, reading S3 data directly.",
          "Present dashboard visuals using Amazon QuickSight, querying Athena."
        ]
      },
      {
        question: "Explain cloud-native network connectivity options. Compare VPC Peering, Transit Gateway, and VPN/Direct Connect.",
        why: "Tests cloud network architecture options.",
        expectedAnswer: [
          "VPC Peering: point-to-point non-transitive connection between two VPCs.",
          "Transit Gateway: centralized network hub routing traffic across multiple VPCs and environments.",
          "VPN/Direct Connect: bridges on-premise environments to cloud networks (Direct Connect is dedicated fiber)."
        ]
      },
      {
        question: "Explain how to audit and protect cloud infrastructure against resource misconfigurations and compliance violations at scale.",
        why: "Tests compliance auditing at scale.",
        expectedAnswer: [
          "Enforce static analysis scanning on IaC templates (trivy, tfsec) in pipelines.",
          "Run continuous configuration checkers (AWS Config) matching compliance profiles.",
          "Automate alerts and auto-remediation loops for non-compliant resources."
        ]
      }
    ]
  }
};

const HR_POOLS = {
  Easy: [
    {
      question: "Walk me through your background and professional history as a [targetRole] as detailed on your resume.",
      why: "Evaluates verbal communication style, career trajectory, and how they summarize achievements."
    },
    {
      question: "Why are you interested in stepping into the role of [targetRole]?",
      why: "Measures candidate role alignment and motivation."
    },
    {
      question: "What do you consider your greatest professional strength and how will it help you as a [targetRole]?",
      why: "Checks self-awareness and how their qualities match the team description."
    },
    {
      question: "Tell me about a project on your resume that you are particularly proud of as a [targetRole].",
      why: "Allows candidate to showcase technical interest and communication skills."
    },
    {
      question: "How do you stay updated with the latest tools and trends in [targetRole]?",
      why: "Checks learning agility and curiosity about technology."
    }
  ],
  Medium: [
    {
      question: "How do you handle tight deadlines or multiple competing priorities in your work as a [targetRole]?",
      why: "Checks time management, prioritization skills, and transparency in communication."
    },
    {
      question: "Tell me about a time you had a professional disagreement or conflict within a team as a [targetRole]. How did you navigate it?",
      why: "Evaluates collaboration, active listening, and conflict resolution capability."
    },
    {
      question: "Describe a project experience as a [targetRole] where you had to collaborate closely with non-technical stakeholders.",
      why: "Checks ability to translate complex technology terms into clear business objectives."
    },
    {
      question: "How do you approach learning a completely new technology when starting a new [targetRole] project?",
      why: "Measures resourcefulness and adaptation methods."
    },
    {
      question: "Tell me about a time when you received constructive feedback as a [targetRole]. How did you act on it?",
      why: "Checks humility, maturity, and capacity for self-improvement."
    }
  ],
  Hard: [
    {
      question: "Describe a significant professional or technical setback you experienced as a [targetRole]. What did you learn and how did you recover?",
      why: "Evaluates resilience, analytical post-mortem reasoning, and learning adaptability."
    },
    {
      question: "Tell me about a time when you had to make a critical architectural or process decision as a [targetRole] under high ambiguity or time pressure.",
      why: "Checks engineering maturity, risk management, and decision-making logic."
    },
    {
      question: "How do you handle a situation when you realize a [targetRole] project will not meet its deadline? Walk me through your communication strategy.",
      why: "Checks stakeholder coordination, integrity, and proactive risk assessment."
    },
    {
      question: "Tell me about a complex project where you had to balance technical debt with shipping speed as a [targetRole]. What compromises did you make?",
      why: "Checks real-world trade-off reasoning and pragmatism."
    },
    {
      question: "Describe a scenario where you led a [targetRole] initiative without having direct authority over the team members.",
      why: "Measures horizontal leadership, persuasion skills, and collaborative influence."
    }
  ]
};

/**
 * Perform a true Fisher-Yates shuffle algorithm to yield randomized arrays
 */
function getFisherYatesShuffled(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateFallbackQuestions(resume, options) {
  const { type = 'Technical', difficulty = 'Medium', number = 5, targetRole = '' } = options;
  const parsed = parseResumeText(resume.resumeText);

  // 1. Identify matching role category based on targetRole
  const roleLower = (targetRole || '').toLowerCase();
  
  // Set up categories to pool from dynamically to increase questions pool size and category relevance
  let categoriesToPool = [];
  let matchedCategory = 'general';

  if (roleLower.includes('machine learning') || roleLower.includes('data scientist') || roleLower.includes('data analyst') || roleLower.includes('ml ') || roleLower.startsWith('ml') || roleLower.includes('deep learning')) {
    matchedCategory = 'machine_learning';
    categoriesToPool.push('machine_learning');
  } else if (roleLower.includes('ai ') || roleLower.startsWith('ai') || roleLower.includes('nlp') || roleLower.includes('llm') || roleLower.includes('transformers') || roleLower.includes('artificial intelligence') || roleLower.includes('ai researcher')) {
    matchedCategory = 'ai';
    categoriesToPool.push('ai');
  } else if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('site reliability') || roleLower.includes('jenkins') || roleLower.includes('ci/cd') || roleLower.includes('docker') || roleLower.includes('kubernetes') || roleLower.includes('infrastructure')) {
    matchedCategory = 'devops';
    categoriesToPool.push('devops');
  } else if (roleLower.includes('cloud') || roleLower.includes('aws') || roleLower.includes('azure') || roleLower.includes('gcp') || roleLower.includes('terraform') || roleLower.includes('iam') || roleLower.includes('vpc') || roleLower.includes('systems administrator') || roleLower.includes('cloud architect')) {
    matchedCategory = 'cloud';
    categoriesToPool.push('cloud');
  } else if (roleLower.includes('cybersecurity') || roleLower.includes('security') || roleLower.includes('owasp') || roleLower.includes('threat') || roleLower.includes('security audit') || roleLower.includes('penetration') || roleLower.includes('ciso')) {
    matchedCategory = 'cybersecurity';
    categoriesToPool.push('cybersecurity');
  } else if (roleLower.includes('blockchain') || roleLower.includes('smart contract') || roleLower.includes('consensus') || roleLower.includes('web3') || roleLower.includes('solidity') || roleLower.includes('ethereum')) {
    matchedCategory = 'blockchain';
    categoriesToPool.push('blockchain');
  } else if (roleLower.includes('flutter') || roleLower.includes('dart') || roleLower.includes('react native') || roleLower.includes('widgets')) {
    matchedCategory = 'flutter';
    categoriesToPool.push('flutter');
  } else if (roleLower.includes('android') || roleLower.includes('jetpack') || roleLower.includes('activities') || roleLower.includes('fragments')) {
    matchedCategory = 'android';
    categoriesToPool.push('android');
  } else if (roleLower.includes('ios') || roleLower.includes('swift') || roleLower.includes('uikit') || roleLower.includes('swiftui')) {
    matchedCategory = 'ios';
    categoriesToPool.push('ios');
  } else if (roleLower.includes('qa') || roleLower.includes('testing') || roleLower.includes('automation') || roleLower.includes('bug tracking') || roleLower.includes('test cases') || roleLower.includes('sdet')) {
    matchedCategory = 'qa';
    categoriesToPool.push('qa');
  } else if (roleLower.includes('product manager') || roleLower.includes('project manager') || roleLower.includes('scrum master') || roleLower.includes('business analyst') || roleLower.includes('product strategy') || roleLower.includes('kpis') || roleLower.includes('roadmap') || roleLower.includes('stakeholder')) {
    matchedCategory = 'product_management';
    categoriesToPool.push('product_management');
  } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('express') || roleLower.includes('api') || roleLower.includes('sql') || roleLower.includes('mongodb') || roleLower.includes('redis') || roleLower.includes('server') || roleLower.includes('database')) {
    matchedCategory = 'backend';
    categoriesToPool.push('backend');
  } else if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('css') || roleLower.includes('rendering') || roleLower.includes('dom') || roleLower.includes('javascript') || roleLower.includes('typescript')) {
    matchedCategory = 'frontend';
    categoriesToPool.push('frontend');
  } else if (roleLower.includes('full stack') || roleLower.includes('fullstack')) {
    matchedCategory = 'fullstack';
    categoriesToPool.push('frontend', 'backend');
  } else if (roleLower.includes('software') || roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('programmer')) {
    matchedCategory = 'software_engineering';
    categoriesToPool.push('frontend', 'backend', 'cloud', 'general');
  } else {
    matchedCategory = 'general';
    categoriesToPool.push('frontend', 'backend', 'cloud', 'devops', 'machine_learning', 'ai', 'general');
  }

  // 2. Fetch technical questions pool matching selected difficulty
  let techPool = [];
  categoriesToPool.forEach(cat => {
    const catPool = TECHNICAL_POOLS[cat]?.[difficulty] || [];
    techPool.push(...catPool);
  });

  // Dynamic Fallback within the same selected category first!
  // If the target difficulty pool has fewer questions than requested, draw from other difficulties
  // within the same categories to satisfy "no unrelated questions appear".
  if (techPool.length < number) {
    const otherDifficulties = ['Easy', 'Medium', 'Hard'].filter(d => d !== difficulty);
    for (const d of otherDifficulties) {
      categoriesToPool.forEach(cat => {
        const catPool = TECHNICAL_POOLS[cat]?.[d] || [];
        techPool.push(...catPool);
      });
      if (techPool.length >= number) break;
    }
  }

  // Always merge general questions to increase pool size and variance if not already added
  if (techPool.length < number && !categoriesToPool.includes('general')) {
    const generalPool = TECHNICAL_POOLS['general']?.[difficulty] || [];
    techPool.push(...generalPool);
  }

  // Fallback to general pool if no questions found
  if (techPool.length === 0) {
    techPool = TECHNICAL_POOLS['general']?.[difficulty] || [];
  }

  // Deduplicate tech pool based on question content
  const uniqueTechPool = [];
  const seenTech = new Set();
  techPool.forEach(q => {
    if (!seenTech.has(q.question)) {
      seenTech.add(q.question);
      uniqueTechPool.push(q);
    }
  });

  // 3. Fetch HR questions pool matching selected difficulty and apply personalization
  const hrPool = HR_POOLS[difficulty] || HR_POOLS['Medium'];
  const personalizedHRPool = hrPool.map(q => {
    let questionText = q.question;
    
    // Personalize using projects
    if (questionText.includes('a project on your resume') && parsed.projects.length > 0) {
      // Pick first non-bullet project header
      const projName = parsed.projects[0].substring(0, 50).trim();
      questionText = `I noticed the project "${projName}" on your resume. Tell me about the biggest technical challenge you faced while building it, and how it prepares you for this role.`;
    }
    // Personalize using work experience
    if (questionText.includes('your background and professional history') && parsed.experience.length > 0) {
      const expName = parsed.experience[0].substring(0, 60).trim();
      questionText = `Walk me through your background and describe how your work experience (specifically: "${expName}") prepares you for the role of ${targetRole || 'Software Professional'}.`;
    }
    // Personalize using education
    if (questionText.includes('Why are you interested in stepping') && parsed.education.length > 0) {
      const eduName = parsed.education[0].substring(0, 50).trim();
      questionText = `With your academic background in ${eduName}, what makes you interested in stepping into the role of ${targetRole || 'Software Professional'}?`;
    }

    // Substitute targetRole string
    questionText = questionText.replace('[targetRole]', targetRole || 'Software Professional');

    return {
      question: questionText,
      why: q.why.replace('[targetRole]', targetRole || 'Software Professional'),
      expectedAnswer: q.expectedAnswer || [
        "Structure details based on situation, task, action, and result (STAR method).",
        "Explain direct context relevance to the target job description.",
        "Highlight lessons learned and adaptability values."
      ],
      difficulty: difficulty
    };
  });

  // 4. Sample final questions based on Interview Type setting
  let finalQuestions = [];

  if (type === 'Technical') {
    const shuffledTech = getFisherYatesShuffled(uniqueTechPool);
    finalQuestions = shuffledTech.slice(0, number).map(q => ({ ...q, difficulty }));
  } else if (type === 'HR') {
    const shuffledHR = getFisherYatesShuffled(personalizedHRPool);
    finalQuestions = shuffledHR.slice(0, number);
  } else { // Mixed mode: 50% technical and 50% HR, randomized order (not grouped, not strictly alternating)
    const techCount = Math.ceil(number / 2);
    const hrCount = number - techCount;

    const shuffledTech = getFisherYatesShuffled(uniqueTechPool);
    const shuffledHR = getFisherYatesShuffled(personalizedHRPool);

    const sampledTech = shuffledTech.slice(0, techCount).map(q => ({ ...q, difficulty }));
    const sampledHR = shuffledHR.slice(0, hrCount);

    const merged = [...sampledTech, ...sampledHR];
    // Shuffle the combined set to randomize their order completely
    finalQuestions = getFisherYatesShuffled(merged);
  }

  // Pad the final list if sizes fall short due to small source lists
  if (finalQuestions.length < number) {
    const fallbackAll = [...uniqueTechPool.map(q => ({ ...q, difficulty })), ...personalizedHRPool];
    const shuffledFallback = getFisherYatesShuffled(fallbackAll);
    const seenFinal = new Set(finalQuestions.map(q => q.question));
    for (const q of shuffledFallback) {
      if (!seenFinal.has(q.question) && finalQuestions.length < number) {
        finalQuestions.push(q);
        seenFinal.add(q.question);
      }
    }
  }

  return { questions: finalQuestions };
}
