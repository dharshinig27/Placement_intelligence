import React, { useState } from 'react';
import { AuthUser, UserProfile } from '../types';
import { DEMO_USERS, StorageService } from '../services/storage';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Brain,
  Video,
  Target,
  Zap,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, profile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('alex.mercer@candidate.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Mercer');
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Quick 1-click Demo Candidate Logins
  const handleQuickDemoLogin = (key: 'alex' | 'priya' | 'jordan') => {
    setIsLoading(true);
    const demo = DEMO_USERS[key];
    setTimeout(() => {
      StorageService.saveAuthUser(demo.user);
      StorageService.saveProfile(demo.profile);
      setIsLoading(false);
      onLoginSuccess(demo.user, demo.profile);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setNotification('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setNotification(null);

    setTimeout(() => {
      const user: AuthUser = {
        id: `usr_${Date.now()}`,
        name: mode === 'signup' ? name : email.split('@')[0],
        email: email.trim(),
        role: 'Software Engineer',
        targetCompany: targetCompany || 'Tech Company',
        isDemoUser: false,
      };

      const currentProfile = StorageService.getProfile();
      const updatedProfile: UserProfile = {
        ...currentProfile,
        studentName: user.name,
        targetCompany: user.targetCompany,
        lastUpdated: new Date().toISOString(),
      };

      StorageService.saveAuthUser(user);
      StorageService.saveProfile(updatedProfile);
      setIsLoading(false);
      onLoginSuccess(user, updatedProfile);
    }, 550);
  };

  const handleOAuthLogin = (provider: 'Google' | 'GitHub') => {
    setIsLoading(true);
    setTimeout(() => {
      const providerEmail =
        provider === 'Google'
          ? 'student.verified@gmail.com'
          : 'student.dev@github.com';
      const user: AuthUser = {
        id: `oauth_${provider.toLowerCase()}_${Date.now()}`,
        name: `${provider} Candidate`,
        email: providerEmail,
        role: 'Software Engineer Candidate',
        targetCompany: 'Stripe',
        isDemoUser: false,
      };

      const currentProfile = StorageService.getProfile();
      StorageService.saveAuthUser(user);
      setIsLoading(false);
      onLoginSuccess(user, currentProfile);
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Left Hero / Brand Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-lg text-white">
                PI
              </div>
              <div>
                <div className="text-base font-bold tracking-tight">Placement Intelligence</div>
                <div className="text-xs text-indigo-200">Evidence-Based Career Engineering</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Live Automated Prep Engine
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Bridge Every Skill Gap with Cold Objective Evidence.
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Connect your resume and target role to instantly get company-specific study materials, Day 1 to Day 7 revision schedules, and AI mock interview simulations.
              </p>
            </div>

            {/* Feature checklist */}
            <div className="space-y-3 pt-2 text-xs text-indigo-100">
              <div className="flex items-start gap-2.5">
                <Target className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Company-Specific Skill Gaps: </strong>
                  Curated study materials bridging your background to the company's real stack.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Brain className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Auto-Synced Memory Revival: </strong>
                  Day 1 study and Day 7 revision checkpoints auto-populated without manual entry.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Video className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Live Camera Mock Interviews: </strong>
                  Real-time speech pace (WPM), confidence scoring, and Gemini bar-raiser critique.
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="relative z-10 pt-8 mt-6 border-t border-indigo-700/50">
            <p className="text-xs text-indigo-200 italic leading-relaxed">
              "The automatic Day 7 revision schedule and company-specific study materials eliminated guesswork. I cracked my Stripe systems design interview on the first attempt."
            </p>
            <div className="mt-2 text-[11px] font-semibold text-white">
              — Alex Mercer · Class of 2026 · Software Engineer
            </div>
          </div>
        </div>

        {/* Right Interactive Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === 'signin'
                    ? 'Access your saved career fit audits, mock interviews, and study schedules.'
                    : 'Get started with personalized evidence matching and spaced memory practice.'}
                </p>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Quick Demo Candidate Profiles (1-Click Login) */}
            <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Instant 1-Click Candidate Profiles
                </span>
                <span className="text-[10px] text-indigo-600 font-mono">No typing required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex')}
                  className="p-2.5 text-left bg-white hover:bg-indigo-50/50 border border-indigo-200/80 rounded-xl transition-all shadow-2xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                    <span>Alex Mercer</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Stripe</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Backend & Systems
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('priya')}
                  className="p-2.5 text-left bg-white hover:bg-indigo-50/50 border border-indigo-200/80 rounded-xl transition-all shadow-2xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                    <span>Priya Sharma</span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">Google</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Distributed Cloud
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('jordan')}
                  className="p-2.5 text-left bg-white hover:bg-indigo-50/50 border border-indigo-200/80 rounded-xl transition-all shadow-2xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center justify-between">
                    <span>Jordan Lee</span>
                    <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">Amazon</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Software SDE 1
                  </div>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {notification && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <span>{notification}</span>
              </div>
            )}

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Company
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Stripe, Google, Amazon"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setNotification('Password reset link sent to registered email.')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating Workspace...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] text-slate-400">
                <span className="bg-white px-2 uppercase tracking-wider font-mono">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('GitHub')}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Footer guest bypass */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Want to test with a blank canvas?</span>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Continue as Guest Candidate →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
