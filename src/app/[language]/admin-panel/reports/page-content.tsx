"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useMemo, useCallback } from "react";
import {
  useFinancialDashboardQuery,
  useProfitLossQuery,
  useBalanceSheetQuery,
  useCashFlowQuery,
  useAttendanceSummaryQuery,
  useAttendanceDetailedQuery,
  useAttendanceAlertsQuery,
  useFeeCollectionReportQuery,
  useFeePendingReportQuery,
  useFeeDefaultersReportQuery,
} from "./queries/queries";
import type {
  BranchFinancialDetail,
  BranchProfitLoss,
  CashFlowEntry,
  AttendanceDetailItem,
  AttendanceAlertItem,
  FeeCollectionItem,
  FeePendingItem,
  FeeDefaulterItem,
} from "./queries/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiPrinterLine } from "@remixicon/react";
import { useStudentsListQuery } from "../students/registrations/queries/queries";
import { useStaffListQuery } from "../staff/queries/queries";

type MainTab = "financial" | "studentAttendance" | "staffAttendance" | "fees";

// ── Progress bar component ──
function ProgressBar({
  value,
  max = 100,
  color = "bg-primary-base",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-weak-50">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Reports() {
  const { t } = useTranslation("admin-panel-reports");

  // ── Global state ──
  const [activeTab, setActiveTab] = useState<MainTab>("financial");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ── Financial sub-tabs ──
  const [finSubTab, setFinSubTab] = useState<
    "overview" | "profitLoss" | "balanceSheet" | "cashFlow"
  >("overview");

  // ── Attendance state ──
  const [attSubTab, setAttSubTab] = useState<"summary" | "detailed" | "alerts">(
    "summary"
  );
  const [attendableId, setAttendableId] = useState("");

  // ── Lookup queries for attendance dropdowns ──
  const { data: studentsList } = useStudentsListQuery();
  const { data: staffList } = useStaffListQuery();

  // ── Fee sub-tabs ──
  const [feeSubTab, setFeeSubTab] = useState<
    "collection" | "pending" | "defaulters"
  >("collection");

  const dateParams = useMemo(() => {
    const p: { startDate?: string; endDate?: string } = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [startDate, endDate]);

  // ── Financial queries ──
  const { data: dashboard, isLoading: dashLoading } =
    useFinancialDashboardQuery(
      activeTab === "financial" ? dateParams : undefined
    );
  const { data: profitLoss, isLoading: plLoading } = useProfitLossQuery(
    activeTab === "financial" && finSubTab === "profitLoss"
      ? dateParams
      : undefined
  );
  const { data: balanceSheet, isLoading: bsLoading } = useBalanceSheetQuery(
    activeTab === "financial" && finSubTab === "balanceSheet"
      ? dateParams
      : undefined
  );
  const { data: cashFlowData, isLoading: cfLoading } = useCashFlowQuery(
    activeTab === "financial" && finSubTab === "cashFlow"
      ? dateParams
      : undefined
  );

  // ── Attendance queries ──
  const attType =
    activeTab === "studentAttendance"
      ? ("student" as const)
      : ("staff" as const);
  const attIdNum = parseInt(attendableId, 10);
  const attEnabled =
    (activeTab === "studentAttendance" || activeTab === "staffAttendance") &&
    !isNaN(attIdNum) &&
    attIdNum > 0;

  const { data: attSummary, isLoading: attSumLoading } =
    useAttendanceSummaryQuery(
      {
        attendableType: attType,
        attendableId: attIdNum || 0,
        ...dateParams,
      },
      attEnabled && attSubTab === "summary"
    );

  const { data: attDetailed, isLoading: attDetLoading } =
    useAttendanceDetailedQuery(
      {
        attendableType: attType,
        attendableId: attIdNum || 0,
        ...dateParams,
      },
      attEnabled && attSubTab === "detailed"
    );

  const { data: attAlerts, isLoading: attAlertsLoading } =
    useAttendanceAlertsQuery(
      activeTab === "studentAttendance" || activeTab === "staffAttendance"
        ? { attendableType: attType, ...dateParams }
        : undefined
    );

  // ── Fee queries ──
  const { data: feeCollection, isLoading: feeColLoading } =
    useFeeCollectionReportQuery(activeTab === "fees" ? dateParams : undefined);
  const { data: feePending, isLoading: feePenLoading } =
    useFeePendingReportQuery();
  const { data: feeDefaulters, isLoading: feeDefLoading } =
    useFeeDefaultersReportQuery();

  // ── Print handler ──
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Tab styling ──
  const tabClass = (tab: string, current: string) =>
    `px-4 py-2 text-paragraph-sm font-medium rounded-md transition-colors ${
      current === tab
        ? "bg-primary-base text-static-white"
        : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"
    }`;

  const subTabClass = (tab: string, current: string) =>
    `px-3 py-1.5 text-label-sm font-medium rounded transition-colors ${
      current === tab
        ? "bg-bg-strong-950 text-static-white"
        : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"
    }`;

  // ── Badge variant helper ──
  const statusBadge = (status: string) => {
    const map: Record<
      string,
      "success" | "destructive" | "warning" | "default"
    > = {
      present: "success",
      absent: "destructive",
      late: "warning",
      half_day: "warning",
      excused: "default",
      paid: "success",
      pending: "warning",
      overdue: "destructive",
    };
    return map[status] ?? "default";
  };

  return (
    <div data-testid="admin-reports-page" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-reports:title")}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <RiPrinterLine className="mr-1.5 size-4" />
              {t("admin-panel-reports:actions.print")}
            </Button>
          </div>
        </div>

        {/* Date filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1">
            <Label className="text-label-sm">
              {t("admin-panel-reports:filters.startDate")}
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-44"
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-label-sm">
              {t("admin-panel-reports:filters.endDate")}
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-44"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            {t("admin-panel-reports:filters.clear")}
          </Button>
        </div>

        {/* Main tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              "financial",
              "studentAttendance",
              "staffAttendance",
              "fees",
            ] as MainTab[]
          ).map((tab) => (
            <button
              key={tab}
              className={tabClass(tab, activeTab)}
              onClick={() => setActiveTab(tab)}
            >
              {t(`admin-panel-reports:tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FINANCIAL TAB
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "financial" && (
          <div className="grid gap-4">
            {/* Sub-tabs */}
            <div className="flex gap-2">
              {(
                ["overview", "profitLoss", "balanceSheet", "cashFlow"] as const
              ).map((st) => (
                <button
                  key={st}
                  className={subTabClass(st, finSubTab)}
                  onClick={() => setFinSubTab(st)}
                >
                  {t(`admin-panel-reports:financial.subtabs.${st}`)}
                </button>
              ))}
            </div>

            {/* Overview */}
            {finSubTab === "overview" && (
              <>
                {dashLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Spinner size="md" />
                  </div>
                ) : dashboard ? (
                  <>
                    {/* Metric cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.totalIncome"
                        )}
                        value={dashboard.tenantSummary.totalIncome}
                        color="text-success-base"
                      />
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.totalExpense"
                        )}
                        value={dashboard.tenantSummary.totalExpense}
                        color="text-error-base"
                      />
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.profit"
                        )}
                        value={dashboard.tenantSummary.profit}
                        color={
                          dashboard.tenantSummary.profit >= 0
                            ? "text-success-base"
                            : "text-error-base"
                        }
                      />
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.profitMargin"
                        )}
                        value={`${dashboard.tenantSummary.profitMarginPercent.toFixed(1)}%`}
                        color="text-primary-base"
                        isText
                      />
                    </div>

                    {/* Branch breakdown */}
                    <div className="rounded-lg border border-stroke-soft-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t(
                                "admin-panel-reports:financial.table.branchName"
                              )}
                            </TableHead>
                            <TableHead>
                              {t("admin-panel-reports:financial.table.income")}
                            </TableHead>
                            <TableHead>
                              {t("admin-panel-reports:financial.table.expense")}
                            </TableHead>
                            <TableHead>
                              {t("admin-panel-reports:financial.table.profit")}
                            </TableHead>
                            <TableHead>
                              {t(
                                "admin-panel-reports:financial.table.profitMargin"
                              )}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboard.branchBreakdown.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-40 text-center text-paragraph-sm text-text-soft-400"
                              >
                                {t("admin-panel-reports:financial.table.empty")}
                              </TableCell>
                            </TableRow>
                          ) : (
                            dashboard.branchBreakdown.map(
                              (b: BranchFinancialDetail) => (
                                <TableRow key={b.branchId}>
                                  <TableCell className="font-medium text-paragraph-sm">
                                    {b.branchName}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-success-base">
                                    {b.income.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-error-base">
                                    {b.expense.toLocaleString()}
                                  </TableCell>
                                  <TableCell
                                    className={`text-paragraph-sm ${b.profit >= 0 ? "text-success-base" : "text-error-base"}`}
                                  >
                                    {b.profit.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm">
                                    {b.profitMarginPercent.toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    message={t("admin-panel-reports:financial.table.empty")}
                  />
                )}
              </>
            )}

            {/* Profit & Loss */}
            {finSubTab === "profitLoss" && (
              <>
                {plLoading ? (
                  <LoadingState />
                ) : profitLoss && profitLoss.length > 0 ? (
                  <div className="grid gap-4">
                    {profitLoss.map((branch: BranchProfitLoss) => (
                      <div
                        key={branch.branchId}
                        className="rounded-lg border border-stroke-soft-200 p-4"
                      >
                        <h4 className="mb-3 text-label-md font-semibold">
                          {branch.branchName}
                        </h4>
                        <div className="mb-4 grid grid-cols-3 gap-3">
                          <div className="rounded-md bg-bg-weak-50 p-3">
                            <p className="text-label-sm text-text-soft-400">
                              {t(
                                "admin-panel-reports:financial.metrics.totalIncome"
                              )}
                            </p>
                            <p className="text-label-md font-bold text-success-base">
                              {branch.totalIncome.toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-md bg-bg-weak-50 p-3">
                            <p className="text-label-sm text-text-soft-400">
                              {t(
                                "admin-panel-reports:financial.metrics.totalExpense"
                              )}
                            </p>
                            <p className="text-label-md font-bold text-error-base">
                              {branch.totalExpense.toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-md bg-bg-weak-50 p-3">
                            <p className="text-label-sm text-text-soft-400">
                              {t(
                                "admin-panel-reports:financial.metrics.profit"
                              )}
                            </p>
                            <p
                              className={`text-label-md font-bold ${branch.profit >= 0 ? "text-success-base" : "text-error-base"}`}
                            >
                              {branch.profit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {/* Cash flow table within P&L */}
                        {branch.cashFlow && branch.cashFlow.length > 0 && (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  {t(
                                    "admin-panel-reports:financial.table.period"
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "admin-panel-reports:financial.table.income"
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "admin-panel-reports:financial.table.expense"
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "admin-panel-reports:financial.table.netCashFlow"
                                  )}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {branch.cashFlow.map((cf: CashFlowEntry) => (
                                <TableRow key={cf.period}>
                                  <TableCell className="font-medium text-paragraph-sm">
                                    {cf.period}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-success-base">
                                    {cf.income.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-error-base">
                                    {cf.expense.toLocaleString()}
                                  </TableCell>
                                  <TableCell
                                    className={`text-paragraph-sm ${cf.netCashFlow >= 0 ? "text-success-base" : "text-error-base"}`}
                                  >
                                    {cf.netCashFlow.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    message={t("admin-panel-reports:financial.table.empty")}
                  />
                )}
              </>
            )}

            {/* Balance Sheet */}
            {finSubTab === "balanceSheet" && (
              <>
                {bsLoading ? (
                  <LoadingState />
                ) : balanceSheet ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.totalIncome"
                        )}
                        value={balanceSheet.totalIncome}
                        color="text-success-base"
                      />
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.metrics.totalExpense"
                        )}
                        value={balanceSheet.totalExpense}
                        color="text-error-base"
                      />
                      <MetricCard
                        label={t(
                          "admin-panel-reports:financial.table.netPosition"
                        )}
                        value={balanceSheet.netPosition}
                        color={
                          balanceSheet.netPosition >= 0
                            ? "text-success-base"
                            : "text-error-base"
                        }
                      />
                    </div>
                    <div className="rounded-lg border border-stroke-soft-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t(
                                "admin-panel-reports:financial.table.branchName"
                              )}
                            </TableHead>
                            <TableHead>
                              {t("admin-panel-reports:financial.table.income")}
                            </TableHead>
                            <TableHead>
                              {t("admin-panel-reports:financial.table.expense")}
                            </TableHead>
                            <TableHead>
                              {t(
                                "admin-panel-reports:financial.table.netPosition"
                              )}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {balanceSheet.entries.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-40 text-center text-paragraph-sm text-text-soft-400"
                              >
                                {t("admin-panel-reports:financial.table.empty")}
                              </TableCell>
                            </TableRow>
                          ) : (
                            balanceSheet.entries.map(
                              (entry: {
                                branchId: string;
                                branchName: string;
                                income: number;
                                expense: number;
                                netPosition: number;
                              }) => (
                                <TableRow key={entry.branchId}>
                                  <TableCell className="font-medium text-paragraph-sm">
                                    {entry.branchName}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-success-base">
                                    {entry.income.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-error-base">
                                    {entry.expense.toLocaleString()}
                                  </TableCell>
                                  <TableCell
                                    className={`text-paragraph-sm ${entry.netPosition >= 0 ? "text-success-base" : "text-error-base"}`}
                                  >
                                    {entry.netPosition.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    message={t("admin-panel-reports:financial.table.empty")}
                  />
                )}
              </>
            )}

            {/* Cash Flow */}
            {finSubTab === "cashFlow" && (
              <>
                {cfLoading ? (
                  <LoadingState />
                ) : cashFlowData && cashFlowData.length > 0 ? (
                  <div className="grid gap-4">
                    {cashFlowData.map((branch: BranchProfitLoss) => (
                      <div
                        key={branch.branchId}
                        className="rounded-lg border border-stroke-soft-200 p-4"
                      >
                        <h4 className="mb-3 text-label-md font-semibold">
                          {branch.branchName}
                        </h4>
                        {branch.cashFlow && branch.cashFlow.length > 0 ? (
                          <>
                            {/* Visual cash flow bars */}
                            <div className="mb-4 grid gap-2">
                              {branch.cashFlow.map((cf: CashFlowEntry) => (
                                <div key={cf.period} className="grid gap-1">
                                  <div className="flex justify-between text-label-sm">
                                    <span>{cf.period}</span>
                                    <span
                                      className={
                                        cf.netCashFlow >= 0
                                          ? "text-success-base"
                                          : "text-error-base"
                                      }
                                    >
                                      {cf.netCashFlow.toLocaleString()}
                                    </span>
                                  </div>
                                  <ProgressBar
                                    value={Math.abs(cf.netCashFlow)}
                                    max={Math.max(
                                      ...branch.cashFlow.map((c) =>
                                        Math.abs(c.netCashFlow)
                                      )
                                    )}
                                    color={
                                      cf.netCashFlow >= 0
                                        ? "bg-success-base"
                                        : "bg-error-base"
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>
                                    {t(
                                      "admin-panel-reports:financial.table.period"
                                    )}
                                  </TableHead>
                                  <TableHead>
                                    {t(
                                      "admin-panel-reports:financial.table.income"
                                    )}
                                  </TableHead>
                                  <TableHead>
                                    {t(
                                      "admin-panel-reports:financial.table.expense"
                                    )}
                                  </TableHead>
                                  <TableHead>
                                    {t(
                                      "admin-panel-reports:financial.table.netCashFlow"
                                    )}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {branch.cashFlow.map((cf: CashFlowEntry) => (
                                  <TableRow key={cf.period}>
                                    <TableCell className="font-medium text-paragraph-sm">
                                      {cf.period}
                                    </TableCell>
                                    <TableCell className="text-paragraph-sm text-success-base">
                                      {cf.income.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-paragraph-sm text-error-base">
                                      {cf.expense.toLocaleString()}
                                    </TableCell>
                                    <TableCell
                                      className={`text-paragraph-sm ${cf.netCashFlow >= 0 ? "text-success-base" : "text-error-base"}`}
                                    >
                                      {cf.netCashFlow.toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </>
                        ) : (
                          <p className="py-4 text-center text-paragraph-sm text-text-soft-400">
                            {t("admin-panel-reports:financial.table.empty")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    message={t("admin-panel-reports:financial.table.empty")}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            STUDENT / STAFF ATTENDANCE TAB
        ═══════════════════════════════════════════════════════════ */}
        {(activeTab === "studentAttendance" ||
          activeTab === "staffAttendance") && (
          <div className="grid gap-4">
            {/* Control bar */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid gap-1">
                <Label className="text-label-sm">
                  {activeTab === "studentAttendance"
                    ? t("admin-panel-reports:filters.student")
                    : t("admin-panel-reports:filters.staff")}{" "}
                  {t("admin-panel-reports:filters.attendableId")}
                </Label>
                <Select
                  value={attendableId}
                  onValueChange={(v) => setAttendableId(v)}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "studentAttendance"
                      ? (studentsList?.data ?? []).map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.firstName && s.lastName
                              ? `${s.firstName} ${s.lastName}`
                              : (s.rollNumber ?? `#${s.id}`)}
                          </SelectItem>
                        ))
                      : (staffList ?? []).map((st) => (
                          <SelectItem key={st.id} value={String(st.id)}>
                            {st.staffId}
                            {st.designation ? ` — ${st.designation}` : ""}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2">
              {(["summary", "detailed", "alerts"] as const).map((st) => (
                <button
                  key={st}
                  className={subTabClass(st, attSubTab)}
                  onClick={() => setAttSubTab(st)}
                >
                  {t(`admin-panel-reports:attendance.subtabs.${st}`)}
                </button>
              ))}
            </div>

            {/* Summary */}
            {attSubTab === "summary" && (
              <>
                {!attEnabled ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-stroke-soft-200">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {activeTab === "studentAttendance"
                        ? t("admin-panel-reports:filters.student")
                        : t("admin-panel-reports:filters.staff")}{" "}
                      ID required
                    </p>
                  </div>
                ) : attSumLoading ? (
                  <LoadingState />
                ) : attSummary ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                      {(
                        [
                          {
                            key: "totalDays",
                            value: attSummary.totalDays,
                            color: "text-primary-base",
                          },
                          {
                            key: "present",
                            value: attSummary.present,
                            color: "text-success-base",
                          },
                          {
                            key: "absent",
                            value: attSummary.absent,
                            color: "text-error-base",
                          },
                          {
                            key: "late",
                            value: attSummary.late,
                            color: "text-warning-base",
                          },
                          {
                            key: "halfDay",
                            value: attSummary.halfDay,
                            color: "text-warning-base",
                          },
                          {
                            key: "excused",
                            value: attSummary.excused,
                            color: "text-text-soft-400",
                          },
                          {
                            key: "attendanceRate",
                            value: `${attSummary.attendanceRate.toFixed(1)}%`,
                            color: "text-primary-base",
                            isText: true,
                          },
                        ] as const
                      ).map((m) => (
                        <div
                          key={m.key}
                          className="rounded-lg border border-stroke-soft-200 p-4"
                        >
                          <p className="text-label-sm text-text-soft-400">
                            {t(
                              `admin-panel-reports:attendance.metrics.${m.key}`
                            )}
                          </p>
                          <p className={`text-xl font-bold ${m.color}`}>
                            {"isText" in m ? m.value : m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Visual attendance rate */}
                    <div className="rounded-lg border border-stroke-soft-200 p-4">
                      <p className="mb-2 text-label-sm text-text-soft-400">
                        {t(
                          "admin-panel-reports:attendance.metrics.attendanceRate"
                        )}
                      </p>
                      <ProgressBar
                        value={attSummary.attendanceRate}
                        color={
                          attSummary.attendanceRate >= 75
                            ? "bg-success-base"
                            : attSummary.attendanceRate >= 50
                              ? "bg-warning-base"
                              : "bg-error-base"
                        }
                      />
                      <p className="mt-1 text-right text-label-sm text-text-soft-400">
                        {attSummary.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    message={t("admin-panel-reports:attendance.table.empty")}
                  />
                )}
              </>
            )}

            {/* Detailed */}
            {attSubTab === "detailed" && (
              <>
                {!attEnabled ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-stroke-soft-200">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {activeTab === "studentAttendance"
                        ? t("admin-panel-reports:filters.student")
                        : t("admin-panel-reports:filters.staff")}{" "}
                      ID required
                    </p>
                  </div>
                ) : attDetLoading ? (
                  <LoadingState />
                ) : (
                  <div className="rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.date")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.status")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.checkIn")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.checkOut")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.remarks")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!attDetailed || attDetailed.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-40 text-center text-paragraph-sm text-text-soft-400"
                            >
                              {t("admin-panel-reports:attendance.table.empty")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          attDetailed.map((rec: AttendanceDetailItem) => (
                            <TableRow key={rec.id}>
                              <TableCell className="text-paragraph-sm">
                                {new Date(rec.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusBadge(rec.status)}>
                                  {t(
                                    `admin-panel-reports:attendance.statuses.${rec.status}`
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {rec.checkIn ?? "—"}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {rec.checkOut ?? "—"}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-text-soft-400">
                                {rec.remarks ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {/* Alerts */}
            {attSubTab === "alerts" && (
              <>
                {attAlertsLoading ? (
                  <LoadingState />
                ) : (
                  <div className="rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.id")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.table.name")}
                          </TableHead>
                          <TableHead>
                            {t(
                              "admin-panel-reports:attendance.metrics.attendanceRate"
                            )}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:filters.threshold")}
                          </TableHead>
                          <TableHead>
                            {t(
                              "admin-panel-reports:attendance.metrics.present"
                            )}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:attendance.metrics.absent")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!attAlerts || attAlerts.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-40 text-center text-paragraph-sm text-text-soft-400"
                            >
                              {t("admin-panel-reports:attendance.table.empty")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          attAlerts.map((alert: AttendanceAlertItem) => (
                            <TableRow key={alert.attendableId}>
                              <TableCell className="text-paragraph-sm font-medium">
                                {alert.attendableId}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {alert.name ?? "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-paragraph-sm font-medium ${alert.attendanceRate < alert.threshold ? "text-error-base" : "text-success-base"}`}
                                  >
                                    {alert.attendanceRate.toFixed(1)}%
                                  </span>
                                  <ProgressBar
                                    value={alert.attendanceRate}
                                    color={
                                      alert.attendanceRate < alert.threshold
                                        ? "bg-error-base"
                                        : "bg-success-base"
                                    }
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {alert.threshold}%
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-success-base">
                                {alert.present}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-error-base">
                                {alert.absent}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            FEES TAB
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "fees" && (
          <div className="grid gap-4">
            {/* Sub-tabs */}
            <div className="flex gap-2">
              {(["collection", "pending", "defaulters"] as const).map((st) => (
                <button
                  key={st}
                  className={subTabClass(st, feeSubTab)}
                  onClick={() => setFeeSubTab(st)}
                >
                  {t(`admin-panel-reports:fees.subtabs.${st}`)}
                </button>
              ))}
            </div>

            {/* Collection */}
            {feeSubTab === "collection" && (
              <>
                {feeColLoading ? (
                  <LoadingState />
                ) : (
                  <div className="rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.category")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.total")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.count")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!feeCollection || feeCollection.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-40 text-center text-paragraph-sm text-text-soft-400"
                            >
                              {t("admin-panel-reports:fees.table.empty")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          feeCollection.map(
                            (item: FeeCollectionItem, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium text-paragraph-sm">
                                  {item.category}
                                </TableCell>
                                <TableCell className="text-paragraph-sm text-success-base">
                                  {item.total.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-paragraph-sm">
                                  {item.count}
                                </TableCell>
                              </TableRow>
                            )
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {/* Pending */}
            {feeSubTab === "pending" && (
              <>
                {feePenLoading ? (
                  <LoadingState />
                ) : (
                  <div className="rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.studentName")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.challanNumber")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.amount")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.paid")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.pending")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.dueDate")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.status")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!feePending || feePending.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-40 text-center text-paragraph-sm text-text-soft-400"
                            >
                              {t("admin-panel-reports:fees.table.empty")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          feePending.map((item: FeePendingItem) => (
                            <TableRow key={item.challanNumber}>
                              <TableCell className="font-medium text-paragraph-sm">
                                {item.studentName}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {item.challanNumber}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {item.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-success-base">
                                {item.paid.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-error-base">
                                {item.pending.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {new Date(item.dueDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusBadge(item.status)}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}

            {/* Defaulters */}
            {feeSubTab === "defaulters" && (
              <>
                {feeDefLoading ? (
                  <LoadingState />
                ) : (
                  <div className="rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.studentName")}
                          </TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.pending")}
                          </TableHead>
                          <TableHead>Overdue Challans</TableHead>
                          <TableHead>
                            {t("admin-panel-reports:fees.table.paymentDate")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!feeDefaulters || feeDefaulters.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-40 text-center text-paragraph-sm text-text-soft-400"
                            >
                              {t("admin-panel-reports:fees.table.empty")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          feeDefaulters.map((item: FeeDefaulterItem) => (
                            <TableRow key={item.studentId}>
                              <TableCell className="font-medium text-paragraph-sm">
                                {item.studentName}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-error-base font-bold">
                                {item.totalPending.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {item.overdueChallans}
                              </TableCell>
                              <TableCell className="text-paragraph-sm text-text-soft-400">
                                {item.lastPaymentDate
                                  ? new Date(
                                      item.lastPaymentDate
                                    ).toLocaleDateString()
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared components ──

function MetricCard({
  label,
  value,
  color,
  isText,
}: {
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-6">
      <p className="text-paragraph-sm text-text-soft-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {isText ? value : (value as number).toLocaleString()}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Spinner size="md" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-stroke-soft-200">
      <p className="text-paragraph-sm text-text-soft-400">{message}</p>
    </div>
  );
}

export default withPageRequiredAuth(Reports, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT, RoleEnum.STAFF],
});
