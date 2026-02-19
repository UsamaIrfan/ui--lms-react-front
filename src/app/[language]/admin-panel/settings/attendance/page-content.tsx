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
import { RiArrowLeftLine, RiCalendarCheckLine } from "@remixicon/react";

interface AttendanceSettings {
  minAttendancePercentage: number;
  trackingMode: string;
  warningThreshold: number;
  criticalThreshold: number;
  alertOnWarning: boolean;
  alertOnCritical: boolean;
  leaveTypes: { name: string; defaultBalance: number }[];
}

const DEFAULT_LEAVE_TYPES = [
  { name: "Sick Leave", defaultBalance: 12 },
  { name: "Casual Leave", defaultBalance: 10 },
  { name: "Earned Leave", defaultBalance: 15 },
  { name: "Maternity Leave", defaultBalance: 180 },
  { name: "Paternity Leave", defaultBalance: 15 },
];

function AttendanceConfiguration() {
  const { t } = useTranslation("admin-panel-settings");
  const { tenantId } = useTenant();
  const { enqueueSnackbar } = useSnackbar();

  const { data: tenant, isLoading } = useTenantQuery(tenantId);
  const updateMutation = useUpdateTenantMutation();

  const [minAttendance, setMinAttendance] = useState(75);
  const [trackingMode, setTrackingMode] = useState("daily");
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(65);
  const [alertOnWarning, setAlertOnWarning] = useState(true);
  const [alertOnCritical, setAlertOnCritical] = useState(true);
  const [leaveTypes, setLeaveTypes] =
    useState<{ name: string; defaultBalance: number }[]>(DEFAULT_LEAVE_TYPES);

  useEffect(() => {
    if (tenant) {
      const settings = (tenant.settings ?? {}) as Record<string, unknown>;
      const config = (settings.attendanceConfig ??
        {}) as Partial<AttendanceSettings>;
      setMinAttendance(config.minAttendancePercentage ?? 75);
      setTrackingMode(config.trackingMode ?? "daily");
      setWarningThreshold(config.warningThreshold ?? 80);
      setCriticalThreshold(config.criticalThreshold ?? 65);
      setAlertOnWarning(config.alertOnWarning ?? true);
      setAlertOnCritical(config.alertOnCritical ?? true);
      setLeaveTypes(config.leaveTypes ?? DEFAULT_LEAVE_TYPES);
    }
  }, [tenant]);

  const handleLeaveBalanceChange = useCallback(
    (index: number, balance: number) => {
      setLeaveTypes((prev) =>
        prev.map((lt, i) =>
          i === index ? { ...lt, defaultBalance: balance } : lt
        )
      );
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!tenantId) return;
    try {
      await updateMutation.mutateAsync({
        id: tenantId,
        data: {
          name: tenant?.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      enqueueSnackbar(
        t("admin-panel-settings:attendance.notifications.saved"),
        { variant: "success" }
      );
    } catch {
      enqueueSnackbar(
        t("admin-panel-settings:attendance.notifications.error"),
        { variant: "error" }
      );
    }
  }, [tenantId, tenant, updateMutation, enqueueSnackbar, t]);

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
              <RiCalendarCheckLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-title-h5 text-text-strong-950">
                {t("admin-panel-settings:attendance.title")}
              </h3>
            </div>
          </div>
        </div>

        {/* Attendance Policy */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:attendance.policy.title")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:attendance.policy.minPercentage")}
                </Label>
                <Input
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:attendance.policy.trackingMode")}
                </Label>
                <select
                  value={trackingMode}
                  onChange={(e) => setTrackingMode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 focus:border-primary-base focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="session">Session-wise</option>
                  <option value="subject">Subject-wise</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threshold & Alerts */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:attendance.threshold.title")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:attendance.threshold.warningLevel")}
                </Label>
                <Input
                  type="number"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:attendance.threshold.criticalLevel")}
                </Label>
                <Input
                  type="number"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alertOnWarning}
                  onChange={(e) => setAlertOnWarning(e.target.checked)}
                  className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
                />
                <span className="text-paragraph-sm text-text-strong-950">
                  {t("admin-panel-settings:attendance.threshold.alertWarning")}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alertOnCritical}
                  onChange={(e) => setAlertOnCritical(e.target.checked)}
                  className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
                />
                <span className="text-paragraph-sm text-text-strong-950">
                  {t("admin-panel-settings:attendance.threshold.alertCritical")}
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Leave Types */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:attendance.leaveTypes.title")}
            </h4>
            <p className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-settings:attendance.leaveTypes.description")}
            </p>
            <div className="grid gap-3">
              {leaveTypes.map((lt, index) => (
                <div
                  key={lt.name}
                  className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-4 py-3"
                >
                  <span className="text-paragraph-sm font-medium text-text-strong-950">
                    {lt.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Label className="text-paragraph-sm text-text-sub-600">
                      {t(
                        "admin-panel-settings:attendance.leaveTypes.defaultBalance"
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={lt.defaultBalance}
                      onChange={(e) =>
                        handleLeaveBalanceChange(index, Number(e.target.value))
                      }
                      className="w-20"
                      min={0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/admin-panel/settings">
            <Button variant="outline">
              {t("admin-panel-settings:attendance.actions.cancel")}
            </Button>
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
            {t("admin-panel-settings:attendance.actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AttendanceConfiguration, {
  roles: [RoleEnum.ADMIN],
});
