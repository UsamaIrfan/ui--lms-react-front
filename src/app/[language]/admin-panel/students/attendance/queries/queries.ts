/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  attendanceControllerQueryV1,
  attendanceControllerBulkV1,
  attendanceControllerSummaryV1,
  attendanceControllerDetailedV1,
  attendanceControllerAlertsV1,
} from "@/services/api/generated/attendance/attendance";
import type { BulkAttendanceDto } from "@/services/api/generated/models";
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

      const records = ((response as any).data ?? []) as AttendanceRecord[];

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

      const data = ((response as any).data ?? []) as AttendanceRecord[];
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
