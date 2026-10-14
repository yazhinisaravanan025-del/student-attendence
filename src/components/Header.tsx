import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  School,
  Sparkles,
  Users,
  CheckCircle2,
  BarChart3,
  BookOpen,
  RotateCcw,
  BellRing,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { formatDateKey } from '../data/mockData';

interface HeaderProps {
  currentTab: 'rollcall' | 'roster' | 'analytics' | 'alerts';
  setCurrentTab: (tab: 'rollcall' | 'roster' | 'analytics' | 'alerts') => void;
  onOpenGuide: () => void;
  onOpenAiSummary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenGuide,
  onOpenAiSummary,
}) => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedDate,
    setSelectedDate,
    getClassStats,
    resetAllData,
  } = useAttendance();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const stats = getClassStats(selectedClassId, selectedDate);

  // Navigate date
  const handleDateOffset = (offsetDays: number) => {
    const parts = selectedDate.split('-');
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(formatDateKey(current));
  };

  const isToday = selectedDate === formatDateKey(new Date());

  const formattedDateDisplay = () => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: School Brand & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3 border-b border-slate-100">
          {/* Logo & School Context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight">AttendEase</h1>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Teacher Suite
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Oakridge Elementary • {currentClass.teacherName}
              </p>
            </div>
          </div>

          {/* Quick AI & Guide Triggers */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={onOpenAiSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all shadow-xs cursor-pointer"
              title="Generate AI Roll Call Summary with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Daily Summary</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Explore UI/UX rationale, state model, and code structure"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>UI/UX & Code Guide</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all attendance and roster data to default sample demo?')) {
                  resetAllData();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second Row: Class Selector, Date Switcher, and Nav Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between py-2.5 gap-3">
          {/* Controls: Class & Date */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Class Dropdown */}
            <div className="relative">
              <label htmlFor="class-select" className="sr-only">
                Select Class
              </label>
              <select
                id="class-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 font-semibold text-slate-800 text-xs sm:text-sm rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer appearance-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.room})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => handleDateOffset(-1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formattedDateDisplay()}</span>
                {isToday && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    TODAY
                  </span>
                )}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="w-5 h-5 opacity-0 absolute cursor-pointer"
                title="Choose custom date"
              />

              <button
                onClick={() => handleDateOffset(1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Today Button */}
            {!isToday && (
              <button
                onClick={() => setSelectedDate(formatDateKey(new Date()))}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Jump to Today
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setCurrentTab('rollcall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'rollcall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${currentTab === 'rollcall' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Roll Call</span>
              <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                stats.attendanceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {stats.attendanceRate}%
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'roster'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${currentTab === 'roster' ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span>Students & Roster</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${currentTab === 'analytics' ? 'text-purple-600' : 'text-slate-500'}`} />
              <span>Analytics & CSV</span>
            </button>

            <button
              onClick={() => setCurrentTab('alerts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'alerts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BellRing className={`w-3.5 h-3.5 ${currentTab === 'alerts' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Parent Notices</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
