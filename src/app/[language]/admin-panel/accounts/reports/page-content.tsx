"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useMemo } from "react";
import {
  useIncomeReportQuery,
  useExpenseReportQuery,
  useIncomeConsolidatedQuery,
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

function AccountsReports() {
  const { t } = useTranslation("admin-panel-accounts-reports");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "income" | "expenses"
  >("overview");

  const dateParams = useMemo(() => {
    const p: { startDate?: string; endDate?: string } = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [startDate, endDate]);

  const { data: consolidated, isLoading: consLoading } =
    useIncomeConsolidatedQuery(dateParams);
  const { data: incomeReport, isLoading: incLoading } =
    useIncomeReportQuery(dateParams);
  const { data: expenseReport, isLoading: expLoading } =
    useExpenseReportQuery(dateParams);

  const tabClass = (tab: string) =>
    `px-4 py-2 text-paragraph-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"}`;

  return (
    <div data-testid="admin-accounts-reports-page" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <h3 className="text-3xl font-bold tracking-tight">
          {t("admin-panel-accounts-reports:title")}
        </h3>

        {/* Date filter */}
        <div className="flex items-end gap-4">
          <div className="grid gap-1">
            <Label className="text-label-sm">
              {t("admin-panel-accounts-reports:filters.startDate")}
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
              {t("admin-panel-accounts-reports:filters.endDate")}
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
            {t("admin-panel-accounts-reports:filters.clear")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            className={tabClass("overview")}
            onClick={() => setActiveTab("overview")}
          >
            {t("admin-panel-accounts-reports:tabs.overview")}
          </button>
          <button
            className={tabClass("income")}
            onClick={() => setActiveTab("income")}
          >
            {t("admin-panel-accounts-reports:tabs.income")}
          </button>
          <button
            className={tabClass("expenses")}
            onClick={() => setActiveTab("expenses")}
          >
            {t("admin-panel-accounts-reports:tabs.expenses")}
          </button>
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid gap-4">
            {consLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-stroke-soft-200 p-6">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("admin-panel-accounts-reports:overview.totalIncome")}
                  </p>
                  <p className="text-2xl font-bold text-success-base">
                    {(consolidated?.totalIncome ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-6">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("admin-panel-accounts-reports:overview.totalExpenses")}
                  </p>
                  <p className="text-2xl font-bold text-error-base">
                    {(consolidated?.totalExpenses ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-6">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("admin-panel-accounts-reports:overview.netBalance")}
                  </p>
                  <p
                    className={`text-2xl font-bold ${(consolidated?.netBalance ?? 0) >= 0 ? "text-success-base" : "text-error-base"}`}
                  >
                    {(consolidated?.netBalance ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Income Report tab */}
        {activeTab === "income" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.category")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.total")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.count")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !incomeReport || incomeReport.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-accounts-reports:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeReport.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {r.category}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-success-base">
                        {r.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {r.count}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Expense Report tab */}
        {activeTab === "expenses" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.category")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.total")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-accounts-reports:table.count")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !expenseReport || expenseReport.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-accounts-reports:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseReport.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {r.category}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-error-base">
                        {r.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {r.count}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AccountsReports, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT],
});
