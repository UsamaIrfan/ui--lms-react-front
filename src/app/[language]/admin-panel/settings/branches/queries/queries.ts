import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  branchControllerFindAllByTenantV1,
  branchControllerCreateV1,
  branchControllerUpdateV1,
  branchControllerRemoveV1,
} from "@/services/api/generated/endpoints/multi-tenancy-branches/multi-tenancy-branches";
import type {
  CreateBranchDto,
  UpdateBranchDto,
} from "@/services/api/generated/models";

const BRANCHES_KEY = ["settings", "branches"];

export function useBranchesQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: [...BRANCHES_KEY, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await branchControllerFindAllByTenantV1(tenantId);
      return res.data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBranchDto) => {
      const res = await branchControllerCreateV1(data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBranchDto }) => {
      const res = await branchControllerUpdateV1(id, data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useDeleteBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await branchControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}
