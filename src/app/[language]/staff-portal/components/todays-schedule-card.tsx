"use client";

import { RiTimeLine, RiMapPinLine } from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { TodayScheduleEntry } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h ?? "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

// ─────────────────────────────────────────────
// Today's Schedule Card
// ─────────────────────────────────────────────

interface TodaysScheduleCardProps {
  entries: TodayScheduleEntry[];
  title: string;
  labels: {
    noClasses: string;
    current: string;
    next: string;
    room: string;
    markAttendance: string;
  };
}

export function TodaysScheduleCard({
  entries,
  title,
  labels,
}: TodaysScheduleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiTimeLine className="h-4 w-4 text-primary-base" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-paragraph-sm text-text-sub-600">
            {labels.noClasses}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  entry.isCurrent &&
                    "bg-primary-alpha-10 ring-1 ring-primary-base",
                  entry.isNext && "bg-warning-alpha-10",
                  !entry.isCurrent && !entry.isNext && "hover:bg-bg-weak-50"
                )}
              >
                {/* Time column */}
                <div className="flex w-20 shrink-0 flex-col items-center">
                  <span className="text-label-xs text-text-strong-950">
                    {formatTime(entry.startTime)}
                  </span>
                  <span className="text-paragraph-xs text-text-sub-600">
                    {formatTime(entry.endTime)}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-10 w-0.5 shrink-0 rounded-full",
                    entry.isCurrent
                      ? "bg-primary-base"
                      : entry.isNext
                        ? "bg-warning-base"
                        : "bg-stroke-soft-200"
                  )}
                />

                {/* Details */}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-label-sm text-text-strong-950">
                    {entry.subject}
                  </span>
                  <span className="text-paragraph-xs text-text-sub-600">
                    {entry.className} - {entry.section}
                    {entry.room && (
                      <>
                        {" "}
                        · <RiMapPinLine className="inline h-3 w-3" />{" "}
                        {entry.room}
                      </>
                    )}
                  </span>
                </div>

                {/* Status badge */}
                {entry.isCurrent && (
                  <Badge className="bg-primary-base text-static-white text-label-xs">
                    {labels.current}
                  </Badge>
                )}
                {entry.isNext && (
                  <Badge className="bg-warning-base text-static-white text-label-xs">
                    {labels.next}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Today's Schedule Card Skeleton
// ─────────────────────────────────────────────

export function TodaysScheduleCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-0.5" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
