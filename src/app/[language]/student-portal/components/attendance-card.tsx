"use client";

import {
  RiCalendarCheckLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
} from "@remixicon/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { AttendanceSummary } from "../types";

// ─────────────────────────────────────────────
// Attendance Card
// ─────────────────────────────────────────────

interface AttendanceCardProps {
  data: AttendanceSummary;
  title: string;
  labels: {
    present: string;
    absent: string;
    late: string;
    total: string;
    monthlyTrend: string;
  };
}

function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return "text-success-base";
  if (percentage >= 75) return "text-warning-base";
  return "text-error-base";
}

function getAttendanceBg(percentage: number): string {
  if (percentage >= 90) return "bg-success-alpha-10";
  if (percentage >= 75) return "bg-warning-alpha-10";
  return "bg-error-alpha-10";
}

export function AttendanceCard({ data, title, labels }: AttendanceCardProps) {
  const progressPercentage = Math.min(data.percentage, 100);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-10",
              getAttendanceBg(data.percentage)
            )}
          >
            <RiCalendarCheckLine
              className={cn("h-4 w-4", getAttendanceColor(data.percentage))}
            />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Main percentage */}
        <div className="flex items-center gap-3">
          <span
            className={cn("text-title-h3", getAttendanceColor(data.percentage))}
          >
            {data.percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-weak-50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              data.percentage >= 90
                ? "bg-success-base"
                : data.percentage >= 75
                  ? "bg-warning-base"
                  : "bg-error-base"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 p-2">
            <RiCheckLine className="h-4 w-4 text-success-base" />
            <span className="text-label-sm text-text-strong-950">
              {data.presentDays}
            </span>
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.present}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 p-2">
            <RiCloseLine className="h-4 w-4 text-error-base" />
            <span className="text-label-sm text-text-strong-950">
              {data.absentDays}
            </span>
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.absent}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 p-2">
            <RiTimeLine className="h-4 w-4 text-warning-base" />
            <span className="text-label-sm text-text-strong-950">
              {data.lateDays}
            </span>
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.late}
            </span>
          </div>
        </div>

        {/* Monthly trend chart */}
        {data.monthlyBreakdown.length > 0 && (
          <div>
            <p className="mb-2 text-label-xs text-text-sub-600">
              {labels.monthlyTrend}
            </p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyBreakdown} barSize={16}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    formatter={(value) => [`${value}%`, ""]}
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "1px solid var(--color-stroke-soft-200)",
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function AttendanceCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-10" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-10" />
        <Skeleton className="h-16 rounded-10" />
        <Skeleton className="h-16 rounded-10" />
      </div>
      <Skeleton className="h-28 w-full" />
    </Card>
  );
}
