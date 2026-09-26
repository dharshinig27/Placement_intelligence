import React, { useState } from 'react';
import {
  UserProfile,
  CareerFitAnalysis,
  ModuleTab,
  MemoryTopic,
  SkillGapStudyMaterial,
  DayStudyPlanItem,
} from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  Upload,
  FileText,
  Github,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  ExternalLink,
  Loader2,
  Briefcase,
  Layers,
  ChevronDown,
  User,
  Check,
  BookOpen,
  Calendar,
  Clock,
  RotateCw,
  Building,
  Zap,
} from 'lucide-react';

interface CareerFitAnalyzerProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  latestCareerFit: CareerFitAnalysis | null;
  onSaveAnalysis: (analysis: CareerFitAnalysis) => void;
  onNavigate: (tab: ModuleTab) => void;
  onAddMemoryTopic: (topic: Omit<MemoryTopic, 'id' | 'currentIntervalIndex' | 'nextDueDate' | 'lastReviewedAt' | 'reviewHistory' | 'lastRefresher'>) => void;
}

export const CareerFitAnalyzer: React.FC<CareerFitAnalyzerProps> = ({
  profile,
  onUpdateProfile,
  latestCareerFit,
  onSaveAnalysis,
  onNavigate,
  onAddMemoryTopic,
}) => {
  // Candidate info
  const [studentName, setStudentName] = useState(profile.studentName || '');
  const [role, setRole] = useState(profile.targetRole || '');
  const [company, setCompany] = useState(profile.targetCompany || '');
  const [jobDescription, setJobDescription] = useState(profile.targetJobDescription || '');
  const [resumeText, setResumeText] = useState(profile.resumeText || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [codingPlatformUrl, setCodingPlatformUrl] = useState(profile.codingPlatformUrl || '');
  const [selectedStudySkill, setSelectedStudySkill] = useState<string | null>(null);
  const [autoSyncNotice, setAutoSyncNotice] = useState<string | null>(null);

  // Upload & parsing states
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [uploadFileName, setUploadFileName] = useState(profile.resumeFileName || '');
  const [resumePdfBase64, setResumePdfBase64] = useState<string | undefined>(profile.resumePdfBase64);
  const [parsedSkills, setParsedSkills] = useState<string[]>(profile.skills || []);

  // GitHub inspection state
  const [githubData, setGithubData] = useState<any>(null);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Coding stats
  const [leetcodeSolved, setLeetcodeSolved] = useState('250');
  const [leetcodeRating, setLeetcodeRating] = useState('1750');

  // Analysis execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'form' | 'results'>(
    latestCareerFit ? 'results' : 'form'
  );

  // Memory revival added state
  const [addedTopicIds, setAddedTopicIds] = useState<Record<string, boolean>>({});

  // Auto-parse uploaded resume with Gemini
  const triggerResumeGeminiParse = async (text: string, base64?: string, filename?: string) => {
    setIsParsingResume(true);
    try {
      const res = await ApiService.parseResume({
        resumeText: text,
        resumePdfBase64: base64,
      });

      if (res.success && res.parsed) {
        const p = res.parsed;
        if (p.studentName && (!studentName || studentName === 'Candidate')) {
          setStudentName(p.studentName);
        }
        if (p.inferredRole && !role) {
          setRole(p.inferredRole);
        }
        if (p.githubUrl && !githubUrl) {
          setGithubUrl(p.githubUrl);
          handleFetchGithub(p.githubUrl);
        }
        if (p.skills && p.skills.length > 0) {
          setParsedSkills(p.skills);
        }
        if (p.extractedResumeText && !text) {
          setResumeText(p.extractedResumeText);
        }

        onUpdateProfile({
          studentName: p.studentName || studentName,
          targetRole: role || p.inferredRole || '',
          skills: p.skills || [],
          summary: p.summary || '',
          education: p.education || '',
          resumeFileName: filename || uploadFileName,
          resumeText: p.extractedResumeText || text,
          resumePdfBase64: base64,
          githubUrl: p.githubUrl || githubUrl,
        });
      }
    } catch (err) {
      console.warn('Resume parsing with Gemini encountered issue:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Handle PDF or text file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please upload a smaller file.');
      return;
    }

    setUploadFileName(file.name);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setResumePdfBase64(base64);
        await triggerResumeGeminiParse('', base64, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result as string;
        setResumeText(text);
        await triggerResumeGeminiParse(text, undefined, file.name);
      };
      reader.readAsText(file);
    }
  };

  // Fetch GitHub repos
  const handleFetchGithub = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || githubUrl).trim();
    if (!targetUrl) return;

    setIsFetchingGithub(true);
    setGithubError(null);
    try {
      const res = await ApiService.fetchGitHubProfile(targetUrl);
      if (res.success && res.profile) {
        setGithubData(res.profile);
      } else {
        setGithubError(
          res.message || 'GitHub profile could not be retrieved directly. You can cite repos manually.'
        );
      }
    } catch (err: any) {
      setGithubError('GitHub inspection failed. You may enter details manually.');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Load sample role preset for fast testing
  const handleLoadSamplePreset = (presetCompany: string, presetRole: string, presetJd: string) => {
    setCompany(presetCompany);
    setRole(presetRole);
    setJobDescription(presetJd);
  };

  // Run Career Fit Analysis
  const handleRunAnalysis = async () => {
    if (!role.trim() || !jobDescription.trim()) {
      alert('Please provide both Target Role and Job Description.');
      return;
    }

    if (!resumeText.trim() && !resumePdfBase64) {
      alert('Please upload a resume or provide your background details.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      onUpdateProfile({
        studentName,
        targetRole: role,
        targetCompany: company,
        targetJobDescription: jobDescription,
        resumeText: resumeText,
        resumePdfBase64: resumePdfBase64,
        githubUrl: githubUrl,
        codingPlatformUrl: codingPlatformUrl,
        resumeFileName: uploadFileName,
        lastUpdated: new Date().toISOString(),
      });

      const codingProfileData = codingPlatformUrl
        ? {
            url: codingPlatformUrl,
            solvedProblems: leetcodeSolved,
            contestRating: leetcodeRating,
          }
        : null;

      const result = await ApiService.analyzeCareerFit({
        role,
        company,
        jobDescription,
        resumeText,
        resumePdfBase64,
        githubData,
        codingProfileData,
      });

      if (result.success && result.analysis) {
        const fullAnalysis: CareerFitAnalysis = {
          ...result.analysis,
          id: `cf_${Date.now()}`,
          analyzedAt: new Date().toISOString(),
          targetRole: role,
          targetCompany: company,
        };

        // Auto-sync study plan and Day 7 revision checkpoints to Memory Revival
        if (fullAnalysis.studyPlan && fullAnalysis.studyPlan.length > 0) {
          StorageService.autoSyncStudyPlanToMemory(
            fullAnalysis.studyPlan,
            company,
            fullAnalysis.studyMaterials
          );
          setAutoSyncNotice(
            `Company study plan (${fullAnalysis.studyPlan.length} sessions including Day 7 Revision) automatically synced to Memory Revival!`
          );
        }

        onSaveAnalysis(fullAnalysis);
        setActiveView('results');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Error occurred while comparing evidence against role requirements.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 pt-2">
      {/* Top Bar / View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Career Fit Analyzer</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Gemini Evidence Matching
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Strict comparison of your submitted resume, code repositories, and job requirements.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveView('form')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'form'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence Inputs
          </button>
          <button
            onClick={() => setActiveView('results')}
            disabled={!latestCareerFit}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'results'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            Evaluation Results
          </button>
        </div>
      </div>

      {activeView === 'form' ? (
        /* Form View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Resume & Target Role */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Resume Upload (Multi-modal with Gemini) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    1. Upload Resume / Portfolio Evidence
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">PDF, DOCX, or Text</span>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 bg-slate-50/50 text-center transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-1">
                  {uploadFileName ? (
                    <span className="text-indigo-600 font-bold">{uploadFileName} attached</span>
                  ) : (
                    <span>Drag and drop your PDF resume, or browse file</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                  Gemini extracts your candidate profile, verified skills, and project history in real-time.
                </p>

                <input
                  type="file"
                  id="resumeFileInput"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resumeFileInput"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isParsingResume ? 'Parsing with Gemini...' : 'Choose Resume PDF'}</span>
                </label>
              </div>

              {isParsingResume && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                  <span>Gemini is extracting candidate profile, skills, and projects from your resume...</span>
                </div>
              )}

              {/* Extracted skills pill box */}
              {parsedSkills.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>Extracted Skills from Resume:</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">✓ Gemini Parsed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Text Box */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Or paste resume text directly:
                </label>
                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content, experience, education, and projects here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Target Role & Job Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. Target Role & Job Description (Source of Truth)
                  </h2>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Quick Presets:
                  <button
                    onClick={() =>
                      handleLoadSamplePreset(
                        'Stripe',
                        'Full Stack / Backend Engineer',
                        `We are looking for a Software Engineer to design, build, and scale reliable payment rails handling millions of transactions every hour.
Key Requirements:
- Demonstrated experience in TypeScript/Node.js, Go, or Python for backend microservices.
- Solid understanding of relational databases (PostgreSQL/MySQL), transaction isolation levels, ACID guarantees, and distributed idempotency.
- Practical experience designing and securing RESTful APIs with rate limiting and authentication (OAuth 2.0).
- Experience with asynchronous message queues (RabbitMQ, Kafka, or AWS SQS) for event streaming and reconciliation.
- Software engineering fundamentals: unit/integration testing (Jest/Vitest), CI/CD workflows, Docker containerization.`
                      )
                    }
                    className="ml-1 text-indigo-600 hover:underline font-semibold"
                  >
                    Stripe
                  </button>
                  <span className="mx-1">·</span>
                  <button
                    onClick={() =>
                      handleLoadSamplePreset(
                        'Google Cloud',
                        'Distributed Systems Software Engineer',
                        `Software Engineer working on large-scale distributed cloud systems.
Key Requirements:
- Strong computer science fundamentals, data structures, and algorithmic complexity.
- Concurrency, distributed consensus protocols (Raft/Paxos), and RPC systems (gRPC).
- Experience with low-latency backend systems, caching patterns, and automated testing.`
                      )
                    }
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Google
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe, Google, Datadog"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Engineer, Backend Specialist"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description / Requirements
                </label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the official job description requirements here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): GitHub, Coding Stats & Run Button */}
          <div className="lg:col-span-5 space-y-6">
            {/* GitHub Profile Connector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <Github className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  3. GitHub Profile Evidence
                </h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your GitHub profile so Gemini can inspect your public repositories, languages, and commit history.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleFetchGithub()}
                  disabled={isFetchingGithub || !githubUrl.trim()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {isFetchingGithub ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Inspect</span>
                  )}
                </button>
              </div>

              {githubError && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                  {githubError}
                </div>
              )}

              {githubData && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-900">
                    <span className="font-bold">{githubData.name || githubData.username}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      Verified Profile
                    </span>
                  </div>
                  <div className="text-slate-600">
                    {githubData.publicRepos} public repositories · Languages: {githubData.topLanguages.slice(0, 3).join(', ')}
                  </div>
                  {githubData.recentRepositories?.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-700">Recent Repositories:</div>
                      {githubData.recentRepositories.slice(0, 3).map((r: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-600 flex justify-between">
                          <span className="truncate max-w-[170px] font-medium text-slate-800">{r.name}</span>
                          <span className="text-slate-400 font-mono">{r.language}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Coding Platform Profile */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Code2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  4. Coding Platform (LeetCode / Contest)
                </h2>
              </div>

              <input
                type="text"
                value={codingPlatformUrl}
                onChange={(e) => setCodingPlatformUrl(e.target.value)}
                placeholder="https://leetcode.com/u/your_handle"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Problems Solved
                  </label>
                  <input
                    type="number"
                    value={leetcodeSolved}
                    onChange={(e) => setLeetcodeSolved(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Contest Rating
                  </label>
                  <input
                    type="number"
                    value={leetcodeRating}
                    onChange={(e) => setLeetcodeRating(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Run Analysis Trigger */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Run Career Fit Match
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Compares every requirement against your resume, GitHub repos, and coding evidence using Gemini.
                </p>
              </div>

              {analysisError && (
                <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                  {analysisError}
                </div>
              )}

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Evidence with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate Career Fit Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        latestCareerFit && (
          <div className="space-y-6">
            {/* Header & Rubric Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{latestCareerFit.targetRole}</span>
                    <span>·</span>
                    <span>{latestCareerFit.targetCompany}</span>
                    <span>·</span>
                    <span>Analyzed {new Date(latestCareerFit.analyzedAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Evidence Fit & Alignment Audit
                  </h2>
                  <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                    {latestCareerFit.summary}
                  </p>
                </div>

                {/* Score badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shrink-0 min-w-[260px]">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
                    <span>Evidence Match Score</span>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-900">
                      {latestCareerFit.rubricScore.totalScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span>Core Technical:</span>
                      <span className="font-semibold text-slate-900">{latestCareerFit.rubricScore.coreTechnicalFit}/40</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience & Projects:</span>
                      <span className="font-semibold text-slate-900">{latestCareerFit.rubricScore.experienceAndProjects}/30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coding & Algorithmic:</span>
                      <span className="font-semibold text-slate-900">{latestCareerFit.rubricScore.problemSolvingAndCoding}/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domain & Tooling:</span>
                      <span className="font-semibold text-slate-900">{latestCareerFit.rubricScore.domainAndTooling}/15</span>
                    </div>
                  </div>
                  <div className="mt-2.5 text-[10px] text-slate-400 border-t border-slate-200 pt-2">
                    *Evidence density match; not an official hiring guarantee.
                  </div>
                </div>
              </div>

              {/* Requirement-by-Requirement Evidence Table */}
              <div className="mt-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Requirement-by-Requirement Evidence Audit</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {latestCareerFit.evidenceRequirements.filter((r) => r.isDemonstrated).length} of{' '}
                    {latestCareerFit.evidenceRequirements.length} verified
                  </span>
                </h3>

                <div className="space-y-3">
                  {latestCareerFit.evidenceRequirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          {item.isDemonstrated ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Demonstrated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Not demonstrated in submitted evidence
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">
                            {item.requirement}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong className="text-slate-800 font-semibold">Evidence Citation: </strong>
                          {item.directEvidenceCitation}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <strong className="text-slate-700 font-medium">Analysis Note: </strong>
                          {item.analysisNote}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid: Missing Evidence & Suggested Project Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Missing or Unverified Evidence */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Missing or Unverified Evidence
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  These requirements are explicitly classified as "not demonstrated in your submitted evidence".
                </p>

                <div className="space-y-3">
                  {latestCareerFit.missingOrUnverifiedEvidence.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {item.skillOrRequirement}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800 font-medium">Recommended Action: </strong>
                        {item.recommendedAction}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            onAddMemoryTopic({
                              topic: item.skillOrRequirement,
                              subtopic: 'Target Role Requirement',
                              notes: `Role Requirement: ${item.skillOrRequirement}.\nNext Action: ${item.recommendedAction}`,
                              learningDate: new Date().toISOString(),
                              intervals: [1, 3, 7, 14, 30],
                              sourceTag: 'career-fit',
                            });
                            setAddedTopicIds((prev) => ({ ...prev, [item.skillOrRequirement]: true }));
                          }}
                          disabled={addedTopicIds[item.skillOrRequirement]}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:text-slate-400"
                        >
                          {addedTopicIds[item.skillOrRequirement] ? (
                            '✓ Scheduled in Memory Revival'
                          ) : (
                            '+ Schedule Memory Retrieval Practice'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Project Gaps */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recommended Portfolio Projects
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Concrete projects suggested by Gemini to substantiate unverified areas in your candidate portfolio.
                </p>

                <div className="space-y-3">
                  {latestCareerFit.projectGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="text-xs font-bold text-indigo-700">
                        {gap.suggestedProjectTitle}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {gap.suggestedProjectDescription}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {gap.keyTechnologiesToUse.map((tech, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Auto-Sync Notification Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <span>Zero Manual Entry · Auto-Synced to Memory Revival</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Day 1 to Day 7 Revision Active
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    All study materials, day-by-day objectives, and spaced Day 7 revision checkpoints have been automatically populated in your Memory Revival schedule.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('memory-revival')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <span>View in Memory Revival</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Company Engineering Profile & Culture */}
            {latestCareerFit.companyEngineeringProfile && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {latestCareerFit.companyEngineeringProfile.companyName} Engineering Culture & Stack Profile
                      </h3>
                      <div className="text-xs text-slate-500">
                        Domain: {latestCareerFit.companyEngineeringProfile.domain}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Target Stack Analysis
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Core Tech Stack Highlights
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {latestCareerFit.companyEngineeringProfile.techStackHighlights.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[11px] text-slate-800 shadow-2xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                      {latestCareerFit.companyEngineeringProfile.interviewCulture}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Engineering Values Tested in Interviews
                    </div>
                    <ul className="space-y-1.5 text-slate-600 text-[11px]">
                      {latestCareerFit.companyEngineeringProfile.coreEngineeringValues.map((val, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Targeted Skill Gap Study Materials */}
            {latestCareerFit.studyMaterials && latestCareerFit.studyMaterials.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>Targeted Skill Gap Study Materials</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curated conceptual breakdowns, official documentation, and code drills tailored to {latestCareerFit.targetCompany}'s architecture and your technical background.
                    </p>
                  </div>

                  <div className="text-xs font-mono text-slate-500">
                    {latestCareerFit.studyMaterials.length} Curated Study Modules
                  </div>
                </div>

                {/* Skill selector tabs */}
                <div className="flex flex-wrap gap-2">
                  {latestCareerFit.studyMaterials.map((mat, idx) => {
                    const active = (selectedStudySkill || latestCareerFit.studyMaterials![0].skillOrRequirement) === mat.skillOrRequirement;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedStudySkill(mat.skillOrRequirement)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mat.skillOrRequirement}
                      </button>
                    );
                  })}
                </div>

                {/* Active Study Material Card */}
                {(() => {
                  const activeMat =
                    latestCareerFit.studyMaterials.find(
                      (m) => m.skillOrRequirement === (selectedStudySkill || latestCareerFit.studyMaterials![0].skillOrRequirement)
                    ) || latestCareerFit.studyMaterials[0];

                  if (!activeMat) return null;

                  return (
                    <div className="space-y-5 bg-slate-50/70 border border-slate-200 rounded-2xl p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <div className="text-xs font-semibold text-indigo-600">
                            Missing Skill Requirement
                          </div>
                          <h4 className="text-base font-bold text-slate-900">
                            {activeMat.skillOrRequirement}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Est. Prep Time: {activeMat.suggestedStudyHours} hours</span>
                        </div>
                      </div>

                      {/* 2-column: Why Company Requires This vs Student Background Bridge */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-indigo-600" />
                            Why {latestCareerFit.targetCompany} Requires This
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {activeMat.companyContext}
                          </p>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            Bridge from Your Current Technical Skills
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {activeMat.studentBackgroundBridge}
                          </p>
                        </div>
                      </div>

                      {/* Core Concepts */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-900">
                          Core Concepts to Master:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {activeMat.coreConcepts.map((c, i) => (
                            <div
                              key={i}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-start gap-2 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <span className="text-slate-800 font-medium">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Snippet Example if available */}
                      {activeMat.codeSnippetExample && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                            Production Code Implementation Pattern
                          </div>
                          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                            <code>{activeMat.codeSnippetExample}</code>
                          </pre>
                        </div>
                      )}

                      {/* Authoritative Resources / Reading List */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Curated Authoritative Resources & Official Specs:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {activeMat.studyResources.map((res, i) => (
                            <div
                              key={i}
                              className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-100">
                                    {res.type}
                                  </span>
                                  {res.url && (
                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                                    >
                                      <span>Open Source</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-xs font-bold text-slate-900">{res.title}</div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                  {res.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real Interview Questions & Pitfalls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Real {latestCareerFit.targetCompany} Interview Questions
                          </div>
                          <ul className="space-y-1.5 text-xs text-amber-950">
                            {activeMat.interviewQuestionsAsked.map((q, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-mono text-amber-700 font-bold shrink-0">Q{i + 1}:</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Critical Pitfalls & Mistakes to Avoid
                          </div>
                          <ul className="space-y-1.5 text-xs text-rose-950">
                            {activeMat.keyPitfallsToAvoid.map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-600 shrink-0 font-bold">✕</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Structured Day-by-Day Study Plan with Day 7 Spaced Revision */}
            {latestCareerFit.studyPlan && latestCareerFit.studyPlan.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>Structured Multi-Day Study & Spaced Revision Schedule</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Day-by-day learning progression with automated 7-day spaced retrieval checkpoints to defeat the forgetting curve.
                    </p>
                  </div>

                  <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
                    Auto-Populated in Memory Revival
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestCareerFit.studyPlan.map((planItem, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        planItem.isRevisionDay
                          ? 'bg-gradient-to-br from-amber-50/80 to-white border-amber-300 shadow-xs ring-1 ring-amber-200'
                          : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            planItem.isRevisionDay
                              ? 'bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {planItem.isRevisionDay && <RotateCw className="w-3 h-3 text-amber-700" />}
                          Day {planItem.dayNumber} {planItem.isRevisionDay ? '· Spaced Revision Checkpoint' : '· Concept Study'}
                        </span>

                        <span className="text-xs font-mono text-slate-500">
                          {planItem.estimatedMinutes} mins
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {planItem.focusTitle}
                      </h4>

                      <div className="text-xs text-indigo-700 font-medium mb-3">
                        Target Skill: {planItem.targetSkill}
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        <div>
                          <strong className="text-slate-800">Objectives: </strong>
                          {planItem.learningObjectives.join(', ')}
                        </div>

                        {planItem.isRevisionDay && (
                          <div className="p-2.5 bg-amber-100/60 rounded-xl text-[11px] text-amber-950 font-medium">
                            🔄 Revising concepts from Day {planItem.revisesDayNumber || 1}. Active recall practice triggered in Memory Revival.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Due Date: {planItem.scheduledDate}
                        </span>

                        <button
                          type="button"
                          onClick={() => onNavigate('memory-revival')}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                          <span>Review Quiz</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ready to test these skills?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Launch a live mock interview with real-time video to test your ability to articulate these concepts under pressure.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Start Live Mock Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
