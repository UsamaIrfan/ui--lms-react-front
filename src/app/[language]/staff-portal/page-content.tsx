"use client";

import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";

import { useStaffDashboard } from "./queries/queries";
import {
  WelcomeSection,
  WelcomeSectionSkeleton,
} from "./components/welcome-section";
import {
  TodaysScheduleCard,
  TodaysScheduleCardSkeleton,
} from "./components/todays-schedule-card";
import {
  AttendanceSummaryCard,
  AttendanceSummaryCardSkeleton,
} from "./components/attendance-summary-card";
import {
  ClassesAssignedCard,
  ClassesAssignedCardSkeleton,
} from "./components/classes-assigned-card";
import {
  PendingTasksCard,
  PendingTasksCardSkeleton,
} from "./components/pending-tasks-card";
import {
  SalarySlipCard,
  SalarySlipCardSkeleton,
} from "./components/salary-slip-card";
import {
  NoticesSection,
  NoticesSectionSkeleton,
} from "./components/notices-section";
import {
  QuickActionsSection,
  QuickActionsSectionSkeleton,
} from "./components/quick-actions-section";

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

      <QuickActionsSectionSkeleton />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodaysScheduleCardSkeleton />
        <AttendanceSummaryCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ClassesAssignedCardSkeleton />
        <PendingTasksCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalarySlipCardSkeleton />
        <NoticesSectionSkeleton />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────

function StaffPortal() {
  const { t } = useTranslation("staff-portal-dashboard");
  const { data, isLoading, isError, refetch } = useStaffDashboard();

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
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
              staffId: t("welcome.staffId"),
              role: t("welcome.role"),
              department: t("welcome.department"),
              branch: t("welcome.branch"),
              branches: t("welcome.branches"),
            }}
          />

          {/* ── Quick Actions ── */}
          <QuickActionsSection
            title={t("quickActions.title")}
            labels={{
              markAttendance: t("quickActions.markAttendance"),
              applyLeave: t("quickActions.applyLeave"),
              viewTimetable: t("quickActions.viewTimetable"),
              uploadMaterial: t("quickActions.uploadMaterial"),
              enterMarks: t("quickActions.enterMarks"),
              viewSchedule: t("quickActions.viewSchedule"),
            }}
          />

          {/* ── Schedule & Attendance ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TodaysScheduleCard
              entries={data.todaySchedule}
              title={t("schedule.title")}
              labels={{
                noClasses: t("schedule.noClasses"),
                current: t("schedule.current"),
                next: t("schedule.next"),
                room: t("schedule.room"),
                markAttendance: t("schedule.markAttendance"),
              }}
            />
            <AttendanceSummaryCard
              data={data.attendance}
              title={t("attendance.title")}
              labels={{
                present: t("attendance.present"),
                absent: t("attendance.absent"),
                late: t("attendance.late"),
                total: t("attendance.total"),
                checkIn: t("attendance.checkIn"),
                checkOut: t("attendance.checkOut"),
                leaveBalance: t("attendance.leaveBalance"),
                remaining: t("attendance.remaining"),
                notCheckedIn: t("attendance.notCheckedIn"),
                notCheckedOut: t("attendance.notCheckedOut"),
              }}
            />
          </div>

          {/* ── Classes & Tasks ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ClassesAssignedCard
              classes={data.assignedClasses}
              title={t("classes.title")}
              labels={{
                noClasses: t("classes.noClasses"),
                students: t("classes.students"),
              }}
            />
            <PendingTasksCard
              tasks={data.pendingTasks}
              title={t("tasks.title")}
              labels={{
                noTasks: t("tasks.noTasks"),
                viewAll: t("tasks.viewAll"),
              }}
            />
          </div>

          {/* ── Salary & Notices ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SalarySlipCard
              slip={data.latestSalarySlip}
              title={t("salary.title")}
              labels={{
                noSlip: t("salary.noSlip"),
                month: t("salary.month"),
                netPay: t("salary.netPay"),
                earnings: t("salary.earnings"),
                deductions: t("salary.deductions"),
                status: t("salary.status"),
                download: t("salary.download"),
                paid: t("salary.paid"),
                pending: t("salary.pending"),
                draft: t("salary.draft"),
              }}
            />
            <NoticesSection
              notices={data.notices}
              title={t("notices.title")}
              labels={{
                noNotices: t("notices.noNotices"),
                viewAll: t("notices.viewAll"),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withPageRequiredAuth(StaffPortal, {
  roles: [RoleEnum.TEACHER, RoleEnum.STAFF],
});
