"use client";

import {
  RiTrophyLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import { cn } from "@/utils/cn";
import type { RecentResult } from "../types";

// ─────────────────────────────────────────────
// Recent Results Card
// ─────────────────────────────────────────────

interface RecentResultsCardProps {
  result: RecentResult | null;
  title: string;
  labels: {
    noResults: string;
    overall: string;
    grade: string;
    rank: string;
    subject: string;
    marks: string;
    viewAll: string;
  };
}

function getGradeColor(percentage: number): string {
  if (percentage >= 80) return "text-success-base";
  if (percentage >= 60) return "text-warning-base";
  return "text-error-base";
}

export function RecentResultsCard({
  result,
  title,
  labels,
}: RecentResultsCardProps) {
  if (!result) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-primary-alpha-10">
              <RiTrophyLine className="h-4 w-4 text-primary-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6">
            <RiTrophyLine className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noResults}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-primary-alpha-10">
              <RiTrophyLine className="h-4 w-4 text-primary-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Link href="/student-portal/results">
            <Button variant="ghost" size="sm" className="gap-1">
              {labels.viewAll}
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Exam name */}
        <p className="text-label-sm text-text-sub-600">{result.examName}</p>

        {/* Overall summary */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 px-4 py-2">
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.overall}
            </span>
            <span
              className={cn(
                "text-title-h4",
                getGradeColor(result.overallPercentage)
              )}
            >
              {result.overallPercentage}%
            </span>
          </div>
          {result.grade && (
            <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 px-4 py-2">
              <span className="text-paragraph-xs text-text-soft-400">
                {labels.grade}
              </span>
              <span className="text-title-h4 text-text-strong-950">
                {result.grade}
              </span>
            </div>
          )}
          {result.rank && (
            <div className="flex flex-col items-center gap-1 rounded-10 bg-bg-weak-50 px-4 py-2">
              <span className="text-paragraph-xs text-text-soft-400">
                {labels.rank}
              </span>
              <span className="text-title-h4 text-primary-base">
                #{result.rank}
              </span>
            </div>
          )}
        </div>

        {/* Subject-wise breakdown */}
        <div className="flex flex-col gap-2">
          {result.subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-paragraph-sm text-text-sub-600">
                {subject.subject}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-label-xs text-text-strong-950">
                  {subject.marksObtained}/{subject.totalMarks}
                </span>
                {subject.grade && (
                  <Badge
                    variant={
                      subject.percentage >= 80
                        ? "success"
                        : subject.percentage >= 60
                          ? "warning"
                          : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {subject.grade}
                  </Badge>
                )}
                <div
                  className={cn(
                    "flex items-center",
                    getGradeColor(subject.percentage)
                  )}
                >
                  {subject.percentage >= 70 ? (
                    <RiArrowUpSLine className="h-3 w-3" />
                  ) : (
                    <RiArrowDownSLine className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function RecentResultsCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-4">
        <Skeleton className="h-16 w-24 rounded-10" />
        <Skeleton className="h-16 w-20 rounded-10" />
        <Skeleton className="h-16 w-20 rounded-10" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </Card>
  );
}
