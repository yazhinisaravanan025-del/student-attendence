import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Eye,
  Sliders,
  Palette,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ux' | 'code' | 'state' | 'gemini'>('ux');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Developer & Teacher Architecture Guide
              </h2>
              <p className="text-xs text-slate-400">
                UI/UX Rationale • Frontend Code Blocks • Local State • Gemini AI Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-50 border-b border-slate-200 shrink-0 overflow-x-auto">
          {[
            { id: 'ux', label: '1. UI/UX Rationale for Teachers', icon: Eye },
            { id: 'code', label: '2. Frontend HTML & Tailwind Code', icon: Code2 },
            { id: 'state', label: '3. State & Local Storage Management', icon: Database },
            { id: 'gemini', label: '4. Gemini API Integration', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: UI/UX RATIONALE */}
          {activeTab === 'ux' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <h3 className="font-bold text-sm text-indigo-950 mb-1">
                  Why Classroom UX Demands High Tactility & Speed
                </h3>
                <p className="text-slate-600">
                  Teachers typically take attendance in the first 3 minutes of class while answering student questions, settling morning announcements, and handing out worksheets. Micro-interactions must eliminate accidental taps, offer instant sensory clarity, and require zero typing on normal days.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Large Tactile Buttons (min-h-[48px])
                  </div>
                  <p className="text-slate-600">
                    <strong>Rationale:</strong> Meets Apple HIG & Android Material touch target minimums (48×48px). Teachers frequently use iPads or Chromebook touchscreens. Small dropdowns cause missed taps and teacher frustration.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    One-Click &ldquo;Mark All Present&rdquo;
                  </div>
                  <p className="text-slate-600">
                    <strong>Rationale:</strong> In a class of 25 students where 23 are present, marking everyone manually requires 25 clicks. With &ldquo;Mark All Present&rdquo;, the teacher clicks once, then simply changes the 2 absent students to &ldquo;Absent&rdquo; in under 10 seconds.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    High Contrast Color Coding & State Ring
                  </div>
                  <p className="text-slate-600">
                    <strong>Rationale:</strong> Green (Present), Red (Absent), Amber (Late), Blue (Excused). An active ring and background tint instantly highlights unmarked students so no child slips through unlogged.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-purple-800 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Direct AI Alert Trigger on Absence
                  </div>
                  <p className="text-slate-600">
                    <strong>Rationale:</strong> When a student is flagged absent or late, an immediate &ldquo;Draft Parent Alert&rdquo; button appears right on their card. This removes friction between recording data and notifying families.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRONTEND CODE BLOCKS */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tactile Attendance Button Block (Tailwind CSS + HTML)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    The reusable 4-button layout providing active feedback and touch responsiveness:
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
  <!-- PRESENT -->
  <button
    type="button"
    onclick="setAttendance(studentId, 'present')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] cursor-pointer active:scale-95 transition-all bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
    <span>Present</span>
  </button>

  <!-- ABSENT -->
  <button
    type="button"
    onclick="setAttendance(studentId, 'absent')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] cursor-pointer active:scale-95 transition-all bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
  >
    <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    <span>Absent</span>
  </button>

  <!-- LATE -->
  <button
    type="button"
    onclick="setAttendance(studentId, 'late')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] cursor-pointer active:scale-95 transition-all bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
  >
    <span>Late</span>
  </button>

  <!-- EXCUSED -->
  <button
    type="button"
    onclick="setAttendance(studentId, 'excused')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] cursor-pointer active:scale-95 transition-all bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
  >
    <span>Excused</span>
  </button>
</div>`,
                      'btn-block'
                    )
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-semibold"
                >
                  {copiedSnippet === 'btn-block' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
  <!-- PRESENT: Emerald background, high contrast, active scale animation -->
  <button
    onclick="markAttendance(student.id, 'present')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] active:scale-95 transition-all \${
      status === 'present' ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600' : 'bg-emerald-50 text-emerald-800'
    }"
  >
    <CheckCircle class="w-5 h-5" />
    <span>Present</span>
  </button>

  <!-- ABSENT: Rose background with distinct X icon -->
  <button
    onclick="markAttendance(student.id, 'absent')"
    class="flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm min-h-[48px] active:scale-95 transition-all \${
      status === 'absent' ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600' : 'bg-rose-50 text-rose-800'
    }"
  >
    <XCircle class="w-5 h-5" />
    <span>Absent</span>
  </button>
  ...
</div>`}
              </pre>
            </div>
          )}

          {/* TAB 3: STATE & LOCAL STORAGE */}
          {activeTab === 'state' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Normalized State Schema & LocalStorage Persistence
              </h3>
              <p className="text-slate-600">
                Attendance records are keyed by composite tuple <code>(studentId, date)</code>. This keeps student demographics separate from daily roll call entries and allows instant lookup and aggregate calculation.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-mono text-[11px] text-slate-800 font-bold">
                  // Core Data Interfaces
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[10px] overflow-x-auto">
{`interface AttendanceEntry {
  studentId: string;    // Foreign key to student
  date: string;         // "YYYY-MM-DD"
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;        // "Doctor note", "Flu", etc.
  lateMinutes?: number; // e.g. 15
  updatedAt: string;    // ISO timestamp
}

// Updating an entry in React state:
const markAttendance = (studentId, status, note, lateMinutes) => {
  setRecords(prev => {
    const existingIndex = prev.findIndex(r => r.studentId === studentId && r.date === selectedDate);
    const updated = { studentId, date: selectedDate, status, note, lateMinutes, updatedAt: new Date().toISOString() };
    if (existingIndex >= 0) {
      const copy = [...prev];
      copy[existingIndex] = updated;
      return copy;
    }
    return [...prev, updated];
  });
};`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI API INTEGRATION */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Server-Side Gemini API Implementation (@google/genai)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    How the backend securely initializes the SDK and prompts <code>gemini-3.8-flash</code> with structured JSON schemas:
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-slate-700 space-y-2">
                <span className="font-bold text-indigo-900">Core Security Rule:</span>
                <p>
                  Per best practices, <code>@google/genai</code> is executed strictly on the Express backend (`server.ts`). The client frontend never touches the API key. The client issues a <code>POST /api/ai/generate-parent-alert</code> with the student attendance parameters.
                </p>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

// Call gemini-3.8-flash for Parent Notice Generation:
const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
  }
});

const { subject, emailBody, smsBody, followUpTip } = JSON.parse(response.text);`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            AttendEase Architecture • Clean TypeScript, Tailwind CSS & Gemini 3.8 Flash
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
