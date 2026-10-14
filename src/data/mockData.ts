import { ClassRoom, Student, AttendanceEntry } from '../types/attendance';

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class-5a',
    name: 'Grade 5A - Maple Wing',
    grade: 'Grade 5',
    room: 'Room 204',
    teacherName: 'Ms. Emily Rivera',
  },
  {
    id: 'class-6b',
    name: 'Grade 6B - Horizon Hall',
    grade: 'Grade 6',
    room: 'Room 312',
    teacherName: 'Mr. Marcus Chen',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Class 5A
  {
    id: 's-101',
    rollNo: '01',
    name: 'Amara Okafor',
    classId: 'class-5a',
    avatarColor: 'bg-emerald-500',
    parentName: 'Ngozi Okafor',
    parentEmail: 'ngozi.okafor@example.com',
    parentPhone: '(555) 234-5678',
    notes: 'Honor roll student, speech team captain',
  },
  {
    id: 's-102',
    rollNo: '02',
    name: 'Benjamin Miller',
    classId: 'class-5a',
    avatarColor: 'bg-blue-500',
    parentName: 'David Miller',
    parentEmail: 'david.miller@example.com',
    parentPhone: '(555) 345-6789',
    notes: 'Bus route #4 arrival sometimes experiences highway delays',
  },
  {
    id: 's-103',
    rollNo: '03',
    name: 'Chloe Zhang',
    classId: 'class-5a',
    avatarColor: 'bg-indigo-500',
    parentName: 'Mei-Ling Zhang',
    parentEmail: 'meiling.zhang@example.com',
    parentPhone: '(555) 456-7890',
  },
  {
    id: 's-104',
    rollNo: '04',
    name: 'Diego Hernandez',
    classId: 'class-5a',
    avatarColor: 'bg-amber-500',
    parentName: 'Carlos Hernandez',
    parentEmail: 'carlos.h@example.com',
    parentPhone: '(555) 567-8901',
    notes: 'Has mild asthma, inhaler in nurse clinic',
  },
  {
    id: 's-105',
    rollNo: '05',
    name: 'Elena Rostova',
    classId: 'class-5a',
    avatarColor: 'bg-rose-500',
    parentName: 'Svetlana Rostova',
    parentEmail: 's.rostova@example.com',
    parentPhone: '(555) 678-9012',
  },
  {
    id: 's-106',
    rollNo: '06',
    name: 'Finnian O’Connor',
    classId: 'class-5a',
    avatarColor: 'bg-teal-500',
    parentName: 'Sean O’Connor',
    parentEmail: 'sean.oconnor@example.com',
    parentPhone: '(555) 789-0123',
    notes: 'Needs front row seating for hearing accommodation',
  },
  {
    id: 's-107',
    rollNo: '07',
    name: 'Grace Kim',
    classId: 'class-5a',
    avatarColor: 'bg-purple-500',
    parentName: 'Soo-Jin Kim',
    parentEmail: 'soojin.kim@example.com',
    parentPhone: '(555) 890-1234',
  },
  {
    id: 's-108',
    rollNo: '08',
    name: 'Hassan Al-Mansoor',
    classId: 'class-5a',
    avatarColor: 'bg-cyan-500',
    parentName: 'Tariq Al-Mansoor',
    parentEmail: 'tariq.almansoor@example.com',
    parentPhone: '(555) 901-2345',
  },
  {
    id: 's-109',
    rollNo: '09',
    name: 'Isabella Rossi',
    classId: 'class-5a',
    avatarColor: 'bg-pink-500',
    parentName: 'Matteo Rossi',
    parentEmail: 'matteo.rossi@example.com',
    parentPhone: '(555) 012-3456',
  },
  {
    id: 's-110',
    rollNo: '10',
    name: 'Jordan Washington',
    classId: 'class-5a',
    avatarColor: 'bg-violet-500',
    parentName: 'Alicia Washington',
    parentEmail: 'alicia.w@example.com',
    parentPhone: '(555) 123-4567',
    notes: 'Flagged for chronic absenteeism review last month',
  },
  {
    id: 's-111',
    rollNo: '11',
    name: 'Kai Takahashi',
    classId: 'class-5a',
    avatarColor: 'bg-emerald-600',
    parentName: 'Kenji Takahashi',
    parentEmail: 'kenji.t@example.com',
    parentPhone: '(555) 234-8901',
  },
  {
    id: 's-112',
    rollNo: '12',
    name: 'Layla Patel',
    classId: 'class-5a',
    avatarColor: 'bg-orange-500',
    parentName: 'Aarav Patel',
    parentEmail: 'aarav.patel@example.com',
    parentPhone: '(555) 345-9012',
  },

  // Class 6B
  {
    id: 's-201',
    rollNo: '01',
    name: 'Lucas Anderson',
    classId: 'class-6b',
    avatarColor: 'bg-blue-600',
    parentName: 'Sarah Anderson',
    parentEmail: 'sarah.anderson@example.com',
    parentPhone: '(555) 456-0123',
  },
  {
    id: 's-202',
    rollNo: '02',
    name: 'Maya Lin',
    classId: 'class-6b',
    avatarColor: 'bg-teal-600',
    parentName: 'Wei Lin',
    parentEmail: 'wei.lin@example.com',
    parentPhone: '(555) 567-1234',
  },
  {
    id: 's-203',
    rollNo: '03',
    name: 'Noah Williams',
    classId: 'class-6b',
    avatarColor: 'bg-indigo-600',
    parentName: 'Marcus Williams',
    parentEmail: 'marcus.w@example.com',
    parentPhone: '(555) 678-2345',
  },
  {
    id: 's-204',
    rollNo: '04',
    name: 'Olivia Martinez',
    classId: 'class-6b',
    avatarColor: 'bg-fuchsia-600',
    parentName: 'Gabriela Martinez',
    parentEmail: 'gabriela.m@example.com',
    parentPhone: '(555) 789-3456',
  },
  {
    id: 's-205',
    rollNo: '05',
    name: 'Priya Sharma',
    classId: 'class-6b',
    avatarColor: 'bg-amber-600',
    parentName: 'Vikram Sharma',
    parentEmail: 'vikram.sharma@example.com',
    parentPhone: '(555) 890-4567',
  },
  {
    id: 's-206',
    rollNo: '06',
    name: 'Quinn Sullivan',
    classId: 'class-6b',
    avatarColor: 'bg-sky-600',
    parentName: 'Patricia Sullivan',
    parentEmail: 'patricia.s@example.com',
    parentPhone: '(555) 901-5678',
  },
];

// Helper to format ISO date string YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDateString(): string {
  return formatDateKey(new Date());
}

/**
 * Seed historical attendance data for realistic analytics across past 10 school days
 */
export function generateInitialAttendance(): AttendanceEntry[] {
  const records: AttendanceEntry[] = [];
  const today = new Date();

  // Create dates for the past 10 days
  for (let i = 0; i <= 10; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    // Skip weekends (0 is Sunday, 6 is Saturday)
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = formatDateKey(d);

    INITIAL_STUDENTS.forEach((student) => {
      // Deterministic patterns for realistic demonstration
      let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
      let note: string | undefined = undefined;
      let lateMinutes: number | undefined = undefined;

      // Jordan Washington has attendance difficulty (unexcused absent sometimes)
      if (student.id === 's-110') {
        if (i === 0 || i === 1) {
          status = 'absent';
          note = 'Unexcused - Parent contact attempted';
        } else if (i === 4) {
          status = 'late';
          lateMinutes = 20;
          note = 'Arrived late after morning announcement';
        }
      }
      // Diego Hernandez was out sick 2 days ago
      else if (student.id === 's-104') {
        if (i === 2 || i === 3) {
          status = 'excused';
          note = 'Medical excuse - doctor note provided';
        }
      }
      // Benjamin Miller had bus delay
      else if (student.id === 's-102') {
        if (i === 1) {
          status = 'late';
          lateMinutes = 15;
          note = 'Bus route 4 delayed in traffic';
        }
      }
      // Elena Rostova out today with flu
      else if (student.id === 's-105' && i === 0) {
        status = 'absent';
        note = 'Flu symptoms reported by parent';
      }
      // Random sporadic absence on older dates
      else if (i > 3 && (student.id === 's-108' || student.id === 's-203') && i === 5) {
        status = 'absent';
        note = 'Family emergency';
      }

      records.push({
        studentId: student.id,
        date: dateStr,
        status,
        note,
        lateMinutes,
        updatedAt: new Date(d.getTime() + 8 * 3600 * 1000).toISOString(),
      });
    });
  }

  return records;
}
