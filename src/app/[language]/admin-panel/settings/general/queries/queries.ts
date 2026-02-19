import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tenantControllerFindOneV1,
  tenantControllerUpdateV1,
} from "@/services/api/generated/endpoints/multi-tenancy-tenants/multi-tenancy-tenants";
import type { Tenant, UpdateTenantDto } from "@/services/api/generated/models";

const TENANT_SETTINGS_KEY = ["tenant-settings"];

export function useTenantQuery(tenantId: string | null) {
  return useQuery<Tenant | null>({
    queryKey: [...TENANT_SETTINGS_KEY, tenantId],
    queryFn: async ({ signal }) => {
      if (!tenantId) return null;
      const res = await tenantControllerFindOneV1(tenantId, { signal });
      return (res as unknown as { data: Tenant })?.data ?? null;
    },
    enabled: !!tenantId,
  });
}

export function useUpdateTenantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantDto }) =>
      tenantControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TENANT_SETTINGS_KEY });
    },
  });
}
