import React from 'react';
import {
  Download,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const AnalyticsView: React.FC = () => {
  const {
    students,
    selectedClassId,
    classes,
    attendanceRecords,
    getStudentStats,
    getClassStats,
    selectedDate,
  } = useAttendance();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const currentStats = getClassStats(selectedClassId, selectedDate);

  // Group attendance records by day of the week for class
  const classRecords = attendanceRecords.filter((r) =>
    classStudents.some((s) => s.id === r.studentId)
  );

  // Calculate weekday rates (Mon-Fri)
  const dayStats: Record<string, { present: number; total: number }> = {
    Mon: { present: 0, total: 0 },
    Tue: { present: 0, total: 0 },
    Wed: { present: 0, total: 0 },
    Thu: { present: 0, total: 0 },
    Fri: { present: 0, total: 0 },
  };

  classRecords.forEach((r) => {
    try {
      const parts = r.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      if (dayStats[dayName]) {
        dayStats[dayName].total++;
        if (r.status === 'present' || r.status === 'late') {
          dayStats[dayName].present++;
        }
      }
    } catch {}
  });

  // Identify at-risk students (< 85% attendance rate)
  const atRiskStudents = classStudents
    .map((student) => ({
      student,
      stats: getStudentStats(student.id),
    }))
    .filter((item) => item.stats.rate < 85 && item.stats.totalDays >= 3);

  // Identify perfect attendance / honor roll (100% or highest rate)
  const topStudents = classStudents
    .map((student) => ({
      student,
      stats: getStudentStats(student.id),
    }))
    .filter((item) => item.stats.rate >= 95 && item.stats.totalDays >= 3)
    .sort((a, b) => b.stats.rate - a.stats.rate)
    .slice(0, 5);

  /**
   * Export to CSV
   */
  const handleExportCSV = () => {
    // Generate dates header
    const uniqueDates = Array.from(new Set(classRecords.map((r) => r.date))).sort();

    const headers = ['Roll No', 'Student Name', 'Parent Name', 'Parent Phone', 'Attendance Rate %', 'Total Tracked', 'Days Present', 'Days Absent', 'Days Late', ...uniqueDates];

    const rows = classStudents.map((s) => {
      const stats = getStudentStats(s.id);
      const dailyStatuses = uniqueDates.map((date) => {
        const rec = classRecords.find((r) => r.studentId === s.id && r.date === date);
        return rec ? rec.status.toUpperCase() : 'N/A';
      });

      return [
        s.rollNo,
        `"${s.name}"`,
        `"${s.parentName}"`,
        `"${s.parentPhone}"`,
        `${stats.rate}%`,
        stats.totalDays,
        stats.presentDays,
        stats.absentDays,
        stats.lateDays,
        ...dailyStatuses,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${currentClass.name.replace(/\s+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown and trends for {currentClass.name}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Full CSV Sheet</span>
        </button>
      </div>

      {/* Weekday Trend & Top KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekday Attendance Bars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance by Day of the Week</h3>
              <p className="text-xs text-slate-400">
                Identifies recurring weekly drop-offs (e.g. Friday travel or Monday tardiness)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="grid grid-cols-5 gap-3 pt-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
              const info = dayStats[day];
              const pct = info.total > 0 ? Math.round((info.present / info.total) * 100) : 0;
              return (
                <div key={day} className="flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-xl h-36 flex flex-col justify-end p-1.5 relative overflow-hidden">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        pct >= 90
                          ? 'bg-emerald-500'
                          : pct >= 80
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="absolute top-2 left-0 right-0 text-center font-bold text-xs text-slate-700">
                      {pct}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-2">{day}</span>
                  <span className="text-[10px] text-slate-400">
                    {info.present}/{info.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Class Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Overall Performance</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Class Average</span>
                <span className="text-2xl font-black text-slate-900">
                  {currentStats.attendanceRate}%
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-800 font-semibold block">
                  Exemplary Students
                </span>
                <span className="text-lg font-bold text-emerald-900">
                  {topStudents.length} students &gt;95%
                </span>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <span className="text-xs text-rose-800 font-semibold block">
                  At-Risk Chronic Absentees
                </span>
                <span className="text-lg font-bold text-rose-900">
                  {atRiskStudents.length} students &lt;85%
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            Based on {classRecords.length} historical attendance logs recorded in this session.
          </p>
        </div>
      </div>

      {/* At-Risk Watchlist & Top Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* At-Risk Chronic Absentee Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Chronic Absenteeism Watchlist</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            State educational standards flag attendance rates below 85% for counselor intervention.
          </p>

          {atRiskStudents.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No students are currently flagged for chronic absenteeism!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {atRiskStudents.map(({ student, stats }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      #{student.rollNo} {student.name}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {stats.absentDays} days absent of {stats.totalDays} tracked
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-700 text-sm">{stats.rate}%</span>
                    <span className="text-[10px] text-rose-500 block">Needs follow-up</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Honor Roll / Perfect Attendance Streaks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Attendance Champions</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Students maintaining outstanding attendance (&gt;95%) this semester.
          </p>

          <div className="space-y-2.5">
            {topStudents.map(({ student, stats }) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    #{student.rollNo} {student.name}
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    {stats.presentDays} of {stats.totalDays} days present
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 text-sm">{stats.rate}%</span>
                  <span className="text-[10px] text-emerald-600 block">Star Attendee</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
