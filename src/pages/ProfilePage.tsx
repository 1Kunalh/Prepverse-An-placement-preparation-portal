import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Plus,
  Save,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  ALL_CSE_SUBJECTS,
  CAREER_INTEREST_OPTIONS,
  StudentProfileRecord,
} from '../utils/recommendationEngine.ts';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

const YEARS: StudentProfileRecord['year'][] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduated',
];

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */

// Counts a number up from 0 when it first appears / changes
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const safe = Number.isFinite(target) ? target : 0;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(safe);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.round(safe * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const n = useCountUp(Number(value) || 0);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

const ANIMATION_CSS = `
.pp-root { --pp-ink:#1e293b; --pp-accent:#4f46e5; --pp-accent-2:#0ea5e9; }

/* Soft drifting pastel background (light theme) */
.pp-bg {
  position: relative;
  border-radius: 1.5rem;
  padding: 1.5rem;
  background:
    radial-gradient(60rem 30rem at 0% 0%, #e0e7ff 0%, transparent 60%),
    radial-gradient(50rem 30rem at 100% 10%, #cffafe 0%, transparent 55%),
    radial-gradient(50rem 30rem at 50% 100%, #fce7f3 0%, transparent 55%),
    #f8fafc;
  background-size: 140% 140%, 140% 140%, 140% 140%, auto;
  animation: pp-drift 22s ease-in-out infinite alternate;
}
@keyframes pp-drift {
  0%   { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
  100% { background-position: 20% 30%, 80% 20%, 40% 70%, 0 0; }
}

/* One orchestrated page-load sequence */
.pp-rise {
  opacity: 0;
  transform: translateY(18px) scale(.985);
  animation: pp-rise .65s cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes pp-rise { to { opacity: 1; transform: none; } }

/* Cards */
.pp-card {
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(203,213,225,.7);
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(79,70,229,.15);
}

/* Stat tiles */
.pp-stat {
  position: relative; overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.pp-stat:hover {
  transform: translateY(-4px);
  border-color: #a5b4fc;
  box-shadow: 0 12px 24px -12px rgba(79,70,229,.35);
}
.pp-stat::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.7) 50%, transparent 60%);
  transform: translateX(-120%);
  transition: transform .8s ease;
}
.pp-stat:hover::after { transform: translateX(120%); }

/* Progress bars fill from 0 */
.pp-bar { height: 4px; border-radius: 999px; background:#e2e8f0; overflow:hidden; margin-top:.6rem; }
.pp-bar > span {
  display:block; height:100%; width:0; border-radius:999px;
  background: linear-gradient(90deg, var(--pp-accent), var(--pp-accent-2));
  animation: pp-fill 1.1s cubic-bezier(.22,1,.36,1) .35s forwards;
}
@keyframes pp-fill { to { width: var(--w); } }

/* Subject tiles */
.pp-subj { transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
.pp-subj:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -12px rgba(15,23,42,.3); }

/* Buttons: respond to the person's action */
.pp-btn { transition: transform .15s ease, box-shadow .2s ease, background-color .2s ease; }
.pp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px -8px rgba(79,70,229,.5); }
.pp-btn:active { transform: translateY(0) scale(.96); }
.pp-btn .pp-arrow { transition: transform .2s ease; }
.pp-btn:hover .pp-arrow, .pp-link:hover .pp-arrow { transform: translateX(4px); }

/* Toggle chips */
.pp-chip { transition: transform .18s cubic-bezier(.34,1.56,.64,1), background-color .2s, color .2s, border-color .2s, box-shadow .2s; }
.pp-chip:hover { transform: translateY(-2px); }
.pp-chip:active { transform: scale(.94); }
.pp-chip-on { box-shadow: 0 6px 14px -6px rgba(79,70,229,.55); animation: pp-pop .35s cubic-bezier(.34,1.56,.64,1); }
@keyframes pp-pop { 0% { transform: scale(.9); } 100% { transform: scale(1); } }

/* Skill chips pop in when added */
.pp-skill { animation: pp-pop-in .4s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pp-pop-in { 0% { opacity:0; transform: scale(.6) translateY(6px); } 100% { opacity:1; transform:none; } }

/* Saved banner slides in, check icon draws attention */
.pp-banner { animation: pp-slide-in .5s cubic-bezier(.22,1,.36,1) both; }
@keyframes pp-slide-in { 0% { opacity:0; transform: translateY(-14px) scale(.98); } 100% { opacity:1; transform:none; } }
.pp-check { animation: pp-check .6s cubic-bezier(.34,1.56,.64,1) .15s both; }
@keyframes pp-check { 0% { transform: scale(0) rotate(-90deg); } 100% { transform: scale(1) rotate(0); } }

/* Inputs */
.pp-input { transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease; }
.pp-input:focus { border-color: var(--pp-accent) !important; box-shadow: 0 0 0 4px rgba(99,102,241,.15); background:#fff; }

/* Save spinner shimmer */
.pp-saving { background-size: 200% 100%; animation: pp-shimmer 1.2s linear infinite;
  background-image: linear-gradient(90deg, #4f46e5 0%, #818cf8 50%, #4f46e5 100%); }
@keyframes pp-shimmer { to { background-position: -200% 0; } }

/* Gentle pulse on the readiness number tile */
.pp-pulse { animation: pp-pulse 3.2s ease-in-out 1.5s infinite; }
@keyframes pp-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); } 50% { box-shadow: 0 0 0 6px rgba(79,70,229,.10); } }

@media (prefers-reduced-motion: reduce) {
  .pp-bg, .pp-rise, .pp-bar > span, .pp-skill, .pp-banner, .pp-check, .pp-chip-on, .pp-pulse, .pp-saving {
    animation: none !important;
  }
  .pp-rise { opacity: 1; transform: none; }
  .pp-bar > span { width: var(--w); }
  .pp-stat::after { display: none; }
}
`;

// helper for staggered entrance delay
const delay = (i: number): React.CSSProperties => ({ animationDelay: `${i * 90}ms` });

const clamp = (n: number) => Math.max(0, Math.min(100, Number(n) || 0));

export function ProfilePage() {
  const {
    profile,
    saveProfile,
    quizResults,
    aptitudeResults,
    interviews,
    resumes,
    notes,
    readiness,
    setActiveTab,
    setSelectedQuizCategory,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState<StudentProfileRecord['year']>('4th Year');
  const [cgpa, setCgpa] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [preferredDomain, setPreferredDomain] = useState('');
  const [interests, setInterests] = useState<string[]>(['Full Stack Web Development']);
  const [knownSubjects, setKnownSubjects] = useState<string[]>(['Java', 'DBMS', 'OOP']);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setCollege(profile.college || '');
      setDegree(profile.degree || 'B.Tech');
      setDepartment(profile.department || 'CSE');
      setYear(profile.year || '4th Year');
      setCgpa(profile.cgpa || '');
      setTargetRole(profile.targetRole || 'Software Developer');
      setPreferredDomain(profile.preferredDomain || '');
      setInterests(
        profile.interests && profile.interests.length > 0
          ? profile.interests
          : ['Full Stack Web Development']
      );
      setKnownSubjects(
        profile.knownSubjects && profile.knownSubjects.length > 0
          ? profile.knownSubjects
          : ['Java', 'DBMS', 'OOP']
      );
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleKnownSubject = (subject: string) => {
    setKnownSubjects((prev) => {
      const next = prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject];
      // Also keep skills synced with known subjects
      if (!prev.includes(subject) && !skills.includes(subject)) {
        setSkills((sPrev) => [...sPrev, subject]);
      }
      return next;
    });
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.length >= 30) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed.slice(0, 60)]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedBanner(false);
    try {
      await saveProfile({
        name: name.trim() || 'B.Tech Student',
        email: email.trim() || 'student@cse.edu',
        college: college.trim(),
        degree: degree.trim(),
        department: department.trim(),
        year,
        cgpa: cgpa.trim(),
        targetRole,
        preferredDomain: preferredDomain.trim() || interests[0] || 'Full Stack Development',
        skills,
        interests,
        knownSubjects,
      });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Compute subject mastery for known subjects
  const subjectAccuracyMap = new Map<string, { sum: number; count: number }>();
  for (const q of quizResults) {
    const cur = subjectAccuracyMap.get(q.category) || { sum: 0, count: 0 };
    cur.sum += q.percentage;
    cur.count += 1;
    subjectAccuracyMap.set(q.category, cur);
  }

  const inputCls =
    'pp-input w-full px-3.5 py-2 text-sm text-slate-800 border border-slate-300 rounded-lg bg-white/80 focus:outline-none';

  // Stat tiles config (so we can animate numbers + bars uniformly)
  const stats: {
    label: string;
    value: number;
    suffix?: string;
    sub: string;
    bar: number;
    highlight?: boolean;
  }[] = [
    {
      label: 'Readiness Score',
      value: Number(readiness.totalReadinessScore) || 0,
      suffix: '%',
      sub: String(readiness.readinessBand),
      bar: clamp(readiness.totalReadinessScore),
      highlight: true,
    },
    {
      label: 'Known Subjects',
      value: knownSubjects.length,
      suffix: ` / ${ALL_CSE_SUBJECTS.length}`,
      sub: 'Selected in profile',
      bar: ALL_CSE_SUBJECTS.length ? (knownSubjects.length / ALL_CSE_SUBJECTS.length) * 100 : 0,
    },
    {
      label: 'Technical Quizzes',
      value: quizResults.length,
      sub: `Avg: ${readiness.technicalScore}%`,
      bar: clamp(readiness.technicalScore),
    },
    {
      label: 'Aptitude Tests',
      value: aptitudeResults.length,
      sub: `Avg: ${readiness.aptitudeScore}%`,
      bar: clamp(readiness.aptitudeScore),
    },
    {
      label: 'Resume Score',
      value: Number(readiness.resumeScore) || 0,
      suffix: '%',
      sub: `${resumes.length} uploaded`,
      bar: clamp(readiness.resumeScore),
    },
    {
      label: 'Study Notes',
      value: notes.length,
      sub: `${interviews.length} interviews`,
      bar: Math.min(100, notes.length * 10),
    },
  ];

  return (
    <div className="pp-root pp-bg">
      <style>{ANIMATION_CSS}</style>

      <div className="space-y-8">
        {/* Header */}
        <div
          className="pp-rise flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={delay(0)}
        >
          <div>
            <div className="text-xs font-medium text-indigo-600">
              Module 1 · Academic Profile, Interests & Progress Tracking
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
              Student Profile & Preparation Tracker
            </h1>
            <p className="text-sm text-slate-600">
              Manage your B.Tech details, career interests, and already known subjects to drive personalized recommendations and track your progress.
            </p>
          </div>
        </div>

        {savedBanner && (
          <div
            role="status"
            className="pp-banner p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="pp-check w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your profile, career interests, and known subjects have been saved! Personalized recommendations have been updated.
            </span>
          </div>
        )}

        {/* Profile Progress Tracking Summary */}
        <div className="pp-rise pp-card p-6 rounded-2xl space-y-5" style={delay(1)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div>
              <div className="text-xs font-semibold text-indigo-600">
                Maintained Profile Progress Summary
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                End-to-End Preparation & Subject Mastery Status
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className="pp-btn px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Open Full Charts</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="pp-btn px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Practice Technical Quiz</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`pp-rise pp-stat p-3.5 rounded-xl bg-white border border-slate-200 ${
                  s.highlight ? 'pp-pulse' : ''
                }`}
                style={delay(i + 2)}
              >
                <div className="text-xs text-slate-500">{s.label}</div>
                <div
                  className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                    s.highlight ? 'text-indigo-600' : 'text-slate-900'
                  }`}
                >
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.sub}</div>
                <div className="pp-bar">
                  <span style={{ ['--w' as string]: `${clamp(s.bar)}%` } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>

          {/* Known Subjects Verification & Progress Grid */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-700 mb-2.5">
              Your Known Subjects & Quiz Verification Progress:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {ALL_CSE_SUBJECTS.map((subj, i) => {
                const isMarkedKnown = knownSubjects.includes(subj);
                const stats2 = subjectAccuracyMap.get(subj);
                const avgScore = stats2 ? Math.round(stats2.sum / stats2.count) : null;
                return (
                  <div
                    key={subj}
                    style={delay(Math.min(i, 12) + 4)}
                    className={`pp-rise pp-subj p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                      isMarkedKnown
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{subj}</span>
                      <span
                        className={`text-[11px] font-mono ${
                          isMarkedKnown ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                      >
                        {isMarkedKnown ? 'Known' : 'To Learn'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70">
                      <span
                        className={`font-mono font-semibold ${
                          avgScore === null
                            ? 'text-slate-400'
                            : avgScore >= 70
                            ? 'text-emerald-700'
                            : avgScore >= 50
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {avgScore !== null ? `Quiz: ${avgScore}%` : 'Unverified'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQuizCategory(subj);
                          setActiveTab('quiz');
                        }}
                        className="pp-link text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Test</span>
                        <ArrowRight className="pp-arrow w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Editable Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="pp-rise pp-card p-6 rounded-2xl space-y-6"
          style={delay(3)}
        >
          <h2 className="text-lg font-bold text-slate-900">Academic & Career Profile Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aarav Sharma"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College / University
              </label>
              <input
                type="text"
                maxLength={200}
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g., NIT Tiruchirappalli"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Degree Program</label>
              <input
                type="text"
                maxLength={100}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g., B.Tech / B.E."
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Branch
              </label>
              <input
                type="text"
                maxLength={100}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Computer Science & Engineering (CSE)"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Year of Study
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as StudentProfileRecord['year'])}
                  className={inputCls}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current CGPA</label>
                <input
                  type="text"
                  maxLength={20}
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g., 8.65"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Role *</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={inputCls}
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Job Domain
              </label>
              <input
                type="text"
                maxLength={100}
                value={preferredDomain}
                onChange={(e) => setPreferredDomain(e.target.value)}
                placeholder="e.g., Backend Systems, Cloud & Distributed Computing"
                className={inputCls}
              />
            </div>
          </div>

          {/* Career Interests */}
          <div className="pt-4 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                Career Interests ({interests.length} selected)
              </label>
              <span className="text-xs text-slate-500">
                Used by "What Should I Prepare Next?" to identify high-priority subjects
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CAREER_INTEREST_OPTIONS.map((item) => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    aria-pressed={active}
                    className={`pp-chip px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      active
                        ? 'pp-chip-on bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Already Known Subjects */}
          <div className="pt-4 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                Already Known CSE Subjects ({knownSubjects.length} selected)
              </label>
              <span className="text-xs text-slate-500">Toggle subjects you have already studied</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_CSE_SUBJECTS.map((subj) => {
                const active = knownSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleKnownSubject(subj)}
                    aria-pressed={active}
                    className={`pp-chip px-3 py-2 rounded-lg text-xs font-semibold border text-left flex items-center justify-between cursor-pointer ${
                      active
                        ? 'pp-chip-on bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-200'
                    }`}
                  >
                    <span>{subj}</span>
                    {active && <CheckCircle2 className="pp-check w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Technical Skills */}
          <div className="pt-4 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Additional Technical Skills & Tools ({skills.length}/30)
              </label>
              <span className="text-xs text-slate-500">Used for Resume & Role alignment</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill (e.g., Spring Boot, React, SQL, Docker)"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="pp-btn px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="pp-skill px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 flex items-center gap-2 shadow-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-600 hover:rotate-12 transition cursor-pointer"
                      aria-label={`Remove ${skill}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No skills added yet. Add your core programming languages and tools above.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/70 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`pp-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-80 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer ${
                saving ? 'pp-saving' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile & Update Recommendations'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}