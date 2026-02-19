"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import {
  useDetailedReportQuery,
  useAttendanceSummaryQuery,
} from "../../queries/queries";
import {
  AttendanceStatus,
  ATTENDANCE_STATUSES,
  LeaveStatus,
} from "../../types";
import type { AttendanceRecord } from "../../types";

const NS = "admin-panel-students-attendance";

function StudentAttendanceDetail() {
  const { t } = useTranslation(NS);
  const params = useParams();
  const studentId = Number(params.id);

  // Date range: default last 6 months
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [startDate, setStartDate] = useState(
    sixMonthsAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const { data: summary, isLoading: summaryLoading } =
    useAttendanceSummaryQuery({
      attendableType: "student",
      attendableId: studentId,
      startDate,
      endDate,
      enabled: !!studentId,
    });

  const { data: detailed, isLoading: detailedLoading } = useDetailedReportQuery(
    {
      attendableType: "student",
      attendableId: studentId,
      startDate,
      endDate,
      enabled: !!studentId,
    }
  );

  const records = detailed?.records ?? [];
  const leaves = detailed?.leaves ?? [];

  const isLoading = summaryLoading || detailedLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const percentage = summary?.percentage ?? 0;

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
                {t(`${NS}:studentDetail.title`)}
              </h3>
              <p className="text-paragraph-sm text-text-soft-400">
                Student #{studentId}
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:reports.filters.startDate`)}
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:reports.filters.endDate`)}
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          <SummaryCard
            label={t(`${NS}:studentDetail.totalDays`)}
            value={summary?.totalDays ?? 0}
            color="text-text-strong-950"
          />
          <SummaryCard
            label={t(`${NS}:studentDetail.present`)}
            value={summary?.presentDays ?? 0}
            color="text-success-base"
          />
          <SummaryCard
            label={t(`${NS}:studentDetail.absent`)}
            value={summary?.absentDays ?? 0}
            color="text-error-base"
          />
          <SummaryCard
            label={t(`${NS}:studentDetail.late`)}
            value={summary?.lateDays ?? 0}
            color="text-warning-base"
          />
          <SummaryCard
            label={t(`${NS}:studentDetail.halfDay`)}
            value={summary?.halfDays ?? 0}
            color="text-orange-600"
          />
          <SummaryCard
            label={t(`${NS}:studentDetail.leave`)}
            value={summary?.leaveDays ?? 0}
            color="text-primary-base"
          />
          <div className="rounded-lg border border-stroke-soft-200 p-4">
            <p className="text-paragraph-sm text-text-soft-400">
              {t(`${NS}:studentDetail.percentage`)}
            </p>
            <p
              className={`mt-1 text-3xl font-bold ${
                percentage >= 75
                  ? "text-success-base"
                  : percentage >= 50
                    ? "text-warning-base"
                    : "text-error-base"
              }`}
            >
              {percentage}%
            </p>
          </div>
        </div>

        {/* Calendar View */}
        <div>
          <h4 className="mb-3 text-lg font-semibold">
            {t(`${NS}:studentDetail.monthlyCalendar`)}
          </h4>
          <MonthlyCalendar records={records} t={t} />
        </div>

        {/* Attendance Records Table */}
        <div>
          <h4 className="mb-3 text-lg font-semibold">
            {t(`${NS}:studentDetail.summary`)}
          </h4>
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(`${NS}:reports.columns.date`)}</TableHead>
                  <TableHead>{t(`${NS}:reports.columns.status`)}</TableHead>
                  <TableHead>{t(`${NS}:reports.columns.checkIn`)}</TableHead>
                  <TableHead>{t(`${NS}:reports.columns.checkOut`)}</TableHead>
                  <TableHead>{t(`${NS}:reports.columns.remarks`)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t(`${NS}:studentDetail.noData`)}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.slice(0, 50).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-paragraph-sm">
                        {formatDate(r.date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} t={t} />
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {r.checkIn ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {r.checkOut ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-text-soft-400">
                        {r.remarks ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Leave Applications */}
        {leaves.length > 0 && (
          <div className="pb-6">
            <h4 className="mb-3 text-lg font-semibold">
              {t(`${NS}:studentDetail.leaveApplications`)}
            </h4>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="text-paragraph-sm">
                        {formatDate(leave.fromDate)}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {formatDate(leave.toDate)}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {t(`${NS}:leaveType.${leave.leaveType}`)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-paragraph-sm text-text-soft-400">
                        {leave.reason}
                      </TableCell>
                      <TableCell>
                        <LeaveBadge status={leave.status} t={t} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-4">
      <p className="text-paragraph-sm text-text-soft-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: AttendanceStatus;
  t: (key: string) => string;
}) {
  const variantMap: Record<
    AttendanceStatus,
    "success" | "destructive" | "warning" | "default" | "secondary"
  > = {
    [AttendanceStatus.PRESENT]: "success",
    [AttendanceStatus.ABSENT]: "destructive",
    [AttendanceStatus.LATE]: "warning",
    [AttendanceStatus.HALF_DAY]: "secondary",
    [AttendanceStatus.EXCUSED]: "default",
  };
  return (
    <Badge variant={variantMap[status] ?? "default"}>
      {t(`${NS}:status.${status}`)}
    </Badge>
  );
}

function LeaveBadge({
  status,
  t,
}: {
  status: LeaveStatus;
  t: (key: string) => string;
}) {
  const variantMap: Record<
    LeaveStatus,
    "success" | "destructive" | "warning" | "default"
  > = {
    [LeaveStatus.PENDING]: "warning",
    [LeaveStatus.APPROVED]: "success",
    [LeaveStatus.REJECTED]: "destructive",
    [LeaveStatus.CANCELLED]: "default",
  };
  return (
    <Badge variant={variantMap[status] ?? "default"}>
      {t(`${NS}:leaveStatus.${status}`)}
    </Badge>
  );
}

// ─── Monthly Calendar ────────────────────────────────────────────

function MonthlyCalendar({
  records,
  t,
}: {
  records: AttendanceRecord[];
  t: (key: string) => string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateStatusMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const r of records) {
      const dateKey = r.date?.split("T")[0];
      if (dateKey) {
        map.set(dateKey, r.status);
      }
    }
    return map;
  }, [records]);

  const days = useMemo(() => {
    const result: Array<{ day: number; status?: AttendanceStatus }> = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      result.push({ day: i, status: dateStatusMap.get(dateStr) });
    }
    return result;
  }, [year, month, daysInMonth, dateStatusMap]);

  const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

  return (
    <div className="rounded-lg border border-stroke-soft-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
        >
          <RiArrowLeftSLine className="h-4 w-4" />
        </Button>
        <span className="text-label-md font-semibold">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
        >
          <RiArrowRightSLine className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-label-sm font-medium text-text-soft-400"
          >
            {t(`${NS}:calendar.${d}`)}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(({ day, status }) => (
          <div
            key={day}
            className={`flex h-10 items-center justify-center rounded-md text-paragraph-sm ${
              status ? calendarStatusColor(status) : "text-text-soft-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-paragraph-xs">
        {ATTENDANCE_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${calendarDotColor(s)}`} />
            <span className="text-text-sub-600">{t(`${NS}:status.${s}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calendarStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "bg-success-lighter text-success-base font-medium";
    case AttendanceStatus.ABSENT:
      return "bg-error-lighter text-error-base font-medium";
    case AttendanceStatus.LATE:
      return "bg-warning-lighter text-warning-base font-medium";
    case AttendanceStatus.HALF_DAY:
      return "bg-orange-100 text-orange-700 font-medium";
    case AttendanceStatus.EXCUSED:
      return "bg-primary-lighter text-primary-base font-medium";
    default:
      return "";
  }
}

function calendarDotColor(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "bg-success-base";
    case AttendanceStatus.ABSENT:
      return "bg-error-base";
    case AttendanceStatus.LATE:
      return "bg-warning-base";
    case AttendanceStatus.HALF_DAY:
      return "bg-orange-500";
    case AttendanceStatus.EXCUSED:
      return "bg-primary-base";
    default:
      return "bg-gray-400";
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default withPageRequiredAuth(StudentAttendanceDetail, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
