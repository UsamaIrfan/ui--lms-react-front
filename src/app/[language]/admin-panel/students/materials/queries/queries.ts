import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  materialsControllerFindAllV1,
  materialsControllerCreateV1,
  materialsControllerUpdateV1,
  materialsControllerRemoveV1,
} from "@/services/api/generated/endpoints/materials-course-materials/materials-course-materials";
import {
  assignmentsControllerFindAllV1,
  assignmentsControllerCreateV1,
  assignmentsControllerUpdateV1,
  assignmentsControllerRemoveV1,
} from "@/services/api/generated/endpoints/materials-assignments/materials-assignments";

export type MaterialItem = {
  id: number;
  subjectId: number;
  title: string;
  description?: string | null;
  type?: string | null;
  filePath?: string | null;
  fileSize?: number;
  externalUrl?: string | null;
  isActive?: boolean;
  downloadCount?: number;
  version?: number;
  createdAt?: string;
};

export type AssignmentItem = {
  id: number;
  subjectId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  totalMarks: number;
  isActive?: boolean;
  createdAt?: string;
};

// --- Materials ---
export function useMaterialsListQuery() {
  return useQuery<MaterialItem[]>({
    queryKey: ["materials"],
    queryFn: async ({ signal }) => {
      const res = await materialsControllerFindAllV1(undefined, { signal });
      return (
        (res as unknown as { data: MaterialItem[] })?.data ??
        (res as unknown as MaterialItem[]) ??
        []
      );
    },
  });
}

export function useCreateMaterialMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      tenantId: string;
      branchId?: string;
      subjectId: number;
      title: string;
      description?: string | null;
      type?: string;
      filePath?: string | null;
      fileSize?: number;
      externalUrl?: string | null;
      isActive?: boolean;
    }) => {
      return materialsControllerCreateV1(
        dto as Parameters<typeof materialsControllerCreateV1>[0]
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useUpdateMaterialMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Record<string, unknown>;
    }) => {
      return materialsControllerUpdateV1(
        id,
        data as Parameters<typeof materialsControllerUpdateV1>[1]
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useDeleteMaterialMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return materialsControllerRemoveV1(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

// --- Assignments ---
export function useAssignmentsListQuery() {
  return useQuery<AssignmentItem[]>({
    queryKey: ["assignments"],
    queryFn: async ({ signal }) => {
      const res = await assignmentsControllerFindAllV1({ signal });
      return (
        (res as unknown as { data: AssignmentItem[] })?.data ??
        (res as unknown as AssignmentItem[]) ??
        []
      );
    },
  });
}

export function useCreateAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      tenantId: string;
      branchId?: string;
      subjectId: number;
      title: string;
      description?: string | null;
      dueDate: string;
      totalMarks: number;
      isActive?: boolean;
    }) => {
      return assignmentsControllerCreateV1(
        dto as Parameters<typeof assignmentsControllerCreateV1>[0]
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useUpdateAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Record<string, unknown>;
    }) => {
      return assignmentsControllerUpdateV1(
        id,
        data as Parameters<typeof assignmentsControllerUpdateV1>[1]
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return assignmentsControllerRemoveV1(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
