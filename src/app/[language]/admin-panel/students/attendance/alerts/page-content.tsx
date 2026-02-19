"use client";

import { useCallback, useMemo, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiArrowLeftLine,
  RiDownloadLine,
  RiNotification3Line,
  RiAlertLine,
} from "@remixicon/react";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useAlertsQuery } from "../queries/queries";
import type { AlertsFilterType, AttendanceAlert } from "../types";

const NS = "admin-panel-students-attendance";

function getSeverity(percentage: number): "critical" | "warning" | "caution" {
  if (percentage < 50) return "critical";
  if (percentage < 65) return "warning";
  return "caution";
}

function AttendanceAlerts() {
  const { t } = useTranslation(NS);
  const { enqueueSnackbar } = useSnackbar();

  const [threshold, setThreshold] = useState(75);

  const filter: AlertsFilterType = useMemo(
    () => ({
      threshold,
      attendableType: "student",
    }),
    [threshold]
  );

  const { data: alerts, isLoading } = useAlertsQuery(filter);
  const alertList = useMemo(() => alerts ?? [], [alerts]);

  const handleExport = useCallback(() => {
    if (alertList.length === 0) {
      enqueueSnackbar(t(`${NS}:reports.exportNoData`), { variant: "error" });
      return;
    }

    const headers = [
      "Student Name",
      "Student ID",
      "Class / Section",
      "Attendance %",
      "Days Absent",
      "Last Attended",
      "Guardian Contact",
      "Severity",
    ];
    const csvRows = [
      headers.join(","),
      ...alertList.map((a) =>
        [
          a.studentName ?? "",
          a.rollNumber ?? a.studentId ?? "",
          [a.className, a.sectionName].filter(Boolean).join(" - "),
          a.percentage,
          a.absentDays ?? "",
          a.lastAttendanceDate ?? "",
          a.phone ?? "",
          getSeverity(a.percentage),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `low-attendance-alerts-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    enqueueSnackbar(t(`${NS}:alerts.export`) + " ✓", { variant: "success" });
  }, [alertList, enqueueSnackbar, t]);

  const handleSendNotifications = useCallback(() => {
    // Placeholder — would call a backend endpoint
    enqueueSnackbar(
      t(`${NS}:alerts.notificationSent`, { count: alertList.length }),
      { variant: "success" }
    );
  }, [alertList.length, enqueueSnackbar, t]);

  const criticalCount = alertList.filter((a) => a.percentage < 50).length;
  const warningCount = alertList.filter(
    (a) => a.percentage >= 50 && a.percentage < 65
  ).length;
  const cautionCount = alertList.filter(
    (a) => a.percentage >= 65 && a.percentage < 75
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin-panel/students/attendance">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RiArrowLeftLine className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">
                {t(`${NS}:alerts.title`)}
              </h3>
              <p className="text-paragraph-sm text-text-soft-400">
                {t(`${NS}:alerts.description`)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <RiDownloadLine className="mr-1 h-4 w-4" />
              {t(`${NS}:alerts.export`)}
            </Button>
            <Button size="sm" onClick={handleSendNotifications}>
              <RiNotification3Line className="mr-1 h-4 w-4" />
              {t(`${NS}:alerts.sendNotifications`)}
            </Button>
          </div>
        </div>

        {/* Threshold + Severity Summary */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:alerts.threshold`)}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-paragraph-sm text-text-soft-400">%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md bg-error-lighter px-3 py-1.5">
              <RiAlertLine className="h-4 w-4 text-error-base" />
              <span className="text-label-sm text-error-base">
                {t(`${NS}:alerts.severity.critical`)}: {criticalCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-warning-lighter px-3 py-1.5">
              <RiAlertLine className="h-4 w-4 text-warning-base" />
              <span className="text-label-sm text-warning-base">
                {t(`${NS}:alerts.severity.warning`)}: {warningCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-bg-weak-50 px-3 py-1.5">
              <RiAlertLine className="h-4 w-4 text-text-sub-600" />
              <span className="text-label-sm text-text-sub-600">
                {t(`${NS}:alerts.severity.caution`)}: {cautionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.studentName`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.studentId`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.class`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.percentage`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.absentDays`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.lastDate`)}</TableHead>
                <TableHead>{t(`${NS}:alerts.columns.contact`)}</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : alertList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t(`${NS}:alerts.noData`)}
                  </TableCell>
                </TableRow>
              ) : (
                alertList.map((alert, idx) => (
                  <AlertRow
                    key={alert.attendableId}
                    alert={alert}
                    index={idx}
                    t={t}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  index,
  t,
}: {
  alert: AttendanceAlert;
  index: number;
  t: (key: string) => string;
}) {
  const severity = getSeverity(alert.percentage);

  return (
    <TableRow>
      <TableCell className="text-paragraph-sm">{index + 1}</TableCell>
      <TableCell className="font-medium text-paragraph-sm">
        <Link
          href={`/admin-panel/students/attendance/students/${alert.attendableId}`}
          className="hover:text-primary-base hover:underline"
        >
          {alert.studentName ?? "—"}
        </Link>
      </TableCell>
      <TableCell className="text-paragraph-sm">
        {alert.rollNumber ?? alert.studentId ?? "—"}
      </TableCell>
      <TableCell className="text-paragraph-sm">
        {[alert.className, alert.sectionName].filter(Boolean).join(" - ") ||
          "—"}
      </TableCell>
      <TableCell>
        <span
          className={`text-label-sm font-bold ${
            alert.percentage < 50
              ? "text-error-base"
              : alert.percentage < 65
                ? "text-warning-base"
                : "text-text-sub-600"
          }`}
        >
          {alert.percentage}%
        </span>
      </TableCell>
      <TableCell className="text-paragraph-sm">
        {alert.absentDays ?? "—"}
      </TableCell>
      <TableCell className="text-paragraph-sm">
        {alert.lastAttendanceDate
          ? new Date(alert.lastAttendanceDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—"}
      </TableCell>
      <TableCell className="text-paragraph-sm text-text-soft-400">
        {alert.phone ?? "—"}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            severity === "critical"
              ? "destructive"
              : severity === "warning"
                ? "warning"
                : "secondary"
          }
        >
          {t(`${NS}:alerts.severity.${severity}`)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export default withPageRequiredAuth(AttendanceAlerts, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
