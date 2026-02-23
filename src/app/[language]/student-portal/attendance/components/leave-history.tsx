"use client";

import { format } from "date-fns";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import type { LeaveApplication, LeaveStatus } from "../types";

interface LeaveHistoryProps {
  leaves: LeaveApplication[];
}

const LEAVE_STATUS_VARIANT: Record<
  LeaveStatus,
  "success" | "destructive" | "warning" | "default" | "secondary"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  cancelled: "secondary",
};

export function LeaveHistory({ leaves }: LeaveHistoryProps) {
  const { t } = useTranslation("student-portal-attendance");

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("leave.title")}
      </h3>

      {leaves.length === 0 ? (
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("leave.noLeaves")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke-soft-200">
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.leaveType")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.fromDate")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.toDate")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.reason")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.status")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("leave.appliedOn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-b border-stroke-soft-200 last:border-b-0 hover:bg-bg-weak-50 transition-colors"
                >
                  <td className="py-3 text-paragraph-sm text-text-strong-950">
                    {t(`leave.types.${leave.leaveType}`)}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {format(new Date(leave.fromDate), "MMM dd, yyyy")}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {format(new Date(leave.toDate), "MMM dd, yyyy")}
                  </td>
                  <td className="max-w-50 truncate py-3 text-paragraph-sm text-text-sub-600">
                    {leave.reason}
                  </td>
                  <td className="py-3">
                    <Badge variant={LEAVE_STATUS_VARIANT[leave.status]}>
                      {t(`leave.statuses.${leave.status}`)}
                    </Badge>
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LeaveHistorySkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-28 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
