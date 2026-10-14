import React, { useState, useMemo } from 'react';
import {
  CheckCheck,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Student, AttendanceStatus } from '../types/attendance';
import { AttendanceCard } from './AttendanceCard';

interface AttendanceRollCallProps {
  onDraftAlert: (student: Student, status: AttendanceStatus) => void;
  onOpenAiSummary: () => void;
}

export const AttendanceRollCall: React.FC<AttendanceRollCallProps> = ({
  onDraftAlert,
  onOpenAiSummary,
}) => {
  const {
    students,
    selectedClassId,
    selectedDate,
    classes,
    markAllPresent,
    clearAttendanceForDay,
    getClassStats,
    getCurrentRecord,
    markAttendance,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus | 'unmarked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const stats = getClassStats(selectedClassId, selectedDate);

  // Filter students for active class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Apply search query and status filter
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;

      const record = getCurrentRecord(student.id, selectedDate);
      if (statusFilter === 'unmarked') {
        return !record || !record.status;
      }
      return record?.status === statusFilter;
    });
  }, [classStudents, searchQuery, statusFilter, getCurrentRecord, selectedDate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllPresent = () => {
    markAllPresent(selectedClassId, selectedDate);
    showToast(`Marked all ${classStudents.length} students Present!`);
  };

  const handleClearAll = () => {
    if (window.confirm("Clear today's attendance records for this class?")) {
      clearAttendanceForDay(selectedClassId, selectedDate);
      showToast('Attendance marks cleared for today.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Stats & Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentClass.name}
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {currentClass.room}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Homeroom Teacher: <span className="font-semibold text-slate-700">{currentClass.teacherName}</span> • Total Enrolled: <span className="font-bold text-slate-900">{stats.total}</span>
            </p>
          </div>

          {/* Teacher Fast Actions */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {/* MARK ALL PRESENT BUTTON */}
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
              title="One-click: Mark all students present (saves time on normal days!)"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>

            {/* AI DAILY SUMMARY BUTTON */}
            <button
              type="button"
              onClick={onOpenAiSummary}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>AI Summary</span>
            </button>

            {/* CLEAR MARKS */}
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Clear today's roll call"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate KPI counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          {/* Rate */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Attendance Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.attendanceRate}%</span>
              <span className="text-xs text-slate-500">of enrolled</span>
            </div>
          </div>

          {/* Present */}
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Present
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{stats.present}</div>
          </div>

          {/* Absent */}
          <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
                Absent
              </span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-900 mt-1">{stats.absent}</div>
          </div>

          {/* Late */}
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Late
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.late}</div>
          </div>

          {/* Excused */}
          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                Excused
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">{stats.excused}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Roll Call Progress: {stats.total - stats.unmarked} of {stats.total} marked</span>
            {stats.unmarked > 0 ? (
              <span className="text-amber-600 font-semibold">{stats.unmarked} unmarked</span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Roll Call Complete
              </span>
            )}
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
              title={`Present: ${stats.present}`}
            />
            <div
              className="bg-amber-500 transition-all duration-300"
              style={{ width: `${(stats.late / (stats.total || 1)) * 100}%` }}
              title={`Late: ${stats.late}`}
            />
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${(stats.excused / (stats.total || 1)) * 100}%` }}
              title={`Excused: ${stats.excused}`}
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${(stats.absent / (stats.total || 1)) * 100}%` }}
              title={`Absent: ${stats.absent}`}
            />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-1 hidden md:inline">
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
            Filter:
          </span>
          {[
            { id: 'all', label: `All (${classStudents.length})` },
            { id: 'present', label: `Present (${stats.present})` },
            { id: 'absent', label: `Absent (${stats.absent})` },
            { id: 'late', label: `Late (${stats.late})` },
            { id: 'excused', label: `Excused (${stats.excused})` },
            { id: 'unmarked', label: `Unmarked (${stats.unmarked})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card Grid View (Large touch buttons)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Compact Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student Cards / Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No students match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your search query or switching the status filter back to &ldquo;All&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-4 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Touch-friendly large cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <AttendanceCard key={student.id} student={student} onDraftAlert={onDraftAlert} />
          ))}
        </div>
      ) : (
        /* COMPACT TABLE VIEW for fast desktop mouse roll call */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status Today</th>
                  <th className="py-3 px-4">Mark Attendance</th>
                  <th className="py-3 px-4">Notes / Delay</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const record = getCurrentRecord(student.id, selectedDate);
                  const status = record?.status;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">#{student.rollNo}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400">{student.parentName}</div>
                      </td>
                      <td className="py-3 px-4">
                        {status ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {status} {status === 'late' && record.lateMinutes && `(+${record.lateMinutes}m)`}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unmarked</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => markAttendance(student.id, 'present')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => markAttendance(student.id, 'absent')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => markAttendance(student.id, 'late', record?.note, 10)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => markAttendance(student.id, 'excused')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              status === 'excused'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {record?.note ? (
                          <span className="truncate max-w-[150px] inline-block">{record.note}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(status === 'absent' || status === 'late') && (
                          <button
                            type="button"
                            onClick={() => onDraftAlert(student, status)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            Draft Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
