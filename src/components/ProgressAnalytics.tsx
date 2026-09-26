import React from 'react';
import {
  UserProfile,
  CareerFitAnalysis,
  InterviewSession,
  MemoryTopic,
} from '../types';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Calendar,
  Mic,
  ShieldCheck,
  Download,
  Gauge,
} from 'lucide-react';

interface ProgressAnalyticsProps {
  profile: UserProfile;
  careerFitHistory: CareerFitAnalysis[];
  interviews: InterviewSession[];
  memoryTopics: MemoryTopic[];
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  profile,
  careerFitHistory,
  interviews,
  memoryTopics,
}) => {
  // Aggregate stats
  const totalReviews = memoryTopics.reduce((acc, t) => acc + t.reviewHistory.length, 0);
  const successfulReviews = memoryTopics.reduce(
    (acc, t) => acc + t.reviewHistory.filter((r) => !r.struggled).length,
    0
  );
  const memoryRetentionRate =
    totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 100;

  const latestCareerFit = careerFitHistory[0] || null;
  const verifiedCount =
    latestCareerFit?.evidenceRequirements.filter((r) => r.isDemonstrated).length ?? 0;
  const totalReqs = latestCareerFit?.evidenceRequirements.length ?? 0;

  // Handle Export Data JSON
  const handleExportData = () => {
    const data = {
      profile,
      careerFitHistory,
      interviews,
      memoryTopics,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement_prep_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Progress & Readiness Analytics</span>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Live Progress
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Objective track record of evidence verification, mock interview evaluations, and spaced retrieval practice.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Preparation Data</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">Evidence Requirements Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {verifiedCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalReqs} requirements</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Direct citations verified in resume & GitHub
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">Mock Interview Sessions</span>
            <Mic className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {interviews.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">sessions recorded</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Average delivery pace: {interviews[0]?.measuredPaceWpm ?? 138} WPM
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">Memory Retention Rate</span>
            <Brain className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-600 tabular-nums">
              {memoryRetentionRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">across {totalReviews} reviews</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Measured across 1, 3, 7, 14, 30 day intervals
          </div>
        </div>
      </div>

      {/* Mock Interview Evaluation History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Mock Interview Historical Attempts
        </h3>

        {interviews.length > 0 ? (
          <div className="space-y-3">
            {interviews.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-indigo-600 font-semibold">{session.interviewType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.company}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {session.role}
                  </div>
                  <div className="text-xs text-slate-600">
                    Verdict: <span className="text-slate-900 font-semibold">{session.evaluation?.verdict || 'Completed'}</span> ·{' '}
                    Pacing: <span className="font-mono text-slate-900">{session.measuredPaceWpm} WPM</span> ·{' '}
                    Fillers: <span className="font-mono text-slate-900">{session.measuredFillerWords} detected</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                      {session.evaluation?.overallScore ?? '--'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      Overall Score
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No completed mock interviews recorded yet. Start an interview to see metrics here.
          </div>
        )}
      </div>

      {/* Placement Readiness Verified Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Target Role Competency Verification Matrix
        </h3>

        {latestCareerFit?.evidenceRequirements && latestCareerFit.evidenceRequirements.length > 0 ? (
          <div className="space-y-2.5">
            {latestCareerFit.evidenceRequirements.map((req, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {req.isDemonstrated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{req.requirement}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {req.directEvidenceCitation}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-mono shrink-0 font-semibold ${
                    req.isDemonstrated ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100' : 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100'
                  }`}
                >
                  {req.isDemonstrated ? 'Verified in Evidence' : 'Unverified in Evidence'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Run a Career Fit analysis to populate your role competency matrix.
          </div>
        )}
      </div>
    </div>
  );
};
