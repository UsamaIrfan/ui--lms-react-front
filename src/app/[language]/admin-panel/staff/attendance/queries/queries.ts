import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  staffAttendanceCheckControllerCheckInV1,
  staffAttendanceCheckControllerCheckOutV1,
  staffAttendanceCheckControllerGetReportsV1,
} from "@/services/api/generated/staff-attendance/staff-attendance";
import type {
  CheckInDto,
  CheckOutDto,
  StaffAttendanceCheckControllerGetReportsV1Params,
} from "@/services/api/generated/models";

export type AttendanceRecordItem = {
  id: number;
  staffId: number;
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime?: string | null;
  remarks?: string | null;
  createdAt: string;
};

const ATTENDANCE_KEY = ["staff-attendance"];

export function useStaffAttendanceReportsQuery(
  params?: StaffAttendanceCheckControllerGetReportsV1Params
) {
  return useQuery<AttendanceRecordItem[]>({
    queryKey: [...ATTENDANCE_KEY, params],
    queryFn: async ({ signal }) => {
      const res = await staffAttendanceCheckControllerGetReportsV1(params, {
        signal,
      });
      const items = (res as unknown as { data: AttendanceRecordItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckInDto) =>
      staffAttendanceCheckControllerCheckInV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useCheckOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckOutDto) =>
      staffAttendanceCheckControllerCheckOutV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}
