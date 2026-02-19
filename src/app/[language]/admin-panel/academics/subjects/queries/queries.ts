import {
  subjectControllerFindAllV1,
  subjectControllerCreateV1,
  subjectControllerUpdateV1,
  subjectControllerRemoveV1,
} from "@/services/api/generated/endpoints/lms-subjects/lms-subjects";
import type {
  CreateSubjectDto,
  UpdateSubjectDto,
} from "@/services/api/generated/models";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const subjectsQueryKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectsQueryKeys.all, "list"] as const,
};

export function useSubjectsListQuery() {
  return useQuery({
    queryKey: subjectsQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await subjectControllerFindAllV1({ signal });
      return (response.data as unknown as SubjectItem[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSubjectDto) => {
      const response = await subjectControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: subjectsQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSubjectDto;
    }) => {
      const response = await subjectControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: subjectsQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await subjectControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: subjectsQueryKeys.lists(),
      });
    },
  });
}

export interface SubjectItem {
  id: number;
  tenantId: string;
  branchId?: string;
  departmentId: number;
  name: string;
  code: string;
  creditHours: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}
