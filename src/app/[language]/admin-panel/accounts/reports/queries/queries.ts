import { useQuery } from "@tanstack/react-query";
import {
  incomeControllerGetIncomeReportV1,
  incomeControllerGetConsolidatedReportV1,
} from "@/services/api/generated/income/income";
import {
  expensesControllerGetExpenseReportV1,
  expensesControllerGetConsolidatedReportV1,
} from "@/services/api/generated/expenses/expenses";

export type ReportRow = {
  category: string;
  total: number;
  count: number;
};

export type ConsolidatedReport = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeByCategory: ReportRow[];
  expenseByCategory: ReportRow[];
};

const REPORT_KEY = ["accounts-reports"];

export function useIncomeReportQuery(params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
}) {
  return useQuery<ReportRow[]>({
    queryKey: [...REPORT_KEY, "income", params],
    queryFn: async ({ signal }) => {
      const res = await incomeControllerGetIncomeReportV1(params, { signal });
      const items = (res as unknown as { data: ReportRow[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useExpenseReportQuery(params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
}) {
  return useQuery<ReportRow[]>({
    queryKey: [...REPORT_KEY, "expense", params],
    queryFn: async ({ signal }) => {
      const res = await expensesControllerGetExpenseReportV1(params, {
        signal,
      });
      const items = (res as unknown as { data: ReportRow[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useIncomeConsolidatedQuery(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<ConsolidatedReport>({
    queryKey: [...REPORT_KEY, "income-consolidated", params],
    queryFn: async ({ signal }) => {
      const res = await incomeControllerGetConsolidatedReportV1(params, {
        signal,
      });
      return (
        (res as unknown as { data: ConsolidatedReport })?.data ?? {
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          incomeByCategory: [],
          expenseByCategory: [],
        }
      );
    },
  });
}

export function useExpenseConsolidatedQuery(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<ConsolidatedReport>({
    queryKey: [...REPORT_KEY, "expense-consolidated", params],
    queryFn: async ({ signal }) => {
      const res = await expensesControllerGetConsolidatedReportV1(params, {
        signal,
      });
      return (
        (res as unknown as { data: ConsolidatedReport })?.data ?? {
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          incomeByCategory: [],
          expenseByCategory: [],
        }
      );
    },
  });
}
