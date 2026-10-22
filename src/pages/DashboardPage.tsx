import React, { useEffect, useState } from 'react';
import { motion, animate, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext.tsx';

/* ---------- Animation variants ---------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

/* ---------- Count-up number ---------- */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
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
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
}

const scoreColor = (p: number) =>
  p < 50 ? 'text-red-600' : p < 70 ? 'text-amber-600' : 'text-emerald-600';

export function DashboardPage() {
  const {
    profile,
    quizResults,
    aptitudeResults,
    resumes,
    interviews,
    notes,
    readiness,
    setActiveTab,
    setSelectedQuizCategory,
  } = useApp();

  const completedProfileFields = profile
    ? [
        profile.name,
        profile.college,
        profile.department,
        profile.cgpa,
        profile.targetRole,
        (profile.skills?.length || 0) > 0 || (profile.knownSubjects?.length || 0) > 0 ? 'skills' : '',
      ].filter(Boolean).length
    : 0;
  const profileCompletion = Math.round((completedProfileFields / 6) * 100);
  const importantNotesCount = notes.filter((n) => Boolean(n.important)).length;

  const quickModules: Array<{
    tab: NavigationTab;
    title: string;
    subtitle: string;
    metric: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      tab: 'quiz',
      title: 'Technical Quiz',
      subtitle: 'Java, Python, C, DSA, DBMS, OS, CN, OOP',
      metric: `${quizResults.length} Attempted · ${readiness.technicalScore}% Avg`,
      icon: Brain,
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      tab: 'aptitude',
      title: 'Aptitude Practice',
      subtitle: 'Quantitative, Logical & Verbal Tests',
      metric: `${aptitudeResults.length} Attempted · ${readiness.aptitudeScore}% Avg`,
      icon: TrendingUp,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      tab: 'resume',
      title: 'AI Resume Analyzer',
      subtitle: 'Upload & verify resume (.PDF, .DOCX, .TXT)',
      metric: `${resumes.length} Analyzed · ${readiness.resumeScore}% Score`,
      icon: FileText,
      accent: 'from-orange-500 to-amber-500',
    },
    {
      tab: 'interview',
      title: 'AI Mock Interview',
      subtitle: '5-Dimension Performance & Clarity Analysis',
      metric: `${interviews.length} Sessions · ${readiness.mockInterviewScore}% Avg`,
      icon: MessageSquare,
      accent: 'from-pink-500 to-rose-500',
    },
    {
      tab: 'notes',
      title: 'Study Notes',
      subtitle: 'Topic revision notes & Important filter',
      metric: `${notes.length} Notes · ${importantNotesCount} Important`,
      icon: BookOpen,
      accent: 'from-violet-500 to-purple-500',
    },
    {
      tab: 'progress',
      title: 'Progress Tracker',
      subtitle: 'Visual Recharts performance analytics',
      metric: `${readiness.learningProgressScore}% Learning Progress`,
      icon: CheckCircle2,
      accent: 'from-cyan-500 to-sky-500',
    },
  ];

  const kpis: Array<{
    tab: NavigationTab;
    label: string;
    value: number;
    link: string;
  }> = [
    {
      tab: 'quiz',
      label: 'Technical Quiz Accuracy',
      value: readiness.technicalScore,
      link: `${quizResults.length} ${quizResults.length === 1 ? 'Quiz' : 'Quizzes'} →`,
    },
    {
      tab: 'aptitude',
      label: 'Aptitude Accuracy',
      value: readiness.aptitudeScore,
      link: `${aptitudeResults.length} ${aptitudeResults.length === 1 ? 'Test' : 'Tests'} →`,
    },
    {
      tab: 'resume',
      label: 'AI Resume Score',
      value: readiness.resumeScore,
      link: resumes.length > 0 ? 'Latest Resume →' : 'Upload File →',
    },
    {
      tab: 'interview',
      label: 'AI Mock Interview Score',
      value: readiness.mockInterviewScore,
      link: `${interviews.length} ${interviews.length === 1 ? 'Session' : 'Sessions'} →`,
    },
  ];

  const subjects = ['Java', 'Python', 'C', 'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Floating soft background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8"
      >
        {/* Welcome Header */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80"
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
              Student Workspace · Target Role: {profile?.targetRole || 'Software Developer'}
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {profile?.name || 'Student'}
              </span>{' '}
              <motion.span
                className="inline-block origin-[70%_70%]"
                animate={{ rotate: [0, 20, -10, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                👋
              </motion.span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Launch any module below to practice technical & aptitude questions, manage study notes, upload your
              resume for verification, or take an AI mock interview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setActiveTab('profile')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur border border-slate-300 hover:bg-white rounded-lg shadow-sm cursor-pointer"
            >
              Profile ({profileCompletion}%)
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setActiveTab('quiz')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-blue-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Technical Quiz</span>
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Launch Modules */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
            <h2 className="text-sm font-bold text-slate-900">
              Quick Launch Preparation Modules (Click Any Card to Open)
            </h2>
            <span className="text-xs text-slate-500">
              Interests: {(profile?.interests || ['Full Stack Web Development']).join(', ')}
            </span>
          </div>

          <motion.div
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.tab}
                  type="button"
                  variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => setActiveTab(mod.tab)}
                  className="group relative p-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur text-left flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-100 hover:border-blue-300 cursor-pointer overflow-hidden"
                >
                  {/* shine sweep */}
                  <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent group-hover:left-[150%] transition-all duration-700" />
                  <div>
                    <div className="flex items-center justify-between">
                      <motion.div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.accent} text-white flex items-center justify-center shadow-md`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-3">{mod.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{mod.subtitle}</div>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-blue-600 mt-3 pt-2 border-t border-slate-100">
                    {mod.metric}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* KPI Row */}
        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => setActiveTab(kpi.tab)}
              className="p-5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm hover:shadow-lg hover:shadow-blue-100 hover:border-blue-300 cursor-pointer"
            >
              <div className="text-xs font-medium text-slate-500">{kpi.label}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  <CountUp value={kpi.value} suffix="%" />
                </span>
                <span className="text-xs text-blue-600 font-medium">{kpi.link}</span>
              </div>
              <ProgressBar value={kpi.value} />
            </motion.div>
          ))}
        </motion.div>

        {/* Subjects + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <motion.div
            variants={fadeUp}
            className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Known Subjects & Technical Practice</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any CSE subject below to launch a technical quiz immediately
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Edit Subjects
              </button>
            </div>

            <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {subjects.map((subj) => {
                const isKnown = (profile?.knownSubjects || []).includes(subj);
                const matchingQuizzes = quizResults.filter((q) => q.category === subj);
                const avg =
                  matchingQuizzes.length > 0
                    ? Math.round(
                        matchingQuizzes.reduce((s, q) => s + q.percentage, 0) / matchingQuizzes.length
                      )
                    : null;

                return (
                  <motion.button
                    key={subj}
                    type="button"
                    variants={fadeUp}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedQuizCategory(subj);
                      setActiveTab('quiz');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer shadow-sm hover:shadow-md ${
                      isKnown
                        ? 'bg-blue-50/60 border-blue-200 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 truncate">{subj}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{isKnown ? 'Known' : 'Practice'}</span>
                      <span className="font-mono font-semibold text-blue-600">
                        {avg !== null ? `${avg}%` : 'Start →'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Preparation Activity</h3>
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View Progress Charts
              </button>
            </div>

            {quizResults.length === 0 && aptitudeResults.length === 0 && interviews.length === 0 ? (
              <motion.p variants={fadeIn} className="text-xs text-slate-500">
                No practice tests recorded yet. Start a Technical Quiz or Aptitude Test to log your progress.
              </motion.p>
            ) : (
              <motion.div variants={container} className="divide-y divide-slate-100">
                {quizResults.slice(0, 3).map((q) => (
                  <motion.div
                    key={q.id}
                    variants={fadeUp}
                    whileHover={{ x: 4, backgroundColor: 'rgba(239,246,255,0.7)' }}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{q.category} Technical Quiz</div>
                      <div className="text-slate-500">{q.difficulty} Difficulty</div>
                    </div>
                    <span className={`font-mono font-semibold tabular-nums ${scoreColor(q.percentage)}`}>
                      {q.percentage}%
                    </span>
                  </motion.div>
                ))}
                {aptitudeResults.slice(0, 2).map((a) => (
                  <motion.div
                    key={a.id}
                    variants={fadeUp}
                    whileHover={{ x: 4, backgroundColor: 'rgba(239,246,255,0.7)' }}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{a.category}</div>
                      <div className="text-slate-500">Aptitude Practice</div>
                    </div>
                    <span className={`font-mono font-semibold tabular-nums ${scoreColor(a.percentage)}`}>
                      {a.percentage}%
                    </span>
                  </motion.div>
                ))}
                {interviews.slice(0, 2).map((m) => (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    whileHover={{ x: 4, backgroundColor: 'rgba(239,246,255,0.7)' }}
                    className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {m.role} ({m.type})
                      </div>
                      <div className="text-slate-500">AI Mock Interview</div>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-blue-600">
                      {m.overallScore}%
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}