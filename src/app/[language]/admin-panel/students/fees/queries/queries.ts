import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  feeStructureControllerFindAllV1,
  feeStructureControllerCreateV1,
  feeStructureControllerUpdateV1,
  feeStructureControllerRemoveV1,
} from "@/services/api/generated/endpoints/lms-fee-structures/lms-fee-structures";
import { feeChallanControllerFindAllV1 } from "@/services/api/generated/endpoints/lms-fee-challans/lms-fee-challans";
import { feePaymentControllerFindAllV1 } from "@/services/api/generated/endpoints/lms-fee-payments/lms-fee-payments";
import {
  feesControllerGenerateChallanV1,
  feesControllerRecordPaymentV1,
  feesControllerGetCollectionReportV1,
  feesControllerGetPendingReportV1,
  feesControllerGetDefaultersReportV1,
  feesControllerSendRemindersV1,
} from "@/services/api/generated/endpoints/fee-management/fee-management";
import type {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  GenerateChallanDto,
  RecordPaymentDto,
  SendRemindersDto,
} from "@/services/api/generated/models";

export type FeeStructureItem = {
  id: number;
  tenantId: string;
  branchId?: string | null;
  institutionId: number;
  gradeClassId?: number | null;
  academicYearId?: number | null;
  name: string;
  amount: number;
  frequency?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChallanItem = {
  id: number;
  tenantId: string;
  branchId?: string | null;
  challanNumber: string;
  studentId: number;
  feeStructureId: number;
  amount: number;
  dueDate: string;
  status: string;
  paidAmount?: number | null;
  createdAt: string;
};

export type PaymentItem = {
  id: number;
  tenantId: string;
  challanId: number;
  amount: number;
  method?: string | null;
  transactionRef?: string | null;
  paidAt?: string | null;
  remarks?: string | null;
  verified: boolean;
  createdAt: string;
};

const FEES_KEY = ["students-fees"];
const STRUCTURES_KEY = [...FEES_KEY, "structures"];
const CHALLANS_KEY = [...FEES_KEY, "challans"];
const PAYMENTS_KEY = [...FEES_KEY, "payments"];

export function useFeeStructuresQuery() {
  return useQuery<FeeStructureItem[]>({
    queryKey: STRUCTURES_KEY,
    queryFn: async ({ signal }) => {
      const res = await feeStructureControllerFindAllV1({ signal });
      const items = (res as unknown as { data: FeeStructureItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateFeeStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeeStructureDto) =>
      feeStructureControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function useUpdateFeeStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeeStructureDto }) =>
      feeStructureControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function useDeleteFeeStructureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeStructureControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STRUCTURES_KEY });
    },
  });
}

export function useChallansQuery() {
  return useQuery<ChallanItem[]>({
    queryKey: CHALLANS_KEY,
    queryFn: async ({ signal }) => {
      const res = await feeChallanControllerFindAllV1({ signal });
      const items = (res as unknown as { data: ChallanItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useGenerateChallanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateChallanDto) =>
      feesControllerGenerateChallanV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CHALLANS_KEY });
    },
  });
}

export function usePaymentsQuery() {
  return useQuery<PaymentItem[]>({
    queryKey: PAYMENTS_KEY,
    queryFn: async ({ signal }) => {
      const res = await feePaymentControllerFindAllV1({ signal });
      const items = (res as unknown as { data: PaymentItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useRecordPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentDto) => feesControllerRecordPaymentV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PAYMENTS_KEY });
      void qc.invalidateQueries({ queryKey: CHALLANS_KEY });
    },
  });
}

export function useCollectionReportQuery(params?: {
  dateFrom?: string;
  dateTo?: string;
  gradeClassId?: number;
}) {
  return useQuery({
    queryKey: [...FEES_KEY, "collection-report", params],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetCollectionReportV1(params, { signal });
      return res;
    },
  });
}

export function usePendingReportQuery() {
  return useQuery({
    queryKey: [...FEES_KEY, "pending-report"],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetPendingReportV1({ signal });
      return res;
    },
  });
}

export function useDefaultersReportQuery() {
  return useQuery({
    queryKey: [...FEES_KEY, "defaulters-report"],
    queryFn: async ({ signal }) => {
      const res = await feesControllerGetDefaultersReportV1({ signal });
      return res;
    },
  });
}

export function useSendRemindersMutation() {
  return useMutation({
    mutationFn: (data: SendRemindersDto) => feesControllerSendRemindersV1(data),
  });
}
