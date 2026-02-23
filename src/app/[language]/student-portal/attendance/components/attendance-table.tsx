"use client";

import { format } from "date-fns";

import { cn } from "@/utils/cn";
import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRecord, AttendanceStatus } from "../types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const STATUS_VARIANT: Record<
  AttendanceStatus,
  "success" | "destructive" | "warning" | "default" | "secondary"
> = {
  present: "success",
  absent: "destructive",
  late: "warning",
  half_day: "default",
  excused: "secondary",
};

export function AttendanceTable({ records }: AttendanceTableProps) {
  const { t } = useTranslation("student-portal-attendance");

  if (records.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("table.title")}
        </h3>
        <p className="text-center text-paragraph-sm text-text-sub-600 py-8">
          {t("table.noRecords")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("table.title")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke-soft-200">
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.date")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.day")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.status")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.checkIn")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.checkOut")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("table.remarks")}
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const dateObj = new Date(record.date);
              return (
                <tr
                  key={record.id}
                  className={cn(
                    "border-b border-stroke-soft-200 last:border-b-0",
                    "hover:bg-bg-weak-50 transition-colors"
                  )}
                >
                  <td className="py-3 text-paragraph-sm text-text-strong-950">
                    {format(dateObj, "MMM dd, yyyy")}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {format(dateObj, "EEEE")}
                  </td>
                  <td className="py-3">
                    <Badge variant={STATUS_VARIANT[record.status]}>
                      {t(`status.${record.status}`)}
                    </Badge>
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {record.checkIn ?? "—"}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {record.checkOut ?? "—"}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {record.remarks ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AttendanceTableSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-36 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 flex-1 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
