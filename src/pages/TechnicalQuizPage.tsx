import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  PracticeQuestion,
  selectPracticeQuestions,
  TECHNICAL_CATEGORIES,
  TECHNICAL_QUESTIONS,
} from '../data/questionBank.ts';

const ANIMATION_CSS = `
@keyframes tq-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tq-slide-in {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tq-pop-in {
  from { opacity: 0; transform: scale(0.94) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes tq-reveal {
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 300px; }
}
@keyframes tq-shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}
@keyframes tq-correct-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
  100% { box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
}
@keyframes tq-timer-warn {
  0%, 100% { background-color: #fff1f2; transform: scale(1); }
  50%      { background-color: #fecdd3; transform: scale(1.06); }
}
@keyframes tq-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(22px, -16px) scale(1.08); }
}
@keyframes tq-float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-26px, 18px) scale(1.1); }
}
@keyframes tq-stripes {
  from { background-position: 0 0; }
  to   { background-position: 28px 0; }
}
@keyframes tq-shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
@keyframes tq-spin-once {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
@keyframes tq-trophy {
  0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(6deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.tq-fade-up    { animation: tq-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tq-slide-in   { animation: tq-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tq-pop-in     { animation: tq-pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tq-reveal     { animation: tq-reveal 0.4s ease-out both; overflow: hidden; }
.tq-shake      { animation: tq-shake 0.45s ease-in-out; }
.tq-correct    { animation: tq-correct-pulse 0.9s ease-out; }
.tq-timer-warn { animation: tq-timer-warn 1s ease-in-out infinite; }
.tq-blob-a     { animation: tq-float 9s ease-in-out infinite; }
.tq-blob-b     { animation: tq-float-slow 11s ease-in-out infinite; }
.tq-trophy     { animation: tq-trophy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.tq-spin-once  { animation: tq-spin-once 0.6s ease-in-out; }
.tq-progress-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255,255,255,0.28) 25%, transparent 25%, transparent 50%,
    rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.28) 75%, transparent 75%
  );
  background-size: 28px 28px;
  animation: tq-stripes 1s linear infinite;
}
.tq-shimmer-btn {
  background-image: linear-gradient(110deg, #2563eb 30%, #6366f1 45%, #3b82f6 55%, #2563eb 70%);
  background-size: 200% 100%;
}
.tq-shimmer-btn:hover { animation: tq-shimmer 1.6s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .tq-fade-up, .tq-slide-in, .tq-pop-in, .tq-reveal, .tq-shake, .tq-correct,
  .tq-timer-warn, .tq-blob-a, .tq-blob-b, .tq-trophy, .tq-spin-once,
  .tq-progress-fill, .tq-shimmer-btn:hover {
    animation: none !important;
  }
}
`;

// Number that counts up smoothly from 0
function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{display}</>;
}

// Circular score ring that draws itself
function ScoreRing({ percentage }: { percentage: number }) {
  const [filled, setFilled] = useState(0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const id = window.setTimeout(() => setFilled(percentage), 80);
    return () => window.clearTimeout(id);
  }, [percentage]);

  const stroke =
    percentage < 50 ? '#ef4444' : percentage < 70 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled / 100)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono tabular-nums text-slate-900">
        <CountUp value={percentage} />%
      </div>
    </div>
  );
}

export function TechnicalQuizPage() {
  const {
    quizResults,
    recordQuizResult,
    selectedQuizCategory,
    setSelectedQuizCategory,
  } = useApp();

  const initialCat =
    selectedQuizCategory && TECHNICAL_CATEGORIES.includes(selectedQuizCategory as any)
      ? selectedQuizCategory
      : 'Java';

  const [category, setCategory] = useState<string>(initialCat);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    selectPracticeQuestions(TECHNICAL_QUESTIONS, initialCat, 'Medium', 5)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});
  const [timer, setTimer] = useState<number>(5 * 60);
  const [quizStarted, setQuizStarted] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<{
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    percentage: number;
  } | null>(null);
  // Bumped on every new question set so the whole quiz area re-plays its entrance
  const [setVersion, setSetVersion] = useState<number>(0);

  const loadQuizQuestions = useCallback(
    async (cat: string, diff: 'Easy' | 'Medium' | 'Hard', cnt: number) => {
      // Immediately set deterministic local questions so the user never waits on an empty screen
      const localSet = selectPracticeQuestions(TECHNICAL_QUESTIONS, cat, diff, cnt);
      setQuestions(localSet);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setRevealedExplanations({});
      setFinalScore(null);
      setTimer(cnt * 60);
      setQuizCompleted(false);
      setQuizStarted(true);
      setSetVersion((v) => v + 1);

      try {
        const res = await fetch(
          `/api/quiz/questions?category=${encodeURIComponent(cat)}&difficulty=${encodeURIComponent(
            diff
          )}&count=${cnt}`
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

  // Sync if user navigated here from a recommendation card
  useEffect(() => {
    if (selectedQuizCategory && TECHNICAL_CATEGORIES.includes(selectedQuizCategory as any)) {
      const target = selectedQuizCategory;
      setCategory(target);
      setSelectedQuizCategory(null);
      loadQuizQuestions(target, difficulty, questionCount);
    }
  }, [selectedQuizCategory, setSelectedQuizCategory, difficulty, questionCount, loadQuizQuestions]);

  // Countdown timer
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;
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
  }, [quizStarted, quizCompleted]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (quizStarted && !quizCompleted && timer === 0 && questions.length > 0) {
      handleSubmitQuiz();
    }
  }, [timer, quizStarted, quizCompleted, questions.length]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadQuizQuestions(newCat, difficulty, questionCount);
  };

  const handleDifficultyChange = (newDiff: 'Easy' | 'Medium' | 'Hard') => {
    setDifficulty(newDiff);
    loadQuizQuestions(category, newDiff, questionCount);
  };

  const handleCountChange = (newCnt: number) => {
    setQuestionCount(newCnt);
    loadQuizQuestions(category, difficulty, newCnt);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (quizCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const toggleExplanation = (idx: number) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSubmitQuiz = async () => {
    if (quizCompleted || questions.length === 0) return;

    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct += 1;
      }
    });

    const total = questions.length;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);

    setQuizCompleted(true);
    setQuizStarted(false);
    setFinalScore({
      score: correct,
      correctAnswers: correct,
      wrongAnswers: wrong,
      percentage,
    });

    await recordQuizResult({
      category,
      difficulty,
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      score: correct,
      percentage,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const currentUserChoice = selectedAnswers[currentQuestionIndex];
  const isCurrentRevealed = Boolean(revealedExplanations[currentQuestionIndex]);
  const timerLow = timer <= 30 && timer > 0;

  return (
    <div className="space-y-6 relative">
      <style>{ANIMATION_CSS}</style>

      {/* Header with floating pastel blobs */}
      <div className="tq-fade-up relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 sm:p-8">
        <div className="tq-blob-a pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="tq-blob-b pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="tq-blob-a pointer-events-none absolute top-4 left-10 h-32 w-32 rounded-full bg-emerald-100/60 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-blue-600">
              Module 2A · Core Computer Science Assessment
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              Technical Quiz Practice
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Select any CSE subject below to immediately practice technical interview questions with explanations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadQuizQuestions(category, difficulty, questionCount)}
            className="group px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:-translate-y-0.5 hover:shadow-md active:scale-95 rounded-xl inline-flex items-center gap-1.5 self-start transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-rotate-180" />
            <span>Restart / New Question Set</span>
          </button>
        </div>
      </div>

      {/* Interactive Subject, Difficulty & Count Control Bar */}
      <div
        className="tq-fade-up p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
        style={{ animationDelay: '80ms' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">1. Choose Subject Category:</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Difficulty:</span>
            {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleDifficultyChange(lvl)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-90 cursor-pointer ${
                  difficulty === lvl
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                {lvl}
              </button>
            ))}

            <span className="text-xs font-semibold text-slate-700 ml-2">Questions:</span>
            {[5, 6, 8, 10].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleCountChange(cnt)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition-all duration-200 active:scale-90 cursor-pointer ${
                  questionCount === cnt
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {TECHNICAL_CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              style={{ animationDelay: `${120 + i * 40}ms` }}
              className={`tq-pop-in px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all duration-200 truncate hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                category === cat
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-transparent shadow-md shadow-blue-500/25'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Active Question Runner on Left + Recent Quiz Scores on Right */}
      {!quizCompleted && currentQ && (
        <div
          key={`runner-${setVersion}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="tq-pop-in lg:col-span-8 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
            {/* Top Bar: Category, Progress, Timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-blue-600">{category}</span>
                  <span className="mx-1.5">·</span>
                  <span>{currentQ.difficulty} Difficulty</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold tabular-nums inline-flex items-center gap-1.5 border transition-colors duration-300 ${
                    timerLow
                      ? 'tq-timer-warn text-red-700 border-red-300'
                      : 'bg-sky-50 text-blue-800 border-sky-200'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${timerLow ? 'text-red-500' : 'text-blue-500'}`} />
                  <span>{formatTime(timer)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="tq-progress-fill h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full origin-left"
                style={{
                  transform: `scaleX(${(currentQuestionIndex + 1) / questions.length})`,
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>

            {/* Question + Options: re-mounts on every question so it slides in */}
            <div key={`q-${currentQuestionIndex}-${setVersion}`} className="space-y-6">
              <div className="tq-slide-in py-1">
                <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQ.question}
                </h2>
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = currentUserChoice === idx;
                  const isCorrectOption = idx === currentQ.correctAnswer;

                  let optionStyle =
                    'bg-white border-slate-200 text-slate-700 hover:bg-sky-50/70 hover:border-blue-300 hover:translate-x-1';
                  let extraAnim = '';
                  if (isCurrentRevealed) {
                    if (isCorrectOption) {
                      optionStyle =
                        'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                      extraAnim = 'tq-correct';
                    } else if (isSelected) {
                      optionStyle = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                      extraAnim = 'tq-shake';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-blue-50 border-blue-500 text-slate-900 font-semibold shadow-sm shadow-blue-500/10 translate-x-1';
                  }

                  return (
                    <button
                      key={`${idx}-${isCurrentRevealed}`}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      style={{ animationDelay: `${120 + idx * 70}ms` }}
                      className={`tq-fade-up w-full p-4 rounded-xl border text-left text-sm transition-all duration-200 flex items-start gap-3 active:scale-[0.99] cursor-pointer ${optionStyle} ${extraAnim}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white scale-110'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instant Answer Check / Explanation Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => toggleExplanation(currentQuestionIndex)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isCurrentRevealed
                    ? 'Hide Answer & Explanation'
                    : 'Check Answer & Explanation'}
                </span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Answered: {Object.keys(selectedAnswers).length} / {questions.length}
              </span>
            </div>

            {isCurrentRevealed && (
              <div className="tq-reveal p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-sky-50/60 border border-emerald-200/70 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-700">
                  Correct Option: {String.fromCharCode(65 + currentQ.correctAnswer)} —{' '}
                  {currentQ.options[currentQ.correctAnswer]}
                </div>
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Explanation:</strong> {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Question Navigation Palette & Previous/Next/Submit Controls */}
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl inline-flex items-center gap-1.5 transition-all duration-200 hover:-translate-x-0.5 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const answered = selectedAnswers[idx] !== undefined;
                  const active = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-110'
                          : answered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
                    }
                    className="tq-shimmer-btn px-4 py-2 text-xs font-semibold text-white rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:translate-x-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Technical Quiz History */}
          <div
            className="tq-fade-up lg:col-span-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
            style={{ animationDelay: '150ms' }}
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Quiz Score History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every submitted quiz updates your Profile Progress & Recommendations.
              </p>
            </div>

            {quizResults.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {quizResults.slice(0, 6).map((res, i) => (
                  <div
                    key={res.id}
                    style={{ animationDelay: `${200 + i * 70}ms` }}
                    className="tq-slide-in py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs transition-colors duration-200 hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{res.category}</div>
                      <div className="text-slate-500 mt-0.5">
                        {res.difficulty} · {res.correctAnswers}/{res.totalQuestions} Correct
                      </div>
                    </div>
                    <div
                      className={`text-sm font-mono font-bold tabular-nums ${
                        res.percentage < 50
                          ? 'text-red-600'
                          : res.percentage < 70
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {res.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-sky-50/60 border border-dashed border-sky-200 text-xs text-slate-600 text-center">
                Answer the questions on the left and click <strong>Submit Quiz</strong> to record your first technical score!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Result & Detailed Answer Review Screen */}
      {quizCompleted && finalScore && (
        <div className="space-y-6">
          <div className="tq-pop-in relative overflow-hidden p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
            <div className="tq-blob-a pointer-events-none absolute -top-20 -right-16 h-60 w-60 rounded-full bg-sky-100/70 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="tq-trophy">
                  <ScoreRing percentage={finalScore.percentage} />
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-600">
                    Quiz Completed · {category} ({difficulty})
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Your Score: <CountUp value={finalScore.score} /> / {questions.length} (
                    {finalScore.percentage}%)
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-lg">
                    {finalScore.percentage < 50
                      ? 'Priority = HIGH: Focus on this topic. Review the explanations below and revise your study notes.'
                      : finalScore.percentage < 70
                      ? 'Priority = MEDIUM: Practice more to push your accuracy above 70%.'
                      : 'Priority = LOW: Great performance! Maintain your mastery with periodic practice.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadQuizQuestions(category, difficulty, questionCount)}
                className="tq-shimmer-btn group px-5 py-2.5 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 self-start shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-180" />
                <span>Practice Another Quiz</span>
              </button>
            </div>

            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Percentage',
                  box: 'bg-slate-50 border-slate-200',
                  labelColor: 'text-slate-500',
                  valueColor: 'text-slate-900',
                  value: <><CountUp value={finalScore.percentage} />%</>,
                },
                {
                  label: 'Correct Answers',
                  box: 'bg-emerald-50/70 border-emerald-200',
                  labelColor: 'text-emerald-700',
                  valueColor: 'text-emerald-800',
                  value: <CountUp value={finalScore.correctAnswers} />,
                },
                {
                  label: 'Wrong / Unanswered',
                  box: 'bg-red-50/70 border-red-200',
                  labelColor: 'text-red-700',
                  valueColor: 'text-red-800',
                  value: <CountUp value={finalScore.wrongAnswers} />,
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{ animationDelay: `${150 + i * 90}ms` }}
                  className={`tq-pop-in p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${stat.box}`}
                >
                  <div className={`text-xs ${stat.labelColor}`}>{stat.label}</div>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums mt-1 ${stat.valueColor}`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}

              <div
                style={{ animationDelay: '420ms' }}
                className="tq-pop-in p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-xs text-slate-500">Topic Performance</div>
                <div className="text-sm font-bold text-slate-900 mt-2">
                  {finalScore.percentage >= 70
                    ? 'Strong (>=70%)'
                    : finalScore.percentage >= 50
                    ? 'Moderate (50-69%)'
                    : 'Needs Focus (<50%)'}
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Explanation Review */}
          <div
            className="tq-fade-up p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
            style={{ animationDelay: '200ms' }}
          >
            <h3 className="text-base font-bold text-slate-900">Detailed Answer Explanations</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    style={{ animationDelay: `${300 + Math.min(idx, 10) * 80}ms` }}
                    className={`tq-fade-up p-4 rounded-xl border space-y-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isCorrect ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Your Answer:{' '}
                        {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                      </span>
                      {!isCorrect && (
                        <span className="font-semibold text-emerald-700">
                          Correct Answer: {q.options[q.correctAnswer]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}