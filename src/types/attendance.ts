export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  classId: string;
  avatarColor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  notes?: string;
}

export interface AttendanceEntry {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  lateMinutes?: number;
  updatedAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  room: string;
  teacherName: string;
}

export interface ParentAlertDraft {
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  followUpTip?: string;
  sentAt?: string;
}

export interface AiDailySummary {
  date: string;
  className: string;
  summary: string;
  observations: string[];
  actionItems: string[];
  generatedAt: string;
}
