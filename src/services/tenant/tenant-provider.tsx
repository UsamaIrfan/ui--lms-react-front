"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TenantContext } from "./tenant-context";
import { getTenantInfo, setTenantInfo } from "./tenant-storage";
import { authControllerSelectTenantV1 } from "@/services/api/generated/auth/auth";
import { branchControllerFindAllByTenantV1 } from "@/services/api/generated/multi-tenancy-branches/multi-tenancy-branches";
import { tenantUserControllerFindTenantsByUserV1 } from "@/services/api/generated/multi-tenancy-tenant-users/multi-tenancy-tenant-users";
import { setTokensInfo } from "@/services/auth/auth-tokens-info";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import type { Tenant } from "@/services/api/generated/model/tenant";
import type { Branch } from "@/services/api/generated/model/branch";
import useAuth from "@/services/auth/use-auth";

function TenantProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { user, isLoaded: isAuthLoaded } = useAuth();

  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [branchId, setBranchIdState] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetchedTenants = useRef(false);

  // Hydrate from cookie on mount
  useEffect(() => {
    const stored = getTenantInfo();
    if (stored) {
      setTenantIdState(stored.tenantId);
      setBranchIdState(stored.branchId);
    }
    setIsLoaded(true);
  }, []);

  // Fetch user's tenants after auth is loaded and user is available
  useEffect(() => {
    if (!isAuthLoaded || !user || hasFetchedTenants.current) return;

    const fetchTenants = async () => {
      try {
        setIsFetching(true);
        hasFetchedTenants.current = true;

        const response = await tenantUserControllerFindTenantsByUserV1(
          Number(user.id)
        );
        const tenantUsers = response.data;

        if (Array.isArray(tenantUsers) && tenantUsers.length > 0) {
          const tenantIds = tenantUsers.map(
            (tu: { tenantId: string }) => tu.tenantId
          );

          // If we currently have a tenant selected, fetch its branches
          const stored = getTenantInfo();
          if (stored?.tenantId && tenantIds.includes(stored.tenantId)) {
            await fetchBranches(stored.tenantId);
          }

          // Build Tenant objects from TenantUser data (API returns tenantName)
          setTenants(
            tenantUsers.map(
              (tu: { tenantId: string; tenantName?: string; id: string }) => ({
                id: tu.tenantId,
                name: tu.tenantName ?? tu.tenantId,
                slug: "",
                isActive: true,
                createdAt: "",
                updatedAt: "",
              })
            )
          );
        }
      } catch {
        // Silently fail — tenant data is not critical for initial load
      } finally {
        setIsFetching(false);
      }
    };

    fetchTenants();
  }, [isAuthLoaded, user]);

  // Reset when user logs out
  useEffect(() => {
    if (isAuthLoaded && !user) {
      hasFetchedTenants.current = false;
      setTenants([]);
      setBranches([]);
    }
  }, [isAuthLoaded, user]);

  const fetchBranches = async (forTenantId: string) => {
    try {
      const response = await branchControllerFindAllByTenantV1(forTenantId);
      const branchList = Array.isArray(response.data) ? response.data : [];
      setBranches(branchList);
      return branchList;
    } catch {
      setBranches([]);
      return [];
    }
  };

  const selectTenant = useCallback(
    async (newTenantId: string) => {
      try {
        setIsFetching(true);

        // Call the backend to select tenant — returns new tokens with tenantId claim
        const tokens = getTokensInfo();
        if (tokens?.token) {
          const response = await authControllerSelectTenantV1({
            tenantId: newTenantId,
          });

          // Update auth tokens with the new tenant-scoped tokens
          if (response.data) {
            setTokensInfo({
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              tokenExpires: response.data.tokenExpires,
            });
          }
        }

        // Update state and cookie
        setTenantIdState(newTenantId);
        setBranchIdState(null);
        setTenantInfo({ tenantId: newTenantId, branchId: null });

        // Fetch branches for the new tenant
        await fetchBranches(newTenantId);

        // Invalidate all React Query cache — data is tenant-scoped
        await queryClient.invalidateQueries();
      } catch (error) {
        // Revert on failure
        const stored = getTenantInfo();
        setTenantIdState(stored?.tenantId ?? null);
        setBranchIdState(stored?.branchId ?? null);
        throw error;
      } finally {
        setIsFetching(false);
      }
    },
    [queryClient]
  );

  const selectBranch = useCallback(
    (newBranchId: string | null) => {
      setBranchIdState(newBranchId);
      setTenantInfo({ tenantId: tenantId, branchId: newBranchId });

      // Invalidate all queries — data may be branch-scoped
      queryClient.invalidateQueries();
    },
    [tenantId, queryClient]
  );

  const clearTenant = useCallback(() => {
    setTenantIdState(null);
    setBranchIdState(null);
    setTenants([]);
    setBranches([]);
    setTenantInfo(null);
    hasFetchedTenants.current = false;

    // Clear all cached data
    queryClient.clear();
  }, [queryClient]);

  const currentTenant = useMemo(
    () => tenants.find((t) => t.id === tenantId) ?? null,
    [tenants, tenantId]
  );

  const currentBranch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId]
  );

  const contextValue = useMemo(
    () => ({
      tenantId,
      branchId,
      currentTenant,
      currentBranch,
      tenants,
      branches,
      isLoaded,
      isFetching,
      selectTenant,
      selectBranch,
      clearTenant,
    }),
    [
      tenantId,
      branchId,
      currentTenant,
      currentBranch,
      tenants,
      branches,
      isLoaded,
      isFetching,
      selectTenant,
      selectBranch,
      clearTenant,
    ]
  );

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantProvider;
