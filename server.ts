import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));

// Server-side Gemini initialization with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON parsing from Gemini
function cleanAndParseJSON<T>(rawText: string, fallback: T): T {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse JSON from model output:', err, rawText);
    return fallback;
  }
}

// Resilient Gemini caller with automatic model fallback for 503 high demand
async function callGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
}) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType as any,
        },
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed, attempting next model in rotation:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// 1. Health check
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// -------------------------------------------------------------
// 1b. Real-Time Resume Parser (Gemini Multi-Modal Extraction)
// -------------------------------------------------------------
app.post('/api/resume/parse', async (req: Request, res: Response) => {
  try {
    const { resumeText, resumePdfBase64 } = req.body;

    if (!resumeText && !resumePdfBase64) {
      return res.status(400).json({ error: 'Please upload a PDF resume or provide resume text.' });
    }

    const systemPrompt = `You are a Senior Technical Talent Analyst.
Extract structured candidate information from the provided resume text or PDF document.
Be accurate and truthful to the candidate's actual submission.
Return a structured JSON object:
{
  "studentName": "Full name of the candidate, or 'Candidate'",
  "inferredRole": "Most suitable career role based on their technical background (e.g. Full Stack Engineer, Backend Engineer, ML Engineer, DevOps)",
  "summary": "2-3 sentences concise professional summary highlighting their core competencies",
  "skills": ["Language/Framework 1", "Database/Tool 2", "Skill 3"],
  "topProjects": [
    {
      "name": "Project Name",
      "description": "1-2 sentence description",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "education": "University/College and Degree/Year",
  "githubUrl": "Extracted GitHub profile URL if mentioned, or empty string",
  "extractedResumeText": "A clean, complete text transcript of the resume extracted from the document"
}`;

    const contents: any[] = [];
    if (resumePdfBase64) {
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: resumePdfBase64.replace(/^data:application\/pdf;base64,/, ''),
        },
      });
    }

    contents.push({
      text: resumeText
        ? `Please parse this resume text:\n"""\n${resumeText}\n"""`
        : `Please extract all structured data from the attached PDF resume.`,
    });

    const response = await callGeminiWithFallback({
      contents,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to extract structured data from resume.' });
    }

    return res.json({ success: true, parsed });
  } catch (error: any) {
    console.error('Error parsing resume with Gemini:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume.' });
  }
});

// -------------------------------------------------------------
// 2. GitHub Profile Fetcher (Safe server-side proxy)
// -------------------------------------------------------------
app.post('/api/github/fetch-profile', async (req: Request, res: Response) => {
  try {
    const { usernameOrUrl } = req.body;
    if (!usernameOrUrl || typeof usernameOrUrl !== 'string') {
      return res.status(400).json({ error: 'Username or URL is required' });
    }

    let username = usernameOrUrl.trim();
    if (username.includes('github.com/')) {
      const match = username.match(/github\.com\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        username = match[1];
      }
    }
    username = username.replace(/^@/, '');

    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'PlacementIntelligencePlatform',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return res.json({
          success: false,
          fallbackRequired: true,
          message: `GitHub user "${username}" was not found. Please provide details manually.`,
        });
      }
      if (userRes.status === 403) {
        return res.json({
          success: false,
          fallbackRequired: true,
          message: 'GitHub API rate limit exceeded or access restricted. Please provide details manually.',
        });
      }
      return res.json({
        success: false,
        fallbackRequired: true,
        message: `GitHub returned status ${userRes.status}. Please enter repository details manually.`,
      });
    }

    const userData = await userRes.json();

    // Fetch top recent repos
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`,
      {
        headers: {
          'User-Agent': 'PlacementIntelligencePlatform',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    let repos = [];
    if (reposRes.ok) {
      const rawRepos = await reposRes.json();
      repos = rawRepos.map((r: any) => ({
        name: r.name,
        description: r.description || 'No description provided',
        language: r.language || 'Unknown',
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
        htmlUrl: r.html_url,
      }));
    }

    // Extract primary languages
    const languageCounts: Record<string, number> = {};
    repos.forEach((r: any) => {
      if (r.language && r.language !== 'Unknown') {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    return res.json({
      success: true,
      profile: {
        username: userData.login,
        name: userData.name || userData.login,
        bio: userData.bio || '',
        publicRepos: userData.public_repos,
        followers: userData.followers,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
        topLanguages,
        recentRepositories: repos,
      },
    });
  } catch (error: any) {
    console.error('Error fetching GitHub profile:', error);
    return res.status(500).json({
      success: false,
      fallbackRequired: true,
      message: 'Failed to reach GitHub. Please enter profile details manually.',
    });
  }
});

// -------------------------------------------------------------
// 3. Career Fit Analyzer
// -------------------------------------------------------------
app.post('/api/career-fit/analyze', async (req: Request, res: Response) => {
  try {
    const {
      role,
      company,
      jobDescription,
      resumeText,
      resumePdfBase64,
      githubData,
      codingProfileData,
    } = req.body;

    if (!role || !jobDescription) {
      return res.status(400).json({ error: 'Target role and Job Description are required' });
    }

    const contents: any[] = [];

    // System instruction enforcing the mandatory evidence-based phrasing
    const systemPrompt = `You are the chief Placement Intelligence & Career Fit Evaluator.
Your job is to rigorously compare candidate evidence (Resume, GitHub activity, Coding profiles) against the provided Job Description and Target Role.

CRITICAL ASSESSMENT RULE:
For company-specific matching, use the job description or verified role requirements as the source of truth.
When a requirement is not demonstrated in the submitted materials, you MUST explicitly state: "not demonstrated in your submitted evidence", rather than claiming the student lacks a skill or does not know the subject.
Do not fabricate company requirements, repository activity, coding statistics, or skills.
Provide a transparent match score based strictly on an evidence rubric (Core Technical Fit 40%, Experience & Projects 30%, Problem Solving & Coding 15%, Domain & Tooling 15%). Clearly explain the rubric and state that this represents evidence match density, NOT an official company hiring decision or hiring probability.`;

    let userPromptText = `TARGET ROLE: ${role}
TARGET COMPANY: ${company || 'Not Specified'}

VERIFIED JOB DESCRIPTION (SOURCE OF TRUTH):
"""
${jobDescription}
"""

CANDIDATE SUBMITTED EVIDENCE:
`;

    if (resumeText) {
      userPromptText += `\nRESUME / CV CONTENT:\n"""\n${resumeText}\n"""\n`;
    }

    if (githubData) {
      userPromptText += `\nGITHUB PROFILE & REPOSITORIES EVIDENCE:\n"""\n${JSON.stringify(githubData, null, 2)}\n"""\n`;
    }

    if (codingProfileData) {
      userPromptText += `\nCODING PLATFORM EVIDENCE (e.g. LeetCode / Competitive Programming):\n"""\n${JSON.stringify(codingProfileData, null, 2)}\n"""\n`;
    }

    userPromptText += `
Please analyze the candidate's submitted evidence against every requirement in the job description.
Return a structured JSON object strictly matching this schema:
{
  "summary": "2-3 sentences objective overview of the candidate's alignment with the role based only on evidence submitted",
  "evidenceRequirements": [
    {
      "requirement": "specific requirement from Job Description",
      "isDemonstrated": boolean,
      "directEvidenceCitation": "exact quote or project link/name from resume/github, or 'None found in submitted materials'",
      "analysisNote": "detailed reasoning. If not demonstrated, use the exact phrase 'not demonstrated in your submitted evidence'."
    }
  ],
  "demonstratedSkills": [
    {
      "skill": "skill name",
      "source": "Resume" | "GitHub" | "CodingPlatform",
      "evidenceSnippet": "short proof citation from evidence",
      "proficiencyAssessment": "Demonstrated via project X / Verified via repository Y"
    }
  ],
  "missingOrUnverifiedEvidence": [
    {
      "skillOrRequirement": "name of missing requirement",
      "status": "not demonstrated in your submitted evidence",
      "impact": "High" | "Medium" | "Low",
      "recommendedAction": "practical step to demonstrate this evidence"
    }
  ],
  "projectGaps": [
    {
      "identifiedGap": "what domain or architectural need is missing from candidate's portfolio",
      "suggestedProjectTitle": "concrete project title to build",
      "suggestedProjectDescription": "concise description of a portfolio project that would provide verified proof for this gap",
      "keyTechnologiesToUse": ["tech1", "tech2"]
    }
  ],
  "rubricScore": {
    "coreTechnicalFit": number, // out of 40
    "experienceAndProjects": number, // out of 30
    "problemSolvingAndCoding": number, // out of 15
    "domainAndTooling": number, // out of 15
    "totalScore": number, // sum (0-100)
    "rubricExplanation": "transparent explanation of how this score was calculated from submitted evidence vs JD requirements"
  },
  "prioritizedRecommendations": [
    {
      "priority": "Immediate" | "Next Week" | "Before Interview",
      "action": "actionable task",
      "rationale": "why this strengthens evidence",
      "linkedModule": "MockInterview" | "MemoryRevival" | "PortfolioProject"
    }
  ],
  "companyEngineeringProfile": {
    "companyName": "${company || 'Target Company'}",
    "domain": "e.g. High-Volume Payment Rails & Financial Ledger Systems / Global Cloud Infrastructure",
    "techStackHighlights": ["Technology 1", "Database/Architecture 2", "Tool 3"],
    "interviewCulture": "Detailed explanation of what this company looks for (e.g. system design depth, idempotency, edge cases, distributed failure modes)",
    "coreEngineeringValues": ["Value 1", "Value 2", "Value 3"]
  },
  "studyMaterials": [
    {
      "skillOrRequirement": "exact name of the missing skill or requirement",
      "companyContext": "Detailed explanation of why ${company || 'this company'} specifically demands this skill and how it is applied in their production systems.",
      "studentBackgroundBridge": "Concrete bridge connecting the candidate's existing background/skills to what they need to master for this role.",
      "coreConcepts": ["Key concept 1", "Key concept 2", "Key concept 3"],
      "suggestedStudyHours": number (e.g. 4 to 8),
      "studyResources": [
        {
          "title": "Resource title (e.g. Official Documentation / Whitepaper / Architecture Guide)",
          "type": "Documentation" | "Architecture Guide" | "Official Paper" | "Code Drill",
          "url": "https://... or documentation reference",
          "description": "Why the candidate should read this specific resource"
        }
      ],
      "codeSnippetExample": "A realistic code pattern or architecture snippet illustrating the solution in production.",
      "interviewQuestionsAsked": ["Real company interview question 1", "Real question 2"],
      "keyPitfallsToAvoid": ["Common pitfall or rookie mistake candidates make in interviews"]
    }
  ],
  "studyPlan": [
    {
      "dayNumber": 1,
      "isRevisionDay": false,
      "focusTitle": "Day 1: [Topic Title grounded in Company Stack]",
      "targetSkill": "Target skill name",
      "companyContextSnippet": "Why this matters at ${company || 'the target company'}",
      "learningObjectives": ["Objective 1", "Objective 2"],
      "actionItems": ["Read resource X", "Write code drill Y"],
      "estimatedMinutes": 60,
      "retrievalQuizPrompt": "Core retrieval question to test recall",
      "scheduledDate": "YYYY-MM-DD"
    },
    {
      "dayNumber": 2,
      "isRevisionDay": false,
      "focusTitle": "Day 2: [Architecture & Implementation]",
      "targetSkill": "Target skill name",
      "companyContextSnippet": "Implementation details for ${company || 'the company'}",
      "learningObjectives": ["Objective 1", "Objective 2"],
      "actionItems": ["Action 1", "Action 2"],
      "estimatedMinutes": 60,
      "retrievalQuizPrompt": "Core retrieval question",
      "scheduledDate": "YYYY-MM-DD"
    },
    {
      "dayNumber": 3,
      "isRevisionDay": false,
      "focusTitle": "Day 3: [Edge Cases & Failure Recovery]",
      "targetSkill": "Target skill name",
      "companyContextSnippet": "Resilience patterns",
      "learningObjectives": ["Objective 1", "Objective 2"],
      "actionItems": ["Action 1"],
      "estimatedMinutes": 60,
      "retrievalQuizPrompt": "Core retrieval question",
      "scheduledDate": "YYYY-MM-DD"
    },
    {
      "dayNumber": 7,
      "isRevisionDay": true,
      "revisesDayNumber": 1,
      "focusTitle": "Day 7 Spaced Revision: Active Recall of Day 1 [Topic]",
      "targetSkill": "Day 1 target skill",
      "companyContextSnippet": "Spaced repetition review to prevent forgetting curve for ${company || 'company'} interview readiness",
      "learningObjectives": ["Recall Day 1 principles without looking at notes", "Solve 3-minute rapid retrieval challenge"],
      "actionItems": ["Complete active retrieval quiz in Memory Revival", "Explain concept aloud using STAR method"],
      "estimatedMinutes": 30,
      "retrievalQuizPrompt": "High-pressure recall check on Day 1 concepts",
      "scheduledDate": "YYYY-MM-DD"
    }
  ]
}`;

    // If PDF base64 is provided, attach it as inlineData
    if (resumePdfBase64) {
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: resumePdfBase64.replace(/^data:application\/pdf;base64,/, ''),
        },
      });
    }

    contents.push({ text: userPromptText });

    const response = await callGeminiWithFallback({
      contents: contents,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse career fit analysis from AI model.' });
    }

    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error in Career Fit Analyzer:', error);
    return res.status(500).json({ error: error.message || 'Error analyzing career fit.' });
  }
});

// -------------------------------------------------------------
// 4. AI Mock Interview Simulator Endpoints
// -------------------------------------------------------------
app.post('/api/interview/generate-questions', async (req: Request, res: Response) => {
  try {
    const { role, company, jobDescription, resumeSummary, interviewType, questionCount = 4 } = req.body;

    const systemPrompt = `You are a Principal Engineering Interviewer for ${company || 'a top tech company'}.
You are conducting a ${interviewType || 'Technical & System Architecture'} mock interview for a ${role} position.
Ground your questions directly in the provided job description and candidate resume.
Ask realistic, probing questions that test technical depth, architectural reasoning, and practical trade-offs.
Do not ask trivial trivia questions; ask scenario-driven and experience-verifying questions.`;

    const userPrompt = `Role: ${role}
Company: ${company || 'Tech Company'}
Job Description:
"""
${jobDescription || 'Standard software engineering requirements'}
"""

Candidate Resume / Profile Summary:
"""
${resumeSummary || 'General software engineering student background'}
"""

Generate exactly ${questionCount} structured interview questions.
Return JSON:
{
  "interviewerPersona": "e.g. Lead Staff Engineer at ${company || 'Cloud Infrastructure'}",
  "openingRemarks": "Welcome! I'm glad to speak with you today. We'll explore your technical depth and problem-solving approaches.",
  "questions": [
    {
      "id": "q1",
      "category": "Architecture / Coding / System Design / Behavioral",
      "question": "Full question text clearly phrased as spoken by the interviewer",
      "contextOrIntent": "What the interviewer is specifically looking for in a strong answer",
      "evaluationCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"]
    }
  ]
}`;

    const response = await callGeminiWithFallback({
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', { questions: [] });
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate interview questions' });
  }
});

// Evaluate complete interview
app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      role,
      company,
      jobDescription,
      questionsAndAnswers,
      measuredPaceWpm,
      measuredFillerWords,
      totalDurationSeconds,
    } = req.body;

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
      return res.status(400).json({ error: 'Questions and answers transcript required for evaluation' });
    }

    const systemPrompt = `You are a Senior Staff Bar Raiser evaluating a candidate's mock interview.
Evaluate strictly on:
1. Technical accuracy: Are the technical assertions correct and up to date?
2. Depth of reasoning: Did they discuss edge cases, tradeoffs, and failure modes?
3. Relevance: Did the candidate answer what was asked directly?
4. Answer structure: Did they organize thoughts logically (e.g. context -> approach -> implementation -> tradeoffs)?
5. Communication clarity: Concise, precise terminology.

Treat physical appearance or facial cues as optional and DO NOT claim appearance reveals competence. Focus on substantive content.
Provide actionable constructive feedback with model answers or missed concepts for each question.`;

    const userPrompt = `Role: ${role}
Company: ${company || 'Tech Company'}
Job Description Excerpt:
"""
${jobDescription?.slice(0, 1000) || 'N/A'}
"""

MEASURED AUDIO & DELIVERY METRICS:
- Words Per Minute: ${measuredPaceWpm || 'Not recorded'}
- Detected Filler Words ("um", "uh", "like", "you know"): ${measuredFillerWords ?? 'Not measured'}
- Total Interview Duration: ${totalDurationSeconds ? `${Math.round(totalDurationSeconds)} seconds` : 'N/A'}

QUESTIONS AND CANDIDATE ANSWERS:
${questionsAndAnswers
  .map(
    (item: any, i: number) => `
QUESTION ${i + 1} (${item.category || 'General'}):
${item.question}

CANDIDATE ANSWER:
"${item.answer || '(No answer provided)'}"
`
  )
  .join('\n---\n')}

Return JSON matching this schema:
{
  "overallScore": number, // 0-100
  "verdict": "Ready for Target Role" | "Strong Foundation - Minor Gaps" | "Needs Practice on Core Concepts",
  "dimensionScores": {
    "technicalAccuracy": { "score": number (0-100), "feedback": "concise feedback" },
    "depthOfReasoning": { "score": number (0-100), "feedback": "concise feedback" },
    "answerRelevance": { "score": number (0-100), "feedback": "concise feedback" },
    "answerStructure": { "score": number (0-100), "feedback": "concise feedback" },
    "communicationClarity": { "score": number (0-100), "feedback": "concise feedback" }
  },
  "speechDeliveryAnalysis": {
    "pacingFeedback": "analysis of speaking pace based on measured ${measuredPaceWpm || 130} wpm (ideal is 130-160 wpm)",
    "fillerWordFeedback": "observation on filler words count: ${measuredFillerWords ?? 0}",
    "presenceObservation": "Speech was audible and structured. (Facial cues are optional and do not indicate technical competence)."
  },
  "keyStrengths": ["strength 1", "strength 2"],
  "improvementAreas": ["area 1", "area 2"],
  "questionBreakdowns": [
    {
      "questionNumber": number,
      "question": "question text",
      "score": number (0-100),
      "strongPoints": "what went well",
      "missedConcepts": "what key engineering concept or tradeoff was overlooked",
      "modelAnswerKeyPoints": ["point 1", "point 2"]
    }
  ],
  "recommendedMemoryRevivalTopics": [
    {
      "topic": "Specific topic name (e.g. Distributed Caching / CAP Theorem)",
      "subtopic": "Subtopic (e.g. Cache Invalidation Strategies)",
      "reason": "Why this should be reviewed based on the candidate's answers",
      "keyConcepts": "2-3 key bullet points the candidate must remember"
    }
  ]
}`;

    const response = await callGeminiWithFallback({
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse interview evaluation.' });
    }

    return res.json({ success: true, evaluation: parsed });
  } catch (error: any) {
    console.error('Error in interview evaluation:', error);
    return res.status(500).json({ error: error.message || 'Evaluation error' });
  }
});

// -------------------------------------------------------------
// 5. Memory Revival (Spaced Retrieval Practice) Endpoints
// -------------------------------------------------------------
app.post('/api/memory/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, subtopic, notes, repetitionLevel = 1 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const systemPrompt = `You are a cognitive science learning specialist designing spaced retrieval practice quizzes.
Retrieval practice must trigger active recall rather than simple recognition.
Ask exactly 3 focused conceptual retrieval questions with 4 distinct options each.
Include a subtle hint and a clear explanation for why the correct answer is right and why alternatives fail.`;

    const userPrompt = `Topic: ${topic}
Subtopic: ${subtopic || 'General Core'}
Student Notes / Key Concepts:
"""
${notes || 'Standard computer science concept'}
"""
Current Spaced Repetition Level: Day interval ${repetitionLevel}

Generate a short 3-question active retrieval quiz in JSON:
{
  "quizTitle": "Retrieval Check: ${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "Focused conceptual question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": number (0 to 3),
      "hint": "Gentle nudge without revealing the answer directly",
      "explanation": "Clear explanation of the concept and trade-offs"
    }
  ]
}`;

    const response = await callGeminiWithFallback({
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', { questions: [] });
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error generating retrieval quiz:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Generate focused refresher when student struggles
app.post('/api/memory/generate-refresher', async (req: Request, res: Response) => {
  try {
    const { topic, subtopic, questionText, studentChoice, correctExplanation, originalNotes } = req.body;

    const systemPrompt = `You are an expert tutor providing a laser-focused 2-minute concept refresher.
DO NOT generate a full-length chapter or long lesson.
Keep it strictly under 180 words:
1. Core intuition (1 sentence)
2. Crucial mental model or code pattern (1-2 sentences)
3. Common pitfall that caused the slip
4. 1-sentence quick recall check.`;

    const userPrompt = `The student struggled with this retrieval question:
Topic: ${topic} (${subtopic || ''})
Question: ${questionText}
Student Selected: ${studentChoice}
Explanation: ${correctExplanation}
Stored Notes: ${originalNotes}

Generate a concise, punchy refresher JSON:
{
  "topic": "${topic}",
  "coreIntuition": "one clear sentence",
  "keyMentalModel": "short mental model or formula",
  "commonPitfall": "why people make this mistake",
  "immediateCheckQuestion": "one simple recall question to verify understanding",
  "immediateCheckAnswer": "short answer to the recall question"
}`;

    const response = await callGeminiWithFallback({
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const parsed = cleanAndParseJSON(response.text || '{}', null);
    return res.json({ success: true, refresher: parsed });
  } catch (error: any) {
    console.error('Error generating refresher:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate refresher' });
  }
});

// -------------------------------------------------------------
// Vite middleware integration for Full-Stack development & production
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Placement Intelligence Platform server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
