import {
  UserProfile,
  CareerFitAnalysis,
  InterviewSession,
  MemoryTopic,
  AuthUser,
  DayStudyPlanItem,
  SkillGapStudyMaterial,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'pip_student_profile',
  CAREER_FIT: 'pip_career_fit_history',
  INTERVIEWS: 'pip_interview_sessions',
  MEMORY_TOPICS: 'pip_memory_topics',
  AUTH_USER: 'pip_auth_user',
};

// Initial realistic default data
const DEFAULT_PROFILE: UserProfile = {
  studentName: 'Alex Rivera',
  targetRole: 'Full Stack / Backend Engineer',
  targetCompany: 'Stripe',
  targetJobDescription: `Role: Software Engineer, Core Payments Backend
Location: Remote / San Francisco

About the Role:
We are looking for a Software Engineer to design, build, and scale reliable payment rails handling millions of transactions every hour. You will work on distributed idempotency, ledger consistency, event-driven webhooks, and fault-tolerant financial integrations.

Key Requirements:
- Demonstrated experience in TypeScript/Node.js, Go, or Python for backend microservices.
- Solid understanding of relational databases (PostgreSQL/MySQL), transaction isolation levels, ACID guarantees, and distributed idempotency.
- Practical experience designing and securing RESTful & GraphQL APIs with rate limiting and authentication (JWT, OAuth 2.0).
- Experience with asynchronous message queues (RabbitMQ, Kafka, or AWS SQS) for event streaming and background reconciliation.
- Strong software engineering fundamentals: unit/integration testing (Jest/Vitest), CI/CD workflows (GitHub Actions), Docker containerization, and monitoring.
- Excellent communication skills, system architecture reasoning, and pragmatic engineering trade-off analysis.`,
  githubUrl: 'https://github.com/alexrivera-dev',
  codingPlatformUrl: 'https://leetcode.com/u/alex_code_r',
  resumeFileName: 'Alex_Rivera_Software_Engineer_CV.pdf',
  resumeText: `ALEX RIVERA
San Francisco, CA | alex.rivera@example.com | github.com/alexrivera-dev | linkedin.com/in/alexrivera

SUMMARY:
Final-year Computer Science student specializing in distributed systems, backend engineering, and reliable API design. Builder of high-concurrency event applications with hands-on PostgreSQL, TypeScript, and Docker experience.

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Python, SQL (PostgreSQL), Go (Basics)
Backend & Architecture: Node.js, Express, Fastify, REST APIs, Microservices, Redis Caching, RabbitMQ
Databases & Storage: PostgreSQL, Prisma ORM, Redis, Transaction Isolation, Indexing Optimization
DevOps & Tooling: Docker, Git, GitHub Actions, Linux, Vitest, Jest

NOTABLE PROJECTS:
1. Distributed Idempotent Payment Webhook Service
- Engineered an event-driven webhook ingestion service processing 1,200 events/sec with guaranteed at-least-once delivery.
- Implemented cryptographic signature verification and idempotency keys using Redis TTL locks and PostgreSQL transactional outbox pattern.
- Maintained 99.9% uptime during benchmark stress tests with zero duplicate processing bugs.

2. Cloud Ledger Sync Engine
- Built an append-only double-entry financial ledger service in TypeScript with ACID compliance on PostgreSQL.
- Reduced audit reconciliation query time by 64% using optimized composite B-Tree indexes and materialized views.
- Wrote 140+ unit and integration test suites with 92% code coverage using Vitest.

3. Distributed Rate Limiter Middleware
- Implemented sliding-window counter and token-bucket algorithms in Go and Redis with sub-2ms latency.
- Packaged as an open-source npm/pkg module with 300+ stars on GitHub.

EDUCATION:
B.S. in Computer Science, University of Technology (2022 - 2026)`,
  lastUpdated: new Date().toISOString(),
};

export const DEMO_USERS: Record<string, { user: AuthUser; profile: UserProfile }> = {
  alex: {
    user: {
      id: 'usr_alex',
      name: 'Alex Mercer',
      email: 'alex.mercer@candidate.edu',
      role: 'Full Stack & Distributed Systems',
      targetCompany: 'Stripe',
      isDemoUser: true,
    },
    profile: DEFAULT_PROFILE,
  },
  priya: {
    user: {
      id: 'usr_priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@candidate.edu',
      role: 'Cloud Infrastructure & High-Scale Systems',
      targetCompany: 'Google',
      isDemoUser: true,
    },
    profile: {
      studentName: 'Priya Sharma',
      targetRole: 'Software Engineer, Cloud Infrastructure',
      targetCompany: 'Google',
      targetJobDescription: `Role: Software Engineer, Google Cloud Core Systems
Location: Mountain View / Remote

About the Team:
Build scalable, resilient distributed storage, RPC frameworks, and distributed concurrency controls handling millions of requests per second with sub-5ms latencies.

Requirements:
- Strong foundations in Algorithms, Data Structures, and Concurrency.
- Experience with Go, C++, or Java; RPC protocols (gRPC, Protocol Buffers).
- Knowledge of distributed consensus (Paxos, Raft), consistent hashing, and Spanner/BigTable models.
- Linux systems programming and network performance tuning.`,
      githubUrl: 'https://github.com/priyasharma-systems',
      codingPlatformUrl: 'https://leetcode.com/u/priya_systems',
      resumeFileName: 'Priya_Sharma_Resume.pdf',
      resumeText: `PRIYA SHARMA
Mountain View, CA | priya.sharma@candidate.edu | github.com/priyasharma-systems
Summary: Systems Engineer specializing in high-throughput RPCs, Raft consensus implementations, and distributed cache partitioning.
Technical Skills: Go, C++, Rust, gRPC, Protobufs, Redis, Linux eBPF, Docker, Kubernetes.
Projects:
1. Distributed Raft Consensus Engine in Go: Implemented leader election, log replication, and state machine snapshots.
2. High-Performance gRPC Proxy: Reverse proxy handling 45,000 req/sec with zero-copy buffer pooling.`,
      lastUpdated: new Date().toISOString(),
    },
  },
  jordan: {
    user: {
      id: 'usr_jordan',
      name: 'Jordan Lee',
      email: 'jordan.lee@candidate.edu',
      role: 'Software Development Engineer I (SDE-1)',
      targetCompany: 'Amazon',
      isDemoUser: true,
    },
    profile: {
      studentName: 'Jordan Lee',
      targetRole: 'Software Development Engineer I',
      targetCompany: 'Amazon',
      targetJobDescription: `Role: Software Development Engineer (SDE 1)
Location: Seattle, WA

Requirements:
- Bachelor's in Computer Science or related field.
- Proficiency in Java, Python, or TypeScript.
- Strong object-oriented design and SOLID principles.
- Familiarity with AWS primitives (DynamoDB, Lambda, SQS, S3).
- Demonstrated passion for customer obsession and high availability.`,
      githubUrl: 'https://github.com/jordanlee-dev',
      codingPlatformUrl: 'https://leetcode.com/u/jordan_sde',
      resumeFileName: 'Jordan_Lee_Resume.pdf',
      resumeText: `JORDAN LEE
Seattle, WA | jordan.lee@candidate.edu | github.com/jordanlee-dev
Summary: Graduating CS student with strong OOP fundamentals, AWS serverless deployments, and data structures.
Technical Skills: Java, TypeScript, Python, AWS Lambda, DynamoDB, PostgreSQL, Docker.
Projects:
1. Serverless E-Commerce Order Processor: Event-driven architecture with AWS SQS, Lambda, and DynamoDB single-table design.
2. Inventory Lock Manager: Pessimistic locking mechanism with DynamoDB conditional writes.`,
      lastUpdated: new Date().toISOString(),
    },
  },
};

const DEFAULT_CAREER_FIT: CareerFitAnalysis = {
  id: 'cf_initial_seed',
  analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  targetRole: 'Full Stack / Backend Engineer',
  targetCompany: 'Stripe',
  summary:
    'Strong evidence of backend microservices engineering, PostgreSQL transactional design, and Redis caching across submitted resume and GitHub projects. Key gaps exist in verifiable Kafka streaming production experience and cloud infrastructure orchestration.',
  evidenceRequirements: [
    {
      requirement: 'Demonstrated experience in TypeScript/Node.js, Go, or Python for backend microservices',
      isDemonstrated: true,
      directEvidenceCitation: 'Distributed Idempotent Payment Webhook Service built with Node.js and TypeScript; Rate Limiter in Go',
      analysisNote: 'Demonstrated with clear production-grade projects in resume and public repositories.',
    },
    {
      requirement: 'Solid understanding of relational databases (PostgreSQL/MySQL), transaction isolation levels, ACID guarantees, and distributed idempotency',
      isDemonstrated: true,
      directEvidenceCitation: 'Cloud Ledger Sync Engine (append-only double-entry ledger, ACID compliance, composite B-Tree indexes)',
      analysisNote: 'Directly demonstrated through transactional outbox implementation and schema indexing design.',
    },
    {
      requirement: 'Asynchronous message queues (RabbitMQ, Kafka, or AWS SQS) for event streaming and background reconciliation',
      isDemonstrated: true,
      directEvidenceCitation: 'RabbitMQ utilized in payment webhook ingestion engine',
      analysisNote: 'RabbitMQ is verified in submitted projects. Note: Kafka-specific partition replay was not demonstrated in your submitted evidence.',
    },
    {
      requirement: 'Practical experience designing and securing RESTful & GraphQL APIs with rate limiting and authentication (JWT, OAuth 2.0)',
      isDemonstrated: false,
      directEvidenceCitation: 'None found in submitted materials',
      analysisNote: 'OAuth 2.0 grant flows and GraphQL schema implementations are not demonstrated in your submitted evidence.',
    },
    {
      requirement: 'Software engineering fundamentals: testing (Vitest/Jest), CI/CD workflows, Docker containerization',
      isDemonstrated: true,
      directEvidenceCitation: '140+ Vitest test suites (92% coverage), Docker configurations, GitHub Actions pipelines',
      analysisNote: 'Demonstrated thoroughly across project repositories.',
    },
  ],
  demonstratedSkills: [
    {
      skill: 'PostgreSQL & ACID Transactions',
      source: 'Resume',
      evidenceSnippet: 'Double-entry ledger with outbox pattern and composite B-tree indexing',
      proficiencyAssessment: 'Demonstrated through complex database state management in Ledger project',
    },
    {
      skill: 'Distributed Idempotency & Caching',
      source: 'GitHub',
      evidenceSnippet: 'Redis TTL locks with atomic SETNX primitives in webhook pipeline',
      proficiencyAssessment: 'Verified in public open-source repository',
    },
    {
      skill: 'Automated Testing & CI/CD',
      source: 'Resume',
      evidenceSnippet: '140+ unit/integration tests with Vitest achieving 92% coverage',
      proficiencyAssessment: 'High rigor demonstrated in code artifacts',
    },
  ],
  missingOrUnverifiedEvidence: [
    {
      skillOrRequirement: 'OAuth 2.0 Authorization Server / Token Exchange Implementation',
      status: 'not demonstrated in your submitted evidence',
      impact: 'High',
      recommendedAction: 'Build a small reference auth microservice with PKCE flow and token rotation to showcase in portfolio.',
    },
    {
      skillOrRequirement: 'Apache Kafka Partitioning & Distributed Log Replay',
      status: 'not demonstrated in your submitted evidence',
      impact: 'Medium',
      recommendedAction: 'Augment the payment webhook project with a Kafka consumer group handling parallel topic partitions.',
    },
    {
      skillOrRequirement: 'Distributed Observability & Distributed Tracing (OpenTelemetry)',
      status: 'not demonstrated in your submitted evidence',
      impact: 'Medium',
      recommendedAction: 'Add OpenTelemetry tracing spans to trace requests across microservice boundaries.',
    },
  ],
  projectGaps: [
    {
      identifiedGap: 'Production OAuth 2.0 / OpenID Connect Authorization & Security',
      suggestedProjectTitle: 'Zero-Trust Identity & Session Proxy',
      suggestedProjectDescription: 'A secure OAuth 2.0 gateway with PKCE authorization flow, token refresh rotation, and distributed revocation lists.',
      keyTechnologiesToUse: ['Node.js/TypeScript', 'Redis', 'OAuth 2.0', 'Jest'],
    },
    {
      identifiedGap: 'High-throughput Kafka Log Streaming with Event Sourcing',
      suggestedProjectTitle: 'Real-time Payment Audit Log Replayer',
      suggestedProjectDescription: 'Event-sourced ledger streaming bank transactions into Kafka topics with idempotent deduplication and real-time reconciliation.',
      keyTechnologiesToUse: ['Apache Kafka', 'PostgreSQL', 'Docker Compose'],
    },
  ],
  rubricScore: {
    coreTechnicalFit: 34,
    experienceAndProjects: 25,
    problemSolvingAndCoding: 13,
    domainAndTooling: 11,
    totalScore: 83,
    rubricExplanation:
      'Calculated based on 83% evidence alignment across required distributed systems capabilities. High density in core backend, database consistency, and testing; deduction reflects absence of OAuth2 security evidence and production Kafka pipeline.',
  },
  prioritizedRecommendations: [
    {
      priority: 'Immediate',
      action: 'Conduct Mock Interview on Distributed Database Transactions & Idempotency Tradeoffs',
      rationale: 'Solidify your ability to articulate the two-phase commit alternatives and outbox pattern verbally under pressure.',
      linkedModule: 'MockInterview',
    },
    {
      priority: 'Next Week',
      action: 'Review Database Isolation Levels & Anomaly Anomalies (Dirty Read vs Phantom Read)',
      rationale: 'Ensure instant recall on repeatable read vs serializable anomalies for fintech bar-raisers.',
      linkedModule: 'MemoryRevival',
    },
    {
      priority: 'Before Interview',
      action: 'Implement OAuth 2.0 Authorization Code Flow with PKCE Sample Repo',
      rationale: 'Provides tangible evidence to cite when asked about API authentication security.',
      linkedModule: 'PortfolioProject',
    },
  ],
  companyEngineeringProfile: {
    companyName: 'Stripe',
    domain: 'Global Financial Infrastructure & Real-Time Payments',
    techStackHighlights: ['Ruby/Sorbet', 'TypeScript', 'PostgreSQL', 'Kafka', 'Redis', 'AWS'],
    interviewCulture:
      'Rigorous focus on correctness, API backward compatibility, distributed idempotency, ledger integrity, and fault tolerance under network partitions.',
    coreEngineeringValues: [
      'Users First & Extreme Reliability',
      'Thinking from First Principles',
      'High Rigor on Data Correctness & Idempotency',
    ],
  },
  studyMaterials: [
    {
      skillOrRequirement: 'OAuth 2.0 Authorization Server / Token Exchange Implementation',
      companyContext:
        'Stripe APIs use restricted API keys and OAuth 2.0 Connect tokens to authenticate millions of merchant platforms. Engineers must understand token grant security, scope isolation, and token revocation propagation.',
      studentBackgroundBridge:
        'You have solid experience in Node.js/TypeScript backend services and basic JWT usage. To bridge to Stripe-grade security, learn the Authorization Code Flow with PKCE and distributed Redis token revocation blacklists.',
      coreConcepts: [
        'OAuth 2.0 Grant Types (Authorization Code with PKCE, Client Credentials)',
        'Access Token (short-lived JWT) vs Refresh Token (opaque rotatable)',
        'Distributed Token Revocation & Redis Bloom Filters',
        'Cryptographic Token Signing (RS256 / Ed25519 asymmetric keypairs)',
      ],
      suggestedStudyHours: 5,
      studyResources: [
        {
          title: 'RFC 7636: Proof Key for Code Exchange (PKCE) by OAuth Public Clients',
          type: 'Official Paper',
          url: 'https://datatracker.ietf.org/doc/html/rfc7636',
          description: 'The golden standard specification for securing modern web & mobile auth flows.',
        },
        {
          title: 'Stripe Connect OAuth & Token Exchange Guide',
          type: 'Architecture Guide',
          url: 'https://docs.stripe.com/connect/oauth-reference',
          description: 'How Stripe implements platform authorizations with granular scopes and webhooks.',
        },
        {
          title: 'OWASP REST Security Cheat Sheet - Token Lifecycle',
          type: 'Documentation',
          url: 'https://cheatsheetseries.owasp.org',
          description: 'Defensive patterns against token replay, CSRF, and secret leakage.',
        },
      ],
      codeSnippetExample: `// Production-grade PKCE Verifier & Token Exchange Middleware
import crypto from 'crypto';

export function generatePkcePair() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function verifyPkce(verifier: string, expectedChallenge: string): boolean {
  const calculated = crypto.createHash('sha256').update(verifier).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(expectedChallenge));
}`,
      interviewQuestionsAsked: [
        'How do you protect OAuth 2.0 tokens from replay attacks in single-page applications where secrets cannot be kept?',
        'Walk through how you would revoke an active JWT access token immediately across a cluster before its 15-minute expiration.',
      ],
      keyPitfallsToAvoid: [
        'Storing client secrets in frontend JavaScript bundles.',
        'Using symmetric secrets (HS256) shared between auth and resource servers instead of asymmetric public/private keys.',
      ],
    },
    {
      skillOrRequirement: 'Apache Kafka Partitioning & Distributed Log Replay',
      companyContext:
        'Stripe routes payment transactions, event webhooks, and ledger entries through distributed append-only event logs. Handling message ordering per account ID while maintaining high throughput is critical.',
      studentBackgroundBridge:
        'You have successfully built RabbitMQ message queue pipelines in your Webhook project. The key transition to Kafka is understanding partitioned commit logs, consumer offset management, and at-least-once idempotency deduplication.',
      coreConcepts: [
        'Partition Keys & Per-Key Total Ordering',
        'Consumer Groups & Rebalancing Protocols',
        'At-least-once Delivery vs Idempotent Processing (Transactional Outbox)',
        'Kafka Offset Commit Semantics & Dead-Letter Queues (DLQ)',
      ],
      suggestedStudyHours: 6,
      studyResources: [
        {
          title: 'Apache Kafka Architecture & Partitioning Deep Dive',
          type: 'Documentation',
          url: 'https://kafka.apache.org/documentation/#design',
          description: 'Explains the distributed commit log, zero-copy reads, and disk sequential I/O.',
        },
        {
          title: 'Designing Data-Intensive Applications (Chapter 11: Stream Processing)',
          type: 'Official Paper',
          description: 'Martin Kleppmann on event sourcing, stream joins, and dual-write prevention.',
        },
      ],
      codeSnippetExample: `// Kafka Consumer with Idempotent Deduplication using Redis SETNX
async function handlePaymentEvent(message: KafkaMessage, redis: RedisClient, db: Pool) {
  const event = JSON.parse(message.value.toString());
  const lockKey = \`processed_event:\${event.idempotencyKey}\`;
  
  // Atomic 24h lease check
  const acquired = await redis.set(lockKey, 'processing', 'NX', 'EX', 86400);
  if (!acquired) {
    console.log('Duplicate event received. Skipping idempotent replay:', event.id);
    return;
  }
  
  await db.query('INSERT INTO transactions (id, amount, status) VALUES ($1, $2, $3)', [
    event.id, event.amount, 'completed'
  ]);
}`,
      interviewQuestionsAsked: [
        'What happens when a Kafka consumer crashes before committing its offset? How do you prevent double-billing a customer?',
        'How would you guarantee strict chronological ordering of debit and credit events for the same bank account in a multi-partition Kafka topic?',
      ],
      keyPitfallsToAvoid: [
        'Assuming a message queue guarantees exactly-once delivery without database-level idempotency checks.',
        'Using random partition keys when causal ordering per customer/entity is required.',
      ],
    },
  ],
  studyPlan: [
    {
      dayNumber: 1,
      isRevisionDay: false,
      focusTitle: 'Day 1: OAuth 2.0 Grant Flows & PKCE Security for Stripe APIs',
      targetSkill: 'OAuth 2.0 Authorization Server / Token Exchange Implementation',
      companyContextSnippet:
        'Stripe Connect relies heavily on OAuth with PKCE for merchant authorizations.',
      learningObjectives: [
        'Understand authorization code flow vs client credentials flow',
        'Implement code_challenge and code_verifier handshake in TypeScript',
        'Explain why PKCE is mandatory for modern client security',
      ],
      actionItems: [
        'Read RFC 7636 PKCE specification overview',
        'Inspect Stripe Connect OAuth reference docs',
        'Implement PKCE SHA-256 verifier helper utility',
      ],
      estimatedMinutes: 60,
      retrievalQuizPrompt: 'Explain how PKCE protects against authorization code interception attacks without a client secret.',
      scheduledDate: new Date().toISOString().split('T')[0],
    },
    {
      dayNumber: 2,
      isRevisionDay: false,
      focusTitle: 'Day 2: Kafka Partitioning & Log Replay in High-Volume Ledger Pipelines',
      targetSkill: 'Apache Kafka Partitioning & Distributed Log Replay',
      companyContextSnippet:
        'Payment events must be processed in strict per-account order across Kafka partitions.',
      learningObjectives: [
        'Master Kafka topic partitioning and consumer group rebalances',
        'Implement idempotent consumer deduplication pattern',
        'Distinguish at-least-once from exactly-once processing',
      ],
      actionItems: [
        'Review Kafka storage log model & partition hashing',
        'Write consumer handler with transactional outbox pattern',
      ],
      estimatedMinutes: 60,
      retrievalQuizPrompt: 'How does Kafka guarantee message ordering, and what partition key would you choose for financial transfers?',
      scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
    },
    {
      dayNumber: 3,
      isRevisionDay: false,
      focusTitle: 'Day 3: Distributed Observability & OpenTelemetry Tracing',
      targetSkill: 'Distributed Observability & Distributed Tracing (OpenTelemetry)',
      companyContextSnippet:
        'Stripe engineers trace payment requests end-to-end across hundreds of backend services.',
      learningObjectives: [
        'Understand W3C TraceContext headers (traceparent, tracestate)',
        'Configure span context propagation across HTTP & Kafka boundaries',
      ],
      actionItems: [
        'Trace an incoming webhook through to database write using OpenTelemetry SDK',
      ],
      estimatedMinutes: 50,
      retrievalQuizPrompt: 'What information does a trace context header carry across microservice boundaries?',
      scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    },
    {
      dayNumber: 7,
      isRevisionDay: true,
      revisesDayNumber: 1,
      focusTitle: 'Day 7 Spaced Revision: Active Recall of Day 1 (OAuth 2.0 & PKCE Security)',
      targetSkill: 'OAuth 2.0 Authorization Server / Token Exchange Implementation',
      companyContextSnippet:
        '7-day spaced retrieval review: solidifying Day 1 OAuth & PKCE security before forgetting curve sets in.',
      learningObjectives: [
        'Recall PKCE sequence from memory without looking at notes',
        'Answer 3-question active retrieval challenge with 100% precision',
        'Verbally explain how to handle token rotation and revocation in an interview setting',
      ],
      actionItems: [
        'Complete the 3-question Retrieval Quiz in Memory Revival',
        'Review edge-case questions asked by Stripe interviewers',
      ],
      estimatedMinutes: 30,
      retrievalQuizPrompt: 'What is the exact mathematical relationship between code_verifier and code_challenge?',
      scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0],
    },
  ],
};

const DEFAULT_INTERVIEWS: InterviewSession[] = [
  {
    id: 'int_session_01',
    date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    role: 'Full Stack / Backend Engineer',
    company: 'Stripe',
    interviewerPersona: 'Staff Platform Engineer, Core Infrastructure',
    interviewType: 'Technical & System Design',
    status: 'completed',
    questions: [
      {
        id: 'q1',
        category: 'System Design',
        question:
          'How would you ensure exactly-once processing or idempotency when receiving payment webhook events from external banks that might retry upon network timeouts?',
        contextOrIntent: 'Tests understanding of idempotency keys, atomic locks, distributed deduplication, and database outbox pattern.',
        evaluationCriteria: ['Idempotency key usage', 'Database unique constraint or Redis lock', 'Atomic transaction handling'],
      },
      {
        id: 'q2',
        category: 'Distributed Databases',
        question:
          'In a financial ledger database, what transaction isolation level would you select in PostgreSQL, and how do you handle concurrent balance debits without race conditions?',
        contextOrIntent: 'Tests ACID guarantees, SELECT FOR UPDATE row-level locking, optimistic vs pessimistic locking.',
        evaluationCriteria: ['Isolation levels (Read Committed vs Serializable)', 'Pessimistic locking vs Optimistic version checks', 'Deadlock prevention'],
      },
      {
        id: 'q3',
        category: 'Architecture & Reliability',
        question:
          'Suppose your primary database replica undergoes an unexpected failover during a batch payout execution. How does your service detect this and safely recover?',
        contextOrIntent: 'Tests fault recovery, health-checking, circuit breakers, and idempotent replay.',
        evaluationCriteria: ['Graceful error handling', 'Circuit breakers / retry with exponential backoff', 'Reconciliation jobs'],
      },
    ],
    answers: {
      q1: 'I implement idempotency using a unique idempotency key passed in the request header or payload. In the database, I store processed keys in an idempotency table with a unique constraint. When a request arrives, we first check Redis with an atomic SETNX to acquire an execution lock with a short TTL. If present, we return the cached response or wait. If not present, we process the payment inside a database transaction, insert the idempotency record, and commit. Even if the external bank retries three times, subsequent attempts find the committed record and receive the exact same response without re-executing.',
      q2: 'For financial ledgers, Read Committed is usually insufficient if we have concurrent reads and writes, though it is the PostgreSQL default. Repeatable Read prevents non-repeatable reads and phantom reads in Postgres (using snapshot isolation). However, for balance debits, the standard approach is pessimistic locking using SELECT ... FOR UPDATE on the user account row so that concurrent debit transactions queue up serially. Alternatively, we can use optimistic concurrency with a version column and retry if a conflict is detected.',
      q3: 'When a database failover occurs, connections in the pool drop and throw connection refused or read-only replica errors. The service must catch these via an exponential backoff retry policy wrapped in a circuit breaker. For the in-flight batch payout, because each payout item records its processing state idempotently with a UUID, when the service reconnects to the newly promoted primary, a background reconciliation worker resumes the batch by querying for records in PENDING state and verifying their status against the upstream payment gateway.',
    },
    timings: {
      q1: 85,
      q2: 78,
      q3: 92,
    },
    totalDurationSeconds: 255,
    measuredPaceWpm: 142,
    measuredFillerWords: 4,
    cameraUsed: true,
    evaluation: {
      overallScore: 88,
      verdict: 'Ready for Target Role',
      dimensionScores: {
        technicalAccuracy: {
          score: 92,
          feedback: 'Accurate explanation of PostgreSQL snapshot isolation and SELECT FOR UPDATE row-level locks.',
        },
        depthOfReasoning: {
          score: 86,
          feedback: 'Strong discussion of atomic locks and database unique constraints. Could further analyze distributed deadlocks.',
        },
        answerRelevance: {
          score: 90,
          feedback: 'Directly addressed the failure modes posed in each prompt.',
        },
        answerStructure: {
          score: 85,
          feedback: 'Clean problem formulation followed by concrete architectural solution and error mitigation.',
        },
        communicationClarity: {
          score: 88,
          feedback: 'Measured pace at 142 words/minute with minimal filler words (4 detected). Very articulate.',
        },
      },
      speechDeliveryAnalysis: {
        pacingFeedback: 'Your pace of 142 WPM is in the sweet spot for technical communication (130-160 WPM).',
        fillerWordFeedback: 'Only 4 filler words detected across 4+ minutes of speech. Excellent economy of words.',
        presenceObservation: 'Steady communication cadence observed throughout all responses.',
      },
      keyStrengths: [
        'Precise understanding of PostgreSQL row locking vs snapshot isolation',
        'Strong practical knowledge of Redis atomic SETNX and idempotency keys',
        'Effective use of reconciliation workers for asynchronous failover recovery',
      ],
      improvementAreas: [
        'Explore distributed deadlock detection and retry backoff strategies in high-contention accounts',
        'Mention distributed tracing (e.g. trace ID correlation across bank retries)',
      ],
      questionBreakdowns: [
        {
          questionNumber: 1,
          question: 'How would you ensure exactly-once processing or idempotency when receiving payment webhook events from external banks that might retry upon network timeouts?',
          score: 92,
          strongPoints: 'Covered atomic Redis locks + PostgreSQL transactional table with unique constraints.',
          missedConcepts: 'Could briefly mention handling requests that fail mid-flight before committing.',
          modelAnswerKeyPoints: ['Unique constraint on Idempotency-Key', 'Transactional Outbox pattern', 'Deterministic error replay'],
        },
        {
          questionNumber: 2,
          question: 'In a financial ledger database, what transaction isolation level would you select in PostgreSQL, and how do you handle concurrent balance debits without race conditions?',
          score: 88,
          strongPoints: 'Correctly contrasted Read Committed with Repeatable Read and explained SELECT FOR UPDATE.',
          missedConcepts: 'Could discuss write skews or serializable snapshot isolation (SSI).',
          modelAnswerKeyPoints: ['Pessimistic SELECT FOR UPDATE', 'Optimistic Versioning', 'Serialization failure retry loops'],
        },
        {
          questionNumber: 3,
          question: 'Suppose your primary database replica undergoes an unexpected failover during a batch payout execution. How does your service detect this and safely recover?',
          score: 85,
          strongPoints: 'Highlighted connection pool eviction, circuit breakers, and state reconciliation.',
          missedConcepts: 'Could address split-brain scenarios and read-after-write replication lag.',
          modelAnswerKeyPoints: ['Circuit breaker pattern', 'Idempotent state reconciliation worker', 'Replication lag mitigation'],
        },
      ],
      recommendedMemoryRevivalTopics: [
        {
          topic: 'PostgreSQL Isolation Levels & Anomalies',
          subtopic: 'Read Committed vs Repeatable Read vs Serializable',
          reason: 'Essential for technical bar raisers in fintech and distributed systems interviews.',
          keyConcepts: 'Dirty Read (G0/G1), Non-repeatable Read (G2a), Phantom Read (A3), Serialization Anomaly (G-skew).',
        },
        {
          topic: 'Distributed Locks with Redis',
          subtopic: 'Redlock Algorithm & Clock Drift Trade-offs',
          reason: 'Deepens reasoning when interviewers push back on single-node Redis locks.',
          keyConcepts: 'Fencing tokens, Martin Kleppmann critique of Redlock, TTL lease expiry safety.',
        },
      ],
    },
  },
];

const DEFAULT_MEMORY_TOPICS: MemoryTopic[] = [
  {
    id: 'mem_top_01',
    topic: 'Database Isolation Levels & Anomalies',
    subtopic: 'Repeatable Read vs Serializable in PostgreSQL',
    notes: 'In PostgreSQL, Read Committed is the default. Repeatable Read uses Multiversion Concurrency Control (MVCC) snapshot isolation—it prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads! However, it does not prevent Write Skew or Serialization Anomalies. Serializable uses SSI (Serializable Snapshot Isolation) which detects rw-antidependencies and aborts transactions with code 40001 (must retry).',
    learningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    intervals: [1, 3, 7, 14, 30],
    currentIntervalIndex: 1, // due for review!
    nextDueDate: new Date().toISOString().split('T')[0], // Today!
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    sourceTag: 'career-fit',
    reviewHistory: [
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        scorePercent: 100,
        confidence: 'High',
        intervalAssignedDays: 3,
        struggled: false,
      },
    ],
    lastRefresher: null,
  },
  {
    id: 'mem_top_02',
    topic: 'CAP Theorem & PACELC Trade-offs',
    subtopic: 'Consistency vs Availability during Partitions',
    notes: 'CAP states in the presence of a network partition (P), you must choose between Consistency (C) and Availability (A). PACELC extends this: if there is Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C). DynamoDB is PA/EL. PostgreSQL single-primary is PC/EC.',
    learningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    intervals: [1, 3, 7, 14, 30],
    currentIntervalIndex: 0,
    nextDueDate: new Date().toISOString().split('T')[0], // Today!
    lastReviewedAt: null,
    sourceTag: 'mock-interview',
    reviewHistory: [],
    lastRefresher: null,
  },
  {
    id: 'mem_top_03',
    topic: 'OAuth 2.0 Grant Flows & PKCE',
    subtopic: 'Authorization Code Flow with Proof Key for Code Exchange',
    notes: 'Used for single-page applications and mobile clients where client secrets cannot be securely stored. Client generates code_verifier (random cryptographic string) and calculates code_challenge (SHA256). Auth server verifies challenge on initial request and validates code_verifier when exchanging authorization code for access/refresh tokens.',
    learningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    intervals: [1, 3, 7, 14, 30],
    currentIntervalIndex: 2,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], // Tomorrow
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    sourceTag: 'career-fit',
    reviewHistory: [
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        scorePercent: 100,
        confidence: 'High',
        intervalAssignedDays: 1,
        struggled: false,
      },
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        scorePercent: 100,
        confidence: 'Medium',
        intervalAssignedDays: 3,
        struggled: false,
      },
    ],
    lastRefresher: null,
  },
  {
    id: 'mem_top_04',
    topic: 'Cache Invalidation Patterns',
    subtopic: 'Cache-Aside vs Write-Through vs Write-Behind',
    notes: 'Cache-Aside (Lazy loading): App reads from cache; on miss, reads DB, writes to cache. On DB update, invalidate (delete) key in cache, do not overwrite (prevents race conditions). Write-Through: Cache updated synchronously with DB. Write-Behind (Write-Back): Write to cache immediately, async write to DB (risk of data loss on crash).',
    learningDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    intervals: [1, 3, 7, 14, 30],
    currentIntervalIndex: 3,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    sourceTag: 'manual',
    reviewHistory: [
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
        scorePercent: 100,
        confidence: 'High',
        intervalAssignedDays: 1,
        struggled: false,
      },
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        scorePercent: 100,
        confidence: 'High',
        intervalAssignedDays: 3,
        struggled: false,
      },
      {
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        scorePercent: 100,
        confidence: 'High',
        intervalAssignedDays: 7,
        struggled: false,
      },
    ],
    lastRefresher: null,
  },
];

export const EMPTY_PROFILE: UserProfile = {
  studentName: '',
  targetRole: '',
  targetCompany: '',
  targetJobDescription: '',
  githubUrl: '',
  codingPlatformUrl: '',
  resumeFileName: '',
  resumeText: '',
  lastUpdated: new Date().toISOString(),
};

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading profile from localStorage', e);
    }
    return EMPTY_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  },

  getCareerFitHistory(): CareerFitAnalysis[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREER_FIT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading career fit history', e);
    }
    return [];
  },

  saveCareerFit(analysis: CareerFitAnalysis): void {
    try {
      const list = this.getCareerFitHistory();
      const updated = [analysis, ...list.filter((item) => item.id !== analysis.id)];
      localStorage.setItem(STORAGE_KEYS.CAREER_FIT, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving career fit', e);
    }
  },

  getLatestCareerFit(): CareerFitAnalysis | null {
    const list = this.getCareerFitHistory();
    return list.length > 0 ? list[0] : null;
  },

  getInterviews(): InterviewSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading interviews', e);
    }
    return [];
  },

  saveInterview(session: InterviewSession): void {
    try {
      const list = this.getInterviews();
      const updated = [session, ...list.filter((s) => s.id !== session.id)];
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving interview', e);
    }
  },

  getMemoryTopics(): MemoryTopic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORY_TOPICS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading memory topics', e);
    }
    return [];
  },

  saveMemoryTopic(topic: MemoryTopic): void {
    try {
      const list = this.getMemoryTopics();
      const index = list.findIndex((t) => t.id === topic.id);
      let updated: MemoryTopic[];
      if (index >= 0) {
        updated = [...list];
        updated[index] = topic;
      } else {
        updated = [topic, ...list];
      }
      localStorage.setItem(STORAGE_KEYS.MEMORY_TOPICS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving memory topic', e);
    }
  },

  deleteMemoryTopic(id: string): void {
    try {
      const list = this.getMemoryTopics();
      const updated = list.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.MEMORY_TOPICS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting topic', e);
    }
  },

  loadSampleDemo(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      localStorage.setItem(STORAGE_KEYS.CAREER_FIT, JSON.stringify([DEFAULT_CAREER_FIT]));
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(DEFAULT_INTERVIEWS));
      localStorage.setItem(STORAGE_KEYS.MEMORY_TOPICS, JSON.stringify(DEFAULT_MEMORY_TOPICS));
    } catch (e) {
      console.error('Error loading sample demo', e);
    }
  },

  loadSampleData(): void {
    this.loadSampleDemo();
  },

  getAuthUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading auth user', e);
    }
    return DEMO_USERS.alex.user;
  },

  saveAuthUser(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error('Error saving auth user', e);
    }
  },

  autoSyncStudyPlanToMemory(
    plan: DayStudyPlanItem[],
    company: string,
    materials?: SkillGapStudyMaterial[]
  ): MemoryTopic[] {
    const existing = this.getMemoryTopics();
    const createdTopics: MemoryTopic[] = [];

    plan.forEach((item) => {
      const duplicate = existing.find(
        (t) => t.topic === item.focusTitle || (t.dayNumber === item.dayNumber && t.targetCompany === company)
      );
      if (duplicate) return;

      const matchingMaterial = materials?.find(
        (m) => m.skillOrRequirement.toLowerCase() === item.targetSkill.toLowerCase()
      );

      const dueDate = item.scheduledDate || (() => {
        const d = new Date();
        d.setDate(d.getDate() + (item.dayNumber === 7 ? 6 : item.dayNumber - 1));
        return d.toISOString().split('T')[0];
      })();

      const notes = [
        `Focus: ${item.focusTitle}`,
        `Target Company Context: ${item.companyContextSnippet}`,
        `Objectives: ${item.learningObjectives?.join('; ') || ''}`,
        `Action Items: ${item.actionItems?.join('; ') || ''}`,
        matchingMaterial?.studentBackgroundBridge ? `Bridge: ${matchingMaterial.studentBackgroundBridge}` : '',
        matchingMaterial?.coreConcepts ? `Core Concepts: ${matchingMaterial.coreConcepts.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const newTopic: MemoryTopic = {
        id: `mem_study_day${item.dayNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        topic: item.focusTitle,
        subtopic: item.isRevisionDay ? `Day ${item.revisesDayNumber || 1} Spaced Review Checkpoint` : `${item.targetSkill} (${company})`,
        notes,
        learningDate: new Date().toISOString(),
        intervals: item.isRevisionDay ? [7, 14, 30] : [1, 3, 7, 14, 30],
        currentIntervalIndex: 0,
        nextDueDate: dueDate,
        lastReviewedAt: null,
        reviewHistory: [],
        lastRefresher: null,
        sourceTag: 'study-plan',
        dayNumber: item.dayNumber,
        isRevision: item.isRevisionDay,
        revisesDayNumber: item.revisesDayNumber,
        targetCompany: company,
        studyResources: matchingMaterial?.studyResources || [],
        keyPitfalls: matchingMaterial?.keyPitfallsToAvoid || [],
      };

      createdTopics.push(newTopic);
    });

    if (createdTopics.length > 0) {
      const merged = [...createdTopics, ...existing];
      try {
        localStorage.setItem(STORAGE_KEYS.MEMORY_TOPICS, JSON.stringify(merged));
      } catch (e) {
        console.error('Error saving auto-synced memory topics', e);
      }
      return merged;
    }

    return existing;
  },

  autoSyncInterviewToMemory(interview: InterviewSession): MemoryTopic[] {
    if (!interview.evaluation) return this.getMemoryTopics();

    const existing = this.getMemoryTopics();
    const createdTopics: MemoryTopic[] = [];

    interview.evaluation.recommendedMemoryRevivalTopics?.forEach((rec) => {
      const isDup = existing.find((t) => t.topic.toLowerCase() === rec.topic.toLowerCase());
      if (isDup) return;

      const dueTomorrow = new Date();
      dueTomorrow.setDate(dueTomorrow.getDate() + 1);

      createdTopics.push({
        id: `mem_interview_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        topic: `${rec.topic} (${interview.company})`,
        subtopic: rec.subtopic,
        notes: `Interview Missed Concept (${interview.company} - ${interview.role}):\n${rec.reason}\n\nKey Concepts:\n${rec.keyConcepts}`,
        learningDate: new Date().toISOString(),
        intervals: [1, 3, 7, 14, 30],
        currentIntervalIndex: 0,
        nextDueDate: dueTomorrow.toISOString().split('T')[0],
        lastReviewedAt: null,
        reviewHistory: [],
        lastRefresher: null,
        sourceTag: 'mock-interview',
        targetCompany: interview.company,
      });
    });

    interview.evaluation.questionBreakdowns?.forEach((qb) => {
      if (qb.missedConcepts && qb.missedConcepts.length > 5 && qb.score < 80) {
        const topicName = `Missed: ${qb.question.slice(0, 45)}...`;
        const isDup = existing.find((t) => t.topic === topicName);
        if (isDup) return;

        const dueToday = new Date().toISOString().split('T')[0];
        createdTopics.push({
          id: `mem_qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          topic: topicName,
          subtopic: `Question ${qb.questionNumber} Feedback (${interview.company})`,
          notes: `Question: ${qb.question}\n\nMissed Concept:\n${qb.missedConcepts}\n\nModel Answer Key Points:\n${qb.modelAnswerKeyPoints?.join('\n• ') || 'N/A'}`,
          learningDate: new Date().toISOString(),
          intervals: [1, 3, 7, 14, 30],
          currentIntervalIndex: 0,
          nextDueDate: dueToday,
          lastReviewedAt: null,
          reviewHistory: [],
          lastRefresher: null,
          sourceTag: 'mock-interview',
          targetCompany: interview.company,
        });
      }
    });

    if (createdTopics.length > 0) {
      const merged = [...createdTopics, ...existing];
      try {
        localStorage.setItem(STORAGE_KEYS.MEMORY_TOPICS, JSON.stringify(merged));
      } catch (e) {
        console.error('Error auto-syncing interview topics', e);
      }
      return merged;
    }

    return existing;
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CAREER_FIT);
    localStorage.removeItem(STORAGE_KEYS.INTERVIEWS);
    localStorage.removeItem(STORAGE_KEYS.MEMORY_TOPICS);
  },
};
