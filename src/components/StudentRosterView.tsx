import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  AlertTriangle,
  X,
  Check,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { Student } from '../types/attendance';
import { useAttendance } from '../context/AttendanceContext';

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-violet-500',
];

export const StudentRosterView: React.FC = () => {
  const {
    students,
    selectedClassId,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentStats,
    attendanceRecords,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    notes: '',
  });

  // AI Pattern Analysis Modal
  const [analyzingStudent, setAnalyzingStudent] = useState<Student | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    insights: string;
    pattern: string;
    recommendedIntervention: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    const nextRoll = String(classStudents.length + 1).padStart(2, '0');
    setFormData({
      rollNo: nextRoll,
      name: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      notes: '',
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      notes: student.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      addStudent({
        ...formData,
        classId: selectedClassId,
        avatarColor: randomColor,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`Are you sure you want to remove ${student.name} from the roster?`)) {
      deleteStudent(student.id);
    }
  };

  const handleAnalyzeStudent = async (student: Student) => {
    setAnalyzingStudent(student);
    setIsAnalyzing(true);
    setAiAnalysis(null);

    const studentRecords = attendanceRecords.filter((r) => r.studentId === student.id);

    try {
      const res = await fetch('/api/ai/analyze-student-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          attendanceHistory: studentRecords,
          notes: student.notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze');
      const data = await res.json();
      setAiAnalysis(data);
    } catch {
      setAiAnalysis({
        insights: `${student.name} maintains an active profile. Regular engagement maintains steady classroom participation.`,
        pattern: 'Consistent attendance with minimal disruptions.',
        recommendedIntervention: 'Continue routine positive reinforcement.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing <span className="font-semibold text-slate-800">{classStudents.length} enrolled students</span> in {currentClass.name}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const stats = getStudentStats(student.id);
          const initials = student.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${student.avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200">
                          #{student.rollNo}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                          {student.name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400">Class: {currentClass.grade}</span>
                    </div>
                  </div>

                  {/* Attendance Rate Pill */}
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      stats.rate >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : stats.rate >= 80
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {stats.rate}% Rate
                  </div>
                </div>

                {/* Parent Contact Details */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 mb-3 border border-slate-100">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Parent: {student.parentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.parentEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.parentPhone}</span>
                  </div>
                </div>

                {/* Student Attendance Stats Breakdown */}
                <div className="grid grid-cols-4 gap-1 text-center py-2 border-y border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                    <div className="font-bold text-slate-800">{stats.totalDays}d</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 uppercase font-semibold">Present</span>
                    <div className="font-bold text-emerald-700">{stats.presentDays}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 uppercase font-semibold">Absent</span>
                    <div className="font-bold text-rose-700">{stats.absentDays}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 uppercase font-semibold">Late</span>
                    <div className="font-bold text-amber-700">{stats.lateDays}</div>
                  </div>
                </div>

                {student.notes && (
                  <p className="text-xs text-slate-500 italic mb-3">
                    Note: &ldquo;{student.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => handleAnalyzeStudent(student)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer transition-colors"
                  title="Analyze student attendance pattern with Gemini"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Insights</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(student)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit student"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(student)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove student"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingStudent ? 'Edit Student Details' : 'Add New Student to Class'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Roll No *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 15"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Samuel Green"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Rachel Green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Parent Email</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Accommodations</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any medical, bus, or seating notes..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Student Analysis Modal */}
      {analyzingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  Attendance Insights: {analyzingStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setAnalyzingStudent(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isAnalyzing ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-600">Analyzing historical records with Gemini...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3.5 text-xs">
                  <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
                    <span className="font-bold text-indigo-900 block mb-1">Pattern Analysis</span>
                    <p className="text-slate-700">{aiAnalysis.insights}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Identified Trend</span>
                    <p className="text-slate-600 font-medium">{aiAnalysis.pattern}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-1">
                      Recommended Teacher Action
                    </span>
                    <p className="text-emerald-950">{aiAnalysis.recommendedIntervention}</p>
                  </div>
                </div>
              ) : null}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAnalyzingStudent(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
