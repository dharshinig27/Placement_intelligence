import React, { useState, useRef, useEffect } from 'react';
import { ModuleTab, UserProfile, AuthUser } from '../types';
import {
  Target,
  RotateCcw,
  Sparkles,
  FolderDown,
  User,
  LogOut,
  ChevronDown,
  Building,
  LogIn,
  Check,
} from 'lucide-react';

interface TopNavigationProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  profile: UserProfile;
  authUser: AuthUser | null;
  onResetData: () => void;
  onLoadSample: () => void;
  onSwitchAccount: (key: 'alex' | 'priya' | 'jordan') => void;
  onLogout: () => void;
  dueMemoryCount: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  profile,
  authUser,
  onResetData,
  onLoadSample,
  onSwitchAccount,
  onLogout,
  dueMemoryCount,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('overview')} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            PI
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Placement Intelligence
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Live Real-Time
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors relative py-2 ${
              currentTab === 'overview'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
            {currentTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('career-fit')}
            className={`transition-colors relative py-2 ${
              currentTab === 'career-fit'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Career Fit
            {currentTab === 'career-fit' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('mock-interview')}
            className={`transition-colors relative py-2 flex items-center gap-1.5 ${
              currentTab === 'mock-interview'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mock Interview
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {currentTab === 'mock-interview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('memory-revival')}
            className={`transition-colors relative py-2 flex items-center gap-1.5 ${
              currentTab === 'memory-revival'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Memory Revival
            {dueMemoryCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                {dueMemoryCount}
              </span>
            )}
            {currentTab === 'memory-revival' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`transition-colors relative py-2 ${
              currentTab === 'progress'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
            {currentTab === 'progress' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('login')}
            className={`transition-colors relative py-2 flex items-center gap-1 ${
              currentTab === 'login'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Login Page</span>
            {currentTab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Target Role Pill */}
          {profile.targetRole && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-900">{profile.targetCompany || 'Target'}</span>
              <span className="text-slate-400">·</span>
              <span className="truncate max-w-[120px]">{profile.targetRole}</span>
            </div>
          )}

          {/* User Profile / Auth Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {authUser ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-xs font-semibold text-slate-800"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[90px] truncate">{authUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && authUser && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900 truncate">{authUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{authUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 w-fit">
                    <Building className="w-3 h-3" />
                    <span>Target: {authUser.targetCompany}</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Switch Student Profile
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchAccount('alex');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Alex Mercer</div>
                      <div className="text-[10px] text-slate-500">Stripe · Full Stack Systems</div>
                    </div>
                    {authUser.email.includes('alex') && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchAccount('priya');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Priya Sharma</div>
                      <div className="text-[10px] text-slate-500">Google · Cloud & Raft</div>
                    </div>
                    {authUser.email.includes('priya') && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchAccount('jordan');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Jordan Lee</div>
                      <div className="text-[10px] text-slate-500">Amazon · SDE I</div>
                    </div>
                    {authUser.email.includes('jordan') && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('login');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-xs text-slate-700 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Go to Login / Auth Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-xs text-rose-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset state */}
          <button
            onClick={onResetData}
            title="Reset data to clean state"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 text-xs">
        <button
          onClick={() => onSelectTab('overview')}
          className={`py-1 px-2 ${currentTab === 'overview' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('career-fit')}
          className={`py-1 px-2 ${currentTab === 'career-fit' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Career Fit
        </button>
        <button
          onClick={() => onSelectTab('mock-interview')}
          className={`py-1 px-2 ${currentTab === 'mock-interview' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Interview
        </button>
        <button
          onClick={() => onSelectTab('memory-revival')}
          className={`py-1 px-2 flex items-center gap-1 ${currentTab === 'memory-revival' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Memory
          {dueMemoryCount > 0 && <span className="text-amber-600 font-mono">({dueMemoryCount})</span>}
        </button>
        <button
          onClick={() => onSelectTab('progress')}
          className={`py-1 px-2 ${currentTab === 'progress' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectTab('login')}
          className={`py-1 px-2 ${currentTab === 'login' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Login
        </button>
      </div>
    </header>
  );
};
