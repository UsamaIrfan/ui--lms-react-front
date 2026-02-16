"use client";

import {
  RiUserAddLine,
  RiMoneyDollarCircleLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiQuestionLine,
  RiMegaphoneLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "@/components/link";
import type { RecentActivityItem } from "../types";

// ─────────────────────────────────────────────
// Activity type config
// ─────────────────────────────────────────────

const activityConfig: Record<
  RecentActivityItem["type"],
  {
    icon: RemixiconComponentType;
    color: string;
    badgeVariant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "destructive";
  }
> = {
  registration: {
    icon: RiUserAddLine,
    color: "text-primary-base",
    badgeVariant: "default",
  },
  payment: {
    icon: RiMoneyDollarCircleLine,
    color: "text-success-base",
    badgeVariant: "success",
  },
  attendance: {
    icon: RiCalendarCheckLine,
    color: "text-information-base",
    badgeVariant: "secondary",
  },
  notice: {
    icon: RiMegaphoneLine,
    color: "text-warning-base",
    badgeVariant: "warning",
  },
  exam: {
    icon: RiFileTextLine,
    color: "text-purple-500",
    badgeVariant: "secondary",
  },
  enquiry: {
    icon: RiQuestionLine,
    color: "text-orange-500",
    badgeVariant: "secondary",
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────
// ActivityItem
// ─────────────────────────────────────────────

function ActivityItem({ activity }: { activity: RecentActivityItem }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 ${config.color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-paragraph-sm text-text-strong-950">
          {activity.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-paragraph-xs text-text-soft-400">
            {activity.user}
          </span>
          <span className="text-paragraph-xs text-text-soft-400">·</span>
          <span className="text-paragraph-xs text-text-soft-400">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
      </div>
      <Badge variant={config.badgeVariant} className="shrink-0 capitalize">
        {activity.type}
      </Badge>
    </div>
  );
}

// ─────────────────────────────────────────────
// RecentActivity
// ─────────────────────────────────────────────

interface RecentActivityProps {
  activities: RecentActivityItem[];
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
}

export function RecentActivity({
  activities,
  title,
  viewAllLabel,
  viewAllHref,
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Link
          href={viewAllHref}
          className="text-label-xs text-primary-base hover:text-primary-dark"
        >
          {viewAllLabel}
        </Link>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-stroke-soft-200">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 shrink-0 rounded" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
