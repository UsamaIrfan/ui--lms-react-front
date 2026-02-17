"use client";

import {
  RiAlertLine,
  RiFileEditLine,
  RiCalendarCheckLine,
  RiUserFollowLine,
} from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import { cn } from "@/utils/cn";
import type { PendingTask } from "../types";

// ─────────────────────────────────────────────
// Pending Tasks Card
// ─────────────────────────────────────────────

const TASK_CONFIG: Record<
  string,
  { icon: typeof RiFileEditLine; color: string }
> = {
  marks_entry: { icon: RiFileEditLine, color: "text-warning-base" },
  attendance: { icon: RiCalendarCheckLine, color: "text-primary-base" },
  leave_approval: { icon: RiUserFollowLine, color: "text-information-base" },
};

interface PendingTasksCardProps {
  tasks: PendingTask[];
  title: string;
  labels: {
    noTasks: string;
    viewAll: string;
  };
}

export function PendingTasksCard({
  tasks,
  title,
  labels,
}: PendingTasksCardProps) {
  const totalCount = tasks.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiAlertLine className="h-4 w-4 text-warning-base" />
          {title}
          {totalCount > 0 && (
            <Badge className="ml-auto bg-warning-base text-static-white text-label-xs">
              {totalCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {tasks.length === 0 || totalCount === 0 ? (
          <p className="py-6 text-center text-paragraph-sm text-text-sub-600">
            {labels.noTasks}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {tasks
              .filter((t) => t.count > 0)
              .map((task) => {
                const config = TASK_CONFIG[task.type] ?? {
                  icon: RiAlertLine,
                  color: "text-text-sub-600",
                };
                const Icon = config.icon;

                return (
                  <Link
                    key={task.type}
                    href={task.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg-weak-50"
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
                    <span className="flex-1 text-label-sm text-text-strong-950">
                      {task.label}
                    </span>
                    <Badge variant="outline" className="text-label-xs">
                      {task.count}
                    </Badge>
                  </Link>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Pending Tasks Card Skeleton
// ─────────────────────────────────────────────

export function PendingTasksCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
