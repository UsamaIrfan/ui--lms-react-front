// ─────────────────────────────────────────────
// Timetable Page Types
// ─────────────────────────────────────────────

/** Day of week as API stores it (0=Sunday, 1=Monday, …6=Saturday) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimetablePeriod {
  id: string;
  subject: string;
  subjectId: string;
  teacher: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  isCurrent: boolean;
  isNext: boolean;
}

export interface TimetableInfo {
  id: string;
  name: string;
  classId: string;
  isActive: boolean;
}

/** Map of dayOfWeek → periods */
export type WeeklySchedule = Record<DayOfWeek, TimetablePeriod[]>;
