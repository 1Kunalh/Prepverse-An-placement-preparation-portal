import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  FileWarning,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ResumeAnalysisRecord } from '../utils/recommendationEngine.ts';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

const SAMPLE_RESUME_CONTENT = `AARAV SHARMA
B.Tech in Computer Science & Engineering (CGPA: 8.6/10)
Email: aarav.sharma@cse.edu | Phone: +91 9876543210 | GitHub: github.com/aarav-cse

TECHNICAL SKILLS
Languages: Java, Python, C, SQL, JavaScript
Core CSE: Data Structures & Algorithms, Object-Oriented Programming (OOP), DBMS, Operating Systems
Frameworks & Tools: React.js, Node.js, Express.js, Git, Linux, MySQL

ACADEMIC & PERSONAL PROJECTS
1. Smart Campus Placement Portal (React.js, Node.js, Express, MySQL)
- Built a role-based portal for 400+ students to track company eligibility and coding test schedules, reducing manual coordination time by 45%.
- Designed REST APIs and normalized database schemas for student applications.

2. Library Management System (Java, JDBC, MySQL)
- Implemented OOP design patterns and SQL transaction handling for book lending and automated fine calculation.

EDUCATION & ACHIEVEMENTS
- B.Tech Computer Science & Engineering, National Institute of Technology (2022 - 2026) — CGPA: 8.6
- Solved 250+ Data Structures and Algorithms problems on LeetCode and GeeksforGeeks.`;

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
}

/* Buttons */
.pp-btn { transition: transform .15s ease, box-shadow .2s ease, background-color .2s ease; }
.pp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 18px -8px rgba(79,70,229,.5); }
.pp-btn:active:not(:disabled) { transform: translateY(0) scale(.97); }

/* Inputs */
.pp-input { transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease; }
.pp-input:focus { border-color: var(--pp-accent) !important; box-shadow: 0 0 0 4px rgba(99,102,241,.15); background:#fff; }

/* Upload zone */
.pp-drop { transition: transform .2s ease, border-color .2s ease, background-color .2s ease, box-shadow .2s ease; }
.pp-drop:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -14px rgba(79,70,229,.4); }
.pp-drop-active { transform: scale(1.02); box-shadow: 0 0 0 6px rgba(99,102,241,.14); animation: pp-glow 1s ease-in-out infinite; }
@keyframes pp-glow { 0%,100% { box-shadow: 0 0 0 4px rgba(99,102,241,.12); } 50% { box-shadow: 0 0 0 10px rgba(99,102,241,.10); } }
.pp-float { animation: pp-float 3s ease-in-out infinite; }
@keyframes pp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

/* Selected file card pops in */
.pp-pop { animation: pp-pop .45s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pp-pop { 0% { opacity:0; transform: scale(.92) translateY(6px); } 100% { opacity:1; transform:none; } }

/* Error: slide in + one shake */
.pp-shake { animation: pp-slide-in .4s cubic-bezier(.22,1,.36,1) both, pp-shake .5s ease .3s; }
@keyframes pp-slide-in { 0% { opacity:0; transform: translateY(-10px); } 100% { opacity:1; transform:none; } }
@keyframes pp-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }

/* Verification progress */
.pp-prog { position: relative; height: 6px; border-radius: 999px; background:#e0e7ff; overflow:hidden; }
.pp-prog > span {
  position:absolute; inset:0 auto 0 0; border-radius:999px;
  background-image: linear-gradient(90deg, #4f46e5, #818cf8, #4f46e5);
  background-size: 200% 100%;
  animation: pp-shimmer 1.2s linear infinite;
  transition: width .6s cubic-bezier(.22,1,.36,1);
}
@keyframes pp-shimmer { to { background-position: -200% 0; } }

/* Scanning beam over the panel while verifying */
.pp-scan { position: relative; overflow: hidden; }
.pp-scan::after {
  content:''; position:absolute; left:0; right:0; height:36px; top:-40px;
  background: linear-gradient(180deg, transparent, rgba(99,102,241,.18), transparent);
  animation: pp-scan 1.6s ease-in-out infinite;
  pointer-events:none;
}
@keyframes pp-scan { 0% { top:-40px; } 100% { top:100%; } }

.pp-ping { animation: pp-ping 1.2s ease-in-out infinite; }
@keyframes pp-ping { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.25); opacity:.6; } }

/* Result panel: one orchestrated reveal */
.pp-reveal { animation: pp-reveal .6s cubic-bezier(.22,1,.36,1) both; }
@keyframes pp-reveal { 0% { opacity:0; transform: translateY(16px) scale(.99); } 100% { opacity:1; transform:none; } }

/* Score bars */
.pp-fillbar { width:0; animation: pp-fill 1.1s cubic-bezier(.22,1,.36,1) .3s forwards; }
@keyframes pp-fill { to { width: var(--w); } }

/* Staggered chips / list rows */
.pp-item { opacity:0; animation: pp-item .45s cubic-bezier(.34,1.3,.64,1) forwards; }
@keyframes pp-item { 0% { opacity:0; transform: translateY(8px) scale(.9); } 100% { opacity:1; transform:none; } }
.pp-chip-s { transition: transform .18s ease, box-shadow .18s ease; }
.pp-chip-s:hover { transform: translateY(-2px); box-shadow: 0 6px 12px -6px rgba(15,23,42,.25); }

/* Verified badge ring */
.pp-badge { animation: pp-badge 2.4s ease-in-out 1s infinite; }
@keyframes pp-badge { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,.18); } }
.pp-check { animation: pp-check .6s cubic-bezier(.34,1.56,.64,1) .2s both; }
@keyframes pp-check { 0% { transform: scale(0) rotate(-90deg); } 100% { transform: scale(1) rotate(0); } }

/* History row */
.pp-row { transition: transform .18s ease, background-color .18s ease, border-color .18s ease; }
.pp-row:hover { transform: translateX(4px); }

@media (prefers-reduced-motion: reduce) {
  .pp-bg, .pp-rise, .pp-float, .pp-pop, .pp-shake, .pp-prog > span, .pp-scan::after, .pp-ping,
  .pp-reveal, .pp-fillbar, .pp-item, .pp-badge, .pp-check, .pp-drop-active { animation: none !important; }
  .pp-rise, .pp-item { opacity: 1; transform: none; }
  .pp-fillbar { width: var(--w); }
  .pp-scan::after { display: none; }
}
`;

const delay = (i: number): React.CSSProperties => ({ animationDelay: `${i * 90}ms` });
const itemDelay = (i: number, base = 0): React.CSSProperties => ({
  animationDelay: `${base + Math.min(i, 14) * 50}ms`,
});
const clamp = (n: number) => Math.max(0, Math.min(100, Number(n) || 0));

export function ResumeAnalyzerPage() {
  const { user, profile, resumes, recordResumeAnalysis } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [targetRole, setTargetRole] = useState<string>(
    profile?.targetRole || 'Software Developer'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<
    'idle' | 'verifying' | 'analyzing' | 'verified' | 'failed'
  >(resumes.length > 0 ? 'verified' : 'idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isNotResumeAlert, setIsNotResumeAlert] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<ResumeAnalysisRecord | null>(
    resumes[0] || null
  );

  const processSelectedFile = (file: File) => {
    setErrorMsg(null);
    setIsNotResumeAlert(false);
    setVerificationStep('idle');

    const nameLower = file.name.toLowerCase();
    const isSupported =
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      nameLower.endsWith('.pdf') ||
      nameLower.endsWith('.txt') ||
      nameLower.endsWith('.doc') ||
      nameLower.endsWith('.docx');

    if (!isSupported) {
      setIsNotResumeAlert(true);
      setVerificationStep('failed');
      setErrorMsg(
        `Invalid file format ("${file.name}"). Please upload a valid Resume file in .PDF, .DOCX, .DOC, or .TXT format.`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setVerificationStep('failed');
      setErrorMsg('File size exceeds 10MB limit. Please upload a smaller resume file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleLoadSampleFile = () => {
    const sampleBlob = new Blob([SAMPLE_RESUME_CONTENT], { type: 'text/plain' });
    const sampleFile = new File([sampleBlob], 'Aarav_Sharma_BTech_Resume.txt', {
      type: 'text/plain',
    });
    processSelectedFile(sampleFile);
  };

  const handleVerifyAndAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsNotResumeAlert(false);

    if (!selectedFile) {
      setErrorMsg('Please select a Resume file (.PDF, .DOCX, or .TXT) to verify and analyze.');
      return;
    }

    setVerificationStep('verifying');
    try {
      const formData = new FormData();
      formData.append('targetRole', targetRole);
      formData.append(
        'studentSkills',
        JSON.stringify(profile?.skills || profile?.knownSubjects || [])
      );
      formData.append('resumeFile', selectedFile);
      formData.append('fileName', selectedFile.name);

      // Brief stage transition so user clearly sees Document Verification -> AI Analysis
      const stageTimer = setTimeout(() => {
        setVerificationStep((prev) => (prev === 'verifying' ? 'analyzing' : prev));
      }, 600);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'x-user-id': user?.uid || 'guest',
        },
        body: formData,
      });

      clearTimeout(stageTimer);

      const data = await response.json();
      if (!response.ok || !data.analysis) {
        setVerificationStep('failed');
        if (data.isNotResume) {
          setIsNotResumeAlert(true);
          setActiveResult(null);
        }
        throw new Error(
          data.error || 'The uploaded document could not be verified as a valid Resume.'
        );
      }

      const analysisRecord: ResumeAnalysisRecord = data.analysis;
      setVerificationStep('verified');
      setActiveResult(analysisRecord);
      await recordResumeAnalysis(analysisRecord);
    } catch (err: any) {
      setVerificationStep('failed');
      setErrorMsg(err?.message || 'An error occurred while verifying and analyzing your resume.');
    }
  };

  const isBusy = verificationStep === 'verifying' || verificationStep === 'analyzing';
  const displayedResult = isNotResumeAlert ? null : activeResult;

  const inputCls =
    'pp-input w-full px-3.5 py-2.5 text-sm text-slate-800 border border-slate-300 rounded-lg bg-white/80 focus:outline-none';

  return (
    <div className="pp-root pp-bg">
      <style>{ANIMATION_CSS}</style>

      <div className="space-y-8">
        {/* Header */}
        <div className="pp-rise" style={delay(0)}>
          <div className="text-xs font-medium text-indigo-600">
            Module 4 · Verified Resume File Upload & AI Evaluation
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">AI Resume Analyzer</h1>
          <p className="text-sm text-slate-600">
            Upload your Resume file below, click <strong>Verify & Analyze Resume</strong> to validate that the document is a genuine Resume/CV, and receive a complete AI evaluation for your target role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload + Verify */}
          <form
            onSubmit={handleVerifyAndAnalyzeResume}
            className={`pp-rise pp-card lg:col-span-5 p-6 rounded-2xl space-y-5 ${
              isBusy ? 'pp-scan' : ''
            }`}
            style={delay(1)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upload & Verify Resume</h2>
              <button
                type="button"
                onClick={handleLoadSampleFile}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Use Sample Resume File
              </button>
            </div>

            {/* Step 1: Target Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1. Select Target Placement Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={inputCls}
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: File Upload */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                2. Upload Resume File (.PDF, .DOCX, .TXT)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`pp-drop p-6 border-2 border-dashed rounded-xl text-center cursor-pointer ${
                    isDragging
                      ? 'pp-drop-active border-indigo-500 bg-indigo-50'
                      : 'border-indigo-200 hover:border-indigo-500 bg-white/70'
                  }`}
                >
                  <div className="pp-float w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    Click to choose your Resume file or drag & drop here
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Supports .PDF, .DOCX, .DOC, and .TXT (Max 10MB)
                  </div>
                </div>
              ) : (
                <div className="pp-pop p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Ready for Resume Verification
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setVerificationStep('idle');
                        setErrorMsg(null);
                        setIsNotResumeAlert(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs font-medium text-red-600 hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="pp-btn w-full py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>

            {/* Validation / Error Banner */}
            {errorMsg && (
              <div
                role="alert"
                className={`pp-shake p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isNotResumeAlert
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {isNotResumeAlert ? (
                  <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  {isNotResumeAlert && (
                    <div className="font-bold text-red-900">
                      Verification Failed — Not a Valid Resume
                    </div>
                  )}
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Live Verification Progress */}
            {isBusy && (
              <div className="pp-pop p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="pp-ping w-4 h-4 text-indigo-600" />
                  <span>
                    {verificationStep === 'verifying'
                      ? 'Step 1/2: Verifying uploaded file is a genuine Resume/CV...'
                      : 'Step 2/2: Verified! Generating AI Resume Analysis & Role Match...'}
                  </span>
                </div>
                <div className="pp-prog">
                  <span style={{ width: verificationStep === 'verifying' ? '50%' : '92%' }} />
                </div>
              </div>
            )}

            {/* Step 3: Verify & Analyze Button */}
            <button
              type="submit"
              disabled={isBusy || !selectedFile}
              className="pp-btn w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {verificationStep === 'verifying'
                  ? 'Verifying Resume File...'
                  : verificationStep === 'analyzing'
                  ? 'Generating AI Evaluation...'
                  : '3. Verify Resume & Get AI Analysis'}
              </span>
            </button>

            {/* Previously Verified Resumes */}
            {resumes.length > 0 && (
              <div className="pt-4 border-t border-slate-200/70">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Previously Verified Resumes ({resumes.length})
                </div>
                <div className="space-y-1.5">
                  {resumes.slice(0, 4).map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      style={itemDelay(i, 200)}
                      onClick={() => {
                        setIsNotResumeAlert(false);
                        setErrorMsg(null);
                        setVerificationStep('verified');
                        setActiveResult(r);
                      }}
                      className={`pp-item pp-row w-full p-2.5 rounded-lg border text-left text-xs flex items-center justify-between cursor-pointer ${
                        displayedResult?.id === r.id
                          ? 'bg-indigo-50 border-indigo-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate max-w-[210px] font-medium">
                        {r.fileName} ({r.targetRole})
                      </span>
                      <span className="font-mono font-bold text-indigo-600">{r.resumeScore}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Right Column: Result */}
          <div className="lg:col-span-7 space-y-6">
            {displayedResult ? (
              <div
                key={displayedResult.id}
                className="pp-reveal pp-card p-6 rounded-2xl space-y-6"
              >
                {/* Verification Confirmation Banner */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileCheck2 className="pp-check w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        Resume Verification Passed · Valid Resume/CV Confirmed
                      </div>
                      <div className="text-xs text-emerald-800 mt-0.5">
                        File: <strong>{displayedResult.fileName}</strong> · Extracted{' '}
                        <strong>{displayedResult.skillsFound.length} skills</strong> for{' '}
                        <strong>{displayedResult.targetRole}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="pp-badge px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-mono font-semibold self-start sm:self-center shrink-0">
                    VERIFIED RESUME
                  </span>
                </div>

                {/* Candidate & Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Resume Evaluation Report</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Target Role: {displayedResult.targetRole}
                    </h2>
                    {(displayedResult.candidateName || displayedResult.detectedEducation) && (
                      <div className="text-xs text-slate-600">
                        {displayedResult.candidateName && (
                          <span>
                            <strong className="text-slate-800">Candidate:</strong>{' '}
                            {displayedResult.candidateName}
                          </span>
                        )}
                        {displayedResult.detectedEducation && (
                          <span>
                            {' '}
                            · <strong className="text-slate-800">Education:</strong>{' '}
                            {displayedResult.detectedEducation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-start">
                    {displayedResult.roleMatchPercentage !== undefined && (
                      <div className="pp-pop px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-center">
                        <div className="text-[11px] text-sky-700 font-medium">Role Match</div>
                        <div className="text-lg font-bold font-mono tabular-nums text-sky-900">
                          <CountUp value={displayedResult.roleMatchPercentage} suffix="%" />
                        </div>
                      </div>
                    )}
                    <div
                      className="pp-pop px-4 py-2 rounded-xl text-white text-center shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                        animationDelay: '120ms',
                      }}
                    >
                      <div className="text-[11px] text-indigo-100">Resume Score</div>
                      <div className="text-xl font-bold font-mono tabular-nums">
                        <CountUp value={displayedResult.resumeScore} suffix="/100" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Breakdown */}
                {displayedResult.sectionBreakdown && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Verified Section-by-Section Score Breakdown
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: 'Technical Skills',
                          val: displayedResult.sectionBreakdown.technicalSkillsScore,
                        },
                        {
                          label: 'Projects & Impact',
                          val: displayedResult.sectionBreakdown.projectsScore,
                        },
                        {
                          label: 'Education & CGPA',
                          val: displayedResult.sectionBreakdown.educationScore,
                        },
                        {
                          label: 'ATS Structure',
                          val: displayedResult.sectionBreakdown.structureAndAtsScore,
                        },
                      ].map((sec, i) => (
                        <div
                          key={sec.label}
                          style={itemDelay(i, 150)}
                          className="pp-item p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 hover:-translate-y-1 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">{sec.label}</span>
                            <span className="font-mono font-bold text-slate-900">
                              <CountUp value={sec.val} suffix="%" />
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`pp-fillbar h-full rounded-full ${
                                sec.val >= 70
                                  ? 'bg-emerald-500'
                                  : sec.val >= 50
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ ['--w' as string]: `${clamp(sec.val)}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Executive Summary */}
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                    AI Evaluation Summary
                  </strong>
                  {displayedResult.summary}
                </div>

                {/* Projects */}
                {displayedResult.detectedProjects && displayedResult.detectedProjects.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white/70 space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Projects Verified in Uploaded Resume
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {displayedResult.detectedProjects.map((proj, idx) => (
                        <li key={idx} className="pp-item leading-relaxed" style={itemDelay(idx, 200)}>
                          {proj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Found vs Missing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Skills Verified in Resume ({displayedResult.skillsFound.length})
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-emerald-900">
                      {displayedResult.skillsFound.length > 0 ? (
                        displayedResult.skillsFound.map((skill, i) => (
                          <span
                            key={i}
                            style={itemDelay(i, 250)}
                            className="pp-item pp-chip-s px-2.5 py-1 rounded-md bg-white border border-emerald-200 font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600">
                          No technical skills listed in uploaded file.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                    <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                      Missing Skills for {displayedResult.targetRole} (
                      {displayedResult.missingSkills.length})
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-red-900">
                      {displayedResult.missingSkills.length > 0 ? (
                        displayedResult.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            style={itemDelay(i, 300)}
                            className="pp-item pp-chip-s px-2.5 py-1 rounded-md bg-white border border-red-200 font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700">
                          All core {displayedResult.targetRole} skills are present!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2.5">Resume Strengths</h3>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {displayedResult.strengths.map((item, idx) => (
                        <li
                          key={idx}
                          className="pp-item flex items-start gap-2"
                          style={itemDelay(idx, 300)}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2.5">Areas to Improve</h3>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {displayedResult.areasToImprove.map((item, idx) => (
                        <li
                          key={idx}
                          className="pp-item flex items-start gap-2"
                          style={itemDelay(idx, 350)}
                        >
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actionable Improvements */}
                <div className="pt-4 border-t border-slate-200/70 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Recommendations to Improve Your Resume for {displayedResult.targetRole}
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                    {displayedResult.suggestedImprovements.map((imp, idx) => (
                      <li key={idx} className="pp-item leading-relaxed" style={itemDelay(idx, 400)}>
                        {imp}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div
                className="pp-rise pp-card p-10 rounded-2xl border border-dashed border-indigo-200 text-center space-y-3"
                style={delay(2)}
              >
                {isNotResumeAlert ? (
                  <>
                    <FileWarning className="pp-pop w-10 h-10 text-red-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">
                      Document Verification Failed
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      The uploaded file could not be verified as a candidate Resume/CV. Please upload a valid Resume containing your Education, Technical Skills, and Projects using the upload panel on the left.
                    </p>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="pp-float w-10 h-10 text-indigo-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">
                      Awaiting Resume Verification & AI Evaluation
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Select your resume file (<strong>.PDF</strong>, <strong>.DOCX</strong>, or <strong>.TXT</strong>) in the left panel and click <strong>Verify Resume & Get AI Analysis</strong>. Once verified, your complete AI evaluation report will appear here.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}