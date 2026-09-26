import { CareerFitAnalysis, InterviewEvaluation, InterviewQuestion, QuizQuestion, TopicRefresher } from '../types';

export const ApiService = {
  async checkHealth(): Promise<{ status: string; hasApiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (e: any) {
      return { status: 'error', hasApiKey: false };
    }
  },

  async fetchGitHubProfile(usernameOrUrl: string) {
    const res = await fetch('/api/github/fetch-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrUrl }),
    });
    return await res.json();
  },

  async parseResume(params: {
    resumeText?: string;
    resumePdfBase64?: string;
  }): Promise<{ success: boolean; parsed?: any; error?: string }> {
    const res = await fetch('/api/resume/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to parse resume');
    }
    return data;
  },

  async analyzeCareerFit(params: {
    role: string;
    company: string;
    jobDescription: string;
    resumeText: string;
    resumePdfBase64?: string;
    githubData?: any;
    codingProfileData?: any;
  }): Promise<{ success: boolean; analysis?: CareerFitAnalysis; error?: string }> {
    const res = await fetch('/api/career-fit/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to analyze career fit');
    }
    return data;
  },

  async generateInterviewQuestions(params: {
    role: string;
    company: string;
    jobDescription: string;
    resumeSummary: string;
    interviewType: string;
    questionCount?: number;
  }): Promise<{
    success: boolean;
    interviewerPersona: string;
    openingRemarks: string;
    questions: InterviewQuestion[];
  }> {
    const res = await fetch('/api/interview/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate interview questions');
    }
    return data;
  },

  async evaluateInterview(params: {
    role: string;
    company: string;
    jobDescription: string;
    questionsAndAnswers: Array<{
      category: string;
      question: string;
      answer: string;
    }>;
    measuredPaceWpm?: number;
    measuredFillerWords?: number;
    totalDurationSeconds?: number;
  }): Promise<{ success: boolean; evaluation?: InterviewEvaluation; error?: string }> {
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to evaluate interview');
    }
    return data;
  },

  async generateRetrievalQuiz(params: {
    topic: string;
    subtopic: string;
    notes: string;
    repetitionLevel?: number;
  }): Promise<{ success: boolean; quizTitle: string; questions: QuizQuestion[] }> {
    const res = await fetch('/api/memory/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate retrieval quiz');
    }
    return data;
  },

  async generateRefresher(params: {
    topic: string;
    subtopic: string;
    questionText: string;
    studentChoice: string;
    correctExplanation: string;
    originalNotes: string;
  }): Promise<{ success: boolean; refresher: TopicRefresher }> {
    const res = await fetch('/api/memory/generate-refresher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate refresher');
    }
    return data;
  },
};
