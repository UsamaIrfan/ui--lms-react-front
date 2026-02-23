"use client";

import { useCallback, useRef, useState } from "react";
import { RiAlertLine, RiRefreshLine, RiDownloadLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";

import { useStudentExams } from "./queries/queries";
import {
  UpcomingExamsList,
  UpcomingExamsListSkeleton,
} from "./components/upcoming-exams-list";
import { ResultsList, ResultsListSkeleton } from "./components/results-list";
import {
  SubjectPerformanceChart,
  PerformanceTrendChart,
  PerformanceSummaryCards,
  PerformanceChartsSkeleton,
} from "./components/performance-charts";
import type { ExamsTab } from "./types";

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

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <UpcomingExamsListSkeleton />
      <ResultsListSkeleton />
      <PerformanceChartsSkeleton />
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab Button
// ─────────────────────────────────────────────

const TABS: ExamsTab[] = ["upcoming", "results"];

function TabButton({
  tab,
  activeTab,
  label,
  onClick,
}: {
  tab: ExamsTab;
  activeTab: ExamsTab;
  label: string;
  onClick: (tab: ExamsTab) => void;
}) {
  const isActive = tab === activeTab;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={`rounded-full px-4 py-2 text-label-sm transition-colors ${
        isActive
          ? "bg-primary-base text-static-white"
          : "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

function StudentExamsPage() {
  const { t } = useTranslation("student-portal-exams");
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ExamsTab>("upcoming");

  const { data, isLoading, isError, refetch } = useStudentExams();

  const handleTabChange = useCallback((tab: ExamsTab) => {
    setActiveTab(tab);
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!printRef.current) return;
    const { generatePdfFromElement } = await import("@/utils/pdf");
    await generatePdfFromElement(
      printRef.current,
      `${t("export.filename")}.pdf`
    );
  }, [t]);

  if (isLoading) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <PageError
        onRetry={() => refetch()}
        errorTitle={t("error")}
        retryLabel={t("tabs.upcoming")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6" ref={printRef}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
          <p className="text-paragraph-sm text-text-sub-600">
            {t("description")}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportPdf}>
          <RiDownloadLine className="mr-1.5 size-4" />
          {t("export.button")}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <TabButton
            key={tab}
            tab={tab}
            activeTab={activeTab}
            label={t(`tabs.${tab}`)}
            onClick={handleTabChange}
          />
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "upcoming" && (
        <UpcomingExamsList exams={data.upcomingExams} />
      )}

      {activeTab === "results" && (
        <>
          <PerformanceSummaryCards results={data.results} />
          <ResultsList results={data.results} studentId={data.studentId} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubjectPerformanceChart results={data.results} />
            <PerformanceTrendChart results={data.results} />
          </div>
        </>
      )}
    </div>
  );
}

export default withPageRequiredAuth(StudentExamsPage, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
