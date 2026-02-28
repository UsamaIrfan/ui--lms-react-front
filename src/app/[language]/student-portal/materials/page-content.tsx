"use client";

import { useState } from "react";
import { RiAlertLine, RiRefreshLine, RiUserLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useStudentEnrollment } from "../hooks/use-student-enrollment";
import { useMaterials } from "./queries/queries";
import { MaterialList } from "./components/material-list";
import { MaterialFilterBar } from "./components/material-filter-bar";
import type { MaterialFilters, MaterialType } from "./types";

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

function MaterialsPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-10" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
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

function MaterialsPageContent() {
  const { t } = useTranslation("student-portal-materials");
  const [filters, setFilters] = useState<MaterialFilters>({});
  const { data: enrollment, isLoading: enrollmentLoading } =
    useStudentEnrollment();

  const {
    data: materials,
    isLoading,
    isError,
    refetch,
  } = useMaterials(filters, enrollment?.isEnrolled ?? false);

  const typeLabels: Record<MaterialType, string> = {
    document: t("types.document"),
    video: t("types.video"),
    presentation: t("types.presentation"),
    link: t("types.link"),
    assignment: t("types.assignment"),
  };

  // ── Loading ──
  if (isLoading || enrollmentLoading) {
    return (
      <div data-testid="student-materials-page" className="flex flex-col gap-6">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {t("description")}
          </p>
        </div>
        <MaterialsPageSkeleton />
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div data-testid="student-materials-page" className="flex flex-col gap-6">
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

  // ── Not enrolled ──
  if (!enrollment?.isEnrolled) {
    return (
      <div data-testid="student-materials-page" className="flex flex-col gap-6">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 py-16">
          <RiUserLine className="size-12 text-text-soft-400" />
          <p className="text-paragraph-sm text-text-soft-400">
            {t("error.notEnrolled")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="student-materials-page" className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-title-h4 text-text-strong-950">{t("pageTitle")}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          {t("description")}
        </p>
      </div>

      {/* Filters */}
      <MaterialFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        labels={{
          all: t("filters.all"),
          document: t("filters.document"),
          video: t("filters.video"),
          presentation: t("filters.presentation"),
          link: t("filters.link"),
          search: t("filters.search"),
        }}
      />

      {/* Material List */}
      <Card>
        <CardContent className="p-4">
          <MaterialList
            materials={materials ?? []}
            labels={{
              noMaterials:
                filters.type || filters.search
                  ? t("list.noResults")
                  : t("list.noMaterials"),
              download: t("list.download"),
              viewLink: t("list.viewLink"),
              uploadedOn: t("list.uploadedOn"),
              downloads: t("list.downloads"),
              version: t("list.version"),
              size: t("list.size"),
            }}
            typeLabels={typeLabels}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(MaterialsPageContent, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
