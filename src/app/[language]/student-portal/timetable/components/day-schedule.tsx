"use client";

import { RiCalendarLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";

import { cn } from "@/utils/cn";
import type { TimetablePeriod } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours ?? "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

// ─────────────────────────────────────────────
// Day Schedule
// ─────────────────────────────────────────────

interface DayScheduleProps {
  periods: TimetablePeriod[];
  labels: {
    noClasses: string;
    room: string;
    current: string;
    next: string;
  };
}

export function DaySchedule({ periods, labels }: DayScheduleProps) {
  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <RiCalendarLine className="size-12 text-text-soft-400" />
        <p className="text-paragraph-sm text-text-soft-400">
          {labels.noClasses}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Timeline line */}
      <div className="absolute bottom-3 left-[11px] top-3 w-px bg-stroke-soft-200" />

      {periods.map((period) => {
        const isBreak =
          period.subject.toLowerCase() === "break" ||
          period.subject.toLowerCase() === "lunch";

        return (
          <div
            key={period.id}
            className={cn(
              "relative flex items-start gap-4 py-3 pl-7",
              period.isCurrent && "rounded-10 bg-primary-alpha-10",
              period.isNext && "rounded-10 bg-bg-weak-50"
            )}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-1.5 top-4.5 size-2.5 rounded-full border-2",
                period.isCurrent
                  ? "border-primary-base bg-primary-base"
                  : period.isNext
                    ? "border-primary-base bg-static-white"
                    : isBreak
                      ? "border-stroke-soft-200 bg-bg-weak-50"
                      : "border-stroke-soft-200 bg-static-white"
              )}
            />

            {/* Time */}
            <div className="flex w-24 shrink-0 flex-col">
              <span
                className={cn(
                  "text-label-xs",
                  period.isCurrent ? "text-primary-base" : "text-text-sub-600"
                )}
              >
                {formatTime(period.startTime)}
              </span>
              <span className="text-paragraph-xs text-text-soft-400">
                {formatTime(period.endTime)}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-label-sm",
                    period.isCurrent
                      ? "text-primary-base"
                      : isBreak
                        ? "italic text-text-soft-400"
                        : "text-text-strong-950"
                  )}
                >
                  {period.subject}
                </span>
                {period.isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-primary-base px-2 py-0.5 text-[9px] font-medium text-static-white">
                    <RiTimeLine className="size-2.5" />
                    {labels.current}
                  </span>
                )}
                {period.isNext && (
                  <span className="rounded-full border border-primary-base px-2 py-0.5 text-[9px] font-medium text-primary-base">
                    {labels.next}
                  </span>
                )}
              </div>
              {!isBreak && (
                <div className="flex items-center gap-3 text-text-soft-400">
                  {period.teacher && (
                    <span className="text-paragraph-xs">{period.teacher}</span>
                  )}
                  {period.room && (
                    <span className="flex items-center gap-0.5 text-paragraph-xs">
                      <RiMapPinLine className="size-3" />
                      {labels.room}: {period.room}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
