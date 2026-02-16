"use client";

import { useState } from "react";
import {
  RiGroupLine,
  RiTeamLine,
  RiCalendarCheckLine,
  RiMoneyDollarCircleLine,
  RiAlertLine,
  RiFileSearchLine,
  RiFileList3Line,
  RiUserAddLine,
  RiNotification3Line,
  RiBarChartBoxLine,
  RiRefreshLine,
} from "@remixicon/react";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useTenant from "@/services/tenant/use-tenant";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminDashboard } from "./queries/queries";
import {
  MetricCard,
  MetricCardSkeleton,
  CompactMetricCard,
  CompactMetricCardSkeleton,
} from "./components/metric-card";
import {
  EnrollmentTrendChart,
  EnrollmentTrendChartSkeleton,
} from "./components/enrollment-trend-chart";
import {
  FeeCollectionChart,
  FeeCollectionChartSkeleton,
} from "./components/fee-collection-chart";
import {
  AttendancePieChart,
  AttendancePieChartSkeleton,
} from "./components/attendance-pie-chart";
import {
  ClassDistributionChart,
  ClassDistributionChartSkeleton,
} from "./components/class-distribution-chart";
import {
  RecentActivity,
  RecentActivitySkeleton,
} from "./components/recent-activity";
import { QuickActions, QuickActionsSkeleton } from "./components/quick-actions";
import type { QuickAction } from "./components/quick-actions";
import {
  NotificationsPanel,
  NotificationsPanelSkeleton,
} from "./components/notifications-panel";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString();
}

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
      {/* Primary metrics skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Secondary metrics skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CompactMetricCardSkeleton />
        <CompactMetricCardSkeleton />
        <CompactMetricCardSkeleton />
        <CompactMetricCardSkeleton />
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EnrollmentTrendChartSkeleton />
        <FeeCollectionChartSkeleton />
        <AttendancePieChartSkeleton />
        <ClassDistributionChartSkeleton />
      </div>

      {/* Bottom section skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivitySkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <QuickActionsSkeleton />
          <NotificationsPanelSkeleton />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────

function AdminPanel() {
  const { t } = useTranslation("admin-panel-home");
  const { branches } = useTenant();
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, isError, refetch } =
    useAdminDashboard(selectedBranch);

  // Quick actions config
  const quickActions: QuickAction[] = [
    {
      icon: RiUserAddLine,
      label: t("quickActions.addStudent"),
      href: "/admin-panel/students/registrations",
    },
    {
      icon: RiTeamLine,
      label: t("quickActions.addStaff"),
      href: "/admin-panel/staff",
    },
    {
      icon: RiCalendarCheckLine,
      label: t("quickActions.markAttendance"),
      href: "/admin-panel/students/attendance",
    },
    {
      icon: RiMoneyDollarCircleLine,
      label: t("quickActions.collectFees"),
      href: "/admin-panel/students/fees",
    },
    {
      icon: RiNotification3Line,
      label: t("quickActions.createNotice"),
      href: "/admin-panel/notices",
    },
    {
      icon: RiBarChartBoxLine,
      label: t("quickActions.viewReports"),
      href: "/admin-panel/accounts/reports",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {t("welcome")} 👋
          </h1>
          <p className="text-paragraph-sm text-text-sub-600">{t("overview")}</p>
        </div>

        {/* Branch filter — only show for multi-branch tenants */}
        {branches.length > 1 && (
          <Select
            value={selectedBranch ?? "all"}
            onValueChange={(value) =>
              setSelectedBranch(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("branchFilter.label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("branchFilter.all")}</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

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
          {/* ── Primary Metrics ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={RiGroupLine}
              title={t("metrics.totalStudents")}
              value={data.metrics.totalStudents.toLocaleString()}
              trend={data.metrics.studentsTrend}
              trendLabel={t("metrics.vsLastMonth")}
              href="/admin-panel/students/registrations"
              linkLabel={t("metrics.viewStudents")}
            />
            <MetricCard
              icon={RiTeamLine}
              iconClassName="bg-success-alpha-10 text-success-base"
              title={t("metrics.totalStaff")}
              value={data.metrics.totalStaff.toLocaleString()}
              trend={data.metrics.staffTrend}
              trendLabel={t("metrics.vsLastMonth")}
              href="/admin-panel/staff"
              linkLabel={t("metrics.viewStaff")}
            />
            <MetricCard
              icon={RiCalendarCheckLine}
              iconClassName="bg-warning-alpha-10 text-warning-base"
              title={t("metrics.attendanceToday")}
              value={`${data.metrics.attendanceToday}%`}
              trend={data.metrics.attendanceTrend}
              trendLabel={t("metrics.vsLastMonth")}
              href="/admin-panel/students/attendance"
              linkLabel={t("metrics.viewAttendance")}
            />
            <MetricCard
              icon={RiMoneyDollarCircleLine}
              iconClassName="bg-information-alpha-10 text-information-base"
              title={t("metrics.feeCollection")}
              value={`₨${formatCurrency(data.metrics.feeCollectionThisMonth)}`}
              trend={data.metrics.feeCollectionPercentage}
              subtitle={t("metrics.ofTarget", {
                target: `₨${formatCurrency(data.metrics.feeCollectionTarget)}`,
              })}
              href="/admin-panel/students/fees"
              linkLabel={t("metrics.viewFees")}
            />
          </div>

          {/* ── Secondary Metrics ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CompactMetricCard
              icon={RiMoneyDollarCircleLine}
              iconClassName="bg-error-alpha-10 text-error-base"
              title={t("metrics.pendingFees")}
              value={`₨${formatCurrency(data.metrics.pendingFeeAmount)}`}
              href="/admin-panel/students/fees"
              linkLabel={t("metrics.viewAll")}
            />
            <CompactMetricCard
              icon={RiFileList3Line}
              iconClassName="bg-information-alpha-10 text-information-base"
              title={t("metrics.upcomingExams")}
              value={data.metrics.upcomingExams}
              href="/admin-panel/students/exams"
              linkLabel={t("metrics.viewExams")}
            />
            <CompactMetricCard
              icon={RiFileSearchLine}
              iconClassName="bg-primary-alpha-10 text-primary-base"
              title={t("metrics.recentEnquiries")}
              value={data.metrics.recentEnquiries}
              href="/admin-panel/students/enquiries"
              linkLabel={t("metrics.viewEnquiries")}
            />
            <CompactMetricCard
              icon={RiAlertLine}
              iconClassName="bg-warning-alpha-10 text-warning-base"
              title={t("metrics.lowAttendanceAlerts")}
              value={data.metrics.lowAttendanceAlerts}
              href="/admin-panel/students/attendance"
              linkLabel={t("metrics.viewAlerts")}
            />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EnrollmentTrendChart
              data={data.enrollmentTrend}
              title={t("charts.enrollmentTrend")}
            />
            <FeeCollectionChart
              data={data.feeCollection}
              title={t("charts.feeCollection")}
              collectedLabel={t("charts.collectedLabel")}
              pendingLabel={t("charts.pendingLabel")}
            />
            <AttendancePieChart
              data={data.attendanceBreakdown}
              title={t("charts.attendanceBreakdown")}
              labels={{
                present: t("charts.present"),
                absent: t("charts.absent"),
                leave: t("charts.leave"),
                late: t("charts.late"),
              }}
            />
            <ClassDistributionChart
              data={data.classDistribution}
              title={t("charts.classDistribution")}
            />
          </div>

          {/* ── Bottom Section ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivity
                activities={data.recentActivity}
                title={t("recentActivity.title")}
                viewAllLabel={t("recentActivity.viewAll")}
                viewAllHref="/admin-panel/notices"
              />
            </div>
            <div className="flex flex-col gap-4">
              <QuickActions
                title={t("quickActions.title")}
                actions={quickActions}
              />
              <NotificationsPanel
                approvals={data.pendingApprovals}
                title={t("notifications.title")}
                emptyMessage={t("notifications.empty")}
                viewAllLabel={t("notifications.viewAll")}
                viewAllHref="/admin-panel/notices"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withPageRequiredAuth(AdminPanel, { roles: [RoleEnum.ADMIN] });
