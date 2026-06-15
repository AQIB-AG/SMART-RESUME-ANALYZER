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
  }
};

const HR_POOLS = {
  Easy: [
    {
      question: "Walk me through your background and professional history as detailed on your resume.",
      why: "Evaluates verbal communication style, career trajectory, and how they summarize achievements."
    },
    {
      question: "Why are you interested in stepping into the role of [targetRole]?",
      why: "Measures candidate role alignment and motivation."
    },
    {
      question: "What do you consider your greatest professional strength and how will it help you in this role?",
      why: "Checks self-awareness and how their qualities match the team description."
    },
    {
      question: "Tell me about a project on your resume that you are particularly proud of.",
      why: "Allows candidate to showcase technical interest and communication skills."
    },
    {
      question: "How do you stay updated with the latest tools and trends in [targetRole]?",
      why: "Checks learning agility and curiosity about technology."
    }
  ],
  Medium: [
    {
      question: "How do you handle tight deadlines or multiple competing priorities?",
      why: "Checks time management, prioritization skills, and transparency in communication."
    },
    {
      question: "Tell me about a time you had a professional disagreement or conflict within a team. How did you navigate it?",
      why: "Evaluates collaboration, active listening, and conflict resolution capability."
    },
    {
      question: "Describe a project experience where you had to collaborate closely with non-technical stakeholders.",
      why: "Checks ability to translate complex technology terms into clear business objectives."
    },
    {
      question: "How do you approach learning a completely new technology when starting a new project?",
      why: "Measures resourcefulness and adaptation methods."
    },
    {
      question: "Tell me about a time when you received constructive feedback. How did you act on it?",
      why: "Checks humility, maturity, and capacity for self-improvement."
    }
  ],
  Hard: [
    {
      question: "Describe a significant technical failure or setback you experienced. What did you learn and how did you recover?",
      why: "Evaluates resilience, analytical post-mortem reasoning, and learning adaptability."
    },
    {
      question: "Tell me about a time when you had to make a critical architectural decision under high ambiguity or time pressure.",
      why: "Checks engineering maturity, risk management, and decision-making logic."
    },
    {
      question: "How do you handle a situation when you realize a project will not meet its deadline? Walk me through your communication strategy.",
      why: "Checks stakeholder coordination, integrity, and proactive risk assessment."
    },
    {
      question: "Tell me about a complex project where you had to balance technical debt with shipping speed. What compromises did you make?",
      why: "Checks real-world trade-off reasoning and pragmatism."
    },
    {
      question: "Describe a scenario where you led a technical initiative without having direct authority over the team members.",
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
  let matchedCategory = 'general';

  if (roleLower.includes('machine learning') || roleLower.includes('data scientist') || roleLower.includes('data analyst') || roleLower.includes('ml ') || roleLower.startsWith('ml') || roleLower.includes('deep learning')) {
    matchedCategory = 'machine_learning';
  } else if (roleLower.includes('ai ') || roleLower.startsWith('ai') || roleLower.includes('nlp') || roleLower.includes('llm') || roleLower.includes('transformers') || roleLower.includes('artificial intelligence')) {
    matchedCategory = 'ai';
  } else if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('site reliability') || roleLower.includes('jenkins') || roleLower.includes('ci/cd') || roleLower.includes('docker') || roleLower.includes('kubernetes')) {
    matchedCategory = 'devops';
  } else if (roleLower.includes('cloud') || roleLower.includes('aws') || roleLower.includes('azure') || roleLower.includes('gcp') || roleLower.includes('terraform') || roleLower.includes('iam') || roleLower.includes('vpc')) {
    matchedCategory = 'cloud';
  } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('express') || roleLower.includes('api') || roleLower.includes('sql') || roleLower.includes('mongodb') || roleLower.includes('redis') || roleLower.includes('server') || roleLower.includes('database')) {
    matchedCategory = 'backend';
  } else if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('css') || roleLower.includes('rendering') || roleLower.includes('dom') || roleLower.includes('javascript') || roleLower.includes('typescript')) {
    matchedCategory = 'frontend';
  }

  // 2. Fetch technical questions pool matching selected difficulty
  let techPool = [];
  const primaryPool = TECHNICAL_POOLS[matchedCategory]?.[difficulty] || [];
  techPool.push(...primaryPool);

  // Merge general questions to double pool size and increase variance
  if (matchedCategory !== 'general') {
    const generalPool = TECHNICAL_POOLS['general']?.[difficulty] || [];
    techPool.push(...generalPool);
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
