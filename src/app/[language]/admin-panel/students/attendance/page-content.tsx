"use client";

import { useCallback, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  RiCalendarCheckLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiFileChartLine,
  RiAlertLine,
  RiUploadLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { useDashboardQuery } from "./queries/queries";

const NS = "admin-panel-students-attendance";

function formatDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function AttendanceDashboard() {
  const { t } = useTranslation(NS);
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));

  const { data: dashboard, isLoading } = useDashboardQuery(selectedDate);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
    },
    []
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t(`${NS}:dashboard.title`)}
          </h3>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-44"
            />
            <Link href="/admin-panel/students/attendance/mark">
              <Button>
                <RiCalendarCheckLine className="mr-1 h-4 w-4" />
                {t(`${NS}:dashboard.actions.markAttendance`)}
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon={<RiUserLine className="h-6 w-6" />}
                label={t(`${NS}:dashboard.totalStudents`)}
                value={dashboard?.totalStudents ?? 0}
                color="bg-primary-lighter text-primary-base"
              />
              <SummaryCard
                icon={<RiCheckLine className="h-6 w-6" />}
                label={t(`${NS}:dashboard.presentToday`)}
                value={dashboard?.presentToday ?? 0}
                subtitle={t(`${NS}:dashboard.percentage`, {
                  value: dashboard?.presentPercentage ?? 0,
                })}
                color="bg-success-lighter text-success-base"
              />
              <SummaryCard
                icon={<RiCloseLine className="h-6 w-6" />}
                label={t(`${NS}:dashboard.absentToday`)}
                value={dashboard?.absentToday ?? 0}
                color="bg-error-lighter text-error-base"
              />
              <SummaryCard
                icon={<RiCalendarLine className="h-6 w-6" />}
                label={t(`${NS}:dashboard.onLeaveToday`)}
                value={dashboard?.onLeaveToday ?? 0}
                color="bg-warning-lighter text-warning-base"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href="/admin-panel/students/attendance/reports">
                <Button variant="outline" size="sm">
                  <RiFileChartLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:dashboard.actions.viewReports`)}
                </Button>
              </Link>
              <Link href="/admin-panel/students/attendance/alerts">
                <Button variant="outline" size="sm">
                  <RiAlertLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:dashboard.actions.viewAlerts`)}
                </Button>
              </Link>
              <Link href="/admin-panel/students/attendance/bulk">
                <Button variant="outline" size="sm">
                  <RiUploadLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:dashboard.actions.bulkUpload`)}
                </Button>
              </Link>
            </div>

            {/* Class-wise summary table */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-text-strong-950">
                {t(`${NS}:dashboard.classSummary`)}
              </h4>
              <div className="rounded-lg border border-stroke-soft-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class / Section</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead style={{ width: 60 }} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!dashboard?.classSummaries ||
                    dashboard.classSummaries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-32 text-center text-paragraph-sm text-text-soft-400"
                        >
                          {t(`${NS}:dashboard.noData`)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      dashboard.classSummaries.map((cs) => (
                        <TableRow key={`${cs.className}-${cs.sectionName}`}>
                          <TableCell className="font-medium">
                            {cs.className}
                            {cs.sectionName ? ` - ${cs.sectionName}` : ""}
                          </TableCell>
                          <TableCell>{cs.totalStudents}</TableCell>
                          <TableCell className="text-success-base">
                            {cs.present}
                          </TableCell>
                          <TableCell className="text-error-base">
                            {cs.absent}
                          </TableCell>
                          <TableCell className="text-warning-base">
                            {cs.late}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                cs.percentage >= 75
                                  ? "text-success-base"
                                  : cs.percentage >= 50
                                    ? "text-warning-base"
                                    : "text-error-base"
                              }
                            >
                              {cs.percentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin-panel/students/attendance/mark?sectionId=${cs.sectionId}`}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <RiArrowRightLine className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
        <div>
          <p className="text-paragraph-sm text-text-soft-400">{label}</p>
          <p className="text-2xl font-bold text-text-strong-950">{value}</p>
          {subtitle && (
            <p className="text-paragraph-xs text-text-sub-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AttendanceDashboard, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
