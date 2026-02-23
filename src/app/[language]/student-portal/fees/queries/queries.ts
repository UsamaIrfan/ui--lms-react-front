import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { feesControllerGetMyChallansV1 } from "@/services/api/generated/fee-management/fee-management";
import { feesControllerGetEffectiveConcessionV1 } from "@/services/api/generated/fee-management/fee-management";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";
import type {
  FeeChallan,
  FeeConcession,
  FeeFrequency,
  StudentFeesPageData,
  PaymentStatus,
  PaymentMethod,
} from "../types";

// ─────────────────────────────────────────────
// Runtime type shapes for API responses
// ─────────────────────────────────────────────

interface RawDashboardResponse {
  data?: {
    student?: { id?: number };
    fees?: {
      totalFees?: number;
      paidAmount?: number;
      pendingAmount?: number;
      nextDueDate?: string;
      nextDueAmount?: number;
    };
  };
}

interface RawChallan {
  id?: number;
  challanNumber?: string;
  studentId?: number;
  feeStructureId?: number;
  amount?: number;
  discount?: number;
  netAmount?: number;
  paidAmount?: number;
  balance?: number;
  dueDate?: string;
  status?: string;
  feeStructure?: {
    id?: number;
    name?: string;
    amount?: number;
    frequency?: string;
    description?: string;
  };
  student?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    studentId?: string;
    gradeClass?: { name?: string };
    section?: { name?: string };
  };
  payments?: Array<{
    id?: number;
    challanId?: number;
    amount?: number;
    method?: string;
    transactionRef?: string;
    paidAt?: string;
    verified?: boolean;
    receiptNumber?: string;
    remarks?: string;
    createdAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface RawChallansResponse {
  data?: RawChallan[];
}

interface RawConcessionResponse {
  data?: {
    id?: number;
    studentId?: number;
    type?: string;
    discountPercentage?: number;
    validFrom?: string;
    validTo?: string;
    reason?: string;
    createdAt?: string;
  } | null;
}

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────

export const studentFeesQueryKeys = createQueryKeys(["student-fees"], {
  page: () => ({ key: [] }),
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function safeFetch<T>(
  fn: (opts?: { signal?: AbortSignal }) => Promise<T>,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await fn(signal ? { signal } : undefined);
  } catch {
    return null;
  }
}

function mapChallan(raw: RawChallan): FeeChallan {
  return {
    id: raw.id ?? 0,
    challanNumber: raw.challanNumber ?? "",
    studentId: raw.studentId ?? 0,
    feeStructureId: raw.feeStructureId ?? 0,
    amount: raw.amount ?? 0,
    discount: raw.discount ?? 0,
    netAmount: raw.netAmount ?? raw.amount ?? 0,
    paidAmount: raw.paidAmount ?? 0,
    balance:
      raw.balance ?? (raw.netAmount ?? raw.amount ?? 0) - (raw.paidAmount ?? 0),
    dueDate: raw.dueDate ?? "",
    status: (raw.status ?? "pending") as PaymentStatus,
    feeStructure: raw.feeStructure
      ? {
          id: raw.feeStructure.id ?? 0,
          name: raw.feeStructure.name ?? "",
          amount: raw.feeStructure.amount ?? 0,
          frequency: raw.feeStructure.frequency as FeeFrequency | undefined,
          description: raw.feeStructure.description,
        }
      : undefined,
    student: raw.student
      ? {
          id: raw.student.id ?? 0,
          firstName: raw.student.firstName ?? "",
          lastName: raw.student.lastName ?? "",
          studentId: raw.student.studentId ?? "",
          gradeClass: raw.student.gradeClass
            ? { name: raw.student.gradeClass.name ?? "" }
            : undefined,
          section: raw.student.section
            ? { name: raw.student.section.name ?? "" }
            : undefined,
        }
      : undefined,
    payments: raw.payments?.map((p) => ({
      id: p.id ?? 0,
      challanId: p.challanId ?? 0,
      amount: p.amount ?? 0,
      method: (p.method ?? "cash") as PaymentMethod,
      transactionRef: p.transactionRef,
      paidAt: p.paidAt ?? "",
      verified: p.verified ?? false,
      receiptNumber: p.receiptNumber,
      remarks: p.remarks,
      createdAt: p.createdAt ?? "",
    })),
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

async function fetchStudentFeesPage(
  signal?: AbortSignal
): Promise<StudentFeesPageData> {
  const [dashboardRes, challansRes] = await Promise.all([
    safeFetch(
      () => portalsControllerGetStudentDashboardV1(undefined, { signal }),
      signal
    ),
    safeFetch(() => feesControllerGetMyChallansV1({ signal }), signal),
  ]);

  const dashboard = (dashboardRes as RawDashboardResponse)?.data;
  const studentId = dashboard?.student?.id;

  // Fetch concession only if we have a student ID
  const concessionRes = studentId
    ? ((await safeFetch(
        () => feesControllerGetEffectiveConcessionV1(studentId, { signal }),
        signal
      )) as RawConcessionResponse | null)
    : null;

  const rawChallans = (challansRes as RawChallansResponse)?.data;
  const challans: FeeChallan[] = Array.isArray(rawChallans)
    ? rawChallans.map(mapChallan)
    : [];

  const feesInfo = dashboard?.fees;
  const totalFees =
    feesInfo?.totalFees ?? challans.reduce((sum, c) => sum + c.netAmount, 0);
  const paidAmount =
    feesInfo?.paidAmount ?? challans.reduce((sum, c) => sum + c.paidAmount, 0);
  const pendingAmount = feesInfo?.pendingAmount ?? totalFees - paidAmount;

  const rawConcession = concessionRes?.data;
  const concession: FeeConcession | null = rawConcession
    ? {
        id: rawConcession.id ?? 0,
        studentId: rawConcession.studentId ?? 0,
        type: (rawConcession.type ?? "scholarship") as FeeConcession["type"],
        discountPercentage: rawConcession.discountPercentage ?? 0,
        validFrom: rawConcession.validFrom ?? "",
        validTo: rawConcession.validTo ?? "",
        reason: rawConcession.reason,
        createdAt: rawConcession.createdAt ?? "",
      }
    : null;

  return {
    challans,
    totalFees,
    paidAmount,
    pendingAmount,
    nextDueDate: feesInfo?.nextDueDate,
    nextDueAmount: feesInfo?.nextDueAmount,
    concession,
  };
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useStudentFees() {
  return useQuery({
    queryKey: studentFeesQueryKeys.page().key,
    queryFn: ({ signal }) => fetchStudentFeesPage(signal),
    staleTime: 2 * 60 * 1000,
  });
}
