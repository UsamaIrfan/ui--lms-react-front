"use client";

import { RiCalendarLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { TimetableEntry } from "../types";

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
// Timetable Widget
// ─────────────────────────────────────────────

interface TimetableWidgetProps {
  entries: TimetableEntry[];
  title: string;
  labels: {
    noClasses: string;
    current: string;
    next: string;
    room: string;
  };
}

export function TimetableWidget({
  entries,
  title,
  labels,
}: TimetableWidgetProps) {
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long" });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-success-alpha-10">
              <RiCalendarLine className="h-4 w-4 text-success-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <span className="text-label-xs text-text-soft-400">{today}</span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <RiCalendarLine className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noClasses}
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-0">
            {/* Timeline line */}
            <div className="absolute bottom-3 left-[11px] top-3 w-px bg-stroke-soft-200" />

            {entries.map((entry) => {
              const isBreak =
                entry.subject.toLowerCase() === "break" ||
                entry.subject.toLowerCase() === "lunch";

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "relative flex items-start gap-4 py-2.5 pl-7",
                    entry.isCurrent && "rounded-10 bg-primary-alpha-10",
                    entry.isNext && "rounded-10 bg-bg-weak-50"
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-1.5 top-4 h-2.5 w-2.5 rounded-full border-2",
                      entry.isCurrent
                        ? "border-primary-base bg-primary-base"
                        : entry.isNext
                          ? "border-primary-base bg-static-white"
                          : isBreak
                            ? "border-stroke-soft-200 bg-bg-weak-50"
                            : "border-stroke-soft-200 bg-static-white"
                    )}
                  />

                  {/* Time */}
                  <div className="flex w-20 shrink-0 flex-col">
                    <span
                      className={cn(
                        "text-label-xs",
                        entry.isCurrent
                          ? "text-primary-base"
                          : "text-text-sub-600"
                      )}
                    >
                      {formatTime(entry.startTime)}
                    </span>
                    <span className="text-paragraph-xs text-text-soft-400">
                      {formatTime(entry.endTime)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-label-sm",
                          entry.isCurrent
                            ? "text-primary-base"
                            : isBreak
                              ? "text-text-soft-400 italic"
                              : "text-text-strong-950"
                        )}
                      >
                        {entry.subject}
                      </span>
                      {entry.isCurrent && (
                        <span className="flex items-center gap-1 rounded-full bg-primary-base px-2 py-0.5 text-[9px] font-medium text-static-white">
                          <RiTimeLine className="h-2.5 w-2.5" />
                          {labels.current}
                        </span>
                      )}
                      {entry.isNext && (
                        <span className="rounded-full border border-primary-base px-2 py-0.5 text-[9px] font-medium text-primary-base">
                          {labels.next}
                        </span>
                      )}
                    </div>
                    {!isBreak && (
                      <div className="flex items-center gap-3 text-text-soft-400">
                        {entry.teacher && (
                          <span className="text-paragraph-xs">
                            {entry.teacher}
                          </span>
                        )}
                        {entry.room && (
                          <span className="flex items-center gap-0.5 text-paragraph-xs">
                            <RiMapPinLine className="h-3 w-3" />
                            {entry.room}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function TimetableWidgetSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </Card>
  );
}
