"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiBuilding2Line, RiGitBranchLine } from "@remixicon/react";
import useTenant from "@/services/tenant/use-tenant";
import useAuth from "@/services/auth/use-auth";
import useLanguage from "@/services/i18n/use-language";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Tenant } from "@/services/api/generated/models/tenant";
import type { Branch } from "@/services/api/generated/models/branch";

function SelectTenantContent() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useLanguage();
  const { user } = useAuth();
  const { tenants, branches, selectTenant, selectBranch, isFetching } =
    useTenant();

  const [step, setStep] = useState<"tenant" | "branch">("tenant");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const returnTo = searchParams.get("returnTo") ?? `/${language}`;

  const handleTenantSelect = useCallback(
    async (tenant: Tenant) => {
      try {
        setIsSelecting(true);
        setSelectedTenantId(tenant.id);
        await selectTenant(tenant.id);

        // If the selected tenant has branches, show branch selection step
        // Otherwise navigate to return URL
        setStep("branch");
      } catch {
        setSelectedTenantId(null);
      } finally {
        setIsSelecting(false);
      }
    },
    [selectTenant]
  );

  const handleBranchSelect = useCallback(
    (branch: Branch | null) => {
      selectBranch(branch?.id ?? null);
      router.replace(returnTo);
    },
    [selectBranch, router, returnTo]
  );

  const handleSkipBranch = useCallback(() => {
    selectBranch(null);
    router.replace(returnTo);
  }, [selectBranch, router, returnTo]);

  const isLoading = isFetching || isSelecting;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-strong-950">
            {step === "tenant"
              ? t("tenant.selectTenantTitle")
              : t("tenant.selectBranchTitle")}
          </h1>
          <p className="mt-2 text-sm text-text-sub-600">
            {step === "tenant"
              ? t("tenant.selectTenantDescription")
              : t("tenant.selectBranchDescription")}
          </p>
          {user && (
            <p className="mt-1 text-xs text-text-soft-400">{user.email}</p>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {/* Tenant selection */}
        {step === "tenant" && !isLoading && (
          <div className="space-y-2">
            {tenants.length === 0 ? (
              <div className="rounded-lg border border-stroke-soft-200 p-6 text-center">
                <RiBuilding2Line className="mx-auto h-8 w-8 text-text-soft-400" />
                <p className="mt-2 text-sm text-text-sub-600">
                  {t("tenant.noTenantsAvailable")}
                </p>
              </div>
            ) : (
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSelect(tenant)}
                  disabled={isSelecting}
                  className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-200 p-4 text-left transition-colors hover:border-primary-base hover:bg-bg-weak-50 disabled:opacity-50"
                  data-testid={`select-tenant-${tenant.id}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
                    <RiBuilding2Line className="h-5 w-5 text-primary-base" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-strong-950">
                      {tenant.name}
                    </p>
                    {tenant.slug && (
                      <p className="text-xs text-text-sub-600">{tenant.slug}</p>
                    )}
                  </div>
                  {selectedTenantId === tenant.id && isSelecting && (
                    <Spinner size="sm" />
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Branch selection */}
        {step === "branch" && !isLoading && (
          <div className="space-y-2">
            {branches.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-stroke-soft-200 p-6 text-center">
                  <RiGitBranchLine className="mx-auto h-8 w-8 text-text-soft-400" />
                  <p className="mt-2 text-sm text-text-sub-600">
                    {t("tenant.noBranchesAvailable")}
                  </p>
                </div>
                <Button
                  onClick={handleSkipBranch}
                  className="w-full"
                  data-testid="continue-without-branch"
                >
                  {t("tenant.continue")}
                </Button>
              </div>
            ) : (
              <>
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchSelect(branch)}
                    className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-200 p-4 text-left transition-colors hover:border-primary-base hover:bg-bg-weak-50"
                    data-testid={`select-branch-${branch.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
                      <RiGitBranchLine className="h-5 w-5 text-primary-base" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-strong-950">
                        {branch.name}
                      </p>
                      <p className="text-xs text-text-sub-600">
                        {branch.code}
                        {branch.isHeadquarters && " (HQ)"}
                      </p>
                    </div>
                  </button>
                ))}

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleSkipBranch}
                    className="w-full"
                    data-testid="skip-branch-selection"
                  >
                    {t("tenant.skipBranchSelection")}
                  </Button>
                </div>

                <div className="pt-1">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("tenant")}
                    className="w-full text-text-sub-600"
                    data-testid="back-to-tenant-selection"
                  >
                    {t("tenant.backToTenantSelection")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(SelectTenantContent);
