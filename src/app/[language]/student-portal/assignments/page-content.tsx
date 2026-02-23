"use client";

import { useState, useMemo } from "react";
import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

import { useAssignments } from "./queries/queries";
import { AssignmentList } from "./components/assignment-list";
import { AssignmentDetailDialog } from "./components/assignment-detail-dialog";
import type {
  AssignmentDetail,
  AssignmentTab,
  AssignmentStatus,
} from "./types";

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────

const TABS: AssignmentTab[] = ["all", "pending", "submitted", "graded"];

function filterByTab(
  assignments: AssignmentDetail[],
  tab: AssignmentTab
): AssignmentDetail[] {
  if (tab === "all") return assignments;

  const statusMap: Record<Exclude<AssignmentTab, "all">, AssignmentStatus[]> = {
    pending: ["not_submitted", "overdue"],
    submitted: ["submitted"],
    graded: ["graded"],
  };

  return assignments.filter((a) => statusMap[tab].includes(a.status));
}

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

function AssignmentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-10" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-16" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

function AssignmentsPageContent() {
  const { t } = useTranslation("student-portal-assignments");
  const [activeTab, setActiveTab] = useState<AssignmentTab>("all");
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: assignments, isLoading, isError, refetch } = useAssignments();

  const filteredAssignments = useMemo(
    () => filterByTab(assignments ?? [], activeTab),
    [assignments, activeTab]
  );

  const tabCounts = useMemo(() => {
    const all = assignments ?? [];
    return {
      all: all.length,
      pending: all.filter(
        (a) => a.status === "not_submitted" || a.status === "overdue"
      ).length,
      submitted: all.filter((a) => a.status === "submitted").length,
      graded: all.filter((a) => a.status === "graded").length,
    };
  }, [assignments]);

  const tabLabels: Record<AssignmentTab, string> = {
    all: t("tabs.all"),
    pending: t("tabs.pending"),
    submitted: t("tabs.submitted"),
    graded: t("tabs.graded"),
  };

  const statusLabels: Record<AssignmentStatus, string> = {
    not_submitted: t("status.pending"),
    submitted: t("status.submitted"),
    graded: t("status.graded"),
    overdue: t("status.overdue"),
  };

  const handleSelectAssignment = (assignment: AssignmentDetail) => {
    setSelectedAssignment(assignment);
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
        <AssignmentsPageSkeleton />
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={cn(
              activeTab !== tab &&
                "text-text-sub-600 hover:text-text-strong-950"
            )}
          >
            {tabLabels[tab]} ({tabCounts[tab]})
          </Button>
        ))}
      </div>

      {/* Assignment List */}
      <Card>
        <CardContent className="p-4">
          <AssignmentList
            assignments={filteredAssignments}
            onSelect={handleSelectAssignment}
            labels={{
              noAssignments:
                activeTab === "all"
                  ? t("list.noAssignments")
                  : t("list.noResults"),
              dueDate: t("list.dueDate"),
              dueIn: t("list.dueIn"),
              overdue: t("list.overdue"),
              days: t("list.days"),
              day: t("list.day"),
              totalMarks: t("list.totalMarks"),
              submit: t("list.submit"),
              viewSubmission: t("list.viewSubmission"),
              viewDetails: t("list.viewDetails"),
            }}
            statusLabels={statusLabels}
          />
        </CardContent>
      </Card>

      {/* Detail / Submit Dialog */}
      <AssignmentDetailDialog
        assignment={selectedAssignment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        labels={{
          title: t("detail.title"),
          description: t("detail.description"),
          dueDate: t("detail.dueDate"),
          totalMarks: t("detail.totalMarks"),
          subject: t("detail.subject"),
          close: t("detail.close"),
          submitAssignment: t("detail.submitAssignment"),
          file: t("submission.file"),
          fileHint: t("submission.fileHint"),
          remarks: t("submission.remarks"),
          remarksPlaceholder: t("submission.remarksPlaceholder"),
          submit: t("submission.submit"),
          submitting: t("submission.submitting"),
          success: t("submission.success"),
          error: t("submission.error"),
          dragDrop: t("submission.dragDrop"),
          maxSize: t("submission.maxSize"),
          removeFile: t("submission.removeFile"),
          yourSubmission: t("submission.yourSubmission"),
          submittedOn: t("submission.submittedOn"),
          marks: t("submission.marks"),
        }}
      />
    </div>
  );
}

export default withPageRequiredAuth(AssignmentsPageContent, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
