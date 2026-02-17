"use client";

import {
  RiDashboardLine,
  RiCalendarCheckLine,
  RiCalendarEventLine,
  RiFileUploadLine,
  RiFileEditLine,
  RiTimeLine,
} from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";

// ─────────────────────────────────────────────
// Quick Actions Section
// ─────────────────────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  icon: typeof RiDashboardLine;
  href: string;
  color: string;
  bgColor: string;
}

interface QuickActionsSectionProps {
  title: string;
  labels: {
    markAttendance: string;
    applyLeave: string;
    viewTimetable: string;
    uploadMaterial: string;
    enterMarks: string;
    viewSchedule: string;
  };
}

export function QuickActionsSection({
  title,
  labels,
}: QuickActionsSectionProps) {
  const actions: QuickAction[] = [
    {
      id: "mark-attendance",
      label: labels.markAttendance,
      icon: RiCalendarCheckLine,
      href: "/admin-panel/attendance",
      color: "text-primary-base",
      bgColor: "bg-primary-alpha-10",
    },
    {
      id: "apply-leave",
      label: labels.applyLeave,
      icon: RiCalendarEventLine,
      href: "/admin-panel/staff/leaves",
      color: "text-information-base",
      bgColor: "bg-information-alpha-10",
    },
    {
      id: "view-timetable",
      label: labels.viewTimetable,
      icon: RiTimeLine,
      href: "/admin-panel/timetable",
      color: "text-success-base",
      bgColor: "bg-success-alpha-10",
    },
    {
      id: "upload-material",
      label: labels.uploadMaterial,
      icon: RiFileUploadLine,
      href: "/admin-panel/materials",
      color: "text-warning-base",
      bgColor: "bg-warning-alpha-10",
    },
    {
      id: "enter-marks",
      label: labels.enterMarks,
      icon: RiFileEditLine,
      href: "/admin-panel/exams",
      color: "text-error-base",
      bgColor: "bg-error-alpha-10",
    },
    {
      id: "view-schedule",
      label: labels.viewSchedule,
      icon: RiDashboardLine,
      href: "/staff-portal",
      color: "text-away-base",
      bgColor: "bg-away-alpha-10",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiDashboardLine className="h-4 w-4 text-primary-base" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-bg-weak-50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-center text-label-xs text-text-strong-950">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Quick Actions Skeleton
// ─────────────────────────────────────────────

export function QuickActionsSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-lg p-3"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
