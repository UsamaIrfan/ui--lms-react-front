/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { studentRegistrationControllerFindAllV1 } from "@/services/api/generated/student-registration/student-registration";
import { staffManagementControllerFindAllV1 } from "@/services/api/generated/staff-management/staff-management";
import { attendanceControllerAlertsV1 } from "@/services/api/generated/attendance/attendance";
import { feesControllerGetCollectionReportV1 } from "@/services/api/generated/fee-management/fee-management";
import { feesControllerGetPendingReportV1 } from "@/services/api/generated/fee-management/fee-management";
import { examControllerFindAllV1 } from "@/services/api/generated/lms-exams/lms-exams";
import { admissionEnquiryControllerFindAllV1 } from "@/services/api/generated/lms-admission-enquiries/lms-admission-enquiries";
import { noticesControllerFindAllV1 } from "@/services/api/generated/notices/notices";
import { gradeClassControllerFindAllV1 } from "@/services/api/generated/lms-grade-classes/lms-grade-classes";
import { staffLeaveControllerFindAllV1 } from "@/services/api/generated/staff-leaves/staff-leaves";
import type { AdminDashboardData } from "../types";
import { demoDashboardData } from "./demo-data";

export const adminDashboardQueryKeys = createQueryKeys(["admin-dashboard"], {
  dashboard: () => ({
    key: [],
    sub: {
      byBranch: (branchId?: string) => ({
        key: [branchId],
      }),
    },
  }),
});

// ─────────────────────────────────────────────
// Safe fetcher — returns null on failure so one
// broken endpoint does not crash the whole dashboard
// ─────────────────────────────────────────────
async function safeFetch<T>(
  fn: (opts?: { signal?: AbortSignal }) => Promise<T>,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await fn(signal ? { signal } : undefined);
  } catch {
    return null;
  }
}

/**
 * Aggregates data from multiple Orval-generated API endpoints
 * into the AdminDashboardData shape consumed by the dashboard UI.
 *
 * Each endpoint is wrapped in safeFetch so a single failure
 * falls back to demo data for that section instead of failing the whole page.
 */
async function fetchAdminDashboard(
  branchId?: string,
  signal?: AbortSignal
): Promise<AdminDashboardData> {
  const branchParams = branchId ? { branchId } : {};

  // Fire all API calls in parallel
  const [
    studentsRes,
    staffRes,
    alertsRes,
    collectionRes,
    pendingFeesRes,
    examsRes,
    enquiriesRes,
    noticesRes,
    classesRes,
    leavesRes,
  ] = await Promise.all([
    safeFetch(
      () =>
        studentRegistrationControllerFindAllV1(
          { limit: 1, page: 1 },
          { signal }
        ),
      signal
    ),
    safeFetch(
      () => staffManagementControllerFindAllV1(branchParams, { signal }),
      signal
    ),
    safeFetch(
      () => attendanceControllerAlertsV1({ threshold: 75 }, { signal }),
      signal
    ),
    safeFetch(
      () => feesControllerGetCollectionReportV1(undefined, { signal }),
      signal
    ),
    safeFetch(() => feesControllerGetPendingReportV1({ signal }), signal),
    safeFetch(() => examControllerFindAllV1({ signal }), signal),
    safeFetch(() => admissionEnquiryControllerFindAllV1({ signal }), signal),
    safeFetch(() => noticesControllerFindAllV1({ signal }), signal),
    safeFetch(() => gradeClassControllerFindAllV1({ signal }), signal),
    safeFetch(
      () => staffLeaveControllerFindAllV1(undefined, { signal }),
      signal
    ),
  ]);

  // ── Extract lists (Orval types are void but runtime returns real data) ──
  const students = (studentsRes?.data as any) ?? null;
  const staffList = (staffRes?.data as any) ?? [];
  const alerts = (alertsRes?.data as any) ?? [];
  const feeCollection = (collectionRes?.data as any) ?? null;
  const pendingFees = (pendingFeesRes?.data as any) ?? null;
  const examsList = (examsRes?.data as any) ?? [];
  const enquiries = (enquiriesRes?.data as any) ?? [];
  const notices = (noticesRes?.data as any) ?? [];
  const classes = (classesRes?.data as any) ?? [];
  const leaves = (leavesRes?.data as any) ?? [];

  // ── Metrics ──
  const totalStudents =
    students?.total ??
    students?.length ??
    demoDashboardData.metrics.totalStudents;
  const totalStaff = Array.isArray(staffList)
    ? staffList.length
    : demoDashboardData.metrics.totalStaff;
  const alertCount = Array.isArray(alerts)
    ? alerts.length
    : demoDashboardData.metrics.lowAttendanceAlerts;
  const upcomingExams = Array.isArray(examsList)
    ? examsList.filter((e: any) => {
        const d = new Date(e.date ?? e.startDate ?? e.examDate);
        return d >= new Date();
      }).length
    : demoDashboardData.metrics.upcomingExams;
  const recentEnquiries = Array.isArray(enquiries)
    ? enquiries.length
    : demoDashboardData.metrics.recentEnquiries;

  // Fee metrics — try to extract from collection report or pending report
  const feeCollectionThisMonth =
    feeCollection?.totalCollected ??
    feeCollection?.collected ??
    demoDashboardData.metrics.feeCollectionThisMonth;
  const feeCollectionTarget =
    feeCollection?.totalExpected ??
    feeCollection?.target ??
    demoDashboardData.metrics.feeCollectionTarget;
  const pendingFeeAmount =
    pendingFees?.totalPending ??
    pendingFees?.total ??
    demoDashboardData.metrics.pendingFeeAmount;
  const feeCollectionPercentage =
    feeCollectionTarget > 0
      ? Math.round((feeCollectionThisMonth / feeCollectionTarget) * 1000) / 10
      : demoDashboardData.metrics.feeCollectionPercentage;

  // ── Class distribution from grade classes ──
  const classDistribution =
    Array.isArray(classes) && classes.length > 0
      ? classes.map((c: any) => ({
          className: c.name ?? c.className ?? `Class ${c.id}`,
          students: c.studentsCount ?? c.studentCount ?? 0,
        }))
      : demoDashboardData.classDistribution;

  // ── Recent activity from notices ──
  const recentActivity =
    Array.isArray(notices) && notices.length > 0
      ? notices.slice(0, 10).map((n: any) => ({
          id: String(n.id),
          type: "notice" as const,
          description: n.title ?? n.description ?? "Notice",
          user: n.createdByName ?? n.author ?? "Admin",
          timestamp: n.createdAt ?? new Date().toISOString(),
        }))
      : demoDashboardData.recentActivity;

  // ── Pending approvals from leave requests with status=pending ──
  const pendingLeaves = Array.isArray(leaves)
    ? leaves.filter((l: any) => l.status === "pending")
    : [];
  const pendingApprovals =
    pendingLeaves.length > 0
      ? pendingLeaves.slice(0, 5).map((l: any) => ({
          id: String(l.id),
          type: "leave" as const,
          title: `${l.leaveType ?? "Leave"} request`,
          requester: l.staffName ?? l.staff?.name ?? "Staff",
          timestamp: l.createdAt ?? new Date().toISOString(),
        }))
      : demoDashboardData.pendingApprovals;

  return {
    metrics: {
      totalStudents,
      studentsTrend: demoDashboardData.metrics.studentsTrend, // no trend endpoint yet
      totalStaff,
      staffTrend: demoDashboardData.metrics.staffTrend,
      attendanceToday: demoDashboardData.metrics.attendanceToday, // needs specific daily attendance endpoint
      attendanceTrend: demoDashboardData.metrics.attendanceTrend,
      feeCollectionThisMonth,
      feeCollectionTarget,
      feeCollectionPercentage,
      pendingFeeAmount,
      upcomingExams,
      recentEnquiries,
      lowAttendanceAlerts: alertCount,
    },
    // Trend charts still use demo data — backend needs time-series endpoints
    enrollmentTrend: demoDashboardData.enrollmentTrend,
    feeCollection: demoDashboardData.feeCollection,
    attendanceBreakdown: demoDashboardData.attendanceBreakdown,
    classDistribution,
    recentActivity,
    pendingApprovals,
  };
}

export function useAdminDashboard(branchId?: string) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard().sub.byBranch(branchId).key,
    queryFn: ({ signal }) => fetchAdminDashboard(branchId, signal),
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });
}
