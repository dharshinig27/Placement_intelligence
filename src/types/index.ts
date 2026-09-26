export type ModuleTab = 'overview' | 'career-fit' | 'mock-interview' | 'memory-revival' | 'progress' | 'login';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  targetCompany: string;
  isDemoUser?: boolean;
}

export interface StudyResource {
  title: string;
  type: 'Documentation' | 'Architecture Guide' | 'Official Paper' | 'Code Drill' | 'Video/Lecture';
  url?: string;
  description: string;
}

export interface SkillGapStudyMaterial {
  skillOrRequirement: string;
  companyContext: string;
  studentBackgroundBridge: string;
  coreConcepts: string[];
  suggestedStudyHours: number;
  studyResources: StudyResource[];
  codeSnippetExample?: string;
  interviewQuestionsAsked: string[];
  keyPitfallsToAvoid: string[];
}

export interface DayStudyPlanItem {
  dayNumber: number; // 1, 2, 3, 4, 5, 6, 7, 14
  isRevisionDay: boolean; // true for day 7, 14
  revisesDayNumber?: number; // e.g. 1
  focusTitle: string;
  targetSkill: string;
  companyContextSnippet: string;
  learningObjectives: string[];
  actionItems: string[];
  estimatedMinutes: number;
  retrievalQuizPrompt: string;
  scheduledDate: string; // YYYY-MM-DD
}

export interface CompanyEngineeringProfile {
  companyName: string;
  domain: string;
  techStackHighlights: string[];
  interviewCulture: string;
  coreEngineeringValues: string[];
}

export interface UserProfile {
  studentName: string;
  targetRole: string;
  targetCompany: string;
  targetJobDescription: string;
  githubUrl: string;
  codingPlatformUrl: string;
  resumeFileName?: string;
  resumeText: string;
  resumePdfBase64?: string;
  skills?: string[];
  education?: string;
  summary?: string;
  lastUpdated: string;
}

export interface ParsedResumeData {
  studentName?: string;
  inferredRole?: string;
  summary?: string;
  skills?: string[];
  topProjects?: Array<{ name: string; description: string; technologies: string[] }>;
  education?: string;
  githubUrl?: string;
  extractedResumeText?: string;
}

export interface RequirementEvidence {
  requirement: string;
  isDemonstrated: boolean;
  directEvidenceCitation: string;
  analysisNote: string;
}

export interface DemonstratedSkill {
  skill: string;
  source: 'Resume' | 'GitHub' | 'CodingPlatform';
  evidenceSnippet: string;
  proficiencyAssessment: string;
}

export interface MissingEvidence {
  skillOrRequirement: string;
  status: string; // "not demonstrated in your submitted evidence"
  impact: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
}

export interface ProjectGap {
  identifiedGap: string;
  suggestedProjectTitle: string;
  suggestedProjectDescription: string;
  keyTechnologiesToUse: string[];
}

export interface RubricScore {
  coreTechnicalFit: number; // 0-40
  experienceAndProjects: number; // 0-30
  problemSolvingAndCoding: number; // 0-15
  domainAndTooling: number; // 0-15
  totalScore: number; // 0-100
  rubricExplanation: string;
}

export interface PrioritizedRecommendation {
  priority: 'Immediate' | 'Next Week' | 'Before Interview';
  action: string;
  rationale: string;
  linkedModule: 'MockInterview' | 'MemoryRevival' | 'PortfolioProject';
}

export interface CareerFitAnalysis {
  id: string;
  analyzedAt: string;
  targetRole: string;
  targetCompany: string;
  summary: string;
  companyEngineeringProfile?: CompanyEngineeringProfile;
  evidenceRequirements: RequirementEvidence[];
  demonstratedSkills: DemonstratedSkill[];
  missingOrUnverifiedEvidence: MissingEvidence[];
  projectGaps: ProjectGap[];
  rubricScore: RubricScore;
  prioritizedRecommendations: PrioritizedRecommendation[];
  studyMaterials?: SkillGapStudyMaterial[];
  studyPlan?: DayStudyPlanItem[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  contextOrIntent: string;
  evaluationCriteria: string[];
}

export interface DimensionScore {
  score: number;
  feedback: string;
}

export interface QuestionBreakdown {
  questionNumber: number;
  question: string;
  score: number;
  strongPoints: string;
  missedConcepts: string;
  modelAnswerKeyPoints: string[];
}

export interface RecommendedMemoryTopic {
  topic: string;
  subtopic: string;
  reason: string;
  keyConcepts: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  verdict: string;
  dimensionScores: {
    technicalAccuracy: DimensionScore;
    depthOfReasoning: DimensionScore;
    answerRelevance: DimensionScore;
    answerStructure: DimensionScore;
    communicationClarity: DimensionScore;
  };
  speechDeliveryAnalysis: {
    pacingFeedback: string;
    fillerWordFeedback: string;
    presenceObservation: string;
  };
  keyStrengths: string[];
  improvementAreas: string[];
  questionBreakdowns: QuestionBreakdown[];
  recommendedMemoryRevivalTopics: RecommendedMemoryTopic[];
}

export interface InterviewSession {
  id: string;
  date: string;
  role: string;
  company: string;
  interviewerPersona: string;
  interviewType: 'Technical & System Design' | 'Core Architecture & Coding' | 'Behavioral & Leadership' | 'Comprehensive Role Bar-Raiser';
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  timings: Record<string, number>; // duration per question in seconds
  totalDurationSeconds: number;
  measuredPaceWpm: number;
  measuredFillerWords: number;
  cameraUsed: boolean;
  evaluation: InterviewEvaluation | null;
  status: 'draft' | 'in-progress' | 'evaluating' | 'completed';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface TopicRefresher {
  topic: string;
  coreIntuition: string;
  keyMentalModel: string;
  commonPitfall: string;
  immediateCheckQuestion: string;
  immediateCheckAnswer: string;
}

export interface ReviewAttempt {
  reviewedAt: string;
  scorePercent: number;
  confidence: 'Low' | 'Medium' | 'High';
  intervalAssignedDays: number;
  struggled: boolean;
}

export interface MemoryTopic {
  id: string;
  topic: string;
  subtopic: string;
  notes: string;
  learningDate: string; // ISO date string
  intervals: number[]; // e.g. [1, 3, 7, 14, 30]
  currentIntervalIndex: number;
  nextDueDate: string; // ISO date string (YYYY-MM-DD)
  lastReviewedAt: string | null;
  reviewHistory: ReviewAttempt[];
  lastRefresher: TopicRefresher | null;
  sourceTag?: 'manual' | 'career-fit' | 'mock-interview' | 'study-plan';
  dayNumber?: number; // e.g. 1 for Day 1 study, 7 for Day 7 revision
  isRevision?: boolean;
  revisesDayNumber?: number;
  targetCompany?: string;
  studyResources?: StudyResource[];
  keyPitfalls?: string[];
}
