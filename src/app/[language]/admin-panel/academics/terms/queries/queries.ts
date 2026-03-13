import {
  termControllerFindAllV1,
  termControllerCreateV1,
  termControllerUpdateV1,
  termControllerRemoveV1,
} from "@/services/api/generated/lms-terms/lms-terms";
import type {
  CreateTermDto,
  UpdateTermDto,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const termQueryKeys = {
  all: ["terms"] as const,
  lists: () => [...termQueryKeys.all, "list"] as const,
  detail: (id: number) => [...termQueryKeys.all, "detail", id] as const,
};

export interface TermItem {
  id: number;
  tenantId: string;
  branchId?: string;
  academicYearId: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  academicYear?: { id: number; name: string };
}

export function useTermsListQuery() {
  return useQuery({
    queryKey: termQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await termControllerFindAllV1({ signal });
      const raw = response.data as unknown;
      return (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as TermItem[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTermDto) => {
      const response = await termControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: termQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTermDto }) => {
      const response = await termControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: termQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await termControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: termQueryKeys.lists(),
      });
    },
  });
}
