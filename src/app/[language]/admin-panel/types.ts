// Admin Dashboard Types
// These types define the shape of the admin dashboard API response.
// The backend endpoint /api/v1/portals/admin/dashboard is planned but not yet implemented.
// Until then, the dashboard uses demo data matching these types.

export interface AdminDashboardMetrics {
  totalStudents: number;
  studentsTrend: number; // percentage change from last month
  totalStaff: number;
  staffTrend: number;
  attendanceToday: number; // percentage
  attendanceTrend: number;
  feeCollectionThisMonth: number;
  feeCollectionTarget: number; // total expected
  feeCollectionPercentage: number;
  pendingFeeAmount: number;
  upcomingExams: number;
  recentEnquiries: number;
  lowAttendanceAlerts: number;
}

export interface EnrollmentTrendItem {
  month: string;
  students: number;
}

export interface FeeCollectionItem {
  month: string;
  collected: number;
  pending: number;
}

export interface AttendanceBreakdown {
  present: number;
  absent: number;
  leave: number;
  late: number;
}

export interface ClassDistributionItem {
  className: string;
  students: number;
}

export interface RecentActivityItem {
  id: string;
  type:
    | "registration"
    | "payment"
    | "attendance"
    | "notice"
    | "exam"
    | "enquiry";
  description: string;
  user: string;
  timestamp: string;
}

export interface PendingApproval {
  id: string;
  type: "leave" | "registration" | "payment" | "document";
  title: string;
  requester: string;
  timestamp: string;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  enrollmentTrend: EnrollmentTrendItem[];
  feeCollection: FeeCollectionItem[];
  attendanceBreakdown: AttendanceBreakdown;
  classDistribution: ClassDistributionItem[];
  recentActivity: RecentActivityItem[];
  pendingApprovals: PendingApproval[];
}
