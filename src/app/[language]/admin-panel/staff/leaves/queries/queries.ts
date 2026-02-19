import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  staffLeaveControllerFindAllV1,
  staffLeaveControllerApplyV1,
  staffLeaveControllerGetBalanceV1,
  staffLeaveControllerApproveV1,
  staffLeaveControllerRejectV1,
} from "@/services/api/generated/endpoints/staff-leaves/staff-leaves";
import type {
  ApplyStaffLeaveDto,
  ApproveStaffLeaveDto,
  RejectStaffLeaveDto,
} from "@/services/api/generated/models";

export type LeaveItem = {
  id: number;
  staffId: number;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
  status: string;
  approvedById?: number | null;
  adminRemarks?: string | null;
  createdAt: string;
};

export type LeaveBalanceItem = {
  id: number;
  staffId: number;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  year: number;
};

const LEAVES_KEY = ["staff-leaves"];
const BALANCE_KEY = ["staff-leave-balance"];

export function useStaffLeavesQuery(staffId?: number) {
  return useQuery<LeaveItem[]>({
    queryKey: [...LEAVES_KEY, staffId],
    queryFn: async ({ signal }) => {
      const params = staffId ? { staffId } : undefined;
      const res = await staffLeaveControllerFindAllV1(params, { signal });
      const items = (res as unknown as { data: LeaveItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useLeaveBalanceQuery(staffId?: number) {
  return useQuery<LeaveBalanceItem[]>({
    queryKey: [...BALANCE_KEY, staffId],
    queryFn: async ({ signal }) => {
      const params = staffId ? { staffId } : undefined;
      const res = await staffLeaveControllerGetBalanceV1(params, { signal });
      const items = (res as unknown as { data: LeaveBalanceItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useApplyLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyStaffLeaveDto) => staffLeaveControllerApplyV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: LEAVES_KEY });
    },
  });
}

export function useApproveLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveStaffLeaveDto }) =>
      staffLeaveControllerApproveV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: LEAVES_KEY });
    },
  });
}

export function useRejectLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectStaffLeaveDto }) =>
      staffLeaveControllerRejectV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: LEAVES_KEY });
    },
  });
}
