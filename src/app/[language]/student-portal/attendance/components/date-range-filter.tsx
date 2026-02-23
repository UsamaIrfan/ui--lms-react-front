"use client";

import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiFilterLine, RiCloseLine } from "@remixicon/react";
import type { AttendanceFilters, AttendanceStatus } from "../types";

const STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "half_day",
  "excused",
];

interface DateRangeFilterProps {
  filters: AttendanceFilters;
  onApply: (filters: AttendanceFilters) => void;
}

export function DateRangeFilter({ filters, onApply }: DateRangeFilterProps) {
  const { t } = useTranslation("student-portal-attendance");
  const [localFilters, setLocalFilters] = useState<AttendanceFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = () => {
    onApply(localFilters);
    setIsExpanded(false);
  };

  const handleReset = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const reset: AttendanceFilters = {
      startDate: startOfYear.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
      status: undefined,
    };
    setLocalFilters(reset);
    onApply(reset);
    setIsExpanded(false);
  };

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-label-lg text-text-strong-950">
          {t("filters.title")}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <RiCloseLine className="mr-1.5 size-4" />
          ) : (
            <RiFilterLine className="mr-1.5 size-4" />
          )}
          {isExpanded ? t("filters.reset") : t("filters.title")}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-label-sm text-text-sub-600">
              {t("filters.startDate")}
            </Label>
            <Input
              type="date"
              value={localFilters.startDate}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-label-sm text-text-sub-600">
              {t("filters.endDate")}
            </Label>
            <Input
              type="date"
              value={localFilters.endDate}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-label-sm text-text-sub-600">
              {t("filters.status")}
            </Label>
            <select
              className="flex h-9 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 focus:border-primary-base focus:outline-none"
              value={localFilters.status ?? ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  status: (e.target.value || undefined) as
                    | AttendanceStatus
                    | undefined,
                }))
              }
            >
              <option value="">{t("filters.allStatuses")}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleApply} className="flex-1">
              {t("filters.apply")}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              {t("filters.reset")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
