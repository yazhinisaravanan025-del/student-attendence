import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileCheck2,
  Copy,
  Check,
  Printer,
  Calendar,
  Users,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AiDailySummary } from '../types/attendance';

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedClassId,
    selectedDate,
    classes,
    students,
    getClassStats,
    getCurrentRecord,
    saveAiSummary,
    aiSummaries,
  } = useAttendance();

  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AiDailySummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const stats = getClassStats(selectedClassId, selectedDate);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Check if we already generated a summary for this class and date
  useEffect(() => {
    if (isOpen) {
      const existing = aiSummaries.find(
        (s) => s.className === currentClass.name && s.date === selectedDate
      );
      if (existing) {
        setSummaryData(existing);
      } else {
        generateSummary();
      }
    }
  }, [isOpen, selectedClassId, selectedDate]);

  if (!isOpen) return null;

  const generateSummary = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Collect absent/late students details
    const absentStudents = classStudents
      .map((student) => {
        const record = getCurrentRecord(student.id, selectedDate);
        if (record && (record.status === 'absent' || record.status === 'late')) {
          return {
            name: student.name,
            rollNo: student.rollNo,
            status: record.status,
            note: record.note || 'No reason provided',
            lateMinutes: record.lateMinutes,
          };
        }
        return null;
      })
      .filter(Boolean);

    try {
      const res = await fetch('/api/ai/summarize-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          className: currentClass.name,
          stats,
          totalStudents: classStudents.length,
          absentStudents,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      const newSummary: AiDailySummary = {
        date: selectedDate,
        className: currentClass.name,
        summary: data.summary,
        observations: data.observations || [],
        actionItems: data.actionItems || [],
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSummaryData(newSummary);
      saveAiSummary(newSummary);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not reach Gemini service; generated algorithmic summary.');
      // Local heuristic fallback
      const pct = Math.round((stats.present / (classStudents.length || 1)) * 100);
      const fallback: AiDailySummary = {
        date: selectedDate,
        className: currentClass.name,
        summary: `On ${selectedDate}, ${currentClass.name} achieved an attendance rate of ${pct}%, with ${stats.present} present out of ${classStudents.length} enrolled students.`,
        observations: [
          `${stats.present} students attended today (${pct}% participation rate).`,
          stats.absent > 0
            ? `${stats.absent} student(s) absent: follow-up required.`
            : '100% full classroom attendance today!',
          stats.late > 0 ? `${stats.late} student(s) logged tardy arrival.` : 'All students arrived on time.',
        ],
        actionItems: [
          'Log verified parent excuse notes in the system.',
          'Send check-in notices for unexcused absences.',
        ],
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSummaryData(fallback);
      saveAiSummary(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!summaryData) return;
    const fullText = `=== DAILY ATTENDANCE SUMMARY ===\nClass: ${summaryData.className}\nDate: ${summaryData.date}\nRate: ${stats.attendanceRate}%\n\n${summaryData.summary}\n\nKey Observations:\n${summaryData.observations.map((o) => `• ${o}`).join('\n')}\n\nRecommended Actions:\n${summaryData.actionItems.map((a) => `[ ] ${a}`).join('\n')}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-600 px-6 py-4 text-white flex items-center justify-between print:bg-none print:text-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Gemini AI Class Attendance Brief
              </h2>
              <p className="text-xs text-indigo-100 print:text-slate-600">
                {currentClass.name} • {selectedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              {errorMessage}
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Attendance</span>
              <div className="text-base font-black text-slate-900">{stats.attendanceRate}%</div>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 uppercase font-bold">Present</span>
              <div className="text-base font-black text-emerald-600">{stats.present}</div>
            </div>
            <div>
              <span className="text-[10px] text-rose-700 uppercase font-bold">Absent</span>
              <div className="text-base font-black text-rose-600">{stats.absent}</div>
            </div>
            <div>
              <span className="text-[10px] text-amber-700 uppercase font-bold">Late</span>
              <div className="text-base font-black text-amber-600">{stats.late}</div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Gemini 3.8 Flash is analyzing patterns and compiling today's summary...
              </p>
            </div>
          ) : summaryData ? (
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-800 font-medium">
                  {summaryData.summary}
                </p>
              </div>

              {/* Key Observations */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Key Observations & Attendance Patterns</span>
                </h4>
                <ul className="space-y-2">
                  {summaryData.observations.map((obs, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action Steps */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Teacher & Counselor Next Steps</span>
                </h4>
                <div className="space-y-1.5">
                  {summaryData.actionItems.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs text-emerald-950 font-medium"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Generated via Gemini 3.8 Flash • {summaryData.generatedAt}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={generateSummary}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Analysis</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Brief</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
