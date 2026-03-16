import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tenantControllerFindAllV1,
  tenantControllerCreateV1,
  tenantControllerUpdateV1,
  tenantControllerRemoveV1,
} from "@/services/api/generated/multi-tenancy-tenants/multi-tenancy-tenants";
import {
  tenantUserControllerAssignV1,
  tenantUserControllerFindUsersByTenantV1,
  tenantUserControllerRemoveUserFromTenantV1,
} from "@/services/api/generated/multi-tenancy-tenant-users/multi-tenancy-tenant-users";
import type {
  CreateTenantDto,
  UpdateTenantDto,
  Tenant,
  TenantUser,
} from "@/services/api/generated/model";

const TENANTS_KEY = ["settings", "tenants"];

export function useTenantsQuery() {
  return useQuery<Tenant[]>({
    queryKey: TENANTS_KEY,
    queryFn: async ({ signal }) => {
      const res = await tenantControllerFindAllV1({ signal });
      const raw = res.data as unknown;
      return (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as Tenant[];
    },
    staleTime: 2 * 60_000,
  });
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      const res = await tenantControllerCreateV1(data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
    },
  });
}

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTenantDto }) => {
      const res = await tenantControllerUpdateV1(id, data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
    },
  });
}

export function useDeleteTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await tenantControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
    },
  });
}

// ─── Tenant Users ───────────────────────────────────────

const TENANT_USERS_KEY = ["settings", "tenant-users"];

export function useTenantUsersQuery(tenantId: string | null) {
  return useQuery<TenantUser[]>({
    queryKey: [...TENANT_USERS_KEY, tenantId],
    queryFn: async ({ signal }) => {
      const res = await tenantUserControllerFindUsersByTenantV1(tenantId!, {
        signal,
      });
      const raw = res.data as unknown;
      return (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as TenantUser[];
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });
}

export function useAssignUserToTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { tenantId: string; userId: number }) => {
      const res = await tenantUserControllerAssignV1(data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_KEY });
    },
  });
}

export function useRemoveUserFromTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tenantId,
      userId,
    }: {
      tenantId: string;
      userId: number;
    }) => {
      await tenantUserControllerRemoveUserFromTenantV1(tenantId, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_KEY });
    },
  });
}
