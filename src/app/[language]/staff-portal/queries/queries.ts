/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { portalsControllerGetStaffDashboardV1 } from "@/services/api/generated/portals/portals";
import { staffAttendanceCheckControllerGetReportsV1 } from "@/services/api/generated/staff-attendance/staff-attendance";
import { staffLeaveControllerGetBalanceV1 } from "@/services/api/generated/staff-leaves/staff-leaves";
import { payrollControllerFindAllSlipsV1 } from "@/services/api/generated/payroll-processing-slips/payroll-processing-slips";
import { timetableSlotControllerFindAllV1 } from "@/services/api/generated/lms-timetable-slots/lms-timetable-slots";
import { noticesControllerGetMyNoticesV1 } from "@/services/api/generated/notices/notices";
import { staffManagementControllerGetMyBranchesV1 } from "@/services/api/generated/staff-management/staff-management";
import type { StaffDashboardData } from "../types";
import { demoStaffDashboard } from "./demo-data";

export const staffDashboardQueryKeys = createQueryKeys(["staff-dashboard"], {
  dashboard: () => ({
    key: [],
  }),
});

// ─────────────────────────────────────────────
// Safe fetcher — returns null on failure so one
// broken endpoint does not crash the whole dashboard
// ─────────────────────────────────────────────
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/**
 * Aggregates data from multiple Orval-generated API endpoints
 * into the StaffDashboardData shape consumed by the staff dashboard UI.
 *
 * Each endpoint is wrapped in safeFetch so a single failure
 * falls back to demo data for that section instead of failing the whole page.
 */
async function fetchStaffDashboard(): Promise<StaffDashboardData> {
  const [
    dashboardRes,
    attendanceRes,
    leavesRes,
    payrollRes,
    timetableRes,
    noticesRes,
    branchesRes,
  ] = await Promise.all([
    safeFetch(() => portalsControllerGetStaffDashboardV1()),
    safeFetch(() => staffAttendanceCheckControllerGetReportsV1()),
    safeFetch(() => staffLeaveControllerGetBalanceV1()),
    safeFetch(() => payrollControllerFindAllSlipsV1()),
    safeFetch(() => timetableSlotControllerFindAllV1()),
    safeFetch(() => noticesControllerGetMyNoticesV1()),
    safeFetch(() => staffManagementControllerGetMyBranchesV1()),
  ]);

  // ── Extract raw data ──
  const dashboard = (dashboardRes?.data as any) ?? null;
  const attendanceReports = (attendanceRes?.data as any) ?? [];
  const leaveBalances = (leavesRes?.data as any) ?? [];
  const payrollSlips = (payrollRes?.data as any) ?? [];
  const timetableSlots = (timetableRes?.data as any) ?? [];
  const notices = (noticesRes?.data as any) ?? [];
  const branches = (branchesRes?.data as any) ?? [];

  // ── Profile ──
  const staff = dashboard?.staff ?? dashboard;
  const branchList =
    Array.isArray(branches) && branches.length > 0
      ? branches.map((b: any) => ({
          id: String(b.branch?.id ?? b.branchId ?? b.id ?? ""),
          name: b.branch?.name ?? b.branchName ?? b.name ?? "",
          assignedClasses: b.assignedClasses ?? 0,
        }))
      : demoStaffDashboard.profile.branches;

  const profile = staff
    ? {
        id: String(staff.id ?? ""),
        name:
          `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() ||
          staff.name ||
          demoStaffDashboard.profile.name,
        photo: staff.photo?.path ?? staff.photoUrl,
        staffId: staff.staffId ?? staff.employeeId ?? "",
        role: staff.designation ?? staff.role ?? "",
        department: staff.department?.name ?? staff.departmentName ?? "",
        primaryBranch:
          dashboard?.primaryBranch?.name ??
          staff.primaryBranch?.name ??
          branchList[0]?.name ??
          "",
        branches: branchList,
      }
    : demoStaffDashboard.profile;

  // ── Today's Schedule ──
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const todaySchedule =
    Array.isArray(timetableSlots) && timetableSlots.length > 0
      ? timetableSlots
          .sort((a: any, b: any) => {
            const ta = a.startTime ?? "";
            const tb = b.startTime ?? "";
            return ta.localeCompare(tb);
          })
          .map((slot: any, index: number, arr: any[]) => {
            const startParts: string[] = (slot.startTime ?? "00:00").split(":");
            const endParts: string[] = (slot.endTime ?? "00:00").split(":");
            const startMinutes =
              parseInt(startParts[0] ?? "0") * 60 +
              parseInt(startParts[1] ?? "0");
            const endMinutes =
              parseInt(endParts[0] ?? "0") * 60 + parseInt(endParts[1] ?? "0");
            const isCurrent =
              currentTimeMinutes >= startMinutes &&
              currentTimeMinutes < endMinutes;
            const isNext =
              !isCurrent &&
              index > 0 &&
              (() => {
                const prev = arr[index - 1];
                const prevEnd: string[] = (prev.endTime ?? "00:00").split(":");
                const prevEndMin =
                  parseInt(prevEnd[0] ?? "0") * 60 +
                  parseInt(prevEnd[1] ?? "0");
                return (
                  currentTimeMinutes >= prevEndMin &&
                  currentTimeMinutes < startMinutes
                );
              })();

            return {
              id: String(slot.id),
              subject: slot.subject?.name ?? slot.subjectName ?? "",
              className:
                slot.gradeClass?.name ?? slot.className ?? slot.class ?? "",
              section: slot.section?.name ?? slot.sectionName ?? "",
              startTime: slot.startTime ?? "",
              endTime: slot.endTime ?? "",
              room: slot.room ?? slot.roomNumber ?? undefined,
              isCurrent,
              isNext: isNext ?? false,
            };
          })
      : demoStaffDashboard.todaySchedule;

  // ── Attendance Summary ──
  const attendanceApi = dashboard?.attendance;
  const todayRecord = Array.isArray(attendanceReports)
    ? attendanceReports.find((r: any) => {
        const d = new Date(r.date ?? "");
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      })
    : null;

  const leaveBalanceList =
    Array.isArray(leaveBalances) && leaveBalances.length > 0
      ? leaveBalances.map((lb: any) => ({
          type: lb.leaveType ?? lb.type ?? lb.leaveTypeName ?? "Leave",
          total: lb.totalDays ?? lb.total ?? 0,
          used: lb.usedDays ?? lb.used ?? 0,
          remaining:
            lb.remainingDays ??
            lb.remaining ??
            (lb.totalDays ?? 0) - (lb.usedDays ?? 0),
        }))
      : demoStaffDashboard.attendance.leaveBalance;

  const attendance = attendanceApi
    ? {
        percentage: attendanceApi.attendancePercentage ?? 0,
        totalDays: attendanceApi.totalDays ?? 0,
        presentDays: attendanceApi.presentDays ?? 0,
        absentDays: attendanceApi.absentDays ?? 0,
        lateDays: attendanceApi.lateDays ?? 0,
        todayCheckIn: todayRecord?.checkInTime ?? undefined,
        todayCheckOut: todayRecord?.checkOutTime ?? undefined,
        todayStatus: todayRecord ? todayRecord.status : ("not_marked" as const),
        leaveBalance: leaveBalanceList,
      }
    : demoStaffDashboard.attendance;

  // ── Assigned Classes ──
  const allBranches = dashboard?.allBranches;
  const assignedClasses =
    Array.isArray(allBranches) && allBranches.length > 0
      ? allBranches.flatMap((b: any) =>
          (b.assignedClassList ?? []).map((c: any) => ({
            id: String(c.id ?? ""),
            className: c.gradeClass?.name ?? c.className ?? "",
            section: c.section?.name ?? c.sectionName ?? "",
            subject: c.subject?.name ?? c.subjectName ?? "",
            studentCount: c.studentCount ?? 0,
          }))
        )
      : demoStaffDashboard.assignedClasses;

  // ── Pending Tasks ──
  const pendingTasks = dashboard?.pendingTasks
    ? [
        ...(dashboard.pendingTasks.marksEntry
          ? [
              {
                type: "marks_entry" as const,
                label: "Marks Entry Pending",
                count: dashboard.pendingTasks.marksEntry,
                href: "/admin-panel/exams",
              },
            ]
          : []),
        ...(dashboard.pendingTasks.attendance
          ? [
              {
                type: "attendance" as const,
                label: "Attendance to Mark",
                count: dashboard.pendingTasks.attendance,
                href: "/admin-panel/attendance",
              },
            ]
          : []),
        ...(dashboard.pendingTasks.leaveApprovals
          ? [
              {
                type: "leave_approval" as const,
                label: "Leave Approvals",
                count: dashboard.pendingTasks.leaveApprovals,
                href: "/admin-panel/staff/leaves",
              },
            ]
          : []),
      ]
    : demoStaffDashboard.pendingTasks;

  // ── Latest Salary Slip ──
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const latestSlip =
    Array.isArray(payrollSlips) && payrollSlips.length > 0
      ? (() => {
          const sorted = [...payrollSlips].sort((a: any, b: any) => {
            const ya = a.year ?? 0;
            const yb = b.year ?? 0;
            if (ya !== yb) return yb - ya;
            return (b.month ?? 0) - (a.month ?? 0);
          });
          const s = sorted[0];
          return {
            id: String(s.id),
            month:
              typeof s.month === "number"
                ? (monthNames[s.month - 1] ?? String(s.month))
                : String(s.month ?? ""),
            year: s.year ?? now.getFullYear(),
            netPay: s.netPay ?? 0,
            totalEarnings: s.totalEarnings ?? 0,
            totalDeductions: s.totalDeductions ?? 0,
            status: s.status ?? "draft",
            paidAt: s.paidAt ?? undefined,
          };
        })()
      : demoStaffDashboard.latestSalarySlip;

  // ── Notices ──
  const noticesList =
    Array.isArray(notices) && notices.length > 0
      ? notices.slice(0, 5).map((n: any) => ({
          id: String(n.id),
          title: n.title ?? "",
          date: n.createdAt ?? n.publishDate ?? n.date ?? "",
          isRead: n.isRead ?? false,
          content: n.content ?? n.description ?? undefined,
        }))
      : demoStaffDashboard.notices;

  return {
    profile,
    todaySchedule,
    attendance,
    assignedClasses:
      assignedClasses.length > 0
        ? assignedClasses
        : demoStaffDashboard.assignedClasses,
    pendingTasks,
    latestSalarySlip: latestSlip,
    notices: noticesList,
  };
}

export function useStaffDashboard() {
  return useQuery({
    queryKey: staffDashboardQueryKeys.dashboard().key,
    queryFn: fetchStaffDashboard,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
