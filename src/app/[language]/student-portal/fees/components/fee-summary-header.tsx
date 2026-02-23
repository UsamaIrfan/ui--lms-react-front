"use client";

import { cn } from "@/utils/cn";
import { useTranslation } from "@/services/i18n/client";
import type { StudentFeesPageData } from "../types";

interface FeeSummaryHeaderProps {
  data: StudentFeesPageData;
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4",
        className
      )}
    >
      <span className="text-paragraph-sm text-text-sub-600">{label}</span>
      <span className="text-title-h4 text-text-strong-950">{value}</span>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FeeSummaryHeader({ data }: FeeSummaryHeaderProps) {
  const { t } = useTranslation("student-portal-fees");

  const paymentProgress =
    data.totalFees > 0
      ? Math.round((data.paidAmount / data.totalFees) * 100)
      : 0;

  const progressColor =
    paymentProgress >= 100
      ? "bg-success-base"
      : paymentProgress >= 50
        ? "bg-warning-base"
        : "bg-error-base";

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-label-lg text-text-strong-950">
          {t("summary.title")}
        </h2>
        <span
          className={cn(
            "text-label-md",
            paymentProgress >= 100
              ? "text-success-base"
              : paymentProgress >= 50
                ? "text-warning-base"
                : "text-error-base"
          )}
        >
          {paymentProgress}% {t("summary.fullyPaid").toLowerCase()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-bg-weak-50">
        <div
          className={cn("h-full rounded-full transition-all", progressColor)}
          style={{ width: `${Math.min(paymentProgress, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label={t("summary.totalFees")}
          value={formatCurrency(data.totalFees)}
        />
        <SummaryCard
          label={t("summary.paidAmount")}
          value={formatCurrency(data.paidAmount)}
          className="border-success-base/20 bg-success-base/5"
        />
        <SummaryCard
          label={t("summary.pendingAmount")}
          value={formatCurrency(data.pendingAmount)}
          className={
            data.pendingAmount > 0
              ? "border-error-base/20 bg-error-base/5"
              : undefined
          }
        />
        <SummaryCard
          label={t("summary.nextDue")}
          value={
            data.nextDueDate
              ? `${formatCurrency(data.nextDueAmount ?? 0)}`
              : t("summary.noDue")
          }
          className={
            data.nextDueDate
              ? "border-warning-base/20 bg-warning-base/5"
              : undefined
          }
        />
      </div>

      {data.nextDueDate && (
        <p className="mt-3 text-paragraph-sm text-text-sub-600">
          {t("summary.dueDate")}:{" "}
          <span className="text-label-sm text-text-strong-950">
            {new Date(data.nextDueDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
      )}
    </div>
  );
}

export function FeeSummaryHeaderSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
      </div>
      <div className="mb-4 h-2 w-full animate-pulse rounded-full bg-bg-weak-50" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-16 border border-stroke-soft-200 p-4"
          >
            <div className="h-3 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-6 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
