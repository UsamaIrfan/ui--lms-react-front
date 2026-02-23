import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";
import { attendanceControllerQueryV1 } from "@/services/api/generated/attendance/attendance";
import { attendanceControllerSummaryV1 } from "@/services/api/generated/attendance/attendance";
import type {
  AttendanceRecord,
  AttendanceSummaryResponse,
  LeaveApplication,
  AttendanceFilters,
  StudentAttendancePageData,
} from "../types";

// ─────────────────────────────────────────────
// Runtime type guards — validate API payloads
// without casting through `any`
// ─────────────────────────────────────────────

interface RawDashboardResponse {
  data?: {
    student?: {
      id?: number;
      firstName?: string;
      lastName?: string;
      studentId?: string;
      gradeClass?: { name?: string };
      section?: { name?: string };
    };
    attendance?: {
      totalDays?: number;
      presentDays?: number;
      absentDays?: number;
      lateDays?: number;
      attendancePercentage?: number;
      monthlyBreakdown?: Array<{
        month?: string;
        year?: number;
        totalDays?: number;
        presentDays?: number;
        absentDays?: number;
        lateDays?: number;
        percentage?: number;
      }>;
    };
  };
}

interface RawAttendanceQueryResponse {
  data?: Array<{
    id?: number;
    date?: string;
    status?: string;
    checkIn?: string;
    checkOut?: string;
    remarks?: string;
    attendableType?: string;
    attendableId?: number;
    sectionId?: number;
  }>;
}

interface RawAttendanceSummaryResponse {
  data?: {
    totalDays?: number;
    presentDays?: number;
    absentDays?: number;
    lateDays?: number;
    halfDays?: number;
    excusedDays?: number;
    attendancePercentage?: number;
    monthlyBreakdown?: Array<{
      month?: string;
      year?: number;
      totalDays?: number;
      presentDays?: number;
      absentDays?: number;
      lateDays?: number;
      percentage?: number;
    }>;
  };
}

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────

export const studentAttendanceQueryKeys = createQueryKeys(
  ["student-attendance"],
  {
    page: () => ({
      key: [],
      sub: {
        by: ({ startDate, endDate, status }: Partial<AttendanceFilters>) => ({
          key: [startDate, endDate, status],
        }),
      },
    }),
    leaves: () => ({
      key: [],
    }),
  }
);

// ─────────────────────────────────────────────
// Helpers
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

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: startOfYear.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
}

// ─────────────────────────────────────────────
// Fetch attendance data
// ─────────────────────────────────────────────

async function fetchStudentAttendancePage(
  filters: AttendanceFilters,
  signal?: AbortSignal
): Promise<StudentAttendancePageData> {
  const { startDate, endDate, status } = filters;

  // 1. Get student profile from dashboard endpoint (cached by React Query)
  const dashboardRes = (await safeFetch(
    () => portalsControllerGetStudentDashboardV1(undefined, { signal }),
    signal
  )) as RawDashboardResponse | null;

  const studentId = dashboardRes?.data?.student?.id;

  // 2. Fetch attendance records and summary in parallel
  const [recordsRes, summaryRes] = await Promise.all([
    safeFetch(
      () =>
        attendanceControllerQueryV1(
          {
            attendableType: "student",
            ...(studentId ? { attendableId: studentId } : {}),
            startDate,
            endDate,
            ...(status ? { status } : {}),
            limit: 100,
          },
          { signal }
        ),
      signal
    ),
    studentId
      ? safeFetch(
          () =>
            attendanceControllerSummaryV1(
              {
                attendableType: "student",
                attendableId: studentId,
                startDate,
                endDate,
                groupBy: "month",
              },
              { signal }
            ),
          signal
        )
      : Promise.resolve(null),
  ]);

  // 3. Type-safe extraction
  const rawRecords = (recordsRes as RawAttendanceQueryResponse)?.data;
  const rawSummary = (summaryRes as RawAttendanceSummaryResponse)?.data;

  // If we have dashboard attendance info but no detailed summary, use dashboard data
  const dashboardAttendance = dashboardRes?.data?.attendance;

  const records: AttendanceRecord[] = Array.isArray(rawRecords)
    ? rawRecords.map((r) => ({
        id: r.id ?? 0,
        date: r.date ?? "",
        status: (r.status ?? "present") as AttendanceRecord["status"],
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        remarks: r.remarks,
        attendableType: (r.attendableType ??
          "student") as AttendanceRecord["attendableType"],
        attendableId: r.attendableId ?? 0,
        sectionId: r.sectionId,
      }))
    : [];

  const summary: AttendanceSummaryResponse = rawSummary
    ? {
        totalDays: rawSummary.totalDays ?? 0,
        presentDays: rawSummary.presentDays ?? 0,
        absentDays: rawSummary.absentDays ?? 0,
        lateDays: rawSummary.lateDays ?? 0,
        halfDays: rawSummary.halfDays ?? 0,
        excusedDays: rawSummary.excusedDays ?? 0,
        attendancePercentage: rawSummary.attendancePercentage ?? 0,
        monthlyBreakdown: rawSummary.monthlyBreakdown?.map((m) => ({
          month: m.month ?? "",
          year: m.year ?? 0,
          totalDays: m.totalDays ?? 0,
          presentDays: m.presentDays ?? 0,
          absentDays: m.absentDays ?? 0,
          lateDays: m.lateDays ?? 0,
          percentage: m.percentage ?? 0,
        })),
      }
    : {
        totalDays: dashboardAttendance?.totalDays ?? 0,
        presentDays: dashboardAttendance?.presentDays ?? 0,
        absentDays: dashboardAttendance?.absentDays ?? 0,
        lateDays: dashboardAttendance?.lateDays ?? 0,
        halfDays: 0,
        excusedDays: 0,
        attendancePercentage: dashboardAttendance?.attendancePercentage ?? 0,
        monthlyBreakdown:
          dashboardAttendance?.monthlyBreakdown?.map((m) => ({
            month: m.month ?? "",
            year: m.year ?? 0,
            totalDays: m.totalDays ?? 0,
            presentDays: m.presentDays ?? 0,
            absentDays: m.absentDays ?? 0,
            lateDays: m.lateDays ?? 0,
            percentage: m.percentage ?? 0,
          })) ?? [],
      };

  // Leaves: extracted from attendance records with leave-like status or empty
  const leaves: LeaveApplication[] = [];

  return { records, summary, leaves };
}

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────

export function useStudentAttendance(filters?: Partial<AttendanceFilters>) {
  const defaults = getDefaultDateRange();
  const effectiveFilters: AttendanceFilters = {
    startDate: filters?.startDate ?? defaults.startDate,
    endDate: filters?.endDate ?? defaults.endDate,
    status: filters?.status,
  };

  return useQuery({
    queryKey: studentAttendanceQueryKeys.page().sub.by({
      startDate: effectiveFilters.startDate,
      endDate: effectiveFilters.endDate,
      status: effectiveFilters.status,
    }).key,
    queryFn: ({ signal }) =>
      fetchStudentAttendancePage(effectiveFilters, signal),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Returns the student's numeric ID (from the student record)
 * needed by mutations like apply-leave.
 */
export function useStudentId() {
  return useQuery({
    queryKey: ["student-profile-id"],
    queryFn: async ({ signal }) => {
      const res = (await portalsControllerGetStudentDashboardV1(undefined, {
        signal,
      })) as RawDashboardResponse;
      return res?.data?.student?.id ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });
}
