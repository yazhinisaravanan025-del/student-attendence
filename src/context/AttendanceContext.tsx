import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  AttendanceEntry,
  AttendanceStatus,
  ClassRoom,
  ParentAlertDraft,
  AiDailySummary,
} from '../types/attendance';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  generateInitialAttendance,
  getTodayDateString,
} from '../data/mockData';

interface ClassStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  attendanceRate: number;
}

interface StudentStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  rate: number;
  consecutiveAbsences: number;
  statusToday?: AttendanceStatus;
}

interface AttendanceContextType {
  classes: ClassRoom[];
  students: Student[];
  selectedClassId: string;
  selectedDate: string;
  attendanceRecords: AttendanceEntry[];
  sentAlerts: ParentAlertDraft[];
  aiSummaries: AiDailySummary[];
  setSelectedClassId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  markAttendance: (
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    lateMinutes?: number
  ) => void;
  markAllPresent: (classId?: string, date?: string) => void;
  clearAttendanceForDay: (classId?: string, date?: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  logSentAlert: (alert: ParentAlertDraft) => void;
  saveAiSummary: (summary: AiDailySummary) => void;
  resetAllData: () => void;
  getClassStats: (classId?: string, date?: string) => ClassStats;
  getStudentStats: (studentId: string) => StudentStats;
  getCurrentRecord: (studentId: string, date?: string) => AttendanceEntry | undefined;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSES: 'attendease_classes_v1',
  STUDENTS: 'attendease_students_v1',
  RECORDS: 'attendease_records_v1',
  ALERTS: 'attendease_alerts_v1',
  SUMMARIES: 'attendease_summaries_v1',
  SELECTED_CLASS: 'attendease_selected_class_v1',
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CLASS) || INITIAL_CLASSES[0].id;
  });
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : generateInitialAttendance();
    } catch {
      return generateInitialAttendance();
    }
  });

  const [sentAlerts, setSentAlerts] = useState<ParentAlertDraft[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aiSummaries, setAiSummaries] = useState<AiDailySummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(sentAlerts));
  }, [sentAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(aiSummaries));
  }, [aiSummaries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS, selectedClassId);
  }, [selectedClassId]);

  /**
   * Mark individual student attendance
   */
  const markAttendance = (
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    lateMinutes?: number
  ) => {
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.studentId === studentId && r.date === selectedDate
      );

      const updatedEntry: AttendanceEntry = {
        studentId,
        date: selectedDate,
        status,
        note,
        lateMinutes,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = updatedEntry;
        return copy;
      } else {
        return [...prev, updatedEntry];
      }
    });
  };

  /**
   * Quick bulk action: Mark all students in the active class present
   */
  const markAllPresent = (classId = selectedClassId, date = selectedDate) => {
    const classStudents = students.filter((s) => s.classId === classId);
    setAttendanceRecords((prev) => {
      const otherRecords = prev.filter(
        (r) => !(r.date === date && classStudents.some((s) => s.id === r.studentId))
      );

      const newPresents: AttendanceEntry[] = classStudents.map((student) => ({
        studentId: student.id,
        date,
        status: 'present' as AttendanceStatus,
        updatedAt: new Date().toISOString(),
      }));

      return [...otherRecords, ...newPresents];
    });
  };

  /**
   * Clear attendance markings for class & date
   */
  const clearAttendanceForDay = (classId = selectedClassId, date = selectedDate) => {
    const classStudents = students.filter((s) => s.classId === classId);
    setAttendanceRecords((prev) =>
      prev.filter((r) => !(r.date === date && classStudents.some((s) => s.id === r.studentId)))
    );
  };

  /**
   * Student Roster Actions
   */
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  const updateStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== studentId));
  };

  const logSentAlert = (alert: ParentAlertDraft) => {
    setSentAlerts((prev) => [alert, ...prev]);
  };

  const saveAiSummary = (summary: AiDailySummary) => {
    setAiSummaries((prev) => [summary, ...prev.filter((s) => !(s.date === summary.date && s.className === summary.className))]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setAttendanceRecords(generateInitialAttendance());
    setSentAlerts([]);
    setAiSummaries([]);
    setSelectedClassId(INITIAL_CLASSES[0].id);
    setSelectedDate(getTodayDateString());
  };

  /**
   * Query: Get active record for student on a date
   */
  const getCurrentRecord = (studentId: string, date = selectedDate): AttendanceEntry | undefined => {
    return attendanceRecords.find((r) => r.studentId === studentId && r.date === date);
  };

  /**
   * Query: Calculate class aggregate statistics for a given date
   */
  const getClassStats = (classId = selectedClassId, date = selectedDate): ClassStats => {
    const classStudents = students.filter((s) => s.classId === classId);
    const total = classStudents.length;

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    classStudents.forEach((student) => {
      const record = attendanceRecords.find((r) => r.studentId === student.id && r.date === date);
      if (!record) {
        unmarked++;
      } else {
        switch (record.status) {
          case 'present':
            present++;
            break;
          case 'absent':
            absent++;
            break;
          case 'late':
            late++;
            break;
          case 'excused':
            excused++;
            break;
        }
      }
    });

    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      unmarked,
      attendanceRate,
    };
  };

  /**
   * Query: Calculate individual student historical statistics & streak
   */
  const getStudentStats = (studentId: string): StudentStats => {
    const studentRecords = attendanceRecords
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalDays = studentRecords.length;
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let excusedDays = 0;

    studentRecords.forEach((r) => {
      if (r.status === 'present') presentDays++;
      else if (r.status === 'absent') absentDays++;
      else if (r.status === 'late') lateDays++;
      else if (r.status === 'excused') excusedDays++;
    });

    const rate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100;

    // Consecutive absences check from most recent records
    let consecutiveAbsences = 0;
    for (const record of studentRecords) {
      if (record.status === 'absent') {
        consecutiveAbsences++;
      } else {
        break;
      }
    }

    const todayRec = studentRecords.find((r) => r.date === selectedDate);

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      rate,
      consecutiveAbsences,
      statusToday: todayRec?.status,
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        classes,
        students,
        selectedClassId,
        selectedDate,
        attendanceRecords,
        sentAlerts,
        aiSummaries,
        setSelectedClassId,
        setSelectedDate,
        markAttendance,
        markAllPresent,
        clearAttendanceForDay,
        addStudent,
        updateStudent,
        deleteStudent,
        logSentAlert,
        saveAiSummary,
        resetAllData,
        getClassStats,
        getStudentStats,
        getCurrentRecord,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
