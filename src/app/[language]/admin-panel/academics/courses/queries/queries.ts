import {
  institutionControllerFindAllV1,
  institutionControllerCreateV1,
  institutionControllerUpdateV1,
  institutionControllerRemoveV1,
} from "@/services/api/generated/endpoints/lms-institutions/lms-institutions";
import {
  departmentControllerFindAllV1,
  departmentControllerCreateV1,
  departmentControllerUpdateV1,
  departmentControllerRemoveV1,
} from "@/services/api/generated/endpoints/lms-departments/lms-departments";
import type {
  CreateInstitutionDto,
  UpdateInstitutionDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/services/api/generated/models";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const institutionsQueryKeys = {
  all: ["institutions"] as const,
  lists: () => [...institutionsQueryKeys.all, "list"] as const,
};

export const departmentsQueryKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentsQueryKeys.all, "list"] as const,
};

export function useInstitutionsListQuery() {
  return useQuery({
    queryKey: institutionsQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await institutionControllerFindAllV1({ signal });
      return (response.data as unknown as InstitutionItem[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDepartmentsListQuery() {
  return useQuery({
    queryKey: departmentsQueryKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await departmentControllerFindAllV1({ signal });
      return (response.data as unknown as DepartmentItem[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInstitutionDto) => {
      const response = await institutionControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: institutionsQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInstitutionDto;
    }) => {
      const response = await institutionControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: institutionsQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await institutionControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: institutionsQueryKeys.lists(),
      });
    },
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDepartmentDto) => {
      const response = await departmentControllerCreateV1(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentsQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDepartmentDto;
    }) => {
      const response = await departmentControllerUpdateV1(id, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentsQueryKeys.lists(),
      });
    },
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await departmentControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentsQueryKeys.lists(),
      });
    },
  });
}

export interface InstitutionItem {
  id: number;
  tenantId: string;
  branchId?: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentItem {
  id: number;
  tenantId: string;
  branchId?: string;
  institutionId: number;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}
