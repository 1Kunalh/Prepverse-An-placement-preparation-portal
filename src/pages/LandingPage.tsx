import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Sparkles,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext.tsx';
import { loginWithGoogle, resetUserPassword } from '../firebase.ts';
import {
  ALL_CSE_SUBJECTS,
  CAREER_INTEREST_OPTIONS,
} from '../utils/recommendationEngine.ts';
import heroImg from '../assets/images/hero_interview_prep_1790747026201.jpg';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

/* ---------- Animation variants ---------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function LandingPage() {
  const { authenticateStudent } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [pendingTab, setPendingTab] = useState<NavigationTab>('dashboard');

  const [name, setName] = useState('Aarav Sharma');
  const [email, setEmail] = useState('student@cse.edu');
  const [password, setPassword] = useState('student123');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Full Stack Web Development',
    'Software Engineering (SDE)',
  ]);
  const [selectedKnownSubjects, setSelectedKnownSubjects] = useState<string[]>([
    'Java',
    'DBMS',
    'OOP',
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const openModal = (mode: 'login' | 'register', targetModule: NavigationTab = 'dashboard') => {
    setAuthMode(mode);
    setPendingTab(targetModule);
    setErrorMsg(null);
    setStatusMsg(null);
    setAuthModalOpen(true);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleKnownSubject = (subject: string) => {
    setSelectedKnownSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleQuickDemoLogin = async (targetModule: NavigationTab = pendingTab) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await authenticateStudent({
        mode: 'login',
        name: name.trim() || 'Aarav Sharma',
        email: email.trim() || 'student@cse.edu',
        password: password || 'student123',
        targetRole,
        interests:
          selectedInterests.length > 0 ? selectedInterests : ['Full Stack Web Development'],
        knownSubjects:
          selectedKnownSubjects.length > 0 ? selectedKnownSubjects : ['Java', 'DBMS', 'OOP'],
        initialTab: targetModule,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not complete login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // Fallback to end-to-end student authentication if popup is blocked in iframe
      await handleQuickDemoLogin(pendingTab);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setLoading(true);

    try {
      if (authMode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        await resetUserPassword(email.trim()).catch(() => null);
        setStatusMsg('Password reset instructions have been sent to your email address.');
        setLoading(false);
        return;
      }

      if (!email.trim() || !password) {
        setErrorMsg('Please enter both your email address and password.');
        setLoading(false);
        return;
      }

      await authenticateStudent({
        mode: authMode === 'register' ? 'register' : 'login',
        name: name.trim() || email.split('@')[0] || 'B.Tech Student',
        email: email.trim(),
        password,
        targetRole,
        interests:
          selectedInterests.length > 0 ? selectedInterests : ['Full Stack Web Development'],
        knownSubjects:
          selectedKnownSubjects.length > 0 ? selectedKnownSubjects : ['Java', 'DBMS', 'OOP'],
        initialTab: pendingTab,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const modulesList: Array<{
    index: string;
    title: string;
    tab: NavigationTab;
    description: string;
    metrics: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      index: '01. Technical Practice',
      title: 'Core CSE Subject Quizzes',
      tab: 'quiz',
      description:
        'Interactive MCQ quizzes across Java, Python, C, Data Structures, DBMS, Operating Systems, Computer Networks, and OOP with instant explanations.',
      metrics: '8 CSE subjects · 3 difficulty levels · Ask questions immediately',
      icon: Brain,
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      index: '02. Aptitude Practice',
      title: 'Quantitative, Logical & Verbal Tests',
      tab: 'aptitude',
      description:
        'Timed online placement screening rounds with step-by-step question navigation, countdown timer, and detailed solution breakdowns.',
      metrics: 'Quantitative · Logical Reasoning · Verbal Ability',
      icon: TrendingUp,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      index: '03. AI Resume Analyzer',
      title: 'Resume Upload & Gemini Evaluation',
      tab: 'resume',
      description:
        'Upload your resume (.PDF, .DOCX, .TXT) and benchmark your extracted skills against your target role using Google Gemini AI.',
      metrics: 'Direct file upload · Missing skill gaps · Actionable improvements',
      icon: FileText,
      accent: 'from-orange-500 to-amber-500',
    },
    {
      index: '04. AI Mock Interview',
      title: 'Interactive Technical & HR Interviews',
      tab: 'interview',
      description:
        'Practice realistic role-specific interview questions one by one and receive structured 10-point evaluation on technical accuracy and clarity.',
      metrics: 'Technical, HR & Mixed modes · Real-time Gemini feedback',
      icon: MessageSquare,
      accent: 'from-pink-500 to-rose-500',
    },
    {
      index: '05. Study Notes',
      title: 'Subject Revision & Important Notes',
      tab: 'notes',
      description:
        'Create, edit, search, and filter CSE subject revision notes with a dedicated Important Only filter for last-minute interview prep.',
      metrics: 'Subject tags · Important Only filter · Instant search',
      icon: BookOpen,
      accent: 'from-violet-500 to-purple-500',
    },
    {
      index: '06. Progress Tracker',
      title: 'Visual Analytics & Profile Progress',
      tab: 'progress',
      description:
        'Maintain your academic profile, known subjects, Recharts subject accuracy bars, aptitude breakdowns, and interview performance history.',
      metrics: 'Visual Recharts graphs · Subject mastery · Session history',
      icon: CheckCircle2,
      accent: 'from-cyan-500 to-sky-500',
    },
  ];

  const stats = [
    { big: '8 Modules', small: 'Click Any Module to Open' },
    { big: '110+ MCQs', small: 'Technical & Aptitude Bank' },
    { big: 'End-to-End', small: 'Profile & Progress Tracking' },
  ];

  const inputClass =
    'w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 flex flex-col">
      {/* Floating background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-1/3 -right-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top Bar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-4 flex items-center justify-between"
      >
        <motion.a
          href="#top"
          whileHover={{ scale: 1.04 }}
          className="text-lg font-bold tracking-tight font-display whitespace-nowrap bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
        >
          Prepverse 
        </motion.a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {[
            { label: 'Modules', href: '#features' as const },
            { label: 'Technical Quiz', tab: 'quiz' as NavigationTab },
            { label: 'Aptitude Practice', tab: 'aptitude' as NavigationTab },
            { label: 'AI Mock Interview', tab: 'interview' as NavigationTab },
          ].map((link) =>
            'href' in link ? (
              <a
                key={link.label}
                href={link.href}
                className="relative group hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            ) : (
              <button
                key={link.label}
                type="button"
                onClick={() => openModal('login', link.tab)}
                className="relative group hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => openModal('login', 'dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap cursor-pointer"
          >
            Login
          </motion.button>
          <motion.button
            type="button"
            onClick={() => openModal('register', 'dashboard')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-blue-200 whitespace-nowrap cursor-pointer"
          >
            Get Started
          </motion.button>
        </div>
      </motion.header>

      {/* Hero */}
      <main id="top" className="relative z-10 flex-1">
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6"
          >
            <motion.div
              variants={fadeLeft}
              className="inline-flex flex-wrap items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-medium text-blue-700"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="inline-flex"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.span>
              <span>B.Tech CSE Placement Readiness Platform</span>
              <span aria-hidden="true">·</span>
              <span>Personalized by Interests & Known Subjects</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              <span className="text-slate-900">Prepare Smarter.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Interview Better.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed"
            >
              An AI-powered interview preparation and placement readiness platform for B.Tech students. Sign in with
              your career interests and already known subjects to unlock interactive technical quizzes, aptitude
              practice, resume upload analysis, and AI mock interviews.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                type="button"
                onClick={() => openModal('register', 'dashboard')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Get Started (Set Interests & Subjects)</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-flex"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => openModal('login', 'dashboard')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white/80 backdrop-blur border border-slate-300 hover:bg-white rounded-xl shadow-sm whitespace-nowrap cursor-pointer"
              >
                Login to Dashboard
              </motion.button>
            </motion.div>

            <motion.div
              variants={container}
              className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-xl"
            >
              {stats.map((s) => (
                <motion.div key={s.big} variants={fadeUp} whileHover={{ y: -4 }}>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{s.big}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.small}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="show"
            className="lg:col-span-5"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* glow behind */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-300/40 via-violet-300/40 to-emerald-300/40 blur-2xl" />

              <div className="relative rounded-2xl overflow-hidden border border-white bg-white shadow-2xl shadow-blue-200/60 aspect-video lg:aspect-[4/3]">
                {!imgError ? (
                  <img
                    src={heroImg}
                    alt="University computer science lab workspace with laptop and study notebooks"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-violet-50 text-slate-900">
                    <motion.span
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="inline-flex"
                    >
                      <Brain className="w-12 h-12 text-blue-500 mb-3" />
                    </motion.span>
                    <p className="text-base font-semibold">Prepverse an Placement Prepration Portal</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Technical Practice · Aptitude · AI Resume & Mock Interviews
                    </p>
                  </div>
                )}

                {/* Light glass caption */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/85 backdrop-blur-md border border-white p-4 shadow-lg"
                >
                  <div className="text-[11px] text-blue-600 font-mono font-semibold inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    PERSONALIZED GUIDANCE
                  </div>
                  <div className="text-base font-semibold text-slate-900 mt-1">"What Should I Prepare Next?"</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tailors your study plan from your career interests, already known CSE subjects, quiz accuracy, and
                    resume skill gaps.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Modules */}
        <section id="features" className="bg-white/70 backdrop-blur border-y border-slate-200 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
              <div className="max-w-2xl">
                <div className="text-xs font-medium text-blue-600">Interactive Platform Modules</div>
                <h2 className="text-3xl font-bold text-slate-900 mt-1">
                  Click Any Module Below to Launch Practice
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Every module is connected to your student profile, personalized recommendations, and progress
                  tracker.
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => handleQuickDemoLogin('dashboard')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Instant Demo Student Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10"
            >
              {modulesList.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.index}
                    variants={fadeUp}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => openModal('login', item.tab)}
                    className="group relative p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-100 hover:border-blue-300 cursor-pointer overflow-hidden"
                  >
                    {/* shine sweep */}
                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-blue-50 to-transparent group-hover:left-[150%] transition-all duration-700" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-md`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>
                        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Open Module <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="text-xs font-mono text-blue-600 font-semibold mt-4">{item.index}</div>
                      <h3 className="text-lg font-semibold text-slate-900 mt-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="relative pt-4 mt-6 border-t border-slate-100 text-xs text-slate-500">
                      {item.metrics}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/80 backdrop-blur border-t border-slate-200 py-8 px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>Prepverse — An Placement Prepration Portal</div>
          <div>Built for B.Tech / CSE Placement Readiness</div>
          <div>by Kunal Hembade and Team</div>
        </div>
      </motion.footer>

      {/* Login / Register Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setAuthModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl shadow-blue-200/50 my-8 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {authMode === 'login' && 'Student Login & Personalized Setup'}
                    {authMode === 'register' && 'Create B.Tech Student Account'}
                    {authMode === 'forgot' && 'Reset Your Password'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pendingTab !== 'dashboard'
                      ? `Sign in to open the ${pendingTab.toUpperCase()} module directly`
                      : 'Sign in with your interests and known subjects for personalized recommendations'}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-4 space-y-4">
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -6, 6, 0] }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed overflow-hidden"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                  {statusMsg && (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 leading-relaxed overflow-hidden"
                    >
                      {statusMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Aarav Sharma"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Placement Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                        {TARGET_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@college.edu"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {authMode !== 'forgot' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {authMode !== 'forgot' && (
                    <>
                      {/* Career Interests */}
                      <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-800">
                            1. Select Your Career Interests ({selectedInterests.length} selected)
                          </label>
                          <span className="text-[11px] text-slate-500">Drives personalized recommendations</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {CAREER_INTEREST_OPTIONS.map((interest) => {
                            const active = selectedInterests.includes(interest);
                            return (
                              <motion.button
                                key={interest}
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                whileHover={{ scale: 1.07, y: -1 }}
                                whileTap={{ scale: 0.92 }}
                                animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                                }`}
                              >
                                {interest}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Known Subjects */}
                      <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-800">
                            2. Select Already Known CSE Subjects ({selectedKnownSubjects.length} selected)
                          </label>
                          <span className="text-[11px] text-slate-500">Saved to your Profile & Progress</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {ALL_CSE_SUBJECTS.map((subj) => {
                            const active = selectedKnownSubjects.includes(subj);
                            return (
                              <motion.button
                                key={subj}
                                type="button"
                                onClick={() => toggleKnownSubject(subj)}
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.92 }}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left transition-colors flex items-center justify-between cursor-pointer ${
                                  active
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-md shadow-violet-200'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-violet-300'
                                }`}
                              >
                                <span className="truncate">{subj}</span>
                                <AnimatePresence>
                                  {active && (
                                    <motion.span
                                      initial={{ scale: 0, rotate: -90 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      exit={{ scale: 0 }}
                                      className="inline-flex shrink-0"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-md shadow-blue-200 cursor-pointer"
                  >
                    {loading
                      ? 'Signing in to Workspace...'
                      : authMode === 'login'
                      ? 'Login & Load Personalized Workspace'
                      : authMode === 'register'
                      ? 'Register & Save Profile Preferences'
                      : 'Send Password Reset Email'}
                  </motion.button>
                </form>

                {authMode !== 'forgot' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <motion.button
                      type="button"
                      onClick={() => handleQuickDemoLogin(pendingTab)}
                      disabled={loading}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>1-Click Instant Student Login</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue with Google</span>
                    </motion.button>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  {authMode === 'login' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMsg(null);
                        }}
                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        New student? Create account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                      }}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Already have an account? Back to Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}