import React, { useState } from 'react';
import { MemoryTopic, QuizQuestion, TopicRefresher, ReviewAttempt } from '../types';
import { ApiService } from '../services/api';
import {
  Brain,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  RotateCcw,
  Trash2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Loader2,
  Lightbulb,
} from 'lucide-react';

interface MemoryRevivalProps {
  memoryTopics: MemoryTopic[];
  onSaveTopic: (topic: MemoryTopic) => void;
  onDeleteTopic: (id: string) => void;
  initialSelectedTopicId?: string | null;
}

export const MemoryRevival: React.FC<MemoryRevivalProps> = ({
  memoryTopics,
  onSaveTopic,
  onDeleteTopic,
  initialSelectedTopicId,
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'study-plan' | 'all' | 'quiz' | 'add'>('due');

  // Add topic form state
  const [newTopic, setNewTopic] = useState('');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newLearningDate, setNewLearningDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Active quiz runner state
  const [activeQuizTopic, setActiveQuizTopic] = useState<MemoryTopic | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<'Low' | 'Medium' | 'High'>('High');

  // Refresher state if struggled
  const [refresherData, setRefresherData] = useState<TopicRefresher | null>(null);
  const [isGeneratingRefresher, setIsGeneratingRefresher] = useState(false);

  // Date filters & auto-synced study plan topics
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTopics = memoryTopics.filter((t) => t.nextDueDate <= todayStr);
  const studyPlanTopics = memoryTopics.filter(
    (t) => t.sourceTag === 'study-plan' || t.dayNumber !== undefined || t.isRevision
  );

  // Launch Quiz for a Topic
  const handleLaunchQuiz = async (topic: MemoryTopic) => {
    setActiveQuizTopic(topic);
    setIsGeneratingQuiz(true);
    setQuizFinished(false);
    setSelectedAnswers({});
    setRevealedHints({});
    setRefresherData(null);
    setCurrentQuestionIndex(0);
    setActiveTab('quiz');

    try {
      const res = await ApiService.generateRetrievalQuiz({
        topic: topic.topic,
        subtopic: topic.subtopic,
        notes: topic.notes,
        repetitionLevel: topic.currentIntervalIndex + 1,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setQuizQuestions(res.questions);
      } else {
        setQuizQuestions([
          {
            id: 'q1',
            question: `What is the core engineering tradeoff of ${topic.topic}?`,
            options: [
              `Coordinating state consistency while minimizing latency overhead`,
              `Removing all memory constraints without hardware`,
              `Ignoring race conditions in distributed systems`,
              `Disabling all network partitions`,
            ],
            correctIndex: 0,
            hint: 'Think about consistency vs latency in production systems.',
            explanation: `${topic.topic} involves balancing state validity with performance.`,
          },
        ]);
      }
    } catch (e: any) {
      console.warn('Quiz generation fallback', e);
      setQuizQuestions([
        {
          id: 'q1',
          question: `Recall check: What is the main design priority in ${topic.topic}?`,
          options: [
            `Ensuring correct state transitions and fault tolerance`,
            `Sacrificing data integrity for unchecked write speed`,
            `Bypassing transaction isolation completely`,
            `Ignoring client retry storms`,
          ],
          correctIndex: 0,
          hint: 'Consider reliability principles.',
          explanation: 'Core engineering design requires deterministic recovery.',
        },
      ]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Select Option
  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  // Complete Quiz & Advance Interval
  const handleFinishQuiz = async () => {
    if (!activeQuizTopic || quizQuestions.length === 0) return;

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / quizQuestions.length) * 100);
    const struggled = scorePercent < 70 || confidenceLevel === 'Low';

    let newIntervalIndex = activeQuizTopic.currentIntervalIndex;
    let daysToAdd = 1;

    if (struggled) {
      newIntervalIndex = 0;
      daysToAdd = 1;
    } else {
      newIntervalIndex = Math.min(
        activeQuizTopic.intervals.length - 1,
        activeQuizTopic.currentIntervalIndex + 1
      );
      daysToAdd = activeQuizTopic.intervals[newIntervalIndex] || 7;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    const attempt: ReviewAttempt = {
      reviewedAt: new Date().toISOString(),
      scorePercent,
      confidence: confidenceLevel,
      intervalAssignedDays: daysToAdd,
      struggled,
    };

    const updatedTopic: MemoryTopic = {
      ...activeQuizTopic,
      currentIntervalIndex: newIntervalIndex,
      nextDueDate: nextDueDateStr,
      lastReviewedAt: new Date().toISOString(),
      reviewHistory: [attempt, ...activeQuizTopic.reviewHistory],
    };

    onSaveTopic(updatedTopic);
    setActiveQuizTopic(updatedTopic);
    setQuizFinished(true);

    if (struggled) {
      setIsGeneratingRefresher(true);
      try {
        const firstMistakeIndex = quizQuestions.findIndex(
          (q, idx) => selectedAnswers[idx] !== q.correctIndex
        );
        const targetQ = quizQuestions[firstMistakeIndex >= 0 ? firstMistakeIndex : 0];

        const refRes = await ApiService.generateRefresher({
          topic: activeQuizTopic.topic,
          subtopic: activeQuizTopic.subtopic,
          questionText: targetQ.question,
          studentChoice: targetQ.options[selectedAnswers[firstMistakeIndex] ?? 1] || 'Incorrect',
          correctExplanation: targetQ.explanation,
          originalNotes: activeQuizTopic.notes,
        });

        if (refRes.success && refRes.refresher) {
          setRefresherData(refRes.refresher);
          updatedTopic.lastRefresher = refRes.refresher;
          onSaveTopic(updatedTopic);
        }
      } catch (err) {
        console.warn('Refresher generation fallback', err);
      } finally {
        setIsGeneratingRefresher(false);
      }
    }
  };

  // Add new topic submission
  const handleAddNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const intervals = [1, 3, 7, 14, 30];
    const nextDate = new Date(newLearningDate);
    nextDate.setDate(nextDate.getDate() + intervals[0]);

    const created: MemoryTopic = {
      id: `mem_${Date.now()}`,
      topic: newTopic.trim(),
      subtopic: newSubtopic.trim() || 'Core Concept',
      notes: newNotes.trim() || 'Notes for active retrieval practice.',
      learningDate: new Date(newLearningDate).toISOString(),
      intervals: intervals,
      currentIntervalIndex: 0,
      nextDueDate: nextDate.toISOString().split('T')[0],
      lastReviewedAt: null,
      reviewHistory: [],
      lastRefresher: null,
      sourceTag: 'manual',
    };

    onSaveTopic(created);
    setNewTopic('');
    setNewSubtopic('');
    setNewNotes('');
    setActiveTab('all');
  };

  return (
    <div className="space-y-6 pb-16 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Memory Revival</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Spaced Retrieval Engine
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Scientific spaced repetition (1, 3, 7, 14, 30 days) with targeted active recall quizzes and adaptive 2-minute refreshers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'due'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Today's Due ({dueTopics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('study-plan')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'study-plan'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Day 1-7 Study Plan ({studyPlanTopics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>All Topics ({memoryTopics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Auto-Sync Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            PI
          </div>
          <div>
            <span className="font-bold text-indigo-950">Automated Memory Pipeline: </span>
            <span className="text-indigo-800">
              Your study plan (Day 1 to Day 7 revision) and mock interview missed concepts are auto-injected here without manual entry.
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200 self-start sm:self-auto shrink-0">
          Spaced Intervals: 1, 3, 7, 14, 30 Days
        </span>
      </div>

      {/* ---------------- VIEW 1: TODAY'S DUE REVIEWS ---------------- */}
      {activeTab === 'due' && (
        <div className="space-y-5">
          {dueTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dueTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between transition-colors shadow-sm space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="text-indigo-600 font-semibold">{topic.subtopic}</span>
                      <span className="font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                        Interval: Day {topic.intervals[topic.currentIntervalIndex]}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{topic.topic}</h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      {topic.notes}
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                      <span>Learned: {new Date(topic.learningDate).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{topic.reviewHistory.length} review{topic.reviewHistory.length === 1 ? '' : 's'} done</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleLaunchQuiz(topic)}
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Take 2-Min Active Retrieval Quiz</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">All Due Topics Completed!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                You're caught up with today's spaced repetition queue. Check the "All Topics" tab to view upcoming schedule, or add new concepts.
              </p>
              <button
                onClick={() => setActiveTab('add')}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add a New Concept to Track</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- VIEW: COMPANY STUDY PLAN & DAY 7 REVISIONS ---------------- */}
      {activeTab === 'study-plan' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-white border border-slate-200 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Auto-Scheduled Company Study Sessions & Day 7 Revisions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically extracted from your Career Fit analysis and interview performance. No manual entry needed.
              </p>
            </div>
            <div className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
              {studyPlanTopics.length} Active Sessions
            </div>
          </div>

          {studyPlanTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {studyPlanTopics.map((topic) => {
                const isDue = topic.nextDueDate <= todayStr;
                return (
                  <div
                    key={topic.id}
                    className={`rounded-2xl p-6 flex flex-col justify-between space-y-4 border transition-all ${
                      topic.isRevision
                        ? 'bg-gradient-to-br from-amber-50/70 to-white border-amber-300 shadow-xs ring-1 ring-amber-200'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            topic.isRevision
                              ? 'bg-amber-100 text-amber-900 border border-amber-200 font-bold'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          {topic.isRevision ? (
                            <>
                              <RotateCcw className="w-3 h-3 text-amber-700" />
                              <span>Day 7 Spaced Revision Checkpoint</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              <span>Day {topic.dayNumber || 1} Study Session</span>
                            </>
                          )}
                        </span>

                        <span
                          className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                            isDue
                              ? 'text-amber-800 bg-amber-50 border border-amber-200 font-bold'
                              : 'text-slate-600 bg-slate-100'
                          }`}
                        >
                          {isDue ? 'Due Today!' : `Due ${topic.nextDueDate}`}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{topic.topic}</h4>
                        <div className="text-xs text-indigo-700 font-medium mt-0.5">
                          {topic.subtopic}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                        {topic.notes}
                      </p>

                      {/* Curated Resources if available */}
                      {topic.studyResources && topic.studyResources.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-600" />
                            <span>Official Study Material & Reading:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {topic.studyResources.map((res, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[240px]"
                                title={res.title}
                              >
                                {res.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleLaunchQuiz(topic)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                          topic.isRevision
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{topic.isRevision ? 'Start Day 7 Revision Quiz' : 'Start Active Recall Quiz'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        title="Delete topic"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No Study Plan Generated Yet</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run a Career Fit analysis or complete a Mock Interview. Your personalized Day 1 to Day 7 revision study plan will be automatically populated here without typing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------- VIEW 3: ALL TOPICS & SCHEDULE ---------------- */}
      {activeTab === 'all' && (
        <div className="space-y-5">
          {memoryTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {memoryTopics.map((topic) => {
                const isDue = topic.nextDueDate <= todayStr;
                return (
                  <div
                    key={topic.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-indigo-600 font-semibold truncate max-w-[150px]">
                          {topic.subtopic}
                        </span>
                        <span
                          className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                            isDue
                              ? 'text-amber-800 bg-amber-50 border border-amber-200'
                              : 'text-slate-600 bg-slate-100'
                          }`}
                        >
                          {isDue ? 'Due Today' : `Due ${topic.nextDueDate}`}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-2">{topic.topic}</h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
                        {topic.notes}
                      </p>

                      {/* Timeline Dots */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Review Stage:</span>
                          <span className="font-mono text-slate-800">
                            Day {topic.intervals[topic.currentIntervalIndex]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {topic.intervals.map((day, idx) => (
                            <div
                              key={day}
                              title={`${day} day review`}
                              className={`flex-1 h-1.5 rounded-full ${
                                idx <= topic.currentIntervalIndex
                                  ? 'bg-amber-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleLaunchQuiz(topic)}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Quiz Now
                      </button>
                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        title="Delete topic"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
              <Brain className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No Memory Topics Yet</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add computer science concepts or import from Career Fit recommendations to retain skills long term.
              </p>
              <button
                onClick={() => setActiveTab('add')}
                className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Topic</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- VIEW 3: ACTIVE RETRIEVAL QUIZ RUNNER ---------------- */}
      {activeTab === 'quiz' && activeQuizTopic && (
        <div className="max-w-2xl mx-auto space-y-6">
          {isGeneratingQuiz ? (
            <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                Generating Active Recall Questions with Gemini...
              </h3>
              <p className="text-xs text-slate-500">
                Creating conceptual retrieval checks for {activeQuizTopic.topic}
              </p>
            </div>
          ) : !quizFinished ? (
            /* Quiz Questions View */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              {/* Question progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 pt-1">{activeQuizTopic.topic}</h2>
                </div>
                <button
                  onClick={() => setActiveTab('due')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Exit Quiz
                </button>
              </div>

              {quizQuestions[currentQuestionIndex] && (
                <div className="space-y-5">
                  <div className="text-base text-slate-900 font-bold leading-relaxed">
                    {quizQuestions[currentQuestionIndex].question}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {quizQuestions[currentQuestionIndex].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                      const isCorrect = optIdx === quizQuestions[currentQuestionIndex].correctIndex;

                      let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-medium';
                        } else {
                          btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={hasAnswered}
                          className={`w-full p-4 text-left text-xs rounded-2xl border-2 transition-all flex items-start gap-3.5 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-relaxed pt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hint */}
                  <div>
                    {!revealedHints[currentQuestionIndex] ? (
                      <button
                        onClick={() =>
                          setRevealedHints((prev) => ({ ...prev, [currentQuestionIndex]: true }))
                        }
                        className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1.5 font-semibold"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Need a hint? (Does not give away answer)</span>
                      </button>
                    ) : (
                      <div className="text-xs text-amber-900 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 leading-relaxed flex items-start gap-2.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 font-bold">Hint: </strong>
                          {quizQuestions[currentQuestionIndex].hint}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation after answered */}
                  {selectedAnswers[currentQuestionIndex] !== undefined && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                      <div className="font-bold text-indigo-950">Explanation:</div>
                      <p className="text-slate-700 leading-relaxed">
                        {quizQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedAnswers[currentQuestionIndex] === undefined
                        ? 'Select an option to verify'
                        : 'Answer recorded'}
                    </span>

                    {selectedAnswers[currentQuestionIndex] !== undefined && (
                      <button
                        onClick={() => {
                          if (currentQuestionIndex + 1 < quizQuestions.length) {
                            setCurrentQuestionIndex((prev) => prev + 1);
                          } else {
                            handleFinishQuiz();
                          }
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span>
                          {currentQuestionIndex + 1 < quizQuestions.length
                            ? 'Next Question'
                            : 'Complete Retrieval Quiz'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Retrieval Practice Session Complete
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your spaced repetition schedule has been updated based on your recall accuracy.
                </p>
              </div>

              {/* Confidence check */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  How confident did you feel about this topic?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Low', 'Medium', 'High'] as const).map((conf) => (
                    <button
                      key={conf}
                      onClick={() => setConfidenceLevel(conf)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        confidenceLevel === conf
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {conf} Confidence
                    </button>
                  ))}
                </div>
              </div>

              {/* Adaptive Refresher if struggled */}
              {isGeneratingRefresher ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto" />
                  <div className="text-xs text-slate-500">
                    Generating focused 2-minute concept refresher...
                  </div>
                </div>
              ) : refresherData ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 pb-2 border-b border-amber-200">
                    <Brain className="w-4 h-4 text-amber-600" />
                    <span>Targeted 2-Minute Concept Refresher</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed">
                    <div>
                      <strong className="text-amber-900 font-bold">Core Intuition: </strong>
                      {refresherData.coreIntuition}
                    </div>

                    <div>
                      <strong className="text-indigo-900 font-bold">Mental Model: </strong>
                      {refresherData.keyMentalModel}
                    </div>

                    <div>
                      <strong className="text-rose-900 font-bold">Common Pitfall: </strong>
                      {refresherData.commonPitfall}
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                      <strong className="text-amber-900 font-bold">Instant Recall Check: </strong>
                      {refresherData.immediateCheckQuestion}
                      <div className="mt-1 text-slate-500 text-[11px]">
                        <em>Answer: {refresherData.immediateCheckAnswer}</em>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-700 font-medium pt-1">
                    *Schedule calibrated: Reviewed earlier tomorrow to solidify memory retention.
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Strong Recall Demonstrated! </span>
                    Interval extended to {activeQuizTopic.intervals[activeQuizTopic.currentIntervalIndex]} days. Next review scheduled for {activeQuizTopic.nextDueDate}.
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab('due')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all shadow-sm"
              >
                Return to Today's Due Queue
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- VIEW 4: ADD TOPIC MODAL / FORM ---------------- */}
      {activeTab === 'add' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Schedule New Concept
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a system design pattern, database algorithm, or role concept to your spaced repetition schedule.
            </p>
          </div>

          <form onSubmit={handleAddNewTopic} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Topic Name
              </label>
              <input
                type="text"
                required
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Distributed Caching & Cache-Aside Invalidation"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Subtopic / Focus Area
              </label>
              <input
                type="text"
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                placeholder="e.g. Write-through vs Cache-Aside race condition mitigation"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Learning Date
              </label>
              <input
                type="date"
                value={newLearningDate}
                onChange={(e) => setNewLearningDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Key Notes / Mental Model Summary
              </label>
              <textarea
                rows={4}
                required
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Core intuition, trade-offs, or code patterns to generate active recall questions from..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Memory Schedule</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
