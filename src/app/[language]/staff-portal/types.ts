// Staff Dashboard Types
// These types extend the Orval-generated StaffDashboard model
// with richer data for the dashboard widgets.

export interface StaffProfile {
  id: string;
  name: string;
  photo?: string;
  staffId: string;
  role: string;
  department: string;
  primaryBranch: string;
  branches: BranchInfo[];
}

export interface BranchInfo {
  id: string;
  name: string;
  assignedClasses: number;
}

export interface TodayScheduleEntry {
  id: string;
  subject: string;
  className: string;
  section: string;
  startTime: string;
  endTime: string;
  room?: string;
  isCurrent: boolean;
  isNext: boolean;
}

export interface StaffAttendanceSummary {
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  todayCheckIn?: string;
  todayCheckOut?: string;
  todayStatus?: "present" | "absent" | "late" | "not_marked";
  leaveBalance: LeaveBalance[];
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

export interface AssignedClass {
  id: string;
  className: string;
  section: string;
  subject: string;
  studentCount: number;
}

export interface PendingTask {
  type: "marks_entry" | "attendance" | "leave_approval";
  label: string;
  count: number;
  href: string;
}

export interface SalarySlipSummary {
  id: string;
  month: string;
  year: number;
  netPay: number;
  totalEarnings: number;
  totalDeductions: number;
  status: string;
  paidAt?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  isRead: boolean;
  content?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface StaffDashboardData {
  profile: StaffProfile;
  todaySchedule: TodayScheduleEntry[];
  attendance: StaffAttendanceSummary;
  assignedClasses: AssignedClass[];
  pendingTasks: PendingTask[];
  latestSalarySlip: SalarySlipSummary | null;
  notices: NoticeItem[];
}
