"use client";

import {
  RiCalendarLine,
  RiTimeLine,
  RiAttachment2,
  RiDownloadLine,
} from "@remixicon/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { NoticeDetail } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatFullDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getAttachmentName(url: string): string {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1] ?? "attachment";
  } catch {
    return "attachment";
  }
}

// ─────────────────────────────────────────────
// Notice Detail Dialog
// ─────────────────────────────────────────────

interface NoticeDetailDialogProps {
  notice: NoticeDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: {
    title: string;
    close: string;
    publishedOn: string;
    expiresOn: string;
    attachments: string;
    downloadAttachment: string;
  };
}

export function NoticeDetailDialog({
  notice,
  open,
  onOpenChange,
  labels,
}: NoticeDetailDialogProps) {
  if (!notice) return null;

  const isExpired = notice.expiresAt
    ? new Date(notice.expiresAt) < new Date()
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-title-h5 text-text-strong-950">
            {notice.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {labels.title}
          </DialogDescription>
        </DialogHeader>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-soft-400">
            <RiCalendarLine className="size-3.5" />
            {labels.publishedOn}{" "}
            {formatFullDate(notice.publishDate || notice.createdAt)}
          </div>
          {notice.expiresAt && (
            <div className="flex items-center gap-1.5 text-paragraph-xs text-text-soft-400">
              <RiTimeLine className="size-3.5" />
              {labels.expiresOn} {formatFullDate(notice.expiresAt)}
              {isExpired && (
                <Badge variant="destructive" className="ml-1">
                  Expired
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-paragraph-sm text-text-sub-600">
            {notice.content}
          </div>
        </div>

        {/* Attachments */}
        {notice.attachments.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-label-xs text-text-sub-600">
                <RiAttachment2 className="size-3.5" />
                {labels.attachments} ({notice.attachments.length})
              </span>
              <div className="flex flex-col gap-1.5">
                {notice.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-10 border border-stroke-soft-200 px-3 py-2 text-paragraph-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50"
                  >
                    <RiDownloadLine className="size-3.5 shrink-0 text-primary-base" />
                    <span className="flex-1 truncate">
                      {getAttachmentName(url)}
                    </span>
                    <span className="text-paragraph-xs text-text-soft-400">
                      {labels.downloadAttachment}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{labels.close}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
