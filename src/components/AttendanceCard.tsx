import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Student, AttendanceStatus } from '../types/attendance';
import { useAttendance } from '../context/AttendanceContext';

interface AttendanceCardProps {
  student: Student;
  onDraftAlert: (student: Student, status: AttendanceStatus) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ student, onDraftAlert }) => {
  const { markAttendance, getCurrentRecord, getStudentStats, selectedDate } = useAttendance();

  const record = getCurrentRecord(student.id, selectedDate);
  const stats = getStudentStats(student.id);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(record?.note || '');
  const [showLateOptions, setShowLateOptions] = useState(false);

  const currentStatus = record?.status;

  const handleStatusChange = (status: AttendanceStatus, minutes?: number) => {
    markAttendance(student.id, status, noteText || record?.note, minutes);
    if (status !== 'late') {
      setShowLateOptions(false);
    } else {
      setShowLateOptions(true);
    }
  };

  const handleSaveNote = () => {
    if (currentStatus) {
      markAttendance(student.id, currentStatus, noteText, record?.lateMinutes);
    }
    setShowNoteInput(false);
  };

  // Get initials for avatar
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all border ${
        currentStatus === 'present'
          ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20'
          : currentStatus === 'absent'
          ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
          : currentStatus === 'late'
          ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20'
          : currentStatus === 'excused'
          ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Student Identification Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${student.avatarColor}`}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                #{student.rollNo}
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {student.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Parent: {student.parentName} ({student.parentPhone})
            </p>
          </div>
        </div>

        {/* Attendance stats pill & streak */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            {stats.consecutiveAbsences > 1 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse border border-rose-200"
                title={`${stats.consecutiveAbsences} days consecutive absence!`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {stats.consecutiveAbsences}d streak
              </span>
            )}

            {stats.rate >= 95 && stats.totalDays >= 5 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800"
                title="Star Attendance"
              >
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {stats.rate}%
              </span>
            )}

            {stats.rate < 85 && (
              <span
                className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200"
                title="At risk: Attendance below 85%"
              >
                {stats.rate}% Rate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Big Tactile Action Buttons (UI/UX Requirement: Large, easy to click, clearly labeled) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {/* PRESENT BUTTON */}
        <button
          type="button"
          onClick={() => handleStatusChange('present')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer min-h-[48px] select-none active:scale-[0.98] ${
            currentStatus === 'present'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 border border-emerald-200'
          }`}
          aria-pressed={currentStatus === 'present'}
        >
          <CheckCircle className={`w-5 h-5 ${currentStatus === 'present' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Present</span>
        </button>

        {/* ABSENT BUTTON */}
        <button
          type="button"
          onClick={() => handleStatusChange('absent')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer min-h-[48px] select-none active:scale-[0.98] ${
            currentStatus === 'absent'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100/90 border border-rose-200'
          }`}
          aria-pressed={currentStatus === 'absent'}
        >
          <XCircle className={`w-5 h-5 ${currentStatus === 'absent' ? 'text-white' : 'text-rose-600'}`} />
          <span>Absent</span>
        </button>

        {/* LATE BUTTON */}
        <button
          type="button"
          onClick={() => handleStatusChange('late', record?.lateMinutes || 10)}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer min-h-[48px] select-none active:scale-[0.98] ${
            currentStatus === 'late'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100/90 border border-amber-200'
          }`}
          aria-pressed={currentStatus === 'late'}
        >
          <Clock className={`w-5 h-5 ${currentStatus === 'late' ? 'text-white' : 'text-amber-600'}`} />
          <span>Late</span>
        </button>

        {/* EXCUSED BUTTON */}
        <button
          type="button"
          onClick={() => handleStatusChange('excused')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer min-h-[48px] select-none active:scale-[0.98] ${
            currentStatus === 'excused'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100/90 border border-blue-200'
          }`}
          aria-pressed={currentStatus === 'excused'}
        >
          <ShieldCheck className={`w-5 h-5 ${currentStatus === 'excused' ? 'text-white' : 'text-blue-600'}`} />
          <span>Excused</span>
        </button>
      </div>

      {/* Late Minutes Quick Buttons (If marked late) */}
      {currentStatus === 'late' && showLateOptions && (
        <div className="flex items-center gap-2 p-2 bg-amber-100/60 rounded-xl mb-3 text-xs">
          <span className="font-semibold text-amber-900">Delay:</span>
          {[5, 10, 15, 20, 30].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => markAttendance(student.id, 'late', record?.note, mins)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                record?.lateMinutes === mins
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white text-amber-900 hover:bg-amber-200 border border-amber-300'
              }`}
            >
              +{mins}m
            </button>
          ))}
        </div>
      )}

      {/* Bottom bar: Note Indicator & AI Alert Trigger */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
        {/* Note trigger & preview */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              record?.note
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{record?.note ? 'Edit Note' : '+ Note'}</span>
          </button>

          {record?.note && !showNoteInput && (
            <span className="text-xs text-slate-600 italic truncate max-w-[180px] sm:max-w-[240px]">
              &ldquo;{record.note}&rdquo;
            </span>
          )}
        </div>

        {/* AI Parent Alert Trigger: Highlights when student is Absent or Late */}
        {(currentStatus === 'absent' || currentStatus === 'late') && (
          <button
            type="button"
            onClick={() => onDraftAlert(student, currentStatus)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-600/20 active:scale-95 cursor-pointer ml-auto"
            title="Auto-draft parent email and SMS alert with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Draft Parent Alert</span>
          </button>
        )}
      </div>

      {/* Expanded Note Input Form */}
      {showNoteInput && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label htmlFor={`note-${student.id}`} className="text-xs font-semibold text-slate-700 block">
            Attendance Note / Reason
          </label>
          <div className="flex gap-2">
            <input
              id={`note-${student.id}`}
              type="text"
              placeholder="e.g. Doctor note provided, fever, traffic delay..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
              className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowNoteInput(false)}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
          {/* Quick preset reason chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400">Quick reasons:</span>
            {['Flu / Fever', 'Doctor Appt', 'Bus Delayed', 'Family Emergency', 'Unexcused'].map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNoteText(preset)}
                  className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {preset}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
