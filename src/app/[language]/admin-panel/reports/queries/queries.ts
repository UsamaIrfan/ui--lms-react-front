import { useQuery } from "@tanstack/react-query";
import { financialDashboardControllerGetDashboardV1 } from "@/services/api/generated/endpoints/financial-dashboard/financial-dashboard";
import { financialDashboardControllerGetProfitLossV1 } from "@/services/api/generated/endpoints/financial-dashboard/financial-dashboard";
import { financialDashboardControllerGetBalanceSheetV1 } from "@/services/api/generated/endpoints/financial-dashboard/financial-dashboard";
import { financialDashboardControllerGetCashFlowV1 } from "@/services/api/generated/endpoints/financial-dashboard/financial-dashboard";
import {
  attendanceControllerSummaryV1,
  attendanceControllerDetailedV1,
  attendanceControllerAlertsV1,
} from "@/services/api/generated/endpoints/attendance/attendance";
import type {
  AttendanceControllerSummaryV1Params,
  AttendanceControllerDetailedV1Params,
  AttendanceControllerAlertsV1Params,
  FeesControllerGetCollectionReportV1Params,
} from "@/services/api/generated/models";
import {
  feesControllerGetCollectionReportV1,
  feesControllerGetPendingReportV1,
  feesControllerGetDefaultersReportV1,
} from "@/services/api/generated/endpoints/fee-management/fee-management";

// ── Financial Dashboard types ──

export type BranchFinancialDetail = {
  branchId: string;
  branchName: string;
  income: number;
  expense: number;
  profit: number;
  profitMarginPercent: number;
};

export type TenantFinancialSummary = {
  tenantId: string;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMarginPercent: number;
  startDate: string;
  endDate: string;
};

export type HeadOfficeFinancial = {
  income: number;
  expense: number;
  profit: number;
};

export type FinancialDashboard = {
  tenantSummary: TenantFinancialSummary;
  headOffice: HeadOfficeFinancial;
  branchBreakdown: BranchFinancialDetail[];
};

export type CashFlowEntry = {
  period: string;
  income: number;
  expense: number;
  netCashFlow: number;
};

export type BranchProfitLoss = {
  branchId: string;
  branchName: string;
  cashFlow: CashFlowEntry[];
  totalIncome: number;
  totalExpense: number;
  profit: number;
};

export type BalanceSheet = {
  tenantId: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netPosition: number;
  entries: {
    branchId: string;
    branchName: string;
    income: number;
    expense: number;
    netPosition: number;
  }[];
};

// ── Attendance types ──

export type AttendanceSummaryItem = {
  attendableId: number;
  attendableType: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  excused: number;
  attendanceRate: number;
};

export type AttendanceDetailItem = {
  id: number;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  attendableId: number;
  attendableType: string;
};

export type AttendanceAlertItem = {
  attendableId: number;
  attendableType: string;
  name?: string;
  attendanceRate: number;
  threshold: number;
  totalDays: number;
  present: number;
  absent: number;
};

// ── Fee report types ──

export type FeeCollectionItem = {
  category: string;
  total: number;
  count: number;
};

export type FeePendingItem = {
  studentId: number;
  studentName: string;
  challanNumber: string;
  amount: number;
  paid: number;
  pending: number;
  dueDate: string;
  status: string;
};

export type FeeDefaulterItem = {
  studentId: number;
  studentName: string;
  totalPending: number;
  overdueChallans: number;
  lastPaymentDate?: string;
};

// ── Query keys ──

const REPORTS_KEY = ["reports"];

// ── Financial dashboard hooks ──

type DateParams = {
  startDate?: string;
  endDate?: string;
};

export function useFinancialDashboardQuery(params?: DateParams) {
  return useQuery<FinancialDashboard>({
    queryKey: [...REPORTS_KEY, "financial-dashboard", params],
    queryFn: async ({ signal }) => {
      const res = await financialDashboardControllerGetDashboardV1(params, {
        signal,
      });
      return (res as unknown as { data: FinancialDashboard })?.data;
    },
  });
}

export function useProfitLossQuery(
  params?: DateParams & { branchId?: string }
) {
  return useQuery<BranchProfitLoss[]>({
    queryKey: [...REPORTS_KEY, "profit-loss", params],
    queryFn: async ({ signal }) => {
      const res = await financialDashboardControllerGetProfitLossV1(params, {
        signal,
      });
      const data = (
        res as unknown as { data: BranchProfitLoss | BranchProfitLoss[] }
      )?.data;
      return Array.isArray(data) ? data : data ? [data] : [];
    },
  });
}

export function useBalanceSheetQuery(params?: DateParams) {
  return useQuery<BalanceSheet>({
    queryKey: [...REPORTS_KEY, "balance-sheet", params],
    queryFn: async ({ signal }) => {
      const res = await financialDashboardControllerGetBalanceSheetV1(params, {
        signal,
      });
      return (res as unknown as { data: BalanceSheet })?.data;
    },
  });
}

export function useCashFlowQuery(params?: DateParams) {
  return useQuery<BranchProfitLoss[]>({
    queryKey: [...REPORTS_KEY, "cash-flow", params],
    queryFn: async ({ signal }) => {
      const res = await financialDashboardControllerGetCashFlowV1(params, {
        signal,
      });
      const data = (
        res as unknown as { data: BranchProfitLoss | BranchProfitLoss[] }
      )?.data;
      return Array.isArray(data) ? data : data ? [data] : [];
    },
  });
}

// ── Attendance hooks ──

type AttendanceSummaryParams = {
  attendableType: "student" | "staff";
  attendableId: number;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
};

type AttendanceDetailedParams = {
  attendableType: "student" | "staff";
  attendableId: number;
  startDate?: string;
  endDate?: string;
};

type AttendanceAlertsParams = {
  threshold?: number;
  attendableType?: "student" | "staff";
  startDate?: string;
  endDate?: string;
};

export function useAttendanceSummaryQuery(
  params: AttendanceSummaryParams,
  enabled: boolean
) {
  return useQuery<AttendanceSummaryItem>({
    queryKey: [...REPORTS_KEY, "attendance-summary", params],
    queryFn: async ({ signal }) => {
      const res = await attendanceControllerSummaryV1(
        params as unknown as AttendanceControllerSummaryV1Params,
        {
          signal,
        }
      );
      return (res as unknown as { data: AttendanceSummaryItem })?.data;
    },
    enabled,
  });
}

export function useAttendanceDetailedQuery(
  params: AttendanceDetailedParams,
  enabled: boolean
) {
  return useQuery<AttendanceDetailItem[]>({
    queryKey: [...REPORTS_KEY, "attendance-detailed", params],
    queryFn: async ({ signal }) => {
      const res = await attendanceControllerDetailedV1(
        params as unknown as AttendanceControllerDetailedV1Params,
        {
          signal,
        }
      );
      const items = (res as unknown as { data: AttendanceDetailItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
    enabled,
  });
}

export function useAttendanceAlertsQuery(params?: AttendanceAlertsParams) {
  return useQuery<AttendanceAlertItem[]>({
    queryKey: [...REPORTS_KEY, "attendance-alerts", params],
    queryFn: async ({ signal }) => {
      const res = await attendanceControllerAlertsV1(
        params as unknown as AttendanceControllerAlertsV1Params,
        {
          signal,
        }
      );
      const items = (res as unknown as { data: AttendanceAlertItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

// ── Fee report hooks ──

export function useFeeCollectionReportQuery(params?: DateParams) {
  return useQuery<FeeCollectionItem[]>({
    queryKey: [...REPORTS_KEY, "fee-collection", params],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetCollectionReportV1(
        params as unknown as FeesControllerGetCollectionReportV1Params,
        {
          signal,
        }
      );
      const items = (res as unknown as { data: FeeCollectionItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useFeePendingReportQuery() {
  return useQuery<FeePendingItem[]>({
    queryKey: [...REPORTS_KEY, "fee-pending"],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetPendingReportV1({ signal });
      const items = (res as unknown as { data: FeePendingItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useFeeDefaultersReportQuery() {
  return useQuery<FeeDefaulterItem[]>({
    queryKey: [...REPORTS_KEY, "fee-defaulters"],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetDefaultersReportV1({ signal });
      const items = (res as unknown as { data: FeeDefaulterItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}
