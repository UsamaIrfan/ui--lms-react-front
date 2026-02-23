"use client";

import { cn } from "@/utils/cn";
import { useTranslation } from "@/services/i18n/client";
import type { AttendanceSummaryResponse } from "../types";

interface AttendanceSummaryHeaderProps {
  summary: AttendanceSummaryResponse;
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4",
        className
      )}
    >
      <span className="text-title-h3 text-text-strong-950">{value}</span>
      <span className="text-paragraph-sm text-text-sub-600">{label}</span>
    </div>
  );
}

export function AttendanceSummaryHeader({
  summary,
}: AttendanceSummaryHeaderProps) {
  const { t } = useTranslation("student-portal-attendance");

  const percentageColor =
    summary.attendancePercentage >= 90
      ? "text-success-base"
      : summary.attendancePercentage >= 75
        ? "text-warning-base"
        : "text-error-base";

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-label-lg text-text-strong-950">
          {t("summary.title")}
        </h2>
        <div className="flex items-center gap-2">
          <span className={cn("text-title-h2", percentageColor)}>
            {summary.attendancePercentage.toFixed(1)}%
          </span>
          <span className="text-paragraph-sm text-text-sub-600">
            {t("summary.overallPercentage")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t("summary.totalDays")} value={summary.totalDays} />
        <StatCard
          label={t("summary.present")}
          value={summary.presentDays}
          className="border-success-base/20 bg-success-base/5"
        />
        <StatCard
          label={t("summary.absent")}
          value={summary.absentDays}
          className="border-error-base/20 bg-error-base/5"
        />
        <StatCard
          label={t("summary.late")}
          value={summary.lateDays}
          className="border-warning-base/20 bg-warning-base/5"
        />
        <StatCard
          label={t("summary.halfDay")}
          value={summary.halfDays}
          className="border-information-base/20 bg-information-base/5"
        />
        <StatCard
          label={t("summary.excused")}
          value={summary.excusedDays}
          className="border-stroke-soft-200"
        />
      </div>
    </div>
  );
}

export function AttendanceSummaryHeaderSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-8 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-16 border border-stroke-soft-200 p-4"
          >
            <div className="h-6 w-12 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-3 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
