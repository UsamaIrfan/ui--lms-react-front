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
import { Spinner } from "@/components/ui/spinner";
import { RiArrowLeftLine, RiNotification3Line } from "@remixicon/react";

interface NotificationToggle {
  key: string;
  label: string;
  enabled: boolean;
}

function NotificationSettings() {
  const { t } = useTranslation("admin-panel-settings");
  const { tenantId } = useTenant();
  const { enqueueSnackbar } = useSnackbar();

  const { data: tenant, isLoading } = useTenantQuery(tenantId);
  const updateMutation = useUpdateTenantMutation();

  const [emailNotifications, setEmailNotifications] = useState<
    NotificationToggle[]
  >([
    { key: "feeReminder", label: "Fee Payment Reminders", enabled: true },
    {
      key: "attendanceAlert",
      label: "Attendance Alerts",
      enabled: true,
    },
    { key: "examResults", label: "Exam Results Published", enabled: true },
    {
      key: "leaveApproval",
      label: "Leave Request Updates",
      enabled: true,
    },
    {
      key: "newNotice",
      label: "New Notice Published",
      enabled: true,
    },
    {
      key: "payrollProcessed",
      label: "Payroll Processed",
      enabled: true,
    },
  ]);

  const [smsNotifications, setSmsNotifications] = useState<
    NotificationToggle[]
  >([
    { key: "feeReminder", label: "Fee Payment Reminders", enabled: false },
    {
      key: "attendanceAlert",
      label: "Attendance Alerts",
      enabled: false,
    },
    { key: "examResults", label: "Exam Results Published", enabled: false },
  ]);

  useEffect(() => {
    if (tenant) {
      const settings = (tenant.settings ?? {}) as Record<string, unknown>;
      const notifConfig = (settings.notificationConfig ?? {}) as Record<
        string,
        unknown
      >;
      const emailConfig = (notifConfig.email ?? {}) as Record<string, boolean>;
      const smsConfig = (notifConfig.sms ?? {}) as Record<string, boolean>;

      setEmailNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          enabled: emailConfig[n.key] ?? n.enabled,
        }))
      );
      setSmsNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          enabled: smsConfig[n.key] ?? n.enabled,
        }))
      );
    }
  }, [tenant]);

  const handleToggleEmail = useCallback((key: string) => {
    setEmailNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  }, []);

  const handleToggleSms = useCallback((key: string) => {
    setSmsNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  }, []);

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
        t("admin-panel-settings:notifications.notifications.saved"),
        { variant: "success" }
      );
    } catch {
      enqueueSnackbar(
        t("admin-panel-settings:notifications.notifications.error"),
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
              <RiNotification3Line className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-title-h5 text-text-strong-950">
                {t("admin-panel-settings:notifications.title")}
              </h3>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:notifications.email.title")}
            </h4>
            <p className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-settings:notifications.email.description")}
            </p>
            <div className="grid gap-3">
              {emailNotifications.map((notif) => (
                <div
                  key={notif.key}
                  className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-4 py-3"
                >
                  <span className="text-paragraph-sm font-medium text-text-strong-950">
                    {notif.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleEmail(notif.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notif.enabled ? "bg-primary-base" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        notif.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              {t("admin-panel-settings:notifications.sms.title")}
            </h4>
            <p className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-settings:notifications.sms.description")}
            </p>
            <div className="grid gap-3">
              {smsNotifications.map((notif) => (
                <div
                  key={notif.key}
                  className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-4 py-3"
                >
                  <span className="text-paragraph-sm font-medium text-text-strong-950">
                    {notif.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleSms(notif.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notif.enabled ? "bg-primary-base" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        notif.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/admin-panel/settings">
            <Button variant="outline">
              {t("admin-panel-settings:notifications.actions.cancel")}
            </Button>
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
            {t("admin-panel-settings:notifications.actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(NotificationSettings, {
  roles: [RoleEnum.ADMIN],
});
