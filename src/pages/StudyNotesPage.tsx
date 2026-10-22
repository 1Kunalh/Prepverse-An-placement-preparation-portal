import React, { useState } from 'react';
import {
  Edit3,
  FileText,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StudyNoteRecord } from '../utils/recommendationEngine.ts';

const NOTE_SUBJECTS = [
  'All',
  'Java',
  'Python',
  'DBMS',
  'OS',
  'CN',
  'DSA',
  'OOP',
  'C',
  'Aptitude',
];

// Soft per-subject accent colours (light theme)
const SUBJECT_STYLES: Record<string, string> = {
  Java: 'bg-orange-50 text-orange-700 ring-orange-200',
  Python: 'bg-sky-50 text-sky-700 ring-sky-200',
  DBMS: 'bg-violet-50 text-violet-700 ring-violet-200',
  OS: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CN: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  DSA: 'bg-rose-50 text-rose-700 ring-rose-200',
  OOP: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  C: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Aptitude: 'bg-lime-50 text-lime-700 ring-lime-200',
};

const ANIMATION_CSS = `
@keyframes sn-fade-up {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sn-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes sn-modal-in {
  from { opacity: 0; transform: translateY(24px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sn-star-pop {
  0%   { transform: scale(1) rotate(0deg); }
  40%  { transform: scale(1.5) rotate(-18deg); }
  70%  { transform: scale(0.9) rotate(8deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes sn-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(24px, -18px) scale(1.08); }
}
@keyframes sn-float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-28px, 20px) scale(1.12); }
}
@keyframes sn-slide-down {
  from { opacity: 0; transform: translateY(-10px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 120px; }
}
@keyframes sn-remove {
  to { opacity: 0; transform: scale(0.88) translateY(8px); }
}
@keyframes sn-shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
@keyframes sn-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

.sn-card-in      { animation: sn-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.sn-header-in    { animation: sn-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.sn-fade-in      { animation: sn-fade-in 0.25s ease-out backwards; }
.sn-modal-in     { animation: sn-modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.sn-star-pop     { animation: sn-star-pop 0.5s ease-out; }
.sn-blob-a       { animation: sn-float 9s ease-in-out infinite; }
.sn-blob-b       { animation: sn-float-slow 11s ease-in-out infinite; }
.sn-banner-in    { animation: sn-slide-down 0.35s ease-out backwards; overflow: hidden; }
.sn-removing     { animation: sn-remove 0.3s ease-in forwards; }
.sn-bob          { animation: sn-bob 3s ease-in-out infinite; }
.sn-shimmer-btn {
  background-image: linear-gradient(110deg, #2563eb 30%, #6366f1 45%, #3b82f6 55%, #2563eb 70%);
  background-size: 200% 100%;
}
.sn-shimmer-btn:hover { animation: sn-shimmer 1.6s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .sn-card-in, .sn-header-in, .sn-fade-in, .sn-modal-in, .sn-star-pop,
  .sn-blob-a, .sn-blob-b, .sn-banner-in, .sn-bob, .sn-shimmer-btn:hover {
    animation: none !important;
  }
}
`;

export function StudyNotesPage() {
  const { notes, createNote, updateNote, toggleNoteImportant, removeNote } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [onlyImportant, setOnlyImportant] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNoteRecord | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | number | null>(null);

  const importantNotesCount = notes.filter((n) => Boolean(n.important)).length;

  const openNewNoteModal = () => {
    setEditingNote(null);
    setTitle('');
    setSubject(selectedSubject !== 'All' ? selectedSubject : 'DBMS');
    setTopic('');
    setContent('');
    setImportant(onlyImportant);
    setEditorOpen(true);
  };

  const openEditNoteModal = (note: StudyNoteRecord) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject);
    setTopic(note.topic);
    setContent(note.content);
    setImportant(Boolean(note.important));
    setEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (editingNote) {
        await updateNote({
          ...editingNote,
          title: title.trim(),
          subject,
          topic: topic.trim(),
          content: content.trim(),
          important: Boolean(important),
        });
      } else {
        await createNote({
          title: title.trim(),
          subject,
          topic: topic.trim(),
          content: content.trim(),
          important: Boolean(important),
        });
      }
      setEditorOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Play the exit animation first, then actually delete
  const handleRemove = (id: any) => {
    setRemovingId(id);
    window.setTimeout(() => {
      removeNote(id);
      setRemovingId(null);
    }, 300);
  };

  const filteredNotes = notes.filter((n) => {
    const isNoteImportant = Boolean(n.important);
    if (onlyImportant && !isNoteImportant) return false;
    if (selectedSubject !== 'All' && n.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Changing this key re-mounts the grid so the card entrance replays on filter change (not on typing)
  const gridKey = `${selectedSubject}-${onlyImportant}`;

  return (
    <>
    <style>{ANIMATION_CSS}</style>
    <div className="space-y-6 relative text-slate-900">

      {/* Header with floating pastel blobs */}
      <div className="sn-header-in relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 sm:p-8">
        <div className="sn-blob-a pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="sn-blob-b pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="sn-blob-a pointer-events-none absolute top-4 left-10 h-32 w-32 rounded-full bg-amber-100/60 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="sn-bob hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-600">Module 3 · Revision Repository</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Study Notes</h1>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Create, organize, search, and mark important revision notes across Java, Python, DBMS, OS, CN, and DSA.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewNoteModal}
            className="sn-shimmer-btn group px-5 py-2.5 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 self-start shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>New Study Note</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        className="sn-header-in p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
        style={{ animationDelay: '80ms' }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 transition-colors duration-200 group-focus-within:text-blue-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, topic, subject, or content..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyImportant(false)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                !onlyImportant
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              All Notes ({notes.length})
            </button>

            <button
              type="button"
              onClick={() => setOnlyImportant((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                onlyImportant
                  ? 'bg-amber-400 text-white border-amber-400 shadow-sm shadow-amber-400/30'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Star
                key={String(onlyImportant)}
                className={`w-3.5 h-3.5 sn-star-pop ${
                  onlyImportant ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'
                }`}
              />
              <span>Important Only ({importantNotesCount})</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          {NOTE_SUBJECTS.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap active:scale-95 cursor-pointer ${
                selectedSubject === subj
                  ? 'bg-white text-blue-700 shadow-sm font-semibold scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Status Line */}
      {onlyImportant && (
        <div className="sn-banner-in px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-600 shrink-0" />
            <span>
              Showing <strong>Important Only</strong> ({filteredNotes.length} of {notes.length} total notes). Click the star button on any note to mark or unmark it as important.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyImportant(false)}
            className="font-semibold text-amber-900 underline hover:text-amber-700 shrink-0 ml-3 cursor-pointer"
          >
            Show All Notes
          </button>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div key={gridKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note, index) => {
            const isImp = Boolean(note.important);
            const chip =
              SUBJECT_STYLES[note.subject] || 'bg-slate-50 text-slate-700 ring-slate-200';
            return (
              <div
                key={note.id}
                className={`sn-card-in group flex ${removingId === note.id ? 'sn-removing' : ''}`}
                style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
              >
                <div
                  className={`h-full w-full p-5 rounded-2xl border bg-white flex flex-col justify-between shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/70 ${
                    isImp
                      ? 'border-amber-300 ring-1 ring-amber-200/70 bg-gradient-to-br from-amber-50/60 to-white'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ring-1 ring-inset shrink-0 ${chip}`}
                        >
                          {note.subject}
                        </span>
                        <span className="truncate">{note.topic}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNoteImportant(note.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 shrink-0 transition-all duration-200 active:scale-90 cursor-pointer ${
                          isImp
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                        }`}
                        title={isImp ? 'Unmark Important' : 'Mark as Important'}
                      >
                        <Star
                          key={String(isImp)}
                          className={`w-3.5 h-3.5 sn-star-pop ${
                            isImp ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span>{isImp ? 'Important' : 'Mark Important'}</span>
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3 transition-colors duration-200 group-hover:text-blue-700">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-line line-clamp-5 leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditNoteModal(note)}
                        className="text-slate-600 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(note.id)}
                        className="text-slate-400 hover:text-red-600 inline-flex items-center gap-1 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sn-card-in p-12 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-3">
          <div className="sn-bob mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {onlyImportant
              ? 'No Important Notes Found for This Filter'
              : 'No Study Notes Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {onlyImportant
              ? 'You currently have no notes marked as Important in this category. Click "Show All Notes" below to mark notes as Important, or create a new important note.'
              : 'Create revision notes for key CSE concepts (like DBMS Normalization, Java Multithreading, or OS Deadlocks).'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {onlyImportant && (
              <button
                type="button"
                onClick={() => {
                  setOnlyImportant(false);
                  setSelectedSubject('All');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Show All Notes ({notes.length})
              </button>
            )}
            <button
              type="button"
              onClick={openNewNoteModal}
              className="sn-shimmer-btn px-5 py-2 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Study Note</span>
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {editorOpen && (
        <div
          className="sn-fade-in fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditorOpen(false)}
        >
          <div
            className="sn-modal-in bg-white text-slate-900 rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl shadow-slate-300/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingNote ? 'Edit Study Note' : 'Create Study Note'}
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:rotate-90 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., BCNF vs 3NF Normalization Rules"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {NOTE_SUBJECTS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Functional Dependencies"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={6}
                  required
                  maxLength={10000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write key definitions, formulas, complexity trade-offs, or code snippets..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Mark as Important for final placement revision</span>
              </label>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="sn-shimmer-btn px-5 py-2 text-xs font-semibold text-white disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}