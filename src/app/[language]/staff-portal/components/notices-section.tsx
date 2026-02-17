"use client";

import { RiMegaphoneLine, RiCircleFill } from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { NoticeItem } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiMegaphoneLine className="h-4 w-4 text-primary-base" />
          {title}
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error-base px-1.5 text-label-xs text-static-white">
              {unreadCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {notices.length === 0 ? (
          <p className="py-6 text-center text-paragraph-sm text-text-sub-600">
            {labels.noNotices}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg-weak-50",
                  !notice.isRead && "bg-primary-alpha-10"
                )}
              >
                {/* Unread indicator */}
                <div className="mt-1.5 shrink-0">
                  {!notice.isRead ? (
                    <RiCircleFill className="h-2 w-2 text-primary-base" />
                  ) : (
                    <div className="h-2 w-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-label-sm",
                      !notice.isRead
                        ? "text-text-strong-950"
                        : "text-text-sub-600"
                    )}
                  >
                    {notice.title}
                  </span>
                  {notice.content && (
                    <span className="line-clamp-1 text-paragraph-xs text-text-sub-600">
                      {notice.content}
                    </span>
                  )}
                </div>

                {/* Date */}
                <span className="shrink-0 text-paragraph-xs text-text-sub-600">
                  {formatDate(notice.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Notices Section Skeleton
// ─────────────────────────────────────────────

export function NoticesSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5">
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
