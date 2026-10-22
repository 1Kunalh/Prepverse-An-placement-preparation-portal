import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext.tsx';

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */

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
      const eased = 1 - Math.pow(1 - p, 3);
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
.pp-root { --pp-accent:#4f46e5; --pp-accent-2:#0ea5e9; }

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

.pp-rise {
  opacity: 0;
  transform: translateY(18px) scale(.985);
  animation: pp-rise .65s cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes pp-rise { to { opacity: 1; transform: none; } }

.pp-card {
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(203,213,225,.7);
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(79,70,229,.15);
  transition: box-shadow .3s ease, transform .3s ease;
}
.pp-card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px -16px rgba(79,70,229,.3);
}

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
  pointer-events: none;
}
.pp-stat:hover::after { transform: translateX(120%); }

.pp-bar { height: 4px; border-radius: 999px; background:#e2e8f0; overflow:hidden; margin-top:.6rem; }
.pp-bar > span {
  display:block; height:100%; width:0; border-radius:999px;
  background: linear-gradient(90deg, var(--pp-accent), var(--pp-accent-2));
  animation: pp-fill 1.1s cubic-bezier(.22,1,.36,1) .35s forwards;
}
@keyframes pp-fill { to { width: var(--w); } }

.pp-pulse { animation: pp-pulse 3.2s ease-in-out 1.5s infinite; }
@keyframes pp-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); } 50% { box-shadow: 0 0 0 6px rgba(79,70,229,.10); } }

/* Empty state: dashed border gently marches, so it reads as "waiting for data" */
.pp-empty { animation: pp-breathe 3s ease-in-out infinite; }
@keyframes pp-breathe { 0%,100% { background-color:#f8fafc; } 50% { background-color:#eef2ff; } }

@media (prefers-reduced-motion: reduce) {
  .pp-bg, .pp-rise, .pp-bar > span, .pp-pulse, .pp-empty { animation: none !important; }
  .pp-rise { opacity: 1; transform: none; }
  .pp-bar > span { width: var(--w); }
  .pp-stat::after { display: none; }
}
`;

const delay = (i: number): React.CSSProperties => ({ animationDelay: `${i * 90}ms` });
const clamp = (n: number) => Math.max(0, Math.min(100, Number(n) || 0));

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#c7d2fe',
  borderRadius: '10px',
  fontSize: '12px',
  boxShadow: '0 8px 20px -8px rgba(79,70,229,.35)',
};

export function ProgressTrackerPage() {
  const {
    quizResults,
    aptitudeResults,
    interviews,
    notes,
    resumes,
    readiness,
  } = useApp();

  const distinctTopics = Array.from(
    new Set([
      ...quizResults.map((q) => q.category),
      ...aptitudeResults.map((a) => a.category),
      ...notes.map((n) => n.subject),
    ])
  );

  // Build chronological score trend data
  const combinedAttempts = [
    ...quizResults.map((q) => ({
      date: new Date(q.createdAt).getTime(),
      label: `${q.category} (${new Date(q.createdAt).toLocaleDateString()})`,
      shortLabel: q.category.slice(0, 8),
      score: q.percentage,
      type: 'Technical',
    })),
    ...aptitudeResults.map((a) => ({
      date: new Date(a.createdAt).getTime(),
      label: `${a.category} (${new Date(a.createdAt).toLocaleDateString()})`,
      shortLabel: a.category.slice(0, 8),
      score: a.percentage,
      type: 'Aptitude',
    })),
    ...interviews.map((i) => ({
      date: new Date(i.createdAt).getTime(),
      label: `Interview: ${i.role}`,
      shortLabel: 'Interview',
      score: i.overallScore,
      type: 'Interview',
    })),
  ].sort((a, b) => a.date - b.date);

  // Topic performance bar data
  const topicPerfMap = new Map<string, { sum: number; count: number }>();
  for (const q of quizResults) {
    const cur = topicPerfMap.get(q.category) || { sum: 0, count: 0 };
    cur.sum += q.percentage;
    cur.count += 1;
    topicPerfMap.set(q.category, cur);
  }
  for (const a of aptitudeResults) {
    const cur = topicPerfMap.get(a.category) || { sum: 0, count: 0 };
    cur.sum += a.percentage;
    cur.count += 1;
    topicPerfMap.set(a.category, cur);
  }

  const topicChartData = Array.from(topicPerfMap.entries()).map(([topic, stats]) => ({
    topic: topic.length > 14 ? `${topic.slice(0, 12)}…` : topic,
    average: Math.round(stats.sum / stats.count),
    attempts: stats.count,
  }));

  const activityData = [
    { name: 'Tech Quizzes', count: quizResults.length },
    { name: 'Aptitude Tests', count: aptitudeResults.length },
    { name: 'Mock Interviews', count: interviews.length },
    { name: 'Study Notes', count: notes.length },
    { name: 'Resumes Analyzed', count: resumes.length },
  ];

  const metricCards: {
    label: string;
    value: number;
    suffix?: string;
    sub: string;
    mono?: boolean;
    bar: number;
    highlight?: boolean;
  }[] = [
    {
      label: 'Quizzes Completed',
      value: quizResults.length,
      sub: `Avg: ${readiness.technicalScore}%`,
      mono: true,
      bar: clamp(readiness.technicalScore),
    },
    {
      label: 'Aptitude Tests',
      value: aptitudeResults.length,
      sub: `Avg: ${readiness.aptitudeScore}%`,
      mono: true,
      bar: clamp(readiness.aptitudeScore),
    },
    {
      label: 'Mock Interviews',
      value: interviews.length,
      sub: `Avg: ${readiness.mockInterviewScore}%`,
      mono: true,
      bar: clamp(readiness.mockInterviewScore),
    },
    {
      label: 'Notes Created',
      value: notes.length,
      sub: 'Revision items',
      bar: Math.min(100, notes.length * 10),
    },
    {
      label: 'Topics Covered',
      value: distinctTopics.length,
      sub: 'Active subjects',
      bar: Math.min(100, distinctTopics.length * 10),
    },
    {
      label: 'Latest Resume',
      value: Number(readiness.resumeScore) || 0,
      suffix: '%',
      sub: `${resumes.length} analyzed`,
      bar: clamp(readiness.resumeScore),
      highlight: true,
    },
  ];

  return (
    <div className="pp-root pp-bg">
      <style>{ANIMATION_CSS}</style>

      <div className="space-y-8">
        {/* Header */}
        <div className="pp-rise" style={delay(0)}>
          <div className="text-xs font-medium text-indigo-600">
            Module 7 · Placement Preparation Analytics
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Progress Tracker</h1>
          <p className="text-sm text-slate-600">
            Visualize your score trends, subject-by-subject accuracy, and cumulative activity across all modules.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {metricCards.map((m, i) => (
            <div
              key={m.label}
              className={`pp-rise pp-stat p-4 rounded-xl border border-slate-200 bg-white ${
                m.highlight ? 'pp-pulse' : ''
              }`}
              style={delay(i + 1)}
            >
              <div className="text-xs text-slate-500">{m.label}</div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                  m.highlight ? 'text-indigo-600' : 'text-slate-900'
                }`}
              >
                <CountUp value={m.value} suffix={m.suffix} />
              </div>
              <div className={`text-xs text-slate-500 mt-1 ${m.mono ? 'font-mono' : ''}`}>{m.sub}</div>
              <div className="pp-bar">
                <span style={{ ['--w' as string]: `${m.bar}%` } as React.CSSProperties} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Score Trend */}
          <div className="pp-rise pp-card pp-card-hover p-6 rounded-2xl" style={delay(7)}>
            <h2 className="text-base font-bold text-slate-900">Score Trend Over Time</h2>
            <p className="text-xs text-slate-500 mb-4">
              Chronological progression of your quiz, aptitude, and interview scores
            </p>

            {combinedAttempts.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedAttempts} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, 'Score']}
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: '#a5b4fc', strokeDasharray: '4 4' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="url(#trendStroke)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#ffffff', stroke: '#6366f1', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#6366f1', stroke: '#e0e7ff', strokeWidth: 4 }}
                      isAnimationActive
                      animationBegin={500}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="pp-empty h-64 flex items-center justify-center border border-dashed border-indigo-200 rounded-xl text-xs text-slate-500 text-center px-6">
                Complete at least one quiz or aptitude test to display your chronological score trend.
              </div>
            )}
          </div>

          {/* Chart 2: Topic Performance */}
          <div className="pp-rise pp-card pp-card-hover p-6 rounded-2xl" style={delay(8)}>
            <h2 className="text-base font-bold text-slate-900">Topic Performance Breakdown</h2>
            <p className="text-xs text-slate-500 mb-4">
              Average score percentage by technical and aptitude category
            </p>

            {topicChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="topicFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, 'Average Accuracy']}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(99,102,241,.08)' }}
                    />
                    <Bar
                      dataKey="average"
                      fill="url(#topicFill)"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive
                      animationBegin={600}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="pp-empty h-64 flex items-center justify-center border border-dashed border-indigo-200 rounded-xl text-xs text-slate-500 text-center px-6">
                Attempt technical or aptitude topics to compare subject accuracy here.
              </div>
            )}
          </div>

          {/* Chart 3: Practice Activity */}
          <div className="pp-rise pp-card pp-card-hover p-6 rounded-2xl lg:col-span-2" style={delay(9)}>
            <h2 className="text-base font-bold text-slate-900">Preparation Activity Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">
              Total completed activities across Technical Quizzes, Aptitude Tests, Mock Interviews, Study Notes, and Resume Evaluations
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(14,165,233,.08)' }} />
                  <Bar
                    dataKey="count"
                    fill="url(#activityFill)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive
                    animationBegin={700}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}