import React from 'react';
import {
  UserProfile,
  CareerFitAnalysis,
  InterviewSession,
  MemoryTopic,
  ModuleTab,
} from '../types';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Mic,
  FileText,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  FolderGit2,
  Upload,
} from 'lucide-react';

interface DashboardOverviewProps {
  profile: UserProfile;
  latestCareerFit: CareerFitAnalysis | null;
  interviews: InterviewSession[];
  memoryTopics: MemoryTopic[];
  onNavigate: (tab: ModuleTab) => void;
  onLaunchTopicQuiz: (topicId: string) => void;
  onLoadSample: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  latestCareerFit,
  interviews,
  memoryTopics,
  onNavigate,
  onLaunchTopicQuiz,
  onLoadSample,
}) => {
  const latestInterview = interviews.length > 0 ? interviews[0] : null;

  // Calculate memory stats
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTopics = memoryTopics.filter((t) => t.nextDueDate <= todayStr);
  const completedReviewsCount = memoryTopics.reduce(
    (acc, t) => acc + t.reviewHistory.length,
    0
  );

  // Requirements breakdown
  const demonstratedReqs =
    latestCareerFit?.evidenceRequirements.filter((r) => r.isDemonstrated) || [];
  const missingReqs =
    latestCareerFit?.evidenceRequirements.filter((r) => !r.isDemonstrated) || [];

  const hasData = !!(profile.targetRole || latestCareerFit || interviews.length > 0);

  return (
    <div className="space-y-8 pb-16 pt-2">
      {/* Onboarding Welcome Banner if Clean / Empty State */}
      {!hasData ? (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-700 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Live AI Readiness Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Bridge the gap between your real code and your dream engineering role.
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Upload your resume and connect your GitHub. Gemini extracts your verified evidence, tests you in live mock interviews with real-time video feedback, and schedules targeted memory revival quizzes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('career-fit')}
                className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume & Start Career Fit</span>
              </button>
              <button
                onClick={onLoadSample}
                className="px-4 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Explore Live Demo Data</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Target Focus Header */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
                <span>Active Target</span>
                <span>·</span>
                <span>Updated {new Date(profile.lastUpdated).toLocaleDateString()}</span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">Live Mode</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                <span>{profile.targetRole || 'Software Engineer'}</span>
                <span className="text-slate-400 font-normal text-xl">at</span>
                <span className="text-indigo-600">{profile.targetCompany || 'Target Company'}</span>
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                {profile.studentName ? `Candidate: ${profile.studentName}. ` : ''}
                Verified requirements compared against your submitted resume, GitHub repositories, and live interview performance.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('career-fit')}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Update Evidence</span>
              </button>
              <button
                onClick={() => onNavigate('mock-interview')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Mock Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Quantitative Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Evidence Alignment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
            <span>Evidence Alignment</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {latestCareerFit ? `${latestCareerFit.rubricScore.totalScore}` : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{demonstratedReqs.length} verified</span>
            <span className="text-amber-600 font-medium font-mono tabular-nums">
              {missingReqs.length} unverified
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Source of truth: Job Description
          </div>
        </div>

        {/* Metric 2: Mock Interview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
            <span>Latest Mock Interview</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {latestInterview?.evaluation?.overallScore ?? '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{latestInterview?.measuredPaceWpm ? `${latestInterview.measuredPaceWpm} WPM` : 'Live video ready'}</span>
            <span className="text-slate-500 font-mono">
              {latestInterview?.measuredFillerWords ?? 0} fillers
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {latestInterview?.evaluation?.verdict || 'Ready for live interview'}
          </div>
        </div>

        {/* Metric 3: Memory Revival */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
            <span>Memory Revival Due</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-600">
              {dueTopics.length}
            </span>
            <span className="text-xs text-slate-500">review{dueTopics.length === 1 ? '' : 's'} due</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{memoryTopics.length} tracked</span>
            <span className="text-emerald-600 font-semibold font-mono">
              {completedReviewsCount} completed
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Spaced 1, 3, 7, 14, 30 day intervals
          </div>
        </div>

        {/* Metric 4: Portfolio Project Gaps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
            <span>Project Gaps to Bridge</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {latestCareerFit?.projectGaps.length ?? 0}
            </span>
            <span className="text-xs text-slate-500">projects</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 truncate border-t border-slate-100 pt-2.5">
            {latestCareerFit?.projectGaps[0]?.suggestedProjectTitle || 'No project gaps identified'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Concrete portfolio recommendations
          </div>
        </div>
      </div>

      {/* Main Grid: Evidence Requirements & Today's Retrieval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Evidence Requirements Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Evidence-Based Requirement Match
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified against job description as source of truth. Unverified items state "not demonstrated in submitted evidence".
                </p>
              </div>
              <button
                onClick={() => onNavigate('career-fit')}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
              >
                Inspect All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestCareerFit && latestCareerFit.evidenceRequirements.length > 0 ? (
              <div className="space-y-3">
                {latestCareerFit.evidenceRequirements.slice(0, 5).map((req, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-3.5"
                  >
                    <div className="mt-0.5 shrink-0">
                      {req.isDemonstrated ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {req.requirement}
                        </span>
                        <span
                          className={`text-xs shrink-0 font-medium px-2 py-0.5 rounded-full ${
                            req.isDemonstrated
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          {req.isDemonstrated ? 'Demonstrated' : 'Not demonstrated in submitted evidence'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-700 font-medium">Evidence Citation: </strong>
                        {req.directEvidenceCitation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">No Career Fit Evaluation Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your resume or paste a job description to compare your qualifications against real requirements.
                </p>
                <button
                  onClick={() => onNavigate('career-fit')}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resume</span>
                </button>
              </div>
            )}
          </div>

          {/* Latest Mock Interview Highlights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Mock Interview Feedback & Delivery
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live video session with speaking pace, filler word frequency, and technical bar-raiser evaluation.
                </p>
              </div>
              <button
                onClick={() => onNavigate('mock-interview')}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
              >
                {latestInterview ? 'View Full Session' : 'Start Session'} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestInterview?.evaluation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Technical Accuracy</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {latestInterview.evaluation.dimensionScores.technicalAccuracy.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${latestInterview.evaluation.dimensionScores.technicalAccuracy.score}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Depth of Reasoning</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {latestInterview.evaluation.dimensionScores.depthOfReasoning.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${latestInterview.evaluation.dimensionScores.depthOfReasoning.score}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Answer Relevance</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {latestInterview.evaluation.dimensionScores.answerRelevance.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{
                          width: `${latestInterview.evaluation.dimensionScores.answerRelevance.score}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Communication & Structure</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {latestInterview.evaluation.dimensionScores.communicationClarity.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{
                          width: `${latestInterview.evaluation.dimensionScores.communicationClarity.score}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                  <span className="text-emerald-800 font-semibold">Interviewer Observation: </span>
                  {latestInterview.evaluation.keyStrengths[0] || 'Good composure and direct answers.'}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <Mic className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">No Mock Interviews Conducted</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Practice questions tailored directly to your target role with live camera, audio delivery analysis, and Gemini grading.
                </p>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start First Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Memory Revival Queue & Prioritized Actions */}
        <div className="space-y-6">
          {/* Today's Memory Due Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Memory Revival Due</h3>
              </div>
              <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {dueTopics.length} due
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Targeted 3-question active recall quizzes designed to trigger long-term retention.
            </p>

            {dueTopics.length > 0 ? (
              <div className="space-y-3">
                {dueTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 mb-0.5">
                      {topic.topic}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-3 truncate">
                      {topic.subtopic}
                    </div>
                    <button
                      onClick={() => onLaunchTopicQuiz(topic.id)}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Take 2-Min Quiz</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-slate-800">All caught up!</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  No spaced retrieval reviews due today.
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigate('memory-revival')}
              className="mt-4 w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Memory Topics</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Prioritized Next Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Prioritized Next Actions</h3>
            </div>

            {latestCareerFit?.prioritizedRecommendations && latestCareerFit.prioritizedRecommendations.length > 0 ? (
              <div className="space-y-3">
                {latestCareerFit.prioritizedRecommendations.slice(0, 3).map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-indigo-700">{rec.priority}</span>
                      <span className="text-slate-400 font-medium">{rec.linkedModule}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mb-1 leading-snug">
                      {rec.action}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal mb-2.5">
                      {rec.rationale}
                    </p>
                    <button
                      onClick={() => {
                        if (rec.linkedModule === 'MockInterview') onNavigate('mock-interview');
                        else if (rec.linkedModule === 'MemoryRevival') onNavigate('memory-revival');
                        else onNavigate('career-fit');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Run a career fit analysis to generate personalized next actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
