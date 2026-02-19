"use client";

import { createContext } from "react";
import type { Tenant } from "@/services/api/generated/model/tenant";
import type { Branch } from "@/services/api/generated/model/branch";

export type TenantContextType = {
  /** Currently selected tenant ID */
  tenantId: string | null;
  /** Currently selected branch ID */
  branchId: string | null;
  /** Full tenant object for the selected tenant */
  currentTenant: Tenant | null;
  /** Full branch object for the selected branch */
  currentBranch: Branch | null;
  /** List of tenants the user belongs to */
  tenants: Tenant[];
  /** List of branches for the selected tenant */
  branches: Branch[];
  /** Whether tenant data has been loaded from storage */
  isLoaded: boolean;
  /** Whether tenant data is currently being fetched */
  isFetching: boolean;
  /**
   * Select a tenant — calls POST /auth/tenant/select to get new tokens,
   * fetches branches, updates cookie, and invalidates React Query cache.
   */
  selectTenant: (tenantId: string) => Promise<void>;
  /** Select a branch — updates cookie and invalidates React Query cache */
  selectBranch: (branchId: string | null) => void;
  /** Clear tenant selection (e.g. on logout) */
  clearTenant: () => void;
};

export const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  branchId: null,
  currentTenant: null,
  currentBranch: null,
  tenants: [],
  branches: [],
  isLoaded: false,
  isFetching: false,
  selectTenant: async () => {},
  selectBranch: () => {},
  clearTenant: () => {},
});
