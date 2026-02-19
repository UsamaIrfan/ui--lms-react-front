/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";
import { noticesControllerGetMyNoticesV1 } from "@/services/api/generated/notices/notices";
import { feesControllerGetMyChallansV1 } from "@/services/api/generated/fee-management/fee-management";
import { materialsControllerFindAllV1 } from "@/services/api/generated/materials-course-materials/materials-course-materials";
import { assignmentsControllerFindAllV1 } from "@/services/api/generated/materials-assignments/materials-assignments";
import { examControllerFindAllV1 } from "@/services/api/generated/lms-exams/lms-exams";
import { timetableSlotControllerFindAllV1 } from "@/services/api/generated/lms-timetable-slots/lms-timetable-slots";
import type { StudentDashboardData } from "../types";
import { demoStudentDashboard } from "./demo-data";

export const studentDashboardQueryKeys = createQueryKeys(
  ["student-dashboard"],
  {
    dashboard: () => ({
      key: [],
    }),
  }
);

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
 * into the StudentDashboardData shape consumed by the student dashboard UI.
 *
 * Each endpoint is wrapped in safeFetch so a single failure
 * falls back to demo data for that section instead of failing the whole page.
 */
async function fetchStudentDashboard(
  signal?: AbortSignal
): Promise<StudentDashboardData> {
  // Fire all API calls in parallel
  const [
    dashboardRes,
    noticesRes,
    challansRes,
    materialsRes,
    assignmentsRes,
    examsRes,
    timetableRes,
  ] = await Promise.all([
    safeFetch(
      () => portalsControllerGetStudentDashboardV1(undefined, { signal }),
      signal
    ),
    safeFetch(
      () => noticesControllerGetMyNoticesV1(undefined, { signal }),
      signal
    ),
    safeFetch(() => feesControllerGetMyChallansV1({ signal }), signal),
    safeFetch(
      () => materialsControllerFindAllV1(undefined, { signal }),
      signal
    ),
    safeFetch(() => assignmentsControllerFindAllV1({ signal }), signal),
    safeFetch(() => examControllerFindAllV1({ signal }), signal),
    safeFetch(() => timetableSlotControllerFindAllV1({ signal }), signal),
  ]);

  // ── Extract raw data ──
  const dashboard = (dashboardRes?.data as any) ?? null;
  const notices = (noticesRes?.data as any) ?? [];
  const challans = (challansRes?.data as any) ?? [];
  const materials = (materialsRes?.data as any) ?? [];
  const assignments = (assignmentsRes?.data as any) ?? [];
  const exams = (examsRes?.data as any) ?? [];
  const timetableSlots = (timetableRes?.data as any) ?? [];

  // ── Profile ──
  const profile = dashboard?.student
    ? {
        id: String(dashboard.student.id ?? ""),
        name: `${dashboard.student.firstName ?? ""} ${dashboard.student.lastName ?? ""}`.trim(),
        photo: dashboard.student.photo?.path,
        studentId: dashboard.student.studentId ?? "",
        className: dashboard.student.gradeClass?.name ?? "",
        section: dashboard.student.section?.name ?? "",
        academicYear:
          dashboard.student.academicYear?.name ??
          demoStudentDashboard.profile.academicYear,
      }
    : demoStudentDashboard.profile;

  // ── Attendance ──
  const attendanceApi = dashboard?.attendance;
  const attendance = attendanceApi
    ? {
        percentage: attendanceApi.attendancePercentage ?? 0,
        totalDays: attendanceApi.totalDays ?? 0,
        presentDays: attendanceApi.presentDays ?? 0,
        absentDays: attendanceApi.absentDays ?? 0,
        lateDays: attendanceApi.lateDays ?? 0,
        monthlyBreakdown:
          attendanceApi.monthlyBreakdown ??
          demoStudentDashboard.attendance.monthlyBreakdown,
      }
    : demoStudentDashboard.attendance;

  // ── Fees ──
  const feesApi = dashboard?.fees;
  const recentPaymentsList = Array.isArray(challans)
    ? challans
        .filter((c: any) => c.status === "paid")
        .slice(0, 3)
        .map((c: any) => ({
          id: String(c.id),
          amount: c.paidAmount ?? c.amount ?? 0,
          date: c.paidDate ?? c.updatedAt ?? "",
          method: c.paymentMethod ?? "N/A",
          challanNumber: c.challanNumber ?? "",
        }))
    : demoStudentDashboard.fees.recentPayments;

  const fees = feesApi
    ? {
        totalFee: feesApi.totalFees ?? 0,
        paidAmount: feesApi.paidAmount ?? 0,
        pendingAmount: feesApi.pendingAmount ?? 0,
        nextDueDate: feesApi.nextDueDate
          ? String(feesApi.nextDueDate)
          : undefined,
        nextDueAmount: feesApi.nextDueAmount ?? undefined,
        recentPayments: recentPaymentsList,
      }
    : demoStudentDashboard.fees;

  // ── Upcoming Exams ──
  const now = new Date();
  const upcomingExams =
    Array.isArray(exams) && exams.length > 0
      ? exams
          .filter((e: any) => {
            const d = new Date(e.date ?? e.startDate ?? e.examDate ?? "");
            return d >= now;
          })
          .slice(0, 5)
          .map((e: any) => ({
            id: String(e.id),
            name: e.name ?? e.title ?? "Exam",
            subject: e.subject?.name ?? e.subjectName ?? "",
            date: e.date ?? e.startDate ?? e.examDate ?? "",
            time: e.time ?? e.startTime ?? "",
            examType: e.examType ?? e.type ?? "exam",
          }))
      : demoStudentDashboard.upcomingExams;

  // ── Recent Results (from dashboard summary) ──
  const examsApi = dashboard?.exams;
  const recentResults =
    examsApi?.lastExamPercentage !== null &&
    examsApi?.lastExamPercentage !== undefined
      ? {
          examName: (examsApi.lastExamName as string) ?? "Recent Exam",
          overallPercentage: Number(examsApi.lastExamPercentage) || 0,
          grade: (examsApi.lastExamGrade as string) ?? undefined,
          rank: (examsApi.lastExamRank as number) ?? undefined,
          subjects: demoStudentDashboard.recentResults?.subjects ?? [],
        }
      : demoStudentDashboard.recentResults;

  // ── Materials ──
  const materialsList =
    Array.isArray(materials) && materials.length > 0
      ? materials.slice(0, 5).map((m: any) => ({
          id: String(m.id),
          title: m.title ?? "",
          subject: m.subject?.name ?? m.subjectName ?? "",
          uploadDate: m.createdAt ?? m.uploadDate ?? "",
          fileType: m.type ?? m.fileType ?? "document",
          downloadUrl: m.file?.path ?? m.url ?? undefined,
        }))
      : demoStudentDashboard.materials;

  // ── Assignments ──
  const assignmentsList =
    Array.isArray(assignments) && assignments.length > 0
      ? assignments.slice(0, 5).map((a: any) => ({
          id: String(a.id),
          title: a.title ?? "",
          subject: a.subject?.name ?? a.subjectName ?? "",
          dueDate: a.dueDate ?? "",
          status: (a.submission
            ? a.submission.grade
              ? "graded"
              : "submitted"
            : "not_submitted") as "graded" | "submitted" | "not_submitted",
          grade: a.submission?.grade ?? undefined,
        }))
      : demoStudentDashboard.assignments;

  // ── Notices ──
  const noticesList =
    Array.isArray(notices) && notices.length > 0
      ? notices.slice(0, 5).map((n: any) => ({
          id: String(n.id),
          title: n.title ?? "",
          date: n.createdAt ?? n.date ?? "",
          isRead: n.isRead ?? false,
          content: n.content ?? n.description ?? undefined,
        }))
      : demoStudentDashboard.notices;

  // ── Timetable ──
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const timetable =
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
              teacher: slot.teacher?.name ?? slot.teacherName ?? "",
              startTime: slot.startTime ?? "",
              endTime: slot.endTime ?? "",
              room: slot.room ?? slot.roomNumber ?? undefined,
              isCurrent,
              isNext: isNext ?? false,
            };
          })
      : demoStudentDashboard.timetable;

  return {
    profile,
    attendance,
    fees,
    upcomingExams,
    recentResults,
    materials: materialsList,
    assignments: assignmentsList,
    notices: noticesList,
    timetable,
  };
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: studentDashboardQueryKeys.dashboard().key,
    queryFn: ({ signal }) => fetchStudentDashboard(signal),
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });
}
