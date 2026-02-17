"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiCalendarCheckLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
} from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { StaffAttendanceSummary } from "../types";

// ─────────────────────────────────────────────
// Attendance Summary Card
// ─────────────────────────────────────────────

interface AttendanceSummaryCardProps {
  data: StaffAttendanceSummary;
  title: string;
  labels: {
    present: string;
    absent: string;
    late: string;
    total: string;
    checkIn: string;
    checkOut: string;
    leaveBalance: string;
    remaining: string;
    notCheckedIn: string;
    notCheckedOut: string;
  };
}

export function AttendanceSummaryCard({
  data,
  title,
  labels,
}: AttendanceSummaryCardProps) {
  const percentageColor =
    data.percentage >= 90
      ? "text-success-base"
      : data.percentage >= 75
        ? "text-warning-base"
        : "text-error-base";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiCalendarCheckLine className="h-4 w-4 text-primary-base" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Percentage circle */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4",
              data.percentage >= 90
                ? "border-success-base"
                : data.percentage >= 75
                  ? "border-warning-base"
                  : "border-error-base"
            )}
          >
            <span className={cn("text-title-h5 font-bold", percentageColor)}>
              {data.percentage.toFixed(0)}%
            </span>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-label-sm text-success-base">
                {data.presentDays}
              </p>
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.present}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-error-base">{data.absentDays}</p>
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.absent}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-warning-base">{data.lateDays}</p>
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.late}
              </p>
            </div>
          </div>
        </div>

        {/* Today's check-in/out */}
        <div className="flex gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2">
            <RiLoginBoxLine className="h-4 w-4 text-success-base" />
            <div>
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.checkIn}
              </p>
              <p className="text-label-sm text-text-strong-950">
                {data.todayCheckIn ?? labels.notCheckedIn}
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2">
            <RiLogoutBoxLine className="h-4 w-4 text-error-base" />
            <div>
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.checkOut}
              </p>
              <p className="text-label-sm text-text-strong-950">
                {data.todayCheckOut ?? labels.notCheckedOut}
              </p>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        {data.leaveBalance.length > 0 && (
          <div>
            <p className="mb-2 text-label-xs text-text-sub-600">
              {labels.leaveBalance}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.leaveBalance.map((lb) => (
                <Badge key={lb.type} variant="outline" className="gap-1.5">
                  {lb.type}:{" "}
                  <span className="font-semibold text-primary-base">
                    {lb.remaining}
                  </span>
                  /{lb.total} {labels.remaining}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Today status */}
        {data.todayStatus && (
          <div className="flex items-center gap-2">
            {data.todayStatus === "present" && (
              <>
                <RiCheckLine className="h-4 w-4 text-success-base" />
                <span className="text-label-xs text-success-base">
                  {labels.present}
                </span>
              </>
            )}
            {data.todayStatus === "absent" && (
              <>
                <RiCloseLine className="h-4 w-4 text-error-base" />
                <span className="text-label-xs text-error-base">
                  {labels.absent}
                </span>
              </>
            )}
            {data.todayStatus === "late" && (
              <>
                <RiTimeLine className="h-4 w-4 text-warning-base" />
                <span className="text-label-xs text-warning-base">
                  {labels.late}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Attendance Summary Card Skeleton
// ─────────────────────────────────────────────

export function AttendanceSummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="grid flex-1 grid-cols-3 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}
