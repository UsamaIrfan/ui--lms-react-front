// ─────────────────────────────────────────────
// Student Attendance Page Types
// ─────────────────────────────────────────────
// These are client-side types for the attendance sub-page.
// Since Orval response types are `void`, we define explicit
// interfaces for the data we receive from the API at runtime.

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "excused";

export type LeaveType =
  | "sick"
  | "casual"
  | "earned"
  | "maternity"
  | "paternity"
  | "unpaid"
  | "other";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

// ── API Response Shapes ──

export interface AttendanceRecord {
  id: number;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  attendableType: "student" | "staff";
  attendableId: number;
  sectionId?: number;
}

export interface AttendanceSummaryResponse {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  excusedDays: number;
  attendancePercentage: number;
  monthlyBreakdown?: MonthlyBreakdownItem[];
}

export interface MonthlyBreakdownItem {
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export interface LeaveApplication {
  id: number;
  attendableType: "student" | "staff";
  attendableId: number;
  fromDate: string;
  toDate: string;
  reason: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Filter State ──

export interface AttendanceFilters {
  startDate: string;
  endDate: string;
  status?: AttendanceStatus;
}

// ── Aggregated Page Data ──

export interface StudentAttendancePageData {
  records: AttendanceRecord[];
  summary: AttendanceSummaryResponse;
  leaves: LeaveApplication[];
}

// ── Leave form ──

export interface LeaveFormData {
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
}
