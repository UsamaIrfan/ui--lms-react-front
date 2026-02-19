import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  expensesControllerFindAllV1,
  expensesControllerCreateV1,
  expensesControllerUpdateV1,
  expensesControllerRemoveV1,
} from "@/services/api/generated/expenses/expenses";
import type {
  CreateBranchExpenseDto,
  UpdateBranchExpenseDto,
} from "@/services/api/generated/models";

export type ExpenseItem = {
  id: string;
  tenantId: string;
  branchId?: string | null;
  category: string;
  description?: string | null;
  amount: number;
  date: string;
  referenceNumber?: string | null;
  paidTo?: string | null;
  status?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};

const EXPENSE_KEY = ["accounts-expenses"];

export function useExpenseListQuery() {
  return useQuery<ExpenseItem[]>({
    queryKey: EXPENSE_KEY,
    queryFn: async ({ signal }) => {
      const res = await expensesControllerFindAllV1({ signal });
      const items = (res as unknown as { data: ExpenseItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchExpenseDto) =>
      expensesControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSE_KEY });
    },
  });
}

export function useUpdateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchExpenseDto }) =>
      expensesControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSE_KEY });
    },
  });
}

export function useDeleteExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSE_KEY });
    },
  });
}
