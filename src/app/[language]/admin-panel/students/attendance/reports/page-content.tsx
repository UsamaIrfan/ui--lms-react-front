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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiListCheck,
  RiCalendarLine,
  RiBarChartLine,
} from "@remixicon/react";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useAttendanceListQuery } from "../queries/queries";
import { AttendanceStatus, ATTENDANCE_STATUSES } from "../types";
import type { AttendanceFilterType, AttendanceRecord } from "../types";

const NS = "admin-panel-students-attendance";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ViewMode = "list" | "calendar" | "summary";

function AttendanceReports() {
  const { t } = useTranslation(NS);
  const { enqueueSnackbar } = useSnackbar();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const [search, setSearch] = useState("");

  const filter: AttendanceFilterType = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status:
        statusFilter !== "__all__"
          ? (statusFilter as AttendanceStatus)
          : undefined,
      attendableType: "student",
      page: page + 1,
      limit: rowsPerPage,
    }),
    [startDate, endDate, statusFilter, page, rowsPerPage]
  );

  const { data: result, isLoading } = useAttendanceListQuery(filter);
  const records = useMemo(() => result?.data ?? [], [result?.data]);

  // Client-side search filter
  const filteredRecords = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.studentName?.toLowerCase().includes(q) ||
        r.rollNumber?.toLowerCase().includes(q) ||
        r.studentId?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const handleExport = useCallback(() => {
    if (filteredRecords.length === 0) {
      enqueueSnackbar(t(`${NS}:reports.exportNoData`), { variant: "error" });
      return;
    }

    const headers = [
      "Date",
      "Student Name",
      "Student ID",
      "Class / Section",
      "Status",
      "Check In",
      "Check Out",
      "Remarks",
      "Marked By",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((r) =>
        [
          r.date ?? "",
          r.studentName ?? "",
          r.rollNumber ?? r.studentId ?? "",
          [r.className, r.sectionName].filter(Boolean).join(" - "),
          r.status ?? "",
          r.checkIn ?? "",
          r.checkOut ?? "",
          r.remarks ?? "",
          r.markedBy ?? "",
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
    link.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    enqueueSnackbar(t(`${NS}:reports.exportSuccess`), { variant: "success" });
  }, [filteredRecords, enqueueSnackbar, t]);

  const clearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("__all__");
    setSearch("");
    setPage(0);
  }, []);

  const hasActiveFilters =
    startDate || endDate || statusFilter !== "__all__" || search;

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
            <h3 className="text-3xl font-bold tracking-tight">
              {t(`${NS}:reports.title`)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggles */}
            <div className="flex rounded-lg border border-stroke-soft-200">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950"} rounded-l-lg`}
              >
                <RiListCheck className="h-3.5 w-3.5" />
                {t(`${NS}:reports.views.list`)}
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1 border-x border-stroke-soft-200 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950"}`}
              >
                <RiCalendarLine className="h-3.5 w-3.5" />
                {t(`${NS}:reports.views.calendar`)}
              </button>
              <button
                onClick={() => setViewMode("summary")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "summary" ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950"} rounded-r-lg`}
              >
                <RiBarChartLine className="h-3.5 w-3.5" />
                {t(`${NS}:reports.views.summary`)}
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <RiDownloadLine className="mr-1 h-4 w-4" />
              {t(`${NS}:reports.export`)}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:reports.filters.startDate`)}
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
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
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:reports.filters.status`)}
            </label>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  {t(`${NS}:reports.filters.allStatuses`)}
                </SelectItem>
                {ATTENDANCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`${NS}:status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:reports.filters.student`)}
            </label>
            <Input
              placeholder={t(`${NS}:reports.filters.student`)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t(`${NS}:reports.filters.clearFilters`)}
            </Button>
          )}
        </div>

        {/* Content */}
        {viewMode === "list" && (
          <ListView
            records={filteredRecords}
            isLoading={isLoading}
            t={t}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        )}
        {viewMode === "calendar" && (
          <CalendarView records={filteredRecords} isLoading={isLoading} t={t} />
        )}
        {viewMode === "summary" && (
          <SummaryView records={filteredRecords} isLoading={isLoading} t={t} />
        )}
      </div>
    </div>
  );
}

// ─── List View ───────────────────────────────────────────────────

function ListView({
  records,
  isLoading,
  t,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  totalPages,
  totalItems,
}: {
  records: AttendanceRecord[];
  isLoading: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  page: number;
  setPage: (p: number | ((p: number) => number)) => void;
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  totalPages: number;
  totalItems: number;
}) {
  return (
    <>
      <div className="rounded-lg border border-stroke-soft-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t(`${NS}:reports.columns.date`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.studentName`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.class`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.status`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.checkIn`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.checkOut`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.remarks`)}</TableHead>
              <TableHead>{t(`${NS}:reports.columns.markedBy`)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <Spinner size="md" />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-40 text-center text-paragraph-sm text-text-soft-400"
                >
                  {t(`${NS}:reports.noData`)}
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-paragraph-sm">
                    {formatDate(r.date)}
                  </TableCell>
                  <TableCell className="font-medium text-paragraph-sm">
                    <Link
                      href={`/admin-panel/students/attendance/students/${r.attendableId}`}
                      className="hover:text-primary-base hover:underline"
                    >
                      {r.studentName ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-paragraph-sm">
                    {[r.className, r.sectionName].filter(Boolean).join(" - ") ||
                      "—"}
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
                  <TableCell className="text-paragraph-sm">
                    {r.markedBy ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
            <span>{t(`${NS}:pagination.rowsPerPage`)}</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(val) => {
                setRowsPerPage(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
            <span>
              {t(`${NS}:pagination.page`, {
                current: page + 1,
                total: totalPages,
              })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={page === 0}
                onClick={() => setPage(0)}
              >
                <RiSkipBackLine className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <RiArrowRightSLine className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
              >
                <RiSkipForwardLine className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Calendar View ───────────────────────────────────────────────

function CalendarView({
  records,
  isLoading,
  t,
}: {
  records: AttendanceRecord[];
  isLoading: boolean;
  t: (key: string) => string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a date->status map
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

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

        {/* Empty cells for first week offset */}
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

// ─── Summary View ────────────────────────────────────────────────

function SummaryView({
  records,
  isLoading,
  t,
}: {
  records: AttendanceRecord[];
  isLoading: boolean;
  t: (key: string) => string;
}) {
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(
      (r) => r.status === AttendanceStatus.PRESENT
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceStatus.LATE
    ).length;
    const halfDay = records.filter(
      (r) => r.status === AttendanceStatus.HALF_DAY
    ).length;
    const excused = records.filter(
      (r) => r.status === AttendanceStatus.EXCUSED
    ).length;
    const percentage =
      total > 0
        ? Math.round(((present + late + excused + halfDay * 0.5) / total) * 100)
        : 0;
    return { total, present, absent, late, halfDay, excused, percentage };
  }, [records]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard
        label="Total Records"
        value={stats.total}
        color="text-text-strong-950"
      />
      <StatCard
        label={t(`${NS}:status.present`)}
        value={stats.present}
        color="text-success-base"
      />
      <StatCard
        label={t(`${NS}:status.absent`)}
        value={stats.absent}
        color="text-error-base"
      />
      <StatCard
        label={t(`${NS}:status.late`)}
        value={stats.late}
        color="text-warning-base"
      />
      <StatCard
        label={t(`${NS}:status.half_day`)}
        value={stats.halfDay}
        color="text-orange-600"
      />
      <StatCard
        label={t(`${NS}:status.excused`)}
        value={stats.excused}
        color="text-primary-base"
      />
      <StatCard
        label="Attendance %"
        value={`${stats.percentage}%`}
        color={
          stats.percentage >= 75
            ? "text-success-base"
            : stats.percentage >= 50
              ? "text-warning-base"
              : "text-error-base"
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-5">
      <p className="text-paragraph-sm text-text-soft-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────

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

// ─── Calendar Color Helpers ──────────────────────────────────────

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

export default withPageRequiredAuth(AttendanceReports, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
