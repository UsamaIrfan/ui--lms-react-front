import {
  subjectControllerFindAllV1,
  subjectControllerFindOneV1,
  subjectControllerCreateV1,
  subjectControllerUpdateV1,
  subjectControllerRemoveV1,
} from "@/services/api/generated/lms-subjects/lms-subjects";
import type {
  CreateSubjectDto,
  UpdateSubjectDto,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const subjectsQueryKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectsQueryKeys.all, "list"] as const,
  detail: (id: number) => [...subjectsQueryKeys.all, "detail", id] as const,
};

export function useSubjectsListQuery() {
  return useQuery({
    queryKey: subjectsQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await subjectControllerFindAllV1({ signal });
      const raw = response.data as unknown;
      return (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as SubjectItem[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubjectDetailQuery(id: number) {
  return useQuery({
    queryKey: subjectsQueryKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await subjectControllerFindOneV1(id, { signal });
      return (response as unknown as { data: SubjectItem })?.data;
    },
    enabled: id > 0,
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
