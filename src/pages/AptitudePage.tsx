import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, animate, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  APTITUDE_CATEGORIES,
  APTITUDE_QUESTIONS,
  PracticeQuestion,
  selectPracticeQuestions,
} from '../data/questionBank.ts';

/* ---------- Animation variants ---------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const slideQuestion: Variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
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

const scoreColor = (p: number) =>
  p < 50 ? 'text-red-600' : p < 70 ? 'text-amber-600' : 'text-emerald-600';

export function AptitudePage() {
  const { aptitudeResults, recordAptitudeResult } = useApp();

  const [category, setCategory] = useState<string>('Quantitative Aptitude');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(6);

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    selectPracticeQuestions(APTITUDE_QUESTIONS, 'Quantitative Aptitude', 'Medium', 6)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answersRecord, setAnswersRecord] = useState<Record<number, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(6 * 75);
  const [testStarted, setTestStarted] = useState<boolean>(true);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);

  const loadAptitudeQuestions = useCallback(
    async (cat: string, diff: 'Easy' | 'Medium' | 'Hard', cnt: number) => {
      const localSet = selectPracticeQuestions(APTITUDE_QUESTIONS, cat, diff, cnt);
      setQuestions(localSet);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswersRecord({});
      setRevealedSolutions({});
      setScore(0);
      setTimer(cnt * 75);
      setTestCompleted(false);
      setTestStarted(true);

      try {
        const res = await fetch(
          `/api/aptitude/questions?category=${encodeURIComponent(
            cat
          )}&difficulty=${encodeURIComponent(diff)}&count=${cnt}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length === cnt) {
            setQuestions(data.questions);
          }
        }
      } catch {
        // Keep localSet already loaded
      }
    },
    []
  );

  // Timer countdown
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testStarted, testCompleted]);

  // Auto-evaluate when timer reaches 0
  useEffect(() => {
    if (testStarted && !testCompleted && timer === 0 && questions.length > 0) {
      finalizeTest(answersRecord);
    }
  }, [timer, testStarted, testCompleted, questions.length]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadAptitudeQuestions(newCat, difficulty, numberOfQuestions);
  };

  const handleDifficultyChange = (newDiff: 'Easy' | 'Medium' | 'Hard') => {
    setDifficulty(newDiff);
    loadAptitudeQuestions(category, newDiff, numberOfQuestions);
  };

  const handleCountChange = (newCnt: number) => {
    setNumberOfQuestions(newCnt);
    loadAptitudeQuestions(category, difficulty, newCnt);
  };

  const handleChooseOption = (optionIdx: number) => {
    if (testCompleted) return;
    setSelectedAnswer(optionIdx);
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  const toggleSolution = (idx: number) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedAnswer(answersRecord[nextIdx] !== undefined ? answersRecord[nextIdx] : null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      setSelectedAnswer(answersRecord[prevIdx] !== undefined ? answersRecord[prevIdx] : null);
    }
  };

  const finalizeTest = async (finalAnswers: Record<number, number>) => {
    if (testCompleted || questions.length === 0) return;

    let computedScore = 0;
    questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correctAnswer) {
        computedScore += 1;
      }
    });

    const total = questions.length;
    const wrong = total - computedScore;
    const percentage = Math.round((computedScore / total) * 100);

    setScore(computedScore);
    setTestCompleted(true);
    setTestStarted(false);

    await recordAptitudeResult({
      category,
      difficulty,
      totalQuestions: total,
      correctAnswers: computedScore,
      wrongAnswers: wrong,
      score: computedScore,
      percentage,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentSolutionShown = Boolean(revealedSolutions[currentQuestionIndex]);
  const timeLow = timer <= 30 && !testCompleted;
  const resultPercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Floating background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-6 p-4 sm:p-6 lg:p-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <motion.div
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
              whileHover={{ scale: 1.04 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.span>
              Module 2B · Placement Screening Simulator
            </motion.div>
            <h1 className="text-2xl font-bold mt-2 bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 bg-clip-text text-transparent">
              Aptitude Practice
            </h1>
            <p className="text-sm text-slate-600">
              Practice Quantitative Aptitude, Logical Reasoning, and Verbal Ability questions with step-by-step
              solutions.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => loadAptitudeQuestions(category, difficulty, numberOfQuestions)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur border border-slate-300 hover:bg-white rounded-lg shadow-sm inline-flex items-center gap-1.5 self-start cursor-pointer"
          >
            <motion.span whileHover={{ rotate: -180 }} transition={{ duration: 0.4 }} className="inline-flex">
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.span>
            <span>Load New Aptitude Set</span>
          </motion.button>
        </motion.div>

        {/* Category / Difficulty / Count bar */}
        <motion.div
          variants={fadeUp}
          className="p-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">1. Select Aptitude Category:</span>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Difficulty:</span>
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                <motion.button
                  key={lvl}
                  type="button"
                  onClick={() => handleDifficultyChange(lvl)}
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </motion.button>
              ))}

              <span className="text-xs font-semibold text-slate-700 ml-2">Questions:</span>
              {[4, 6, 8, 10].map((cnt) => (
                <motion.button
                  key={cnt}
                  type="button"
                  onClick={() => handleCountChange(cnt)}
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                    numberOfQuestions === cnt
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cnt}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {APTITUDE_CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                type="button"
                variants={fadeUp}
                onClick={() => handleCategoryChange(cat)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border text-left transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-blue-300'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Active Test */}
        {!testCompleted && currentQuestion && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-blue-600">{category}</span>
                    <span className="mx-1.5">·</span>
                    <span>{currentQuestion.difficulty} Difficulty</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>

                {/* Timer */}
                <motion.div
                  animate={
                    timeLow
                      ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 8px rgba(239,68,68,0.2)', '0 0 0 0 rgba(239,68,68,0)'] }
                      : { scale: 1 }
                  }
                  transition={timeLow ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums inline-flex items-center gap-1.5 border ${
                    timeLow
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="inline-flex"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </motion.span>
                  <span>{formatTime(timer)}</span>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                  initial={false}
                  animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Question + Options (slide animation on change) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex + '-' + currentQuestion.id}
                  variants={slideQuestion}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="py-1">
                    <h2 className="text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                      {currentQuestionIndex + 1}. {currentQuestion.question}
                    </h2>
                  </div>

                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrectOpt = idx === currentQuestion.correctAnswer;

                      let optClass = 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40';
                      if (isCurrentSolutionShown) {
                        if (isCorrectOpt) {
                          optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                        } else if (isSelected) {
                          optClass = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                        }
                      } else if (isSelected) {
                        optClass = 'bg-blue-50 border-blue-600 text-slate-900 font-semibold shadow-md shadow-blue-100';
                      }

                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          variants={fadeUp}
                          onClick={() => handleChooseOption(idx)}
                          whileHover={{ x: 6, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          animate={
                            isCurrentSolutionShown && isSelected && !isCorrectOpt
                              ? { x: [0, -8, 8, -6, 6, 0] }
                              : {}
                          }
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-colors flex items-start gap-3 cursor-pointer ${optClass}`}
                        >
                          <motion.span
                            animate={isSelected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </motion.span>
                          <span className="leading-relaxed flex-1">{opt}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Solution toggle */}
              <div className="flex items-center justify-between pt-1">
                <motion.button
                  type="button"
                  onClick={() => toggleSolution(currentQuestionIndex)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isCurrentSolutionShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>
                    {isCurrentSolutionShown ? 'Hide Step-by-Step Solution' : 'Show Step-by-Step Solution'}
                  </span>
                </motion.button>

                <span className="text-xs text-slate-500 font-mono">
                  Answered: {Object.keys(answersRecord).length} / {questions.length}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {isCurrentSolutionShown && (
                  <motion.div
                    key="solution"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 text-xs text-slate-700 space-y-1.5">
                      <div className="font-bold text-emerald-700">
                        Correct Answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)} —{' '}
                        {currentQuestion.options[currentQuestion.correctAnswer]}
                      </div>
                      <p className="leading-relaxed">
                        <strong className="text-slate-900">Step-by-Step Solution:</strong>{' '}
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <motion.button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePreviousQuestion}
                  whileHover={currentQuestionIndex === 0 ? {} : { x: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </motion.button>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {questions.map((q, idx) => {
                    const isAnswered = answersRecord[idx] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <motion.button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                          setSelectedAnswer(answersRecord[idx] !== undefined ? answersRecord[idx] : null);
                        }}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={isCurrent ? { scale: 1.15 } : { scale: 1 }}
                        className={`w-7 h-7 rounded-md text-xs font-mono font-semibold cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                            : isAnswered
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < questions.length - 1 && (
                    <motion.button
                      type="button"
                      onClick={handleNextQuestion}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-blue-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="inline-flex"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </motion.button>
                  )}

                  <motion.button
                    type="button"
                    onClick={() => finalizeTest(answersRecord)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md shadow-emerald-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Aptitude Test</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Aptitude History</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contributes 25% weight toward your overall Interview Readiness Score.
                </p>
              </div>

              {aptitudeResults.length > 0 ? (
                <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-slate-100">
                  {aptitudeResults.slice(0, 6).map((res) => (
                    <motion.div
                      key={res.id}
                      variants={fadeUp}
                      whileHover={{ x: 4, backgroundColor: 'rgba(239,246,255,0.7)' }}
                      className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{res.category}</div>
                        <div className="text-slate-500 mt-0.5">
                          {res.difficulty} · {res.correctAnswers}/{res.totalQuestions} Correct
                        </div>
                      </div>
                      <div className={`text-sm font-mono font-bold tabular-nums ${scoreColor(res.percentage)}`}>
                        {res.percentage}%
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 text-center"
                >
                  Answer the aptitude questions on the left and click <strong>Submit Aptitude Test</strong> to record
                  your score!
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Result Page */}
        {testCompleted && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div
              variants={fadeUp}
              className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200"
                  >
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="inline-flex"
                    >
                      <Trophy className="w-7 h-7" />
                    </motion.span>
                  </motion.div>
                  <div>
                    <div className="text-xs font-medium text-blue-600">
                      Aptitude Test Result · {category} ({difficulty})
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">
                      Score: <CountUp value={score} /> / {questions.length} (
                      <span className={scoreColor(resultPercent)}>
                        <CountUp value={resultPercent} suffix="%" />
                      </span>
                      )
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      All {questions.length} selected questions have been evaluated. Review the step-by-step solutions
                      below.
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => loadAptitudeQuestions(category, difficulty, numberOfQuestions)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-200 inline-flex items-center gap-2 self-start cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Another Set</span>
                </motion.button>
              </div>

              <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="text-xs text-slate-500">Accuracy</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    <CountUp value={resultPercent} suffix="%" />
                  </div>
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200"
                >
                  <div className="text-xs text-emerald-700">Correct</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
                    <CountUp value={score} />
                  </div>
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="p-4 rounded-xl bg-red-50/70 border border-red-200"
                >
                  <div className="text-xs text-red-700">Incorrect / Skipped</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-red-800 mt-1">
                    <CountUp value={questions.length - score} />
                  </div>
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="text-xs text-slate-500">Questions Evaluated</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    <CountUp value={questions.length} />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Solutions breakdown */}
            <motion.div
              variants={fadeUp}
              className="p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900">Step-by-Step Aptitude Solutions</h3>
              <motion.div variants={container} className="space-y-4">
                {questions.map((q, idx) => {
                  const chosen = answersRecord[idx];
                  const correct = chosen === q.correctAnswer;
                  return (
                    <motion.div
                      key={q.id}
                      variants={fadeUp}
                      whileHover={{ y: -3, boxShadow: '0 10px 25px -10px rgba(59,130,246,0.25)' }}
                      className={`p-4 rounded-xl border space-y-2 ${
                        correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900 whitespace-pre-line">
                          {idx + 1}. {q.question}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            correct ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          Your Choice: {chosen !== undefined ? q.options[chosen] : 'Unanswered'}
                        </span>
                        {!correct && (
                          <span className="font-semibold text-emerald-700">
                            Correct Answer: {q.options[q.correctAnswer]}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                        <strong className="text-slate-800">Solution:</strong> {q.explanation}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}