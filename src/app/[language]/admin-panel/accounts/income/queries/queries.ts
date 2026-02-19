import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  incomeControllerFindAllV1,
  incomeControllerCreateV1,
  incomeControllerUpdateV1,
  incomeControllerRemoveV1,
} from "@/services/api/generated/endpoints/income/income";
import type {
  CreateBranchIncomeDto,
  UpdateBranchIncomeDto,
} from "@/services/api/generated/models";

export type IncomeItem = {
  id: string;
  tenantId: string;
  branchId?: string | null;
  category: string;
  description?: string | null;
  amount: number;
  date: string;
  referenceNumber?: string | null;
  receivedFrom?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};

const INCOME_KEY = ["accounts-income"];

export function useIncomeListQuery() {
  return useQuery<IncomeItem[]>({
    queryKey: INCOME_KEY,
    queryFn: async ({ signal }) => {
      const res = await incomeControllerFindAllV1({ signal });
      const items = (res as unknown as { data: IncomeItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateIncomeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchIncomeDto) => incomeControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: INCOME_KEY });
    },
  });
}

export function useUpdateIncomeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchIncomeDto }) =>
      incomeControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: INCOME_KEY });
    },
  });
}

export function useDeleteIncomeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomeControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: INCOME_KEY });
    },
  });
}
