"use client";

import {
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiAlertLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PendingApproval } from "../types";

// ─────────────────────────────────────────────
// Approval type config
// ─────────────────────────────────────────────

const approvalConfig: Record<
  PendingApproval["type"],
  { icon: RemixiconComponentType; color: string }
> = {
  leave: { icon: RiTimeLine, color: "text-warning-base" },
  registration: { icon: RiCheckboxCircleLine, color: "text-primary-base" },
  payment: { icon: RiErrorWarningLine, color: "text-success-base" },
  document: { icon: RiAlertLine, color: "text-orange-500" },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────
// PendingApprovalItem
// ─────────────────────────────────────────────

function PendingApprovalItem({ approval }: { approval: PendingApproval }) {
  const config = approvalConfig[approval.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 ${config.color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-paragraph-sm text-text-strong-950">
          {approval.title}
        </p>
        <p className="text-paragraph-xs text-text-soft-400">
          {approval.requester} · {formatRelativeTime(approval.timestamp)}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NotificationsPanel
// ─────────────────────────────────────────────

interface NotificationsPanelProps {
  approvals: PendingApproval[];
  title: string;
  emptyMessage: string;
  viewAllLabel: string;
  viewAllHref: string;
}

export function NotificationsPanel({
  approvals,
  title,
  emptyMessage,
  viewAllLabel,
  viewAllHref,
}: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {approvals.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error-base px-1.5 text-label-xs text-static-white">
              {approvals.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href={viewAllHref}>{viewAllLabel}</a>
        </Button>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <p className="py-4 text-center text-paragraph-sm text-text-soft-400">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-y divide-stroke-soft-200">
            {approvals.map((approval) => (
              <PendingApprovalItem key={approval.id} approval={approval} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NotificationsPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 shrink-0 rounded" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
