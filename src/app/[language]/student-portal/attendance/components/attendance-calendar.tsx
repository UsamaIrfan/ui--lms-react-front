"use client";

import { useCallback, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  getDay,
  isSameMonth,
} from "date-fns";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

import { cn } from "@/utils/cn";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import type { AttendanceRecord, AttendanceStatus } from "../types";

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-success-base text-static-white",
  absent: "bg-error-base text-static-white",
  late: "bg-warning-base text-static-white",
  half_day: "bg-information-base text-static-white",
  excused: "bg-bg-soft-200 text-text-sub-600",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceCalendar({ records }: AttendanceCalendarProps) {
  const { t } = useTranslation("student-portal-attendance");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const record of records) {
      const dateKey = record.date.split("T")[0];
      if (dateKey) {
        map.set(dateKey, record.status);
      }
    }
    return map;
  }, [records]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-label-lg text-text-strong-950">
          {t("calendar.title")}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <RiArrowLeftSLine className="size-4" />
          </Button>
          <span className="min-w-35 text-center text-label-md text-text-strong-950">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <RiArrowRightSLine className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-label-xs text-text-sub-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const status = recordsByDate.get(dateKey);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={dateKey}
              className={cn(
                "flex aspect-square items-center justify-center rounded-8 text-label-sm transition-colors",
                isCurrentMonth
                  ? status
                    ? STATUS_COLORS[status]
                    : "text-text-sub-600 hover:bg-bg-weak-50"
                  : "text-text-disabled-300"
              )}
              title={status ? t(`status.${status}`) : undefined}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {(Object.entries(STATUS_COLORS) as [AttendanceStatus, string][]).map(
          ([status, colorClass]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("size-3 rounded-full", colorClass)} />
              <span className="text-paragraph-xs text-text-sub-600">
                {t(
                  `calendar.legend.${status === "half_day" ? "halfDay" : status}`
                )}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function AttendanceCalendarSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-8 w-40 animate-pulse rounded-8 bg-bg-weak-50" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-8 bg-bg-weak-50"
          />
        ))}
      </div>
    </div>
  );
}
