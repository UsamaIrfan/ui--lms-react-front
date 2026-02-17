"use client";

import {
  RiTaskLine,
  RiArrowRightSLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiStarLine,
} from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import { cn } from "@/utils/cn";
import type { AssignmentItem } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStatusIcon(status: AssignmentItem["status"]) {
  switch (status) {
    case "submitted":
      return RiCheckboxCircleLine;
    case "graded":
      return RiStarLine;
    default:
      return RiTimeLine;
  }
}

function getStatusVariant(status: AssignmentItem["status"]) {
  switch (status) {
    case "submitted":
      return "success" as const;
    case "graded":
      return "default" as const;
    default:
      return "warning" as const;
  }
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────
// Assignments Section
// ─────────────────────────────────────────────

interface AssignmentsSectionProps {
  assignments: AssignmentItem[];
  title: string;
  labels: {
    noAssignments: string;
    viewAll: string;
    submit: string;
    submitted: string;
    graded: string;
    pending: string;
    dueIn: string;
    overdue: string;
    days: string;
    day: string;
  };
}

export function AssignmentsSection({
  assignments,
  title,
  labels,
}: AssignmentsSectionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-warning-alpha-10">
              <RiTaskLine className="h-4 w-4 text-warning-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Link href="/student-portal/assignments">
            <Button variant="ghost" size="sm" className="gap-1">
              {labels.viewAll}
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <RiTaskLine className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noAssignments}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {assignments.map((assignment) => {
              const daysLeft = getDaysUntil(assignment.dueDate);
              const StatusIcon = getStatusIcon(assignment.status);
              const statusLabel =
                assignment.status === "submitted"
                  ? labels.submitted
                  : assignment.status === "graded"
                    ? labels.graded
                    : labels.pending;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 rounded-10 border border-stroke-soft-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        assignment.status === "submitted"
                          ? "bg-success-alpha-10"
                          : assignment.status === "graded"
                            ? "bg-primary-alpha-10"
                            : "bg-warning-alpha-10"
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          "h-4 w-4",
                          assignment.status === "submitted"
                            ? "text-success-base"
                            : assignment.status === "graded"
                              ? "text-primary-base"
                              : "text-warning-base"
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-label-sm text-text-strong-950">
                        {assignment.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {assignment.subject}
                        </Badge>
                        <span
                          className={cn(
                            "text-paragraph-xs",
                            daysLeft < 0
                              ? "text-error-base"
                              : daysLeft <= 2
                                ? "text-warning-base"
                                : "text-text-soft-400"
                          )}
                        >
                          {daysLeft < 0
                            ? labels.overdue
                            : `${labels.dueIn} ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? labels.day : labels.days}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(assignment.status)}>
                      {statusLabel}
                    </Badge>
                    {assignment.status === "not_submitted" && (
                      <Link
                        href={`/student-portal/assignments/${assignment.id}`}
                      >
                        <Button size="sm" variant="outline">
                          {labels.submit}
                        </Button>
                      </Link>
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

export function AssignmentsSectionSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-18 w-full rounded-10" />
        <Skeleton className="h-18 w-full rounded-10" />
        <Skeleton className="h-18 w-full rounded-10" />
      </div>
    </Card>
  );
}
