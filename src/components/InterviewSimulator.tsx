import React, { useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  InterviewSession,
  InterviewQuestion,
  InterviewEvaluation,
  ModuleTab,
  MemoryTopic,
} from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Info,
  Brain,
  Award,
  Activity,
  Gauge,
} from 'lucide-react';

interface InterviewSimulatorProps {
  profile: UserProfile;
  interviews: InterviewSession[];
  onSaveInterview: (session: InterviewSession) => void;
  onNavigate: (tab: ModuleTab) => void;
  onAddMemoryTopic: (topic: Omit<MemoryTopic, 'id' | 'currentIntervalIndex' | 'nextDueDate' | 'lastReviewedAt' | 'reviewHistory' | 'lastRefresher'>) => void;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  profile,
  interviews,
  onSaveInterview,
  onNavigate,
  onAddMemoryTopic,
}) => {
  // Wizard steps: 'setup' | 'permissions' | 'room' | 'evaluating' | 'report'
  const [currentStep, setCurrentStep] = useState<'setup' | 'permissions' | 'room' | 'evaluating' | 'report'>(
    interviews.length > 0 && interviews[0].evaluation ? 'report' : 'setup'
  );

  // Setup params
  const [targetRole, setTargetRole] = useState(profile.targetRole || 'Full Stack / Backend Engineer');
  const [targetCompany, setTargetCompany] = useState(profile.targetCompany || 'Stripe');
  const [interviewType, setInterviewType] = useState<
    'Technical & System Design' | 'Core Architecture & Coding' | 'Behavioral & Leadership' | 'Comprehensive Role Bar-Raiser'
  >('Technical & System Design');
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Hardware / Permission states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Video stream ref & Audio Analyzer
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live audio volume level for wave visualizer (0-100)
  const [audioVolume, setAudioVolume] = useState<number>(0);

  // Live Confidence Score Model (0-100)
  const [liveConfidenceScore, setLiveConfidenceScore] = useState<number>(78);
  const [confidenceLabel, setConfidenceLabel] = useState<string>('Steady & Composed');

  // Active session data
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    interviews.length > 0 ? interviews[0] : null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Real-time audio metrics
  const [measuredPaceWpm, setMeasuredPaceWpm] = useState(135);
  const [detectedFillerWords, setDetectedFillerWords] = useState(0);

  // Loading states
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Topics added to Memory Revival notification map
  const [addedTopicIds, setAddedTopicIds] = useState<Record<string, boolean>>({});

  // Question timer interval
  useEffect(() => {
    let interval: any;
    if (currentStep === 'room') {
      interval = setInterval(() => {
        setQuestionElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, currentQuestionIndex]);

  // Real-time confidence score calculation algorithm
  useEffect(() => {
    if (currentStep !== 'room') return;

    // Calculate confidence based on speaking pace, fillers, and audio presence
    let baseScore = 75;

    // Pacing factor: ideal is 130 - 160 WPM
    if (measuredPaceWpm >= 125 && measuredPaceWpm <= 160) {
      baseScore += 12;
    } else if (measuredPaceWpm > 160 && measuredPaceWpm <= 190) {
      baseScore += 5;
    } else if (measuredPaceWpm < 100 && measuredPaceWpm > 0) {
      baseScore -= 8;
    }

    // Filler word penalty (-3 points per filler, max -15)
    const fillerPenalty = Math.min(15, detectedFillerWords * 3);
    baseScore -= fillerPenalty;

    // Audio activity bonus (steady vocal projection)
    if (audioVolume > 15) {
      baseScore += 6;
    }

    // Word volume bonus (substantive response)
    const wordCount = currentAnswerText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 40) baseScore += 7;
    else if (wordCount > 15) baseScore += 4;

    const clamped = Math.max(35, Math.min(96, baseScore));
    setLiveConfidenceScore(clamped);

    if (clamped >= 85) {
      setConfidenceLabel('High Technical Confidence');
    } else if (clamped >= 70) {
      setConfidenceLabel('Steady & Composed');
    } else {
      setConfidenceLabel('Pacing & Formulating');
    }
  }, [currentStep, measuredPaceWpm, detectedFillerWords, audioVolume, currentAnswerText]);

  // Audio stream visualizer setup
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('Audio analyser could not be initialized:', e);
    }
  };

  // Clean up media streams
  const stopMediaTracks = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCurrentAnswerText(transcript);

        // Filler word detector
        const fillerMatches = transcript.match(/\b(um|uh|like|you know|basically|sort of|actually)\b/gi);
        setDetectedFillerWords(fillerMatches ? fillerMatches.length : 0);

        // Words per minute computation
        const words = transcript.trim().split(/\s+/).filter(Boolean).length;
        if (questionElapsedSeconds > 4) {
          const wpm = Math.round((words / questionElapsedSeconds) * 60);
          if (wpm > 40 && wpm < 260) setMeasuredPaceWpm(wpm);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
        setIsRecordingAnswer(false);
      };

      recognition.onend = () => {
        setIsRecordingAnswer(false);
      };

      recognitionRef.current = recognition;
    }
  }, [questionElapsedSeconds]);

  // Request camera and microphone stream
  const startCameraAndMic = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: micEnabled,
      });

      mediaStreamRef.current = stream;
      setupAudioAnalyser(stream);

      if (videoRef.current && cameraEnabled) {
        videoRef.current.srcObject = stream;
      }

      setCurrentStep('room');

      // Read out first question if voice is on
      if (activeSession && activeSession.questions.length > 0) {
        speakQuestion(activeSession.questions[0].question);
      }
    } catch (err: any) {
      console.warn('Hardware permission alert:', err);
      setPermissionError(
        'Camera or microphone access was restricted. You can still proceed smoothly in text mode.'
      );
      // Allow proceeding in text mode
      setCurrentStep('room');
    }
  };

  // Re-bind video element when room step renders
  useEffect(() => {
    if (currentStep === 'room' && videoRef.current && mediaStreamRef.current && cameraEnabled) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [currentStep, cameraEnabled]);

  // Speak question via Web Speech Synthesis
  const speakQuestion = (text: string) => {
    if (!speechSynthesisEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Recognition
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not enabled in this browser. You can type your answer directly.');
      return;
    }

    if (isRecordingAnswer) {
      recognitionRef.current.stop();
      setIsRecordingAnswer(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingAnswer(true);
      } catch (e) {
        console.warn('Speech recognition start failed', e);
        setIsRecordingAnswer(false);
      }
    }
  };

  // Generate Questions with Gemini
  const handleStartSetup = async () => {
    setIsGeneratingQuestions(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.generateInterviewQuestions({
        role: targetRole,
        company: targetCompany,
        jobDescription: profile.targetJobDescription || '',
        resumeSummary: profile.resumeText.slice(0, 1500),
        interviewType: interviewType,
        questionCount: questionCount,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        const newSession: InterviewSession = {
          id: `int_${Date.now()}`,
          date: new Date().toISOString(),
          role: targetRole,
          company: targetCompany,
          interviewerPersona: res.interviewerPersona || 'Principal Systems Bar Raiser',
          interviewType: interviewType,
          questions: res.questions,
          answers: {},
          timings: {},
          totalDurationSeconds: 0,
          measuredPaceWpm: 135,
          measuredFillerWords: 0,
          cameraUsed: cameraEnabled,
          evaluation: null,
          status: 'in-progress',
        };

        setActiveSession(newSession);
        setCurrentQuestionIndex(0);
        setCurrentAnswerText('');
        setQuestionElapsedSeconds(0);
        setCurrentStep('permissions');
      } else {
        setErrorMsg('Failed to generate interview questions. Please try again.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error initializing interview session.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Submit Answer & Go to Next
  const handleNextQuestion = () => {
    if (!activeSession) return;

    if (isRecordingAnswer && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingAnswer(false);
    }

    const currentQ = activeSession.questions[currentQuestionIndex];
    const duration = Math.max(10, questionElapsedSeconds);

    const updatedAnswers = {
      ...activeSession.answers,
      [currentQ.id]: currentAnswerText.trim() || 'No answer provided.',
    };

    const updatedTimings = {
      ...activeSession.timings,
      [currentQ.id]: duration,
    };

    const updatedSession: InterviewSession = {
      ...activeSession,
      answers: updatedAnswers,
      timings: updatedTimings,
    };

    setActiveSession(updatedSession);

    if (currentQuestionIndex + 1 < activeSession.questions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswerText('');
      setQuestionElapsedSeconds(0);
      speakQuestion(activeSession.questions[nextIdx].question);
    } else {
      handleFinishAndEvaluate(updatedSession);
    }
  };

  // Finish & Evaluate
  const handleFinishAndEvaluate = async (completedSession: InterviewSession) => {
    setCurrentStep('evaluating');
    setIsEvaluating(true);
    stopMediaTracks();

    const totalSeconds = Object.values(completedSession.timings).reduce((a, b) => a + b, 0);

    const qnaList = completedSession.questions.map((q) => ({
      category: q.category,
      question: q.question,
      answer: completedSession.answers[q.id] || '',
    }));

    try {
      const evalRes = await ApiService.evaluateInterview({
        role: completedSession.role,
        company: completedSession.company,
        jobDescription: profile.targetJobDescription || '',
        questionsAndAnswers: qnaList,
        measuredPaceWpm: measuredPaceWpm,
        measuredFillerWords: detectedFillerWords,
        totalDurationSeconds: totalSeconds,
      });

      if (evalRes.success && evalRes.evaluation) {
        const finalizedSession: InterviewSession = {
          ...completedSession,
          totalDurationSeconds: totalSeconds,
          measuredPaceWpm: measuredPaceWpm,
          measuredFillerWords: detectedFillerWords,
          evaluation: evalRes.evaluation,
          status: 'completed',
        };

        // Auto-sync missed concepts and recommendations to Memory Revival
        StorageService.autoSyncInterviewToMemory(finalizedSession);

        setActiveSession(finalizedSession);
        onSaveInterview(finalizedSession);
        setCurrentStep('report');
      } else {
        alert('Evaluation could not be processed.');
        setCurrentStep('setup');
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
      alert('Error evaluating interview: ' + err.message);
      setCurrentStep('setup');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>AI Mock Interview Simulator</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Video & Voice Evaluation
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Practice real technical questions with live camera feed, real-time speech pace, confidence gauge, and Gemini evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 'report' && (
            <button
              onClick={() => setCurrentStep('setup')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Mock Interview</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- STEP 1: SETUP ---------------- */}
      {currentStep === 'setup' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Configure Interview Session
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gemini designs probing questions tailored directly to your target company and job description.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe, Google, Datadog"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Software Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Evaluation Track
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Technical & System Design',
                  'Core Architecture & Coding',
                  'Behavioral & Leadership',
                  'Comprehensive Role Bar-Raiser',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type as any)}
                    className={`p-3.5 text-left rounded-xl text-xs transition-all border ${
                      interviewType === type
                        ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Question Count
              </label>
              <div className="flex gap-3">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Questions ({num * 3} min)
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-900 font-bold">Privacy by Design: </span>
                Your video stream and speech recognition are processed in-browser. Raw audio and video recordings are never saved to remote servers. Only evaluated answers and score metrics are kept.
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleStartSetup}
              disabled={isGeneratingQuestions}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Contextual Role Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Configure Video & Enter Room</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: CAMERA & MIC EQUIPMENT CHECK ---------------- */}
      {currentStep === 'permissions' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Live Video & Microphone Setup
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your live video will be displayed right while you answer each question.
            </p>
          </div>

          <div className="space-y-3">
            {/* Live Camera Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Live Video Feed (Displayed while answering)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    See yourself in real-time as you speak your responses.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  cameraEnabled ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cameraEnabled ? 'Camera On' : 'Off'}
              </button>
            </div>

            {/* Microphone Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600">
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Microphone Audio
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Measures speaking pace (WPM), confidence, and filler words.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMicEnabled(!micEnabled)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  micEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {micEnabled ? 'Mic Active' : 'Off'}
              </button>
            </div>

            {/* Voice Synthesis Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600">
                  {speechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Interviewer Voice (Speech Synthesis)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Speaks interview questions aloud naturally.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  speechSynthesisEnabled ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {speechSynthesisEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>

          {permissionError && (
            <div className="p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{permissionError}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setCurrentStep('setup')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
            >
              Back to Setup
            </button>
            <button
              onClick={startCameraAndMic}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Begin Live Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 3: LIVE INTERVIEW ROOM (VIDEO FRONT & CENTER) ---------------- */}
      {currentStep === 'room' && activeSession && (
        <div className="space-y-6">
          {/* Top Session Progress Bar & Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Question {currentQuestionIndex + 1} of {activeSession.questions.length}
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                {activeSession.questions[currentQuestionIndex].category}
              </span>
            </div>

            {/* Real-time Delivery Counters & Live Confidence Gauge */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-900 font-bold tabular-nums">
                  {Math.floor(questionElapsedSeconds / 60)}:
                  {String(questionElapsedSeconds % 60).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Pace:</span>
                <span className="text-slate-900 font-bold tabular-nums">{measuredPaceWpm} WPM</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Fillers:</span>
                <span className="text-amber-600 font-bold tabular-nums">{detectedFillerWords}</span>
              </div>

              {/* Live Confidence Badge */}
              <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 text-indigo-800">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-sans text-[11px] font-semibold">{confidenceLabel}</span>
                <span className="font-bold tabular-nums">({liveConfidenceScore}%)</span>
              </div>
            </div>
          </div>

          {/* Main Dual Stage: Video + Response alongside Interviewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Interviewer Card */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      AI
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {activeSession.interviewerPersona}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activeSession.company} · {activeSession.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speakQuestion(activeSession.questions[currentQuestionIndex].question)
                    }
                    title="Repeat question"
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="text-base text-slate-900 font-semibold leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    "{activeSession.questions[currentQuestionIndex].question}"
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <strong className="text-indigo-900 font-semibold">What the Interviewer is Assessing: </strong>
                    {activeSession.questions[currentQuestionIndex].contextOrIntent}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Structure: Context → Approach → Trade-offs</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Interviewer
                </span>
              </div>
            </div>

            {/* Right Column (7 cols): Candidate Live Video & Real-time Answering */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Live Candidate Stream & Delivery
                    </span>
                    {cameraEnabled && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Audio Volume Visualizer Meter */}
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-75"
                        style={{ width: `${Math.min(100, audioVolume * 1.5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prominent Live Video Display */}
                {cameraEnabled ? (
                  <div className="relative aspect-video max-h-56 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 mb-4 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Feed
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono">
                      Confidence: {liveConfidenceScore}%
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 mb-4 flex items-center gap-2.5">
                    <VideoOff className="w-4 h-4 text-slate-400" />
                    <span>Camera-off mode active. Focus is purely on verbal & conceptual substance.</span>
                  </div>
                )}

                {/* Candidate Speech Transcript & Box */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span className="font-semibold text-slate-800">Your Spoken Answer</span>
                    <span className="text-[11px] text-slate-400">Speak or edit text directly</span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentAnswerText}
                    onChange={(e) => setCurrentAnswerText(e.target.value)}
                    placeholder="Click 'Record Answer' below to speak your response, or type here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                    isRecordingAnswer
                      ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isRecordingAnswer ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecordingAnswer ? 'Stop Recording' : 'Record Answer (Voice)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>
                    {currentQuestionIndex + 1 < activeSession.questions.length
                      ? 'Submit & Next Question'
                      : 'Finish & Evaluate Interview'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 4: EVALUATING SCREEN ---------------- */}
      {currentStep === 'evaluating' && (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Evaluating Technical Depth & Answer Structure...
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Gemini Bar Raiser is grading technical accuracy, depth of reasoning, edge-case coverage, and measured speech delivery against {activeSession?.role} standards.
          </p>
        </div>
      )}

      {/* ---------------- STEP 5: EVALUATION REPORT ---------------- */}
      {currentStep === 'report' && activeSession?.evaluation && (
        <div className="space-y-6">
          {/* Header Score & Verdict */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{activeSession.role}</span>
                  <span>·</span>
                  <span>{activeSession.company}</span>
                  <span>·</span>
                  <span>{new Date(activeSession.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span>Verdict:</span>
                  <span className="text-indigo-600">{activeSession.evaluation.verdict}</span>
                </h2>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Evaluated across technical correctness, reasoning depth, delivery pace ({activeSession.measuredPaceWpm} WPM), and verbal economy ({activeSession.measuredFillerWords} filler words detected).
                </p>
              </div>

              {/* Score Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shrink-0 min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
                  <span>Interview Score</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-900">
                    {activeSession.evaluation.overallScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Duration:</span>
                  <span className="text-slate-800 font-mono font-semibold">
                    {Math.round(activeSession.totalDurationSeconds / 60)} min
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Core Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
              {Object.entries(activeSession.evaluation.dimensionScores).map(([key, item]) => {
                const labelMap: Record<string, string> = {
                  technicalAccuracy: 'Technical Accuracy',
                  depthOfReasoning: 'Depth of Reasoning',
                  answerRelevance: 'Answer Relevance',
                  answerStructure: 'Answer Structure',
                  communicationClarity: 'Clarity & Delivery',
                };
                return (
                  <div
                    key={key}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium truncate">{labelMap[key] || key}</span>
                      <span className="font-mono text-slate-900 font-bold tabular-nums">
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Key Demonstrated Strengths</h3>
              </div>
              <ul className="space-y-2">
                {activeSession.evaluation.keyStrengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Targeted Improvement Areas</h3>
              </div>
              <ul className="space-y-2">
                {activeSession.evaluation.improvementAreas.map((imp, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Breakdown with Candidate Answer & Model Answer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Detailed Question Breakdown & Model Answers
            </h3>

            <div className="space-y-4">
              {activeSession.evaluation.questionBreakdowns.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      Question {idx + 1}: {item.question}
                    </span>
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 font-bold shrink-0">
                      {item.score}/100
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Your Answer: </strong>
                    "{activeSession.answers[`q${idx + 1}`] || activeSession.answers[activeSession.questions[idx]?.id] || 'No transcript'}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <span className="font-semibold text-emerald-800">What went well: </span>
                      {item.strongPoints}
                    </div>
                    <div className="text-amber-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                      <span className="font-semibold text-amber-800">Missed concept: </span>
                      {item.missedConcepts}
                    </div>
                  </div>

                  {item.modelAnswerKeyPoints?.length > 0 && (
                    <div className="text-xs text-slate-600 pt-1">
                      <span className="text-slate-900 font-semibold">Model Answer Key Points: </span>
                      {item.modelAnswerKeyPoints.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Scheduled Memory Revival Topics */}
          {activeSession.evaluation.recommendedMemoryRevivalTopics?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recommended Memory Revival Topics
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Turn missed interview questions into active recall quizzes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSession.evaluation.recommendedMemoryRevivalTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {topic.topic}
                      </div>
                      <div className="text-xs text-indigo-700 font-semibold mb-1">{topic.subtopic}</div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {topic.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onAddMemoryTopic({
                          topic: topic.topic,
                          subtopic: topic.subtopic,
                          notes: topic.keyConcepts,
                          learningDate: new Date().toISOString(),
                          intervals: [1, 3, 7, 14, 30],
                          sourceTag: 'mock-interview',
                        });
                        setAddedTopicIds((prev) => ({ ...prev, [topic.topic]: true }));
                      }}
                      disabled={addedTopicIds[topic.topic]}
                      className="w-full py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {addedTopicIds[topic.topic] ? '✓ Scheduled in Memory Revival' : '+ Schedule Retrieval Practice'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
