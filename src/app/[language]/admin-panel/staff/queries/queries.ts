import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  staffManagementControllerFindAllV1,
  staffManagementControllerCreateV1,
  staffManagementControllerUpdateV1,
  staffManagementControllerRemoveV1,
} from "@/services/api/generated/staff-management/staff-management";
import type {
  CreateStaffMgmtDto,
  UpdateStaffMgmtDto,
} from "@/services/api/generated/models";

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
