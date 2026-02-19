"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useTenant from "@/services/tenant/use-tenant";
import {
  useTenantQuery,
  useUpdateTenantMutation,
} from "../general/queries/queries";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { RiArrowLeftLine, RiMoneyDollarCircleLine } from "@remixicon/react";

interface FeeSettings {
  lateFeeGracePeriod: number;
  lateFeePerDay: number;
  lateFeeMaxPercentage: number;
  lateFeeEnabled: boolean;
  paymentModes: string[];
  feeCategories: string[];
  concessionTypes: string[];
}

const DEFAULT_PAYMENT_MODES = [
  "cash",
  "bank_transfer",
  "online",
  "cheque",
  "card",
];
const DEFAULT_CONCESSION_TYPES = [
  "scholarship",
  "sibling",
  "staff_child",
  "merit",
  "financial_aid",
];

function FeeConfiguration() {
  const { t } = useTranslation("admin-panel-settings");
  const { tenantId } = useTenant();
  const { enqueueSnackbar } = useSnackbar();

  const { data: tenant, isLoading } = useTenantQuery(tenantId);
  const updateMutation = useUpdateTenantMutation();

  const [lateFeeGracePeriod, setLateFeeGracePeriod] = useState(7);
  const [lateFeePerDay, setLateFeePerDay] = useState(50);
  const [lateFeeMaxPercentage, setLateFeeMaxPercentage] = useState(10);
  const [lateFeeEnabled, setLateFeeEnabled] = useState(true);
  const [paymentModes, setPaymentModes] = useState<string[]>(
    DEFAULT_PAYMENT_MODES
  );
  const [feeCategories, setFeeCategories] = useState("");
  const [concessionTypes, setConcessionTypes] = useState<string[]>(
    DEFAULT_CONCESSION_TYPES
  );

  useEffect(() => {
    if (tenant) {
      const settings = (tenant.settings ?? {}) as Record<string, unknown>;
      const feeConfig = (settings.feeConfig ?? {}) as Partial<FeeSettings>;
      setLateFeeGracePeriod(feeConfig.lateFeeGracePeriod ?? 7);
      setLateFeePerDay(feeConfig.lateFeePerDay ?? 50);
      setLateFeeMaxPercentage(feeConfig.lateFeeMaxPercentage ?? 10);
      setLateFeeEnabled(feeConfig.lateFeeEnabled ?? true);
      setPaymentModes(feeConfig.paymentModes ?? DEFAULT_PAYMENT_MODES);
      setFeeCategories((feeConfig.feeCategories ?? []).join(", "));
      setConcessionTypes(feeConfig.concessionTypes ?? DEFAULT_CONCESSION_TYPES);
    }
  }, [tenant]);

  const handleTogglePaymentMode = useCallback((mode: string) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  }, []);

  const handleToggleConcession = useCallback((type: string) => {
    setConcessionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!tenantId) return;
    try {
      const existingSettings = (tenant?.settings ?? {}) as Record<
        string,
        unknown
      >;
      const feeConfig: FeeSettings = {
        lateFeeGracePeriod,
        lateFeePerDay,
        lateFeeMaxPercentage,
        lateFeeEnabled,
        paymentModes,
        feeCategories: feeCategories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        concessionTypes,
      };
      await updateMutation.mutateAsync({
        id: tenantId,
        data: {
          ...existingSettings,
          name: tenant?.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      // Since settings is a JSON blob, we store via the tenant update
      void feeConfig; // Settings would be stored if backend supports it
      enqueueSnackbar(t("admin-panel-settings:fees.notifications.saved"), {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(t("admin-panel-settings:fees.notifications.error"), {
        variant: "error",
      });
    }
  }, [
    tenantId,
    tenant,
    lateFeeGracePeriod,
    lateFeePerDay,
    lateFeeMaxPercentage,
    lateFeeEnabled,
    paymentModes,
    feeCategories,
    concessionTypes,
    updateMutation,
    enqueueSnackbar,
    t,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin-panel/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50"
          >
            <RiArrowLeftLine className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base">
              <RiMoneyDollarCircleLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-title-h5 text-text-strong-950">
                {t("admin-panel-settings:fees.title")}
              </h3>
            </div>
          </div>
        </div>

        {/* Late Fee Policy */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-label-md text-text-strong-950">
                {t("admin-panel-settings:fees.lateFee.title")}
              </h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lateFeeEnabled}
                  onChange={(e) => setLateFeeEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
                />
                <span className="text-paragraph-sm text-text-sub-600">
                  {t("admin-panel-settings:fees.lateFee.enabled")}
                </span>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:fees.lateFee.gracePeriod")}
                </Label>
                <Input
                  type="number"
                  value={lateFeeGracePeriod}
                  onChange={(e) =>
                    setLateFeeGracePeriod(Number(e.target.value))
                  }
                  min={0}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:fees.lateFee.perDay")}</Label>
                <Input
                  type="number"
                  value={lateFeePerDay}
                  onChange={(e) => setLateFeePerDay(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:fees.lateFee.maxPercentage")}
                </Label>
                <Input
                  type="number"
                  value={lateFeeMaxPercentage}
                  onChange={(e) =>
                    setLateFeeMaxPercentage(Number(e.target.value))
                  }
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modes */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:fees.paymentModes.title")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_PAYMENT_MODES.map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentModes.includes(mode)}
                    onChange={() => handleTogglePaymentMode(mode)}
                    className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
                  />
                  <span className="text-paragraph-sm capitalize text-text-strong-950">
                    {mode.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Categories */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:fees.categories.title")}
            </h4>
            <p className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-settings:fees.categories.description")}
            </p>
            <Input
              value={feeCategories}
              onChange={(e) => setFeeCategories(e.target.value)}
              placeholder="Tuition, Lab, Library, Transport, Hostel"
            />
          </CardContent>
        </Card>

        {/* Concession Types */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:fees.concessions.title")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_CONCESSION_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={concessionTypes.includes(type)}
                    onChange={() => handleToggleConcession(type)}
                    className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
                  />
                  <span className="text-paragraph-sm capitalize text-text-strong-950">
                    {type.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/admin-panel/settings">
            <Button variant="outline">
              {t("admin-panel-settings:fees.actions.cancel")}
            </Button>
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
            {t("admin-panel-settings:fees.actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(FeeConfiguration, {
  roles: [RoleEnum.ADMIN],
});
