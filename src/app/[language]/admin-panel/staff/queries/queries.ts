import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersControllerFindAllV1 } from "@/services/api/generated/users/users";
import {
  staffManagementControllerFindAllV1,
  staffManagementControllerCreateV1,
  staffManagementControllerUpdateV1,
  staffManagementControllerRemoveV1,
  staffManagementControllerFindOneV1,
  staffManagementControllerAssignToBranchV1,
  staffManagementControllerGetStaffBranchesV1,
  staffManagementControllerTransferBranchV1,
  staffManagementControllerRemoveBranchAssignmentV1,
  staffManagementControllerGetMyBranchesV1,
} from "@/services/api/generated/staff-management/staff-management";
import {
  staffAttendanceCheckControllerCheckInV1,
  staffAttendanceCheckControllerCheckOutV1,
  staffAttendanceCheckControllerGetReportsV1,
} from "@/services/api/generated/staff-attendance/staff-attendance";
import {
  staffLeaveControllerFindAllV1,
  staffLeaveControllerApplyV1,
  staffLeaveControllerGetBalanceV1,
  staffLeaveControllerApproveV1,
  staffLeaveControllerRejectV1,
} from "@/services/api/generated/staff-leaves/staff-leaves";
import type {
  CreateStaffMgmtDto,
  UpdateStaffMgmtDto,
  AssignBranchDto,
  TransferBranchDto,
  CheckInDto,
  CheckOutDto,
  StaffAttendanceCheckControllerGetReportsV1Params,
  ApplyStaffLeaveDto,
  ApproveStaffLeaveDto,
  RejectStaffLeaveDto,
  StaffLeaveControllerFindAllV1Params,
  StaffLeaveControllerGetBalanceV1Params,
} from "@/services/api/generated/model";

export type StaffItem = {
  id: number;
  staffId: string;
  userId: number;
  institutionId: number;
  departmentId?: number | null;
  primaryBranchId: string;
  designation?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  experienceYears?: number | null;
  joiningDate?: string | null;
  basicSalary: number;
  employmentType: string;
  emergencyContact?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
};

const STAFF_KEY = ["staff-management"];

export function useStaffListQuery(branchId?: string) {
  return useQuery<StaffItem[]>({
    queryKey: [...STAFF_KEY, branchId],
    queryFn: async ({ signal }) => {
      const params = branchId ? { branchId } : undefined;
      const res = await staffManagementControllerFindAllV1(params, { signal });
      const items = (res as unknown as { data: StaffItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffMgmtDto) =>
      staffManagementControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useUpdateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<UpdateStaffMgmtDto>;
    }) => staffManagementControllerUpdateV1(id, data as UpdateStaffMgmtDto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useDeleteStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffManagementControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

// --- Staff detail ---

export function useStaffDetailQuery(id: number | null) {
  return useQuery<StaffItem | null>({
    queryKey: [...STAFF_KEY, "detail", id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const res = await staffManagementControllerFindOneV1(id, { signal });
      return (res as unknown as StaffItem) ?? null;
    },
    enabled: !!id,
  });
}

// --- Branch management ---

const BRANCH_ASSIGNMENTS_KEY = [...STAFF_KEY, "branch-assignments"];

export function useStaffBranchesQuery(staffId: number | null) {
  return useQuery({
    queryKey: [...BRANCH_ASSIGNMENTS_KEY, staffId],
    queryFn: async ({ signal }) => {
      if (!staffId) return [];
      const res = await staffManagementControllerGetStaffBranchesV1(staffId, {
        signal,
      });
      const items = (res as unknown as { data: unknown[] })?.data;
      return Array.isArray(items) ? items : Array.isArray(res) ? res : [];
    },
    enabled: !!staffId,
  });
}

export function useAssignBranchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: number;
      data: AssignBranchDto;
    }) => staffManagementControllerAssignToBranchV1(staffId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BRANCH_ASSIGNMENTS_KEY });
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useTransferBranchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: number;
      data: TransferBranchDto;
    }) => staffManagementControllerTransferBranchV1(staffId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BRANCH_ASSIGNMENTS_KEY });
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useRemoveBranchAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) =>
      staffManagementControllerRemoveBranchAssignmentV1(assignmentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BRANCH_ASSIGNMENTS_KEY });
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

// --- My branches ---

export function useMyBranchesQuery() {
  return useQuery({
    queryKey: [...STAFF_KEY, "my-branches"],
    queryFn: async ({ signal }) => {
      const res = await staffManagementControllerGetMyBranchesV1({ signal });
      const items = (res as unknown as { data: unknown[] })?.data;
      return Array.isArray(items) ? items : Array.isArray(res) ? res : [];
    },
  });
}

// --- Staff Attendance (check-in / check-out / reports) ---

const STAFF_ATTENDANCE_KEY = ["staff-attendance"];

export function useStaffCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckInDto) =>
      staffAttendanceCheckControllerCheckInV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_ATTENDANCE_KEY });
    },
  });
}

export function useStaffCheckOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckOutDto) =>
      staffAttendanceCheckControllerCheckOutV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_ATTENDANCE_KEY });
    },
  });
}

export function useStaffAttendanceReportsQuery(
  params?: StaffAttendanceCheckControllerGetReportsV1Params
) {
  return useQuery({
    queryKey: [...STAFF_ATTENDANCE_KEY, "reports", params],
    queryFn: async ({ signal }) => {
      const res = await staffAttendanceCheckControllerGetReportsV1(params, {
        signal,
      });
      const items = (res as unknown as { data: unknown[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

// --- Staff Leaves ---

const STAFF_LEAVES_KEY = ["staff-leaves"];

export function useStaffLeavesQuery(
  params?: StaffLeaveControllerFindAllV1Params
) {
  return useQuery({
    queryKey: [...STAFF_LEAVES_KEY, params],
    queryFn: async ({ signal }) => {
      const res = await staffLeaveControllerFindAllV1(params, { signal });
      const items = (res as unknown as { data: unknown[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useApplyStaffLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyStaffLeaveDto) => staffLeaveControllerApplyV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_LEAVES_KEY });
    },
  });
}

export function useStaffLeaveBalanceQuery(
  params?: StaffLeaveControllerGetBalanceV1Params
) {
  return useQuery({
    queryKey: [...STAFF_LEAVES_KEY, "balance", params],
    queryFn: async ({ signal }) => {
      const res = await staffLeaveControllerGetBalanceV1(params, { signal });
      return res;
    },
  });
}

export function useApproveStaffLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveStaffLeaveDto }) =>
      staffLeaveControllerApproveV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_LEAVES_KEY });
    },
  });
}

export function useRejectStaffLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectStaffLeaveDto }) =>
      staffLeaveControllerRejectV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_LEAVES_KEY });
    },
  });
}

// ── Users Dropdown Lookup ──────────────────────────────────────────────────

export type UserDropdownItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

export function useUsersDropdownQuery() {
  return useQuery<UserDropdownItem[]>({
    queryKey: ["users", "dropdown"],
    queryFn: async ({ signal }) => {
      const res = await usersControllerFindAllV1(
        { page: 1, limit: 100 },
        { signal }
      );
      const raw = (res as any)?.data?.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 5 * 60_000,
  });
}
