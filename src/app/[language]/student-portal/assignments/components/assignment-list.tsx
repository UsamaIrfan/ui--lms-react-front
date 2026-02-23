"use client";

import {
  RiTaskLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiStarLine,
  RiAlertLine,
} from "@remixicon/react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import type { AssignmentDetail, AssignmentStatus } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStatusIcon(status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return RiCheckboxCircleLine;
    case "graded":
      return RiStarLine;
    case "overdue":
      return RiAlertLine;
    default:
      return RiTimeLine;
  }
}

function getStatusVariant(status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return "success" as const;
    case "graded":
      return "default" as const;
    case "overdue":
      return "destructive" as const;
    default:
      return "warning" as const;
  }
}

function getStatusColors(status: AssignmentStatus) {
  switch (status) {
    case "submitted":
      return { bg: "bg-success-alpha-10", text: "text-success-base" };
    case "graded":
      return { bg: "bg-primary-alpha-10", text: "text-primary-base" };
    case "overdue":
      return { bg: "bg-error-alpha-10", text: "text-error-base" };
    default:
      return { bg: "bg-warning-alpha-10", text: "text-warning-base" };
  }
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────
// Assignment List
// ─────────────────────────────────────────────

interface AssignmentListProps {
  assignments: AssignmentDetail[];
  onSelect: (assignment: AssignmentDetail) => void;
  labels: {
    noAssignments: string;
    dueDate: string;
    dueIn: string;
    overdue: string;
    days: string;
    day: string;
    totalMarks: string;
    submit: string;
    viewSubmission: string;
    viewDetails: string;
  };
  statusLabels: Record<AssignmentStatus, string>;
}

export function AssignmentList({
  assignments,
  onSelect,
  labels,
  statusLabels,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <RiTaskLine className="size-12 text-text-soft-400" />
        <p className="text-paragraph-sm text-text-soft-400">
          {labels.noAssignments}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((assignment) => {
        const daysLeft = getDaysUntil(assignment.dueDate);
        const StatusIcon = getStatusIcon(assignment.status);
        const colors = getStatusColors(assignment.status);

        return (
          <button
            key={assignment.id}
            type="button"
            onClick={() => onSelect(assignment)}
            className="group flex w-full items-center justify-between gap-4 rounded-16 border border-stroke-soft-200 p-4 text-left transition-colors hover:border-primary-base hover:bg-bg-weak-50"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  colors.bg
                )}
              >
                <StatusIcon className={cn("size-5", colors.text)} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-strong-950 transition-colors group-hover:text-primary-base">
                  {assignment.title}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {assignment.subject}
                  </Badge>
                  <span className="text-paragraph-xs text-text-soft-400">
                    {labels.totalMarks}: {assignment.totalMarks}
                  </span>
                  <span
                    className={cn(
                      "text-paragraph-xs",
                      assignment.status === "overdue"
                        ? "text-error-base"
                        : daysLeft <= 2
                          ? "text-warning-base"
                          : "text-text-soft-400"
                    )}
                  >
                    {assignment.status === "overdue"
                      ? labels.overdue
                      : `${labels.dueIn} ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? labels.day : labels.days}`}
                  </span>
                </div>
                {assignment.submission?.marks !== null &&
                  assignment.submission?.marks !== undefined && (
                    <span className="text-paragraph-xs text-text-sub-600">
                      Marks: {assignment.submission.marks}/
                      {assignment.totalMarks}
                    </span>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(assignment.status)}>
                {statusLabels[assignment.status]}
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
