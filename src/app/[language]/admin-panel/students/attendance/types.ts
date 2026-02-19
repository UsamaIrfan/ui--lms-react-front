// ─── Enums ───────────────────────────────────────────────────────
export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  HALF_DAY = "half_day",
  EXCUSED = "excused",
}

export enum LeaveStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum LeaveType {
  SICK = "sick",
  CASUAL = "casual",
  EARNED = "earned",
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  UNPAID = "unpaid",
  OTHER = "other",
}

export const ATTENDANCE_STATUSES = Object.values(AttendanceStatus);

// ─── Domain Models ───────────────────────────────────────────────

export interface AttendanceRecord {
  id: number;
  attendableType: "student" | "staff";
  attendableId: number;
  date: string;
  status: AttendanceStatus;
  sectionId?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  // joined fields
  studentName?: string;
  studentId?: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
  markedBy?: string;
  photo?: string | null;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  percentage: number;
}

export interface DetailedReport {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
  leaves: LeaveRecord[];
}

export interface LeaveRecord {
  id: number;
  attendableType: "student" | "staff";
  attendableId: number;
  fromDate: string;
  toDate: string;
  reason: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  approvedById?: number | null;
  adminRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAlert {
  attendableType: "student" | "staff";
  attendableId: number;
  percentage: number;
  totalRecords: number;
  // joined
  studentName?: string;
  studentId?: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
  phone?: string;
  guardianName?: string;
  lastAttendanceDate?: string;
  absentDays?: number;
}

export interface BulkResult {
  marked: number;
  skipped: number;
  total: number;
}

// ─── Simple Student (for mark attendance list) ──────────────────

export interface StudentForAttendance {
  id: number;
  firstName: string;
  lastName: string;
  studentId?: string;
  rollNumber?: string;
  photo?: string | null;
}

// ─── Filter / Query Types ────────────────────────────────────────

export interface AttendanceFilterType {
  startDate?: string;
  endDate?: string;
  attendableType?: "student" | "staff";
  attendableId?: number;
  status?: AttendanceStatus;
  sectionId?: number;
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AlertsFilterType {
  threshold?: number;
  attendableType?: "student" | "staff";
  startDate?: string;
  endDate?: string;
}

// ─── Dashboard Summary ──────────────────────────────────────────

export interface DashboardSummary {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  presentPercentage: number;
  classSummaries: ClassAttendanceSummary[];
}

export interface ClassAttendanceSummary {
  className: string;
  sectionName: string;
  sectionId: number;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}
