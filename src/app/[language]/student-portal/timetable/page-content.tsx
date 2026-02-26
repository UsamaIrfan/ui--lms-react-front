"use client";

import { useMemo, useState } from "react";
import {
  RiAlertLine,
  RiRefreshLine,
  RiCalendarLine,
  RiUserLine,
} from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useStudentEnrollment } from "../hooks/use-student-enrollment";
import { useTimetable } from "./queries/queries";
import { DaySchedule } from "./components/day-schedule";
import { DaySelector } from "./components/day-selector";
import type { DayOfWeek, TimetablePeriod } from "./types";

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

function TimetablePageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-10" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-10" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────

function TimetablePageContent() {
  const { t } = useTranslation("student-portal-timetable");
  const { data: enrollment, isLoading: enrollmentLoading } =
    useStudentEnrollment();
  const { data, isLoading, isError, refetch } = useTimetable(
    enrollment?.isEnrolled ?? false
  );

  // Default to today, but only Mon–Sat; if Sunday, show Monday
  const todayDay = new Date().getDay() as DayOfWeek;
  const defaultDay: DayOfWeek = todayDay === 0 ? 1 : todayDay;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(defaultDay);

  // Group periods by day
  const periodsByDay = useMemo(() => {
    const grouped: Record<number, TimetablePeriod[]> = {};
    for (let d = 0; d <= 6; d++) {
      grouped[d] = [];
    }
    if (data?.periods) {
      for (const period of data.periods) {
        if (!grouped[period.dayOfWeek]) grouped[period.dayOfWeek] = [];
        grouped[period.dayOfWeek].push(period);
      }
      // Sort each day by startTime
      for (const key of Object.keys(grouped)) {
        grouped[Number(key)].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
      }
    }
    return grouped;
  }, [data?.periods]);

  const dayLabels: Record<string, string> = {
    monday: t("days.monday"),
    tuesday: t("days.tuesday"),
    wednesday: t("days.wednesday"),
    thursday: t("days.thursday"),
    friday: t("days.friday"),
    saturday: t("days.saturday"),
  };

  // ── Loading ──
  if (isLoading || enrollmentLoading) {
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
        <TimetablePageSkeleton />
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

  // ── Not enrolled ──
  if (!enrollment?.isEnrolled) {
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
        <div className="flex flex-col items-center gap-3 py-16">
          <RiUserLine className="size-12 text-text-soft-400" />
          <p className="text-paragraph-sm text-text-soft-400">
            {t("error.notEnrolled")}
          </p>
        </div>
      </div>
    );
  }

  // ── No timetable configured ──
  if (!data?.timetable) {
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
        <div className="flex flex-col items-center gap-3 py-16">
          <RiCalendarLine className="size-12 text-text-soft-400" />
          <p className="text-paragraph-sm text-text-soft-400">
            {t("error.noTimetable")}
          </p>
        </div>
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

      {/* Day Selector */}
      <DaySelector
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        periodsByDay={periodsByDay}
        dayLabels={dayLabels}
        todayLabel={t("labels.today")}
        periodsLabel={t("labels.periods")}
      />

      {/* Schedule */}
      <Card>
        <CardContent className="p-4">
          <DaySchedule
            periods={periodsByDay[selectedDay] ?? []}
            labels={{
              noClasses: t("period.noClasses"),
              room: t("period.room"),
              current: t("period.current"),
              next: t("period.next"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(TimetablePageContent, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
