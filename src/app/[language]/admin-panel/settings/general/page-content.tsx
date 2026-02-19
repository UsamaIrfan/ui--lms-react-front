"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useTenant from "@/services/tenant/use-tenant";
import { useTenantQuery, useUpdateTenantMutation } from "./queries/queries";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { RiArrowLeftLine, RiSettings4Line } from "@remixicon/react";

const TIMEZONES = [
  "UTC",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dubai",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

function GeneralSettings() {
  const { t } = useTranslation("admin-panel-settings");
  const { tenantId } = useTenant();
  const { enqueueSnackbar } = useSnackbar();

  const { data: tenant, isLoading } = useTenantQuery(tenantId);
  const updateMutation = useUpdateTenantMutation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [academicYearStart, setAcademicYearStart] = useState("");
  const [academicYearEnd, setAcademicYearEnd] = useState("");

  // Hydrate form when tenant data loads
  useEffect(() => {
    if (tenant) {
      setName(tenant.name ?? "");
      setSlug(tenant.slug ?? "");
      setContactEmail(String(tenant.contactEmail ?? ""));
      setContactPhone(String(tenant.contactPhone ?? ""));
      const settings = (tenant.settings ?? {}) as Record<string, unknown>;
      setTimezone(String(settings.timezone ?? "UTC"));
      setAcademicYearStart(String(settings.academicYearStart ?? ""));
      setAcademicYearEnd(String(settings.academicYearEnd ?? ""));
    }
  }, [tenant]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      enqueueSnackbar(
        t("admin-panel-settings:general.validation.nameRequired"),
        { variant: "error" }
      );
      return;
    }
    if (!tenantId) return;

    try {
      await updateMutation.mutateAsync({
        id: tenantId,
        data: {
          name,
          slug,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
        },
      });
      enqueueSnackbar(t("admin-panel-settings:general.notifications.saved"), {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(t("admin-panel-settings:general.notifications.error"), {
        variant: "error",
      });
    }
  }, [
    name,
    slug,
    contactEmail,
    contactPhone,
    tenantId,
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
              <RiSettings4Line className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-title-h5 text-text-strong-950">
                {t("admin-panel-settings:general.title")}
              </h3>
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              Institution Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:general.form.institutionName")}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:general.form.slug")}</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="institution-slug"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              Contact Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:general.form.contactEmail")}
                </Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@institution.com"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:general.form.contactPhone")}
                </Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timezone & Academic Year */}
        <Card>
          <CardContent className="grid gap-5 p-6">
            <h4 className="text-label-md text-text-strong-950">
              Timezone & Academic Year
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>{t("admin-panel-settings:general.form.timezone")}</Label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 focus:border-primary-base focus:outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:general.form.academicYearStart")}
                </Label>
                <Input
                  type="date"
                  value={academicYearStart}
                  onChange={(e) => setAcademicYearStart(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("admin-panel-settings:general.form.academicYearEnd")}
                </Label>
                <Input
                  type="date"
                  value={academicYearEnd}
                  onChange={(e) => setAcademicYearEnd(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/admin-panel/settings">
            <Button variant="outline">
              {t("admin-panel-settings:general.actions.cancel")}
            </Button>
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
            {t("admin-panel-settings:general.actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(GeneralSettings, {
  roles: [RoleEnum.ADMIN],
});
