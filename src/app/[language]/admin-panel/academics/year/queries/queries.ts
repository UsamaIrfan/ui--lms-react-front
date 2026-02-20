import {
  academicYearControllerFindAllV1,
  academicYearControllerFindOneV1,
  academicYearControllerCreateV1,
  academicYearControllerUpdateV1,
  academicYearControllerRemoveV1,
} from "@/services/api/generated/lms-academic-years/lms-academic-years";
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const academicYearQueryKeys = {
  all: ["academic-years"] as const,
  lists: () => [...academicYearQueryKeys.all, "list"] as const,
  detail: (id: number) => [...academicYearQueryKeys.all, "detail", id] as const,
};

export function useAcademicYearsListQuery() {
  return useQuery({
    queryKey: academicYearQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await academicYearControllerFindAllV1({ signal });
      const raw = response.data as unknown;
      return (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as AcademicYearItem[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAcademicYearDetailQuery(id: number) {
  return useQuery({
    queryKey: academicYearQueryKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await academicYearControllerFindOneV1(id, { signal });
      return (response as unknown as { data: AcademicYearItem })?.data;
    },
    enabled: id > 0,
  });
}

export function useCreateAcademicYearMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAcademicYearDto) => {
      const response = await academicYearControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: academicYearQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateAcademicYearMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAcademicYearDto;
    }) => {
      const response = await academicYearControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: academicYearQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteAcademicYearMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await academicYearControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: academicYearQueryKeys.lists(),
      });
    },
  });
}

export interface AcademicYearItem {
  id: number;
  tenantId: string;
  branchId?: string;
  institutionId: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  createdAt: string;
  updatedAt: string;
}
