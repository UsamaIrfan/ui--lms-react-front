"use client";

import { RiFileList3Line, RiTimeLine } from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpcomingExam } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatExamDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function getCountdownVariant(days: number) {
  if (days <= 3) return "destructive" as const;
  if (days <= 7) return "warning" as const;
  return "secondary" as const;
}

// ─────────────────────────────────────────────
// Upcoming Exams Card
// ─────────────────────────────────────────────

interface UpcomingExamsCardProps {
  exams: UpcomingExam[];
  title: string;
  labels: {
    noExams: string;
    daysLeft: string;
    day: string;
    days: string;
    tomorrow: string;
    today: string;
  };
}

export function UpcomingExamsCard({
  exams,
  title,
  labels,
}: UpcomingExamsCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-warning-alpha-10">
            <RiFileList3Line className="h-4 w-4 text-warning-base" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <RiFileList3Line className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noExams}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exams.map((exam) => {
              const daysLeft = getDaysUntil(exam.date);
              const countdownText =
                daysLeft === 0
                  ? labels.today
                  : daysLeft === 1
                    ? labels.tomorrow
                    : `${daysLeft} ${daysLeft === 1 ? labels.day : labels.days}`;

              return (
                <div
                  key={exam.id}
                  className="flex items-center justify-between gap-3 rounded-10 border border-stroke-soft-200 p-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-text-strong-950">
                      {exam.subject}
                    </span>
                    <div className="flex items-center gap-2 text-text-soft-400">
                      <RiTimeLine className="h-3 w-3" />
                      <span className="text-paragraph-xs">
                        {formatExamDate(exam.date)}
                        {exam.time ? ` • ${exam.time}` : ""}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getCountdownVariant(daysLeft)}>
                    {countdownText}
                  </Badge>
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

export function UpcomingExamsCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-10" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-10" />
        <Skeleton className="h-16 w-full rounded-10" />
        <Skeleton className="h-16 w-full rounded-10" />
      </div>
    </Card>
  );
}
