import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, animate, type Variants } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { MockInterviewRecord } from '../utils/recommendationEngine.ts';

const ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

interface QAEvaluationItem {
  question: string;
  answer: string;
  scoreOutOf10: number;
  technicalCorrectness: number;
  relevance: number;
  clarity: number;
  communication: number;
  completeness: number;
  wordCount: number;
  conceptsCovered: string[];
  conceptsMissed: string[];
  clarityAndCommunicationNote: string;
  feedback: string;
  improvementSuggestion: string;
  idealAnswerKeyPoints: string[];
  sampleIdealAnswer: string;
}

/* ---------- Animation variants ---------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stageVariants: Variants = {
  enter: { opacity: 0, y: 30, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } },
};

/* ---------- Count-up number ---------- */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);
  return (
    <>
      {display}
      {suffix}
    </>
  );
}

/* ---------- Animated progress bar ---------- */
function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.25 }}
      />
    </div>
  );
}

/* ---------- Bouncing dots loader ---------- */
function DotsLoader() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

const selectClass =
  'w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all';

export function MockInterviewPage() {
  const { user, profile, interviews, recordMockInterview } = useApp();

  const [role, setRole] = useState<string>(profile?.targetRole || 'Software Developer');
  const [type, setType] = useState<'Technical' | 'HR' | 'Mixed'>('Technical');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresher / Final Year B.Tech');
  const [totalQuestions, setTotalQuestions] = useState<number>(3);

  const [stage, setStage] = useState<
    'idle' | 'starting' | 'answering' | 'evaluating' | 'feedback' | 'completing' | 'completed'
  >('idle');
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentHint, setCurrentHint] = useState<string>('');
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [latestEvaluation, setLatestEvaluation] = useState<QAEvaluationItem | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<string>('');
  const [pendingNextTopic, setPendingNextTopic] = useState<string>('');
  const [pendingNextHint, setPendingNextHint] = useState<string>('');
  const [qaHistory, setQaHistory] = useState<QAEvaluationItem[]>([]);
  const [completedReport, setCompletedReport] = useState<MockInterviewRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartInterview = async () => {
    setErrorMsg(null);
    setStage('starting');
    setQaHistory([]);
    setCompletedReport(null);
    setCurrentQuestionNumber(1);
    setStudentAnswer('');

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || 'guest',
        },
        body: JSON.stringify({
          role,
          type,
          difficulty,
          experienceLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) {
        throw new Error(data.error || 'Could not generate first question.');
      }

      setCurrentQuestion(data.question);
      setCurrentTopic(data.topic || type);
      setCurrentHint(data.hint || 'Structure your response with Concept, Mechanism, and Example.');
      setStage('answering');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to start AI mock interview.');
      setStage('idle');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      setErrorMsg('Please write your answer before submitting.');
      return;
    }

    setErrorMsg(null);
    setStage('evaluating');

    const isLast = currentQuestionNumber >= totalQuestions;
    const prevQs = [...qaHistory.map((item) => item.question), currentQuestion];
    const wordsCount = studentAnswer.trim().split(/\s+/).filter(Boolean).length;

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || 'guest',
        },
        body: JSON.stringify({
          role,
          type,
          difficulty,
          experienceLevel,
          question: currentQuestion,
          answer: studentAnswer.trim(),
          isLastQuestion: isLast,
          nextQuestionNumber: currentQuestionNumber + 1,
          previousQuestions: prevQs,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.evaluation) {
        throw new Error(data.error || 'Failed to evaluate your answer.');
      }

      const ev = data.evaluation;
      const evaluatedItem: QAEvaluationItem = {
        question: currentQuestion,
        answer: studentAnswer.trim(),
        scoreOutOf10: Number(ev.scoreOutOf10) || 1,
        technicalCorrectness: Number(ev.technicalCorrectness) || 1,
        relevance: Number(ev.relevance) || 1,
        clarity: Number(ev.clarity) || 1,
        communication: Number(ev.communication) || 1,
        completeness: Number(ev.completeness) || 1,
        wordCount: Number(ev.wordCount) || wordsCount,
        conceptsCovered: Array.isArray(ev.conceptsCovered)
          ? ev.conceptsCovered.map(String)
          : [],
        conceptsMissed: Array.isArray(ev.conceptsMissed)
          ? ev.conceptsMissed.map(String)
          : [],
        clarityAndCommunicationNote: String(ev.clarityAndCommunicationNote || ''),
        feedback: String(ev.feedback || ''),
        improvementSuggestion: String(ev.improvementSuggestion || ''),
        idealAnswerKeyPoints: Array.isArray(ev.idealAnswerKeyPoints)
          ? ev.idealAnswerKeyPoints.map(String)
          : [],
        sampleIdealAnswer: String(ev.sampleIdealAnswer || ''),
      };

      setLatestEvaluation(evaluatedItem);
      setQaHistory((prev) => [...prev, evaluatedItem]);
      setPendingNextQuestion(String(ev.nextQuestion || ''));
      setPendingNextTopic(String(ev.nextTopic || type));
      setPendingNextHint(
        String(ev.nextHint || 'Explain the core concept, internal working, and a practical example.')
      );
      setStage('feedback');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error evaluating answer.');
      setStage('answering');
    }
  };

  const handleProceedAfterFeedback = async () => {
    if (currentQuestionNumber < totalQuestions) {
      const nextNum = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextNum);
      setCurrentQuestion(
        pendingNextQuestion ||
          `Question #${nextNum}: Describe a core technical design trade-off relevant to ${role}.`
      );
      setCurrentTopic(pendingNextTopic || type);
      setCurrentHint(pendingNextHint || 'Cover Concept, Mechanism, and Example.');
      setStudentAnswer('');
      setLatestEvaluation(null);
      setStage('answering');
    } else {
      setStage('completing');
      try {
        const res = await fetch('/api/interview/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.uid || 'guest',
          },
          body: JSON.stringify({
            role,
            type,
            difficulty,
            experienceLevel,
            qaList: qaHistory,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.interview) {
          throw new Error(data.error || 'Failed to finalize interview report.');
        }

        const record: MockInterviewRecord = data.interview;
        setCompletedReport(record);
        await recordMockInterview(record);
        setStage('completed');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Error generating final interview summary.');
        setStage('feedback');
      }
    }
  };

  const handleOpenPastReport = (item: MockInterviewRecord) => {
    setCompletedReport(item);
    try {
      const parsed = JSON.parse(item.transcriptSummary || '[]');
      if (Array.isArray(parsed)) {
        setQaHistory(parsed);
      } else {
        setQaHistory([]);
      }
    } catch {
      setQaHistory([]);
    }
    setStage('completed');
  };

  // Compute fallback dimension averages if viewing an older interview record
  const getReportDimensions = (report: MockInterviewRecord) => {
    if (report.dimensionAverages) return report.dimensionAverages;
    if (qaHistory.length > 0) {
      const n = qaHistory.length;
      const avg = (fn: (q: QAEvaluationItem) => number) =>
        Math.round((qaHistory.reduce((acc, q) => acc + fn(q), 0) / n) * 10);
      return {
        technicalAccuracy: avg((q) => q.technicalCorrectness || q.scoreOutOf10),
        relevance: avg((q) => q.relevance || q.scoreOutOf10),
        clarity: avg((q) => q.clarity || q.scoreOutOf10),
        communication: avg((q) => q.communication || q.scoreOutOf10),
        completeness: avg((q) => q.completeness || q.scoreOutOf10),
      };
    }
    const base = report.overallScore || 0;
    return {
      technicalAccuracy: base,
      relevance: base,
      clarity: base,
      communication: base,
      completeness: base,
    };
  };

  const liveWordCount = studentAnswer.trim()
    ? studentAnswer.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const stageKey =
    stage === 'idle' || stage === 'starting'
      ? 'config'
      : stage === 'answering' || stage === 'evaluating'
      ? 'answer'
      : stage === 'feedback' || stage === 'completing'
      ? 'feedback'
      : 'report';

  const pillBtn = (active: boolean) =>
    `py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
    }`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Floating background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
            whileHover={{ scale: 1.04 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="inline-flex"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            Module 5 · Multi-Dimensional Answer & Performance Analysis
          </motion.div>
          <h1 className="text-2xl font-bold mt-2 bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 bg-clip-text text-transparent">
            AI Mock Interview
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            Practice role-specific Technical, HR, or Mixed interviews. Every answer is evaluated independently on
            Technical Accuracy, Relevance, Clarity, Communication, and Completeness based strictly on what you write.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              key="err"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -6, 6, 0] }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Stage 1: Configuration & Past Reports */}
          {stageKey === 'config' && (
            <motion.div
              key="config"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Configure Mock Interview Session</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className={selectClass}
                    >
                      <option value="Internship Candidate (3rd Year B.Tech)">
                        Internship Candidate (3rd Year B.Tech)
                      </option>
                      <option value="Fresher / Final Year B.Tech">Fresher / Final Year B.Tech</option>
                      <option value="0-1 Year Entry Level">0-1 Year Entry Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Technical', 'HR', 'Mixed'] as const).map((t) => (
                        <motion.button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap={{ scale: 0.93 }}
                          className={pillBtn(type === t)}
                        >
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                        <motion.button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap={{ scale: 0.93 }}
                          className={pillBtn(difficulty === d)}
                        >
                          {d}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number of Interview Questions
                  </label>
                  <div className="flex items-center gap-3">
                    {[3, 5].map((cnt) => (
                      <motion.button
                        key={cnt}
                        type="button"
                        onClick={() => setTotalQuestions(cnt)}
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.93 }}
                        className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg border cursor-pointer ${
                          totalQuestions === cnt
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                        }`}
                      >
                        {cnt} Questions
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-900">How Performance Analysis Works:</div>
                  <p className="leading-relaxed">
                    Each response is analyzed for <strong>Technical Accuracy (35%)</strong>,{' '}
                    <strong>Relevance (20%)</strong>, <strong>Clarity (15%)</strong>,{' '}
                    <strong>Communication (15%)</strong>, and <strong>Completeness (15%)</strong> based on the
                    concepts covered, sentence structure, transition connectors, and examples in your answer.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>{role}</span>
                    <span className="mx-1.5">·</span>
                    <span>{type}</span>
                    <span className="mx-1.5">·</span>
                    <span>{difficulty}</span>
                  </div>

                  <motion.button
                    type="button"
                    disabled={stage === 'starting'}
                    onClick={handleStartInterview}
                    whileHover={stage === 'starting' ? {} : { scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {stage === 'starting' ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-flex"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{stage === 'starting' ? 'Generating Question #1' : 'Start AI Mock Interview'}</span>
                    {stage === 'starting' && <DotsLoader />}
                  </motion.button>
                </div>
              </div>

              {/* Past Reports */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Past Mock Interview Reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any completed session below to inspect its full performance breakdown.
                </p>

                {interviews.length > 0 ? (
                  <motion.div variants={container} initial="hidden" animate="show" className="mt-4 space-y-2.5">
                    {interviews.slice(0, 6).map((item) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                        whileHover={{ x: 5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenPastReport(item)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-100 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.role} ({item.type})
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {item.difficulty} · {item.totalQuestions} Questions ·{' '}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-sm font-mono font-bold tabular-nums ${
                              item.overallScore >= 75
                                ? 'text-emerald-600'
                                : item.overallScore >= 50
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {item.overallScore}%
                          </span>
                          <Eye className="w-4 h-4 text-slate-400" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="mt-6 p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-flex"
                    >
                      <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    </motion.span>
                    <p className="text-xs text-slate-600">
                      No mock interviews completed yet. Start a session on the left to get a full 5-dimension
                      performance report.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stage 2: Answering */}
          {stageKey === 'answer' && (
            <motion.div
              key="answer"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">
                    <span>{role}</span>
                    <span className="mx-1.5">·</span>
                    <span>{type} Interview</span>
                    <span className="mx-1.5">·</span>
                    <span>{difficulty}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    Question {currentQuestionNumber} of {totalQuestions}
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-500">
                  Live Word Count:{' '}
                  <motion.strong
                    key={liveWordCount}
                    initial={{ scale: 1.4, color: '#2563eb' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="inline-block"
                  >
                    {liveWordCount}
                  </motion.strong>{' '}
                  words
                </span>
              </div>

              {/* Step progress */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                  initial={false}
                  animate={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {/* Interviewer prompt (light card) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionNumber}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border border-blue-100 space-y-2 overflow-hidden"
                >
                  <motion.div
                    aria-hidden
                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-200/50 blur-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <div className="relative text-xs font-mono text-blue-700 uppercase font-semibold">
                    Interviewer Prompt · {currentTopic}
                  </div>
                  <h2 className="relative text-lg font-semibold leading-relaxed text-slate-900">
                    {currentQuestion}
                  </h2>
                  {currentHint && (
                    <p className="relative text-xs text-slate-600 pt-2 border-t border-blue-100">
                      <strong className="text-slate-800">Expected Coverage Tip:</strong> {currentHint}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Interview Response
                  </label>
                  <textarea
                    rows={7}
                    required
                    disabled={stage === 'evaluating'}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Write your clear, structured response here (define the concept, explain how it works, and give a concrete example)..."
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 leading-relaxed transition-all disabled:bg-slate-50"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Tip: Aim for 35+ words with clear definitions, transition phrases, and a practical example.
                  </span>

                  <motion.button
                    type="submit"
                    disabled={stage === 'evaluating'}
                    whileHover={stage === 'evaluating' ? {} : { scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <motion.span
                      animate={stage === 'evaluating' ? { x: [0, 6, 0], y: [0, -4, 0] } : {}}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="inline-flex"
                    >
                      <Send className="w-4 h-4" />
                    </motion.span>
                    <span>
                      {stage === 'evaluating'
                        ? 'Analyzing Your Answer Performance'
                        : 'Submit Answer for Analysis'}
                    </span>
                    {stage === 'evaluating' && <DotsLoader />}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Stage 3: Per-question feedback */}
          {stageKey === 'feedback' && latestEvaluation && (
            <motion.div
              key="feedback"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="text-xs font-medium text-blue-600">
                    Detailed Performance Analysis · Question {currentQuestionNumber} of {totalQuestions}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">Answer Evaluation Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated from your {latestEvaluation.wordCount}-word response against expected {role}{' '}
                    concepts.
                  </p>
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-lg font-bold tabular-nums self-start shadow-lg shadow-blue-200"
                >
                  Overall Question Score: <CountUp value={latestEvaluation.scoreOutOf10} /> / 10
                </motion.div>
              </div>

              {/* 5 dimensions */}
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Technical Accuracy', val: latestEvaluation.technicalCorrectness, weight: '35% weight' },
                  { label: 'Question Relevance', val: latestEvaluation.relevance, weight: '20% weight' },
                  { label: 'Answer Clarity', val: latestEvaluation.clarity, weight: '15% weight' },
                  { label: 'Communication', val: latestEvaluation.communication, weight: '15% weight' },
                  { label: 'Completeness', val: latestEvaluation.completeness, weight: '15% weight' },
                ].map((dim) => (
                  <motion.div
                    key={dim.label}
                    variants={fadeUp}
                    whileHover={{ y: -5, scale: 1.03 }}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{dim.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{dim.weight}</span>
                    </div>
                    <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                      <CountUp value={dim.val} />/10
                    </div>
                    <AnimatedBar
                      percent={dim.val * 10}
                      color={
                        dim.val >= 8
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          : dim.val >= 5
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Answer + diagnostic */}
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <motion.div variants={fadeUp} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">
                    Your Submitted Response ({latestEvaluation.wordCount} words):
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">"{latestEvaluation.answer}"</p>
                </motion.div>

                <motion.div variants={fadeUp} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">Clarity & Communication Diagnostic:</div>
                  <p className="text-slate-700 leading-relaxed">
                    {latestEvaluation.clarityAndCommunicationNote ||
                      `Evaluated sentence structure and transition clarity across ${latestEvaluation.wordCount} words.`}
                  </p>
                </motion.div>
              </motion.div>

              {/* Concepts */}
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <motion.div variants={fadeUp} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="font-bold text-emerald-900 uppercase tracking-wider">
                    Key Concepts Covered ({latestEvaluation.conceptsCovered.length})
                  </div>
                  {latestEvaluation.conceptsCovered.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {latestEvaluation.conceptsCovered.map((c, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 300 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-900 font-medium"
                        >
                          {c}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">
                      No specific technical keywords from the prompt were detected in your answer.
                    </p>
                  )}
                </motion.div>

                <motion.div variants={fadeUp} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="font-bold text-amber-900 uppercase tracking-wider">
                    Expected Concepts Missed ({latestEvaluation.conceptsMissed.length})
                  </div>
                  {latestEvaluation.conceptsMissed.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {latestEvaluation.conceptsMissed.map((c, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 300 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="px-2.5 py-1 rounded bg-white border border-amber-200 text-amber-900 font-medium"
                        >
                          {c}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-700 font-medium">
                      You covered all primary expected keywords for this question!
                    </p>
                  )}
                </motion.div>
              </motion.div>

              {/* Feedback boxes */}
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 text-xs leading-relaxed">
                <motion.div variants={fadeUp} className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-800">
                  <strong className="block text-blue-900 mb-1">Technical & Behavioral Evaluation Feedback:</strong>
                  {latestEvaluation.feedback}
                </motion.div>

                <motion.div variants={fadeUp} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800">
                  <strong className="block text-amber-900 mb-1">How to Improve This Specific Answer:</strong>
                  {latestEvaluation.improvementSuggestion}
                </motion.div>

                {latestEvaluation.sampleIdealAnswer && (
                  <motion.div variants={fadeUp} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-slate-800">
                    <strong className="block text-emerald-900 mb-1">Reference 10/10 Model Answer:</strong>
                    {latestEvaluation.sampleIdealAnswer}
                  </motion.div>
                )}
              </motion.div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <motion.button
                  type="button"
                  disabled={stage === 'completing'}
                  onClick={handleProceedAfterFeedback}
                  whileHover={stage === 'completing' ? {} : { scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {stage === 'completing'
                      ? 'Compiling Full Interview Performance Report'
                      : currentQuestionNumber < totalQuestions
                      ? `Proceed to Question ${currentQuestionNumber + 1}`
                      : 'Complete Interview & View Full Performance Report'}
                  </span>
                  {stage === 'completing' ? (
                    <DotsLoader />
                  ) : (
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="inline-flex"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Stage 4: Complete report */}
          {stageKey === 'report' && completedReport && (
            <motion.div
              key="report"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </motion.span>
                      <span>
                        Complete Interview Performance Report · {completedReport.role} ({completedReport.type})
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">
                      Overall Performance Score:{' '}
                      <span
                        className={
                          completedReport.overallScore >= 75
                            ? 'text-emerald-600'
                            : completedReport.overallScore >= 50
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }
                      >
                        <CountUp value={completedReport.overallScore} suffix="%" />
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Performance Band:{' '}
                      <strong className="text-slate-900">
                        {completedReport.performanceBand ||
                          (completedReport.overallScore >= 75
                            ? 'Excellent (Placement Ready)'
                            : completedReport.overallScore >= 55
                            ? 'Good (Solid Foundation)'
                            : 'Developing (Needs Practice)')}
                      </strong>{' '}
                      · Evaluated across {completedReport.totalQuestions} question(s)
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setStage('idle')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-200 inline-flex items-center gap-2 self-start cursor-pointer"
                  >
                    <motion.span whileHover={{ rotate: -180 }} transition={{ duration: 0.4 }} className="inline-flex">
                      <RotateCcw className="w-4 h-4" />
                    </motion.span>
                    <span>Start New Interview</span>
                  </motion.button>
                </div>

                {/* 5-dimension averages */}
                {(() => {
                  const dims = getReportDimensions(completedReport);
                  const items = [
                    { label: 'Technical Accuracy', score: dims.technicalAccuracy },
                    { label: 'Question Relevance', score: dims.relevance },
                    { label: 'Answer Clarity', score: dims.clarity },
                    { label: 'Communication Skills', score: dims.communication },
                    { label: 'Depth & Completeness', score: dims.completeness },
                  ];
                  return (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Multi-Dimensional Performance Breakdown (Averaged Across All Answers)
                      </h3>
                      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {items.map((d) => (
                          <motion.div
                            key={d.label}
                            variants={fadeUp}
                            whileHover={{ y: -5, scale: 1.03 }}
                            className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2"
                          >
                            <div className="text-xs font-semibold text-slate-700">{d.label}</div>
                            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                              <CountUp value={d.score} suffix="%" />
                            </div>
                            <AnimatedBar
                              percent={d.score}
                              color={
                                d.score >= 75
                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                  : d.score >= 50
                                  ? 'bg-gradient-to-r from-blue-400 to-indigo-600'
                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                              }
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  );
                })()}

                {/* Strengths vs weaknesses */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <motion.div variants={fadeUp} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Demonstrated Strengths
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {completedReport.strongAreas.map((s, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeUp} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Areas Requiring Improvement
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {completedReport.weakAreas.map((w, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>

                {/* Suggestions */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-900">
                    Actionable Recommendations to Improve Your Interview Score
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                    {completedReport.suggestions.map((sug, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="leading-relaxed"
                      >
                        {sug}
                      </motion.li>
                    ))}
                  </ol>
                </motion.div>
              </div>

              {/* Transcript */}
              {qaHistory.length > 0 && (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Question-by-Question Transcript & Dimension Scores
                  </h3>
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {qaHistory.map((qa, index) => (
                      <motion.div
                        key={index}
                        variants={fadeUp}
                        whileHover={{ y: -3, boxShadow: '0 10px 25px -10px rgba(59,130,246,0.25)' }}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                          <div className="text-sm font-bold text-slate-900">
                            Q{index + 1}. {qa.question}
                          </div>
                          <span className="px-3 py-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-mono font-bold shrink-0 self-start shadow-md shadow-blue-200">
                            Score: {qa.scoreOutOf10}/10
                          </span>
                        </div>

                        <div className="text-xs text-slate-700">
                          <strong className="text-slate-900">Your Answer:</strong> "{qa.answer}"
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          {[
                            ['Technical', qa.technicalCorrectness],
                            ['Relevance', qa.relevance],
                            ['Clarity', qa.clarity],
                            ['Communication', qa.communication],
                            ['Completeness', qa.completeness],
                          ].map(([label, val]) => (
                            <motion.span
                              key={label as string}
                              whileHover={{ scale: 1.08, y: -2 }}
                              className="px-2.5 py-1 rounded bg-white border border-slate-200"
                            >
                              {label}: <strong>{val}/10</strong>
                            </motion.span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                          <strong className="text-slate-800">Evaluator Feedback:</strong> {qa.feedback}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}