"use client";

import { useCallback, useRef, useState } from "react";
import { RiAlertLine, RiRefreshLine, RiDownloadLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";

import { useStudentAttendance } from "./queries/queries";
import {
  AttendanceSummaryHeader,
  AttendanceSummaryHeaderSkeleton,
} from "./components/attendance-summary-header";
import {
  AttendanceCalendar,
  AttendanceCalendarSkeleton,
} from "./components/attendance-calendar";
import {
  AttendanceTable,
  AttendanceTableSkeleton,
} from "./components/attendance-table";
import {
  MonthlyTrendChart,
  MonthlyTrendChartSkeleton,
} from "./components/monthly-trend-chart";
import { DateRangeFilter } from "./components/date-range-filter";
import { LeaveHistory, LeaveHistorySkeleton } from "./components/leave-history";
import { ApplyLeaveDialog } from "./components/apply-leave-dialog";
import type { AttendanceFilters } from "./types";

// ─────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────

function PageError({
  onRetry,
  errorTitle,
  retryLabel,
}: {
  onRetry: () => void;
  errorTitle: string;
  retryLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <RiAlertLine className="size-12 text-error-base" />
      <p className="text-label-md text-text-strong-950">{errorTitle}</p>
      <Button variant="outline" onClick={onRetry}>
        <RiRefreshLine className="mr-2 size-4" />
        {retryLabel}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <AttendanceSummaryHeaderSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceCalendarSkeleton />
        <MonthlyTrendChartSkeleton />
      </div>
      <AttendanceTableSkeleton />
      <LeaveHistorySkeleton />
    </div>
  );
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

function StudentAttendancePage() {
  const { t } = useTranslation("student-portal-attendance");
  const printRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<AttendanceFilters>(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return {
      startDate: startOfYear.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  });

  const { data, isLoading, isError, refetch } = useStudentAttendance(filters);

  const handleFilterApply = useCallback((newFilters: AttendanceFilters) => {
    setFilters(newFilters);
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!printRef.current) return;
    const { generatePdfFromElement } = await import("@/utils/pdf");
    await generatePdfFromElement(
      printRef.current,
      `${t("export.filename")}.pdf`
    );
  }, [t]);

  if (isLoading) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <PageError
        onRetry={() => refetch()}
        errorTitle={t("error")}
        retryLabel={t("filters.reset")}
      />
    );
  }

  return (
    <div data-testid="student-attendance-page" className="flex flex-col gap-6 p-4 lg:p-6" ref={printRef}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
          <p className="text-paragraph-sm text-text-sub-600">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ApplyLeaveDialog />
          <Button variant="outline" onClick={handleExportPdf}>
            <RiDownloadLine className="mr-1.5 size-4" />
            {t("export.button")}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <AttendanceSummaryHeader summary={data.summary} />

      {/* Filters */}
      <DateRangeFilter filters={filters} onApply={handleFilterApply} />

      {/* Calendar + Trend Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceCalendar records={data.records} />
        <MonthlyTrendChart data={data.summary.monthlyBreakdown ?? []} />
      </div>

      {/* Records Table */}
      <AttendanceTable records={data.records} />

      {/* Leave History */}
      <LeaveHistory leaves={data.leaves} />
    </div>
  );
}

export default withPageRequiredAuth(StudentAttendancePage, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
