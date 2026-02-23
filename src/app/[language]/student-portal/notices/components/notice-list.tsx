"use client";

import {
  RiCircleFill,
  RiNotification3Line,
  RiAttachment2,
} from "@remixicon/react";

import { cn } from "@/utils/cn";
import type { NoticeDetail } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;

    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Notice List
// ─────────────────────────────────────────────

interface NoticeListProps {
  notices: NoticeDetail[];
  onSelect: (notice: NoticeDetail) => void;
  labels: {
    noNotices: string;
    publishedOn: string;
    attachments: string;
    attachment: string;
  };
}

export function NoticeList({ notices, onSelect, labels }: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <RiNotification3Line className="size-12 text-text-soft-400" />
        <p className="text-paragraph-sm text-text-soft-400">
          {labels.noNotices}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notices.map((notice) => (
        <button
          key={notice.id}
          type="button"
          onClick={() => onSelect(notice)}
          className="group flex w-full items-start gap-3 rounded-16 border border-stroke-soft-200 p-4 text-left transition-colors hover:border-primary-base hover:bg-bg-weak-50"
        >
          <div className="mt-1 shrink-0">
            {!notice.isRead ? (
              <RiCircleFill className="size-2.5 text-primary-base" />
            ) : (
              <div className="size-2.5" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span
              className={cn(
                "text-label-sm transition-colors group-hover:text-primary-base",
                notice.isRead ? "text-text-sub-600" : "text-text-strong-950"
              )}
            >
              {notice.title}
            </span>
            {notice.content && (
              <p className="line-clamp-2 text-paragraph-xs text-text-soft-400">
                {notice.content}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3">
              <span className="text-paragraph-xs text-text-soft-400">
                {getRelativeDate(notice.publishDate || notice.createdAt)}
              </span>
              {notice.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-paragraph-xs text-text-soft-400">
                  <RiAttachment2 className="size-3" />
                  {notice.attachments.length}{" "}
                  {notice.attachments.length === 1
                    ? labels.attachment
                    : labels.attachments}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
