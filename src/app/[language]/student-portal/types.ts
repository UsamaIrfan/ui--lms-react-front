// Student Dashboard Types
// These types extend the Orval-generated StudentDashboard model
// with richer data for the dashboard widgets.

export interface StudentProfile {
  id: string;
  name: string;
  photo?: string;
  studentId: string;
  className: string;
  section: string;
  academicYear: string;
}

export interface AttendanceSummary {
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  monthlyBreakdown: MonthlyAttendance[];
}

export interface MonthlyAttendance {
  month: string;
  percentage: number;
}

export interface FeeStatus {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  recentPayments: FeePayment[];
}

export interface FeePayment {
  id: string;
  amount: number;
  date: string;
  method: string;
  challanNumber: string;
}

export interface UpcomingExam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  examType: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  percentage: number;
}

export interface RecentResult {
  examName: string;
  overallPercentage: number;
  grade?: string;
  rank?: number;
  subjects: ExamResult[];
}

export interface CourseMaterialItem {
  id: string;
  title: string;
  subject: string;
  uploadDate: string;
  fileType: string;
  downloadUrl?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "not_submitted" | "submitted" | "graded";
  grade?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  isRead: boolean;
  content?: string;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room?: string;
  isCurrent: boolean;
  isNext: boolean;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  attendance: AttendanceSummary;
  fees: FeeStatus;
  upcomingExams: UpcomingExam[];
  recentResults: RecentResult | null;
  materials: CourseMaterialItem[];
  assignments: AssignmentItem[];
  notices: NoticeItem[];
  timetable: TimetableEntry[];
}
