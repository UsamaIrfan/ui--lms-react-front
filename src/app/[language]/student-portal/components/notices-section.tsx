"use client";

import {
  RiNotification3Line,
  RiArrowRightSLine,
  RiCircleFill,
} from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import { cn } from "@/utils/cn";
import type { NoticeItem } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Notices Section
// ─────────────────────────────────────────────

interface NoticesSectionProps {
  notices: NoticeItem[];
  title: string;
  labels: {
    noNotices: string;
    viewAll: string;
  };
}

export function NoticesSection({
  notices,
  title,
  labels,
}: NoticesSectionProps) {
  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-10 bg-error-alpha-10">
              <RiNotification3Line className="h-4 w-4 text-error-base" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-base text-[9px] font-medium text-static-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Link href="/student-portal/notices">
            <Button variant="ghost" size="sm" className="gap-1">
              {labels.viewAll}
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {notices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <RiNotification3Line className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noNotices}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/student-portal/notices/${notice.id}`}
                className="group flex items-start gap-3 rounded-10 p-2.5 transition-colors hover:bg-bg-weak-50"
              >
                <div className="mt-1 shrink-0">
                  {!notice.isRead ? (
                    <RiCircleFill className="h-2.5 w-2.5 text-primary-base" />
                  ) : (
                    <div className="h-2.5 w-2.5" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-label-sm transition-colors group-hover:text-primary-base",
                      notice.isRead
                        ? "text-text-sub-600"
                        : "text-text-strong-950"
                    )}
                  >
                    {notice.title}
                  </span>
                  <span className="text-paragraph-xs text-text-soft-400">
                    {formatDate(notice.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function NoticesSectionSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}
