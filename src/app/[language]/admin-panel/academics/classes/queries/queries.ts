import {
  gradeClassControllerFindAllV1,
  gradeClassControllerCreateV1,
  gradeClassControllerUpdateV1,
  gradeClassControllerRemoveV1,
} from "@/services/api/generated/lms-grade-classes/lms-grade-classes";
import {
  sectionControllerFindAllV1,
  sectionControllerCreateV1,
  sectionControllerRemoveV1,
} from "@/services/api/generated/lms-sections/lms-sections";
import type {
  CreateGradeClassDto,
  UpdateGradeClassDto,
  CreateSectionDto,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const classesQueryKeys = {
  all: ["grade-classes"] as const,
  lists: () => [...classesQueryKeys.all, "list"] as const,
};

export const sectionsQueryKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionsQueryKeys.all, "list"] as const,
};

export function useClassesListQuery() {
  return useQuery({
    queryKey: classesQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await gradeClassControllerFindAllV1({ signal });
      return (response.data as unknown as GradeClassItem[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSectionsListQuery() {
  return useQuery({
    queryKey: sectionsQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await sectionControllerFindAllV1({ signal });
      return (response.data as unknown as SectionItem[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGradeClassDto) => {
      const response = await gradeClassControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: classesQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateGradeClassDto;
    }) => {
      const response = await gradeClassControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: classesQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await gradeClassControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: classesQueryKeys.lists(),
      });
    },
  });
}

export function useCreateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSectionDto) => {
      const response = await sectionControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sectionsQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await sectionControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sectionsQueryKeys.lists(),
      });
    },
  });
}

export interface GradeClassItem {
  id: number;
  tenantId: string;
  branchId?: string;
  institutionId: number;
  name: string;
  numericGrade?: number | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SectionItem {
  id: number;
  tenantId: string;
  branchId?: string;
  gradeClassId: number;
  name: string;
  capacity: number;
  classTeacherId?: number | null;
  createdAt: string;
  updatedAt: string;
}
