/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  salaryStructureControllerFindAllV1,
  salaryStructureControllerCreateV1,
  salaryStructureControllerUpdateV1,
  salaryStructureControllerRemoveV1,
  salaryStructureControllerFindOneV1,
} from "@/services/api/generated/payroll-salary-structures/payroll-salary-structures";
import {
  payrollControllerProcessV1,
  payrollControllerFindAllSlipsV1,
  payrollControllerFindOneSlipV1,
  payrollControllerGeneratePdfV1,
} from "@/services/api/generated/payroll-processing-slips/payroll-processing-slips";
import type {
  CreateSalaryStructureDto,
  ProcessPayrollDto,
} from "@/services/api/generated/model";

export type SalaryComponentItem = {
  name: string;
  type: "earning" | "deduction";
  amount: number;
};

export type SalaryStructureItem = {
  id: number;
  staffId: number;
  name: string;
  components: SalaryComponentItem[];
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  isActive?: boolean;
  createdAt: string;
};

export type PayrollSlipItem = {
  id: number;
  staffId: number;
  structureId: number;
  month: number;
  year: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  workingDays: number;
  presentDays: number;
  status: string;
  paidAt?: string | null;
  remarks?: string | null;
  createdAt: string;
};

const STRUCTURES_KEY = ["salary-structures"];
const SLIPS_KEY = ["payroll-slips"];

export function useSalaryStructuresQuery() {
  return useQuery<SalaryStructureItem[]>({
    queryKey: STRUCTURES_KEY,
    queryFn: async ({ signal }) => {
      const res = await salaryStructureControllerFindAllV1({ signal });
      const items = (res as unknown as { data: SalaryStructureItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalaryStructureDto) =>
      salaryStructureControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function useUpdateStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateSalaryStructureDto>;
    }) => salaryStructureControllerUpdateV1(id, data as any),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function useDeleteStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryStructureControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function usePayrollSlipsQuery() {
  return useQuery<PayrollSlipItem[]>({
    queryKey: SLIPS_KEY,
    queryFn: async ({ signal }) => {
      const res = await payrollControllerFindAllSlipsV1({ signal });
      const items = (res as unknown as { data: PayrollSlipItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useProcessPayrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcessPayrollDto) => payrollControllerProcessV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SLIPS_KEY });
    },
  });
}

// --- Slip detail & PDF ---

export function usePayrollSlipDetailQuery(id: number | null) {
  return useQuery<PayrollSlipItem | null>({
    queryKey: [...SLIPS_KEY, "detail", id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const res = await payrollControllerFindOneSlipV1(id, { signal });
      return (res as unknown as PayrollSlipItem) ?? null;
    },
    enabled: !!id,
  });
}

export function usePayrollSlipPdfQuery(id: number | null) {
  return useQuery({
    queryKey: [...SLIPS_KEY, "pdf", id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const res = await payrollControllerGeneratePdfV1(id, { signal });
      return res;
    },
    enabled: !!id,
  });
}

// --- Salary structure detail ---

export function useSalaryStructureDetailQuery(id: number | null) {
  return useQuery<SalaryStructureItem | null>({
    queryKey: [...STRUCTURES_KEY, "detail", id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const res = await salaryStructureControllerFindOneV1(id, { signal });
      return (res as unknown as SalaryStructureItem) ?? null;
    },
    enabled: !!id,
  });
}
