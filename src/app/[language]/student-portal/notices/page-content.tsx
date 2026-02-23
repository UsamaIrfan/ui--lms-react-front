"use client";

import { useState, useMemo } from "react";
import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useNotices } from "./queries/queries";
import { NoticeList } from "./components/notice-list";
import { NoticeDetailDialog } from "./components/notice-detail-dialog";
import type { NoticeDetail, NoticeFilter } from "./types";

// ─────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────

function PageError({
  onRetry,
  errorTitle,
  retryLabel,
}: {
  onRetry: () => void;
  errorTitle: string;
  retryLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <RiAlertLine className="size-12 text-error-base" />
      <p className="text-label-md text-text-strong-950">{errorTitle}</p>
      <Button variant="outline" onClick={onRetry}>
        <RiRefreshLine className="mr-2 size-4" />
        {retryLabel}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function NoticesPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-10" />
        <Skeleton className="h-9 w-28 rounded-10" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-16" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

function NoticesPageContent() {
  const { t } = useTranslation("student-portal-notices");
  const { data: notices, isLoading, isError, refetch } = useNotices();

  const [filter, setFilter] = useState<NoticeFilter>("all");
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredNotices = useMemo(() => {
    if (!notices) return [];
    if (filter === "unread") return notices.filter((n) => !n.isRead);
    return notices;
  }, [notices, filter]);

  const unreadCount = useMemo(
    () => (notices ?? []).filter((n) => !n.isRead).length,
    [notices]
  );

  const handleSelect = (notice: NoticeDetail) => {
    setSelectedNotice(notice);
    setDialogOpen(true);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {t("description")}
          </p>
        </div>
        <NoticesPageSkeleton />
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
        </div>
        <PageError
          onRetry={() => refetch()}
          errorTitle={t("error.title")}
          retryLabel={t("error.retry")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-title-h4 text-text-strong-950">{t("pageTitle")}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          {t("description")}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t("filters.all")} ({notices?.length ?? 0})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          {t("filters.unread")} ({unreadCount})
        </Button>
      </div>

      {/* Notice List */}
      <Card>
        <CardContent className="p-4">
          <NoticeList
            notices={filteredNotices}
            onSelect={handleSelect}
            labels={{
              noNotices:
                filter === "unread" ? t("list.noUnread") : t("list.noNotices"),
              publishedOn: t("list.publishedOn"),
              attachments: t("list.attachments"),
              attachment: t("list.attachment"),
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <NoticeDetailDialog
        notice={selectedNotice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        labels={{
          title: t("detail.title"),
          close: t("detail.close"),
          publishedOn: t("detail.publishedOn"),
          expiresOn: t("detail.expiresOn"),
          attachments: t("detail.attachments"),
          downloadAttachment: t("detail.downloadAttachment"),
        }}
      />
    </div>
  );
}

export default withPageRequiredAuth(NoticesPageContent, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
