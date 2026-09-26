import React, { useState } from 'react';
import {
  ModuleTab,
  UserProfile,
  CareerFitAnalysis,
  InterviewSession,
  MemoryTopic,
  AuthUser,
} from './types';
import { StorageService, DEMO_USERS } from './services/storage';
import { TopNavigation } from './components/TopNavigation';
import { DashboardOverview } from './components/DashboardOverview';
import { CareerFitAnalyzer } from './components/CareerFitAnalyzer';
import { InterviewSimulator } from './components/InterviewSimulator';
import { MemoryRevival } from './components/MemoryRevival';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ModuleTab>('overview');

  // Authenticated candidate state
  const [authUser, setAuthUser] = useState<AuthUser | null>(StorageService.getAuthUser);

  // Core application state
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile);
  const [careerFitHistory, setCareerFitHistory] = useState<CareerFitAnalysis[]>(
    StorageService.getCareerFitHistory
  );
  const [interviews, setInterviews] = useState<InterviewSession[]>(
    StorageService.getInterviews
  );
  const [memoryTopics, setMemoryTopics] = useState<MemoryTopic[]>(
    StorageService.getMemoryTopics
  );

  // Selected topic for immediate quiz from dashboard
  const [selectedTopicIdForQuiz, setSelectedTopicIdForQuiz] = useState<string | null>(null);

  // Update Profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated, lastUpdated: new Date().toISOString() };
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  // Save Career Fit Analysis & Auto-Sync Study Plan to Memory Revival
  const handleSaveCareerFit = (analysis: CareerFitAnalysis) => {
    StorageService.saveCareerFit(analysis);
    if (analysis.studyPlan && analysis.studyPlan.length > 0) {
      StorageService.autoSyncStudyPlanToMemory(
        analysis.studyPlan,
        analysis.targetCompany,
        analysis.studyMaterials
      );
      setMemoryTopics(StorageService.getMemoryTopics());
    }
    setCareerFitHistory(StorageService.getCareerFitHistory());
  };

  // Save Mock Interview Session & Auto-Sync Missed Concepts to Memory Revival
  const handleSaveInterview = (session: InterviewSession) => {
    StorageService.saveInterview(session);
    if (session.evaluation) {
      StorageService.autoSyncInterviewToMemory(session);
      setMemoryTopics(StorageService.getMemoryTopics());
    }
    setInterviews(StorageService.getInterviews());
  };

  // Save or Update Memory Topic
  const handleSaveMemoryTopic = (topic: MemoryTopic) => {
    StorageService.saveMemoryTopic(topic);
    setMemoryTopics(StorageService.getMemoryTopics());
  };

  // Delete Memory Topic
  const handleDeleteMemoryTopic = (id: string) => {
    StorageService.deleteMemoryTopic(id);
    setMemoryTopics(StorageService.getMemoryTopics());
  };

  // 1-click Add Memory Topic from Career Fit or Interview recommendations
  const handleAddMemoryTopic = (
    topicData: Omit<
      MemoryTopic,
      'id' | 'currentIntervalIndex' | 'nextDueDate' | 'lastReviewedAt' | 'reviewHistory' | 'lastRefresher'
    >
  ) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (topicData.intervals[0] || 1));

    const newTopic: MemoryTopic = {
      ...topicData,
      id: `mem_${Date.now()}`,
      currentIntervalIndex: 0,
      nextDueDate: nextDate.toISOString().split('T')[0],
      lastReviewedAt: null,
      reviewHistory: [],
      lastRefresher: null,
    };

    StorageService.saveMemoryTopic(newTopic);
    setMemoryTopics(StorageService.getMemoryTopics());
  };

  // Launch direct quiz from overview queue
  const handleLaunchTopicQuiz = (topicId: string) => {
    setSelectedTopicIdForQuiz(topicId);
    setCurrentTab('memory-revival');
  };

  // Switch student profile seamlessly
  const handleSwitchAccount = (key: 'alex' | 'priya' | 'jordan') => {
    const targetDemo = DEMO_USERS[key];
    if (targetDemo) {
      StorageService.saveAuthUser(targetDemo.user);
      StorageService.saveProfile(targetDemo.profile);
      setAuthUser(targetDemo.user);
      setProfile(targetDemo.profile);
      setMemoryTopics(StorageService.getMemoryTopics());
    }
  };

  // Handle successful login from Login page
  const handleLoginSuccess = (user: AuthUser, loggedInProfile: UserProfile) => {
    setAuthUser(user);
    setProfile(loggedInProfile);
    setMemoryTopics(StorageService.getMemoryTopics());
    setCareerFitHistory(StorageService.getCareerFitHistory());
    setInterviews(StorageService.getInterviews());
    setCurrentTab('overview');
  };

  // Handle logout
  const handleLogout = () => {
    StorageService.saveAuthUser(null);
    setAuthUser(null);
    setCurrentTab('login');
  };

  // Reset data to clean state
  const handleResetData = () => {
    if (window.confirm('Reset all preparation data to clean state?')) {
      StorageService.resetToDefault();
      setProfile(StorageService.getProfile());
      setCareerFitHistory(StorageService.getCareerFitHistory());
      setInterviews(StorageService.getInterviews());
      setMemoryTopics(StorageService.getMemoryTopics());
      setCurrentTab('overview');
    }
  };

  // Load sample demo data
  const handleLoadSample = () => {
    StorageService.loadSampleData();
    setProfile(StorageService.getProfile());
    setCareerFitHistory(StorageService.getCareerFitHistory());
    setInterviews(StorageService.getInterviews());
    setMemoryTopics(StorageService.getMemoryTopics());
    setAuthUser(StorageService.getAuthUser());
  };

  // Calculate memory count for top badge
  const todayStr = new Date().toISOString().split('T')[0];
  const dueMemoryCount = memoryTopics.filter((t) => t.nextDueDate <= todayStr).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal Top Navigation */}
      <TopNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        authUser={authUser}
        onResetData={handleResetData}
        onLoadSample={handleLoadSample}
        onSwitchAccount={handleSwitchAccount}
        onLogout={handleLogout}
        dueMemoryCount={dueMemoryCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onContinueAsGuest={() => {
              setCurrentTab('overview');
            }}
          />
        )}

        {currentTab === 'overview' && (
          <DashboardOverview
            profile={profile}
            latestCareerFit={careerFitHistory[0] || null}
            interviews={interviews}
            memoryTopics={memoryTopics}
            onNavigate={setCurrentTab}
            onLaunchTopicQuiz={handleLaunchTopicQuiz}
            onLoadSample={handleLoadSample}
          />
        )}

        {currentTab === 'career-fit' && (
          <CareerFitAnalyzer
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            latestCareerFit={careerFitHistory[0] || null}
            onSaveAnalysis={handleSaveCareerFit}
            onNavigate={setCurrentTab}
            onAddMemoryTopic={handleAddMemoryTopic}
          />
        )}

        {currentTab === 'mock-interview' && (
          <InterviewSimulator
            profile={profile}
            interviews={interviews}
            onSaveInterview={handleSaveInterview}
            onNavigate={setCurrentTab}
            onAddMemoryTopic={handleAddMemoryTopic}
          />
        )}

        {currentTab === 'memory-revival' && (
          <MemoryRevival
            memoryTopics={memoryTopics}
            onSaveTopic={handleSaveMemoryTopic}
            onDeleteTopic={handleDeleteMemoryTopic}
            initialSelectedTopicId={selectedTopicIdForQuiz}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressAnalytics
            profile={profile}
            careerFitHistory={careerFitHistory}
            interviews={interviews}
            memoryTopics={memoryTopics}
          />
        )}
      </main>

      {/* Clean Unboxed Light Mode Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Placement Intelligence Platform</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Evidence-Based Matching & Spaced Practice</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Privacy by Design · Audio & Video Processed In-Browser · Powered by Gemini
          </div>
        </div>
      </footer>
    </div>
  );
}
