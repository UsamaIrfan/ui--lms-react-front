/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  attendanceControllerQueryV1,
  attendanceControllerBulkV1,
  attendanceControllerMarkV1,
  attendanceControllerSummaryV1,
  attendanceControllerDetailedV1,
  attendanceControllerAlertsV1,
  attendanceControllerApplyLeaveV1,
  attendanceControllerApproveV1,
  attendanceControllerRejectV1,
} from "@/services/api/generated/attendance/attendance";
import { studentEnrollmentControllerFindAllV1 } from "@/services/api/generated/lms-student-enrollments/lms-student-enrollments";
import type {
  BulkAttendanceDto,
  MarkAttendanceDto,
  ApplyLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  AttendanceControllerApproveV1Params,
  AttendanceControllerRejectV1Params,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  AttendanceSummary,
  DetailedReport,
  AttendanceAlert,
  AttendanceFilterType,
  AlertsFilterType,
  DashboardSummary,
  ClassAttendanceSummary,
} from "../types";

// --- Query Keys ---

export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  dashboard: (date: string) =>
    [...attendanceQueryKeys.all, "dashboard", date] as const,
  lists: () => [...attendanceQueryKeys.all, "list"] as const,
  list: (filter?: AttendanceFilterType) =>
    [...attendanceQueryKeys.lists(), filter] as const,
  summaries: () => [...attendanceQueryKeys.all, "summary"] as const,
  summary: (params: Record<string, unknown>) =>
    [...attendanceQueryKeys.summaries(), params] as const,
  detailed: (params: Record<string, unknown>) =>
    [...attendanceQueryKeys.all, "detailed", params] as const,
  alerts: (filter?: AlertsFilterType) =>
    [...attendanceQueryKeys.all, "alerts", filter] as const,
};

// --- Dashboard Query ---

export function useDashboardQuery(date: string) {
  return useQuery({
    queryKey: attendanceQueryKeys.dashboard(date),
    queryFn: async ({ signal }) => {
      const response = await attendanceControllerQueryV1(
        {
          startDate: date,
          endDate: date,
          attendableType: "student" as any,
        },
        { signal }
      );

      const raw = (response as any).data;
      const records = (
        Array.isArray(raw) ? raw : (raw?.data ?? [])
      ) as AttendanceRecord[];

      const classMap = new Map<
        string,
        {
          className: string;
          sectionName: string;
          sectionId: number;
          total: number;
          present: number;
          absent: number;
          late: number;
        }
      >();

      for (const r of records) {
        const key = `${r.className ?? "Unknown"}-${r.sectionName ?? ""}`;
        if (!classMap.has(key)) {
          classMap.set(key, {
            className: r.className ?? "Unknown",
            sectionName: r.sectionName ?? "",
            sectionId: r.sectionId ?? 0,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
          });
        }
        const cs = classMap.get(key)!;
        cs.total++;
        if (r.status === "present") cs.present++;
        else if (r.status === "absent") cs.absent++;
        else if (r.status === "late") cs.late++;
      }

      const classSummaries: ClassAttendanceSummary[] = [];
      const classValues = Array.from(classMap.values());
      classValues.forEach((cs) => {
        classSummaries.push({
          ...cs,
          totalStudents: cs.total,
          percentage: cs.total > 0 ? (cs.present / cs.total) * 100 : 0,
        });
      });

      const presentToday = records.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;

      const absentToday = records.filter((r) => r.status === "absent").length;

      const onLeave = records.filter((r) => r.status === "excused").length;

      const dashboard: DashboardSummary = {
        totalStudents: records.length,
        presentToday,
        absentToday,
        onLeaveToday: onLeave,
        presentPercentage:
          records.length > 0 ? (presentToday / records.length) * 100 : 0,
        classSummaries,
      };

      return dashboard;
    },
    staleTime: 60 * 1000,
  });
}

// --- Attendance List Query ---

export function useAttendanceListQuery(filter: AttendanceFilterType) {
  return useQuery({
    queryKey: attendanceQueryKeys.list(filter),
    queryFn: async ({ signal }) => {
      const response = await attendanceControllerQueryV1(
        {
          startDate: filter.startDate,
          endDate: filter.endDate,
          attendableType: filter.attendableType as any,
          attendableId: filter.attendableId,
          status: filter.status as any,
          sectionId: filter.sectionId,
          page: filter.page,
          limit: filter.limit,
        },
        { signal }
      );

      const raw = (response as any).data;
      const data = (
        Array.isArray(raw) ? raw : (raw?.data ?? [])
      ) as AttendanceRecord[];
      return { data };
    },
    staleTime: 60 * 1000,
  });
}

// --- Attendance Summary Query ---

export function useAttendanceSummaryQuery(params: {
  attendableType: "student" | "staff";
  attendableId: string | number;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: attendanceQueryKeys.summary({
      type: params.attendableType,
      id: params.attendableId,
      start: params.startDate,
      end: params.endDate,
    }),
    queryFn: async ({ signal }) => {
      const response = await attendanceControllerSummaryV1(
        {
          attendableType: params.attendableType as any,
          attendableId: Number(params.attendableId),
          startDate: params.startDate,
          endDate: params.endDate,
        },
        { signal }
      );

      return (response as any).data as AttendanceSummary;
    },
    enabled: params.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

// --- Detailed Report Query ---

export function useDetailedReportQuery(params: {
  attendableType: "student" | "staff";
  attendableId: string | number;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: attendanceQueryKeys.detailed({
      type: params.attendableType,
      id: params.attendableId,
      start: params.startDate,
      end: params.endDate,
    }),
    queryFn: async ({ signal }) => {
      const response = await attendanceControllerDetailedV1(
        {
          attendableType: params.attendableType as any,
          attendableId: Number(params.attendableId),
          startDate: params.startDate,
          endDate: params.endDate,
        },
        { signal }
      );

      return (response as any).data as DetailedReport;
    },
    enabled: params.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

// --- Alerts Query ---

export function useAlertsQuery(filter: AlertsFilterType) {
  return useQuery({
    queryKey: attendanceQueryKeys.alerts(filter),
    queryFn: async ({ signal }) => {
      const response = await attendanceControllerAlertsV1(
        {
          threshold: filter.threshold,
          attendableType: filter.attendableType as any,
          startDate: filter.startDate,
          endDate: filter.endDate,
        },
        { signal }
      );

      return ((response as any).data ?? []) as AttendanceAlert[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// --- Bulk Attendance Mutation ---

export function useBulkAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BulkAttendanceDto) => {
      const response = await attendanceControllerBulkV1(data);
      return (response as any).data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

// --- Single Mark Attendance ---

export function useMarkAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MarkAttendanceDto) => {
      const response = await attendanceControllerMarkV1(data);
      return (response as any).data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

// --- Leave Management ---

export function useApplyLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ApplyLeaveDto) => {
      const response = await attendanceControllerApplyLeaveV1(data);
      return (response as any).data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      params,
    }: {
      id: number;
      data: ApproveLeaveDto;
      params: AttendanceControllerApproveV1Params;
    }) => {
      const response = await attendanceControllerApproveV1(id, data, params);
      return (response as any).data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

export function useRejectLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      params,
    }: {
      id: number;
      data: RejectLeaveDto;
      params: AttendanceControllerRejectV1Params;
    }) => {
      const response = await attendanceControllerRejectV1(id, data, params);
      return (response as any).data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

// --- Enrolled Students Query (for mark-attendance page) ---

export interface EnrolledStudent {
  studentId: number;
  studentName: string;
  rollNumber: string;
}

export function useEnrolledStudentsQuery(sectionId: number | undefined) {
  return useQuery({
    queryKey: ["enrolled-students", sectionId],
    queryFn: async ({ signal }) => {
      // Pass sectionId + status=active as query params
      // Use the generated function but append query params
      const res = await studentEnrollmentControllerFindAllV1({
        signal,
      });

      const raw = (res as any)?.data;
      const enrollments: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

      // Filter by sectionId and active status on the client side
      // (server-side filtering via query params is the ideal approach
      //  but the Orval-generated function doesn't support query params yet)
      return enrollments
        .filter((e: any) => {
          const sid = e.sectionId ?? e.section?.id;
          const status = e.status ?? "";
          return sid === sectionId && status === "active";
        })
        .map(
          (e: any): EnrolledStudent => ({
            studentId: e.studentId ?? e.student?.id ?? 0,
            studentName: e.studentName ?? "",
            rollNumber: e.rollNumber ?? "",
          })
        );
    },
    enabled: !!sectionId,
    staleTime: 5 * 60 * 1000,
  });
}
