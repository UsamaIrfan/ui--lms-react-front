"use client";

import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";

import { useStudentDashboard } from "./queries/queries";
import {
  WelcomeSection,
  WelcomeSectionSkeleton,
} from "./components/welcome-section";
import {
  AttendanceCard,
  AttendanceCardSkeleton,
} from "./components/attendance-card";
import {
  FeeStatusCard,
  FeeStatusCardSkeleton,
} from "./components/fee-status-card";
import {
  UpcomingExamsCard,
  UpcomingExamsCardSkeleton,
} from "./components/upcoming-exams-card";
import {
  RecentResultsCard,
  RecentResultsCardSkeleton,
} from "./components/recent-results-card";
import {
  CourseMaterialsSection,
  CourseMaterialsSkeleton,
} from "./components/course-materials-section";
import {
  AssignmentsSection,
  AssignmentsSectionSkeleton,
} from "./components/assignments-section";
import {
  NoticesSection,
  NoticesSectionSkeleton,
} from "./components/notices-section";
import {
  TimetableWidget,
  TimetableWidgetSkeleton,
} from "./components/timetable-widget";

// ─────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────

function DashboardError({
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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-alpha-10">
        <RiAlertLine className="h-7 w-7 text-error-base" />
      </div>
      <p className="text-paragraph-md text-text-sub-600">{errorTitle}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RiRefreshLine className="mr-2 h-4 w-4" />
        {retryLabel}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeSectionSkeleton />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AttendanceCardSkeleton />
        <FeeStatusCardSkeleton />
        <UpcomingExamsCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentResultsCardSkeleton />
        <TimetableWidgetSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CourseMaterialsSkeleton />
        <AssignmentsSectionSkeleton />
      </div>

      <NoticesSectionSkeleton />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────

function StudentPortal() {
  const { t } = useTranslation("student-portal-dashboard");
  const { data, isLoading, isError, refetch } = useStudentDashboard();

  return (
    <div data-testid="student-dashboard" className="flex flex-col gap-6 p-4 lg:p-6">
      {/* ── Error State ── */}
      {isError && (
        <DashboardError
          onRetry={() => refetch()}
          errorTitle={t("error.title")}
          retryLabel={t("error.retry")}
        />
      )}

      {/* ── Loading State ── */}
      {isLoading && <DashboardSkeleton />}

      {/* ── Dashboard Content ── */}
      {data && !isError && (
        <div className="flex flex-col gap-6">
          {/* ── Welcome Section ── */}
          <WelcomeSection
            profile={data.profile}
            greeting={t("welcome.greeting")}
            labels={{
              studentId: t("welcome.studentId"),
              class: t("welcome.class"),
              section: t("welcome.section"),
              academicYear: t("welcome.academicYear"),
            }}
          />

          {/* ── Top Metrics Row ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AttendanceCard
              data={data.attendance}
              title={t("attendance.title")}
              labels={{
                present: t("attendance.present"),
                absent: t("attendance.absent"),
                late: t("attendance.late"),
                total: t("attendance.total"),
                monthlyTrend: t("attendance.monthlyTrend"),
              }}
            />
            <FeeStatusCard
              data={data.fees}
              title={t("fees.title")}
              labels={{
                totalFee: t("fees.totalFee"),
                paid: t("fees.paid"),
                pending: t("fees.pending"),
                nextDue: t("fees.nextDue"),
                recentPayments: t("fees.recentPayments"),
                payNow: t("fees.payNow"),
                viewAll: t("fees.viewAll"),
              }}
            />
            <UpcomingExamsCard
              exams={data.upcomingExams}
              title={t("exams.title")}
              labels={{
                noExams: t("exams.noExams"),
                daysLeft: t("exams.daysLeft"),
                day: t("exams.day"),
                days: t("exams.days"),
                tomorrow: t("exams.tomorrow"),
                today: t("exams.today"),
              }}
            />
          </div>

          {/* ── Results & Timetable ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentResultsCard
              result={data.recentResults}
              title={t("results.title")}
              labels={{
                noResults: t("results.noResults"),
                overall: t("results.overall"),
                grade: t("results.grade"),
                rank: t("results.rank"),
                subject: t("results.subject"),
                marks: t("results.marks"),
                viewAll: t("results.viewAll"),
              }}
            />
            <TimetableWidget
              entries={data.timetable}
              title={t("timetable.title")}
              labels={{
                noClasses: t("timetable.noClasses"),
                current: t("timetable.current"),
                next: t("timetable.next"),
                room: t("timetable.room"),
              }}
            />
          </div>

          {/* ── Materials & Assignments ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CourseMaterialsSection
              materials={data.materials}
              title={t("materials.title")}
              labels={{
                noMaterials: t("materials.noMaterials"),
                viewAll: t("materials.viewAll"),
                download: t("materials.download"),
              }}
            />
            <AssignmentsSection
              assignments={data.assignments}
              title={t("assignments.title")}
              labels={{
                noAssignments: t("assignments.noAssignments"),
                viewAll: t("assignments.viewAll"),
                submit: t("assignments.submit"),
                submitted: t("assignments.submitted"),
                graded: t("assignments.graded"),
                pending: t("assignments.pending"),
                dueIn: t("assignments.dueIn"),
                overdue: t("assignments.overdue"),
                days: t("assignments.days"),
                day: t("assignments.day"),
              }}
            />
          </div>

          {/* ── Notices ── */}
          <NoticesSection
            notices={data.notices}
            title={t("notices.title")}
            labels={{
              noNotices: t("notices.noNotices"),
              viewAll: t("notices.viewAll"),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default withPageRequiredAuth(StudentPortal, {
  roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
});
