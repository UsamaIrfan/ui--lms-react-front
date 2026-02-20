import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  noticesControllerFindAllV1,
  noticesControllerFindOneV1,
  noticesControllerFindByBranchV1,
  noticesControllerCreateV1,
  noticesControllerUpdateV1,
  noticesControllerRemoveV1,
  noticesControllerGetMyNoticesV1,
} from "@/services/api/generated/notices/notices";
import type {
  CreateNoticeDto,
  UpdateNoticeDto,
  Notice,
  NoticesControllerGetMyNoticesV1Params,
} from "@/services/api/generated/model";

const NOTICES_KEY = ["notices"];

export function useNoticesListQuery() {
  return useQuery<Notice[]>({
    queryKey: NOTICES_KEY,
    queryFn: async ({ signal }) => {
      const res = await noticesControllerFindAllV1({ signal });
      const items = (res as unknown as { data: Notice[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateNoticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeDto) => noticesControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTICES_KEY });
    },
  });
}

export function useUpdateNoticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeDto }) =>
      noticesControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTICES_KEY });
    },
  });
}

export function useDeleteNoticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noticesControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: NOTICES_KEY });
    },
  });
}

export function useNoticeDetailQuery(id: string) {
  return useQuery<Notice>({
    queryKey: [...NOTICES_KEY, id],
    queryFn: async ({ signal }) => {
      const res = await noticesControllerFindOneV1(id, { signal });
      return (res as unknown as { data: Notice })?.data;
    },
    enabled: !!id,
  });
}

export function useNoticesByBranchQuery(branchId?: string) {
  return useQuery<Notice[]>({
    queryKey: [...NOTICES_KEY, "branch", branchId],
    queryFn: async ({ signal }) => {
      const res = await noticesControllerFindByBranchV1(branchId!, { signal });
      const items = (res as unknown as { data: Notice[] })?.data;
      return Array.isArray(items) ? items : [];
    },
    enabled: !!branchId,
  });
}

export function useMyNoticesQuery(
  params?: NoticesControllerGetMyNoticesV1Params
) {
  return useQuery<Notice[]>({
    queryKey: [...NOTICES_KEY, "my", params],
    queryFn: async ({ signal }) => {
      const res = await noticesControllerGetMyNoticesV1(params, { signal });
      const items = (res as unknown as { data: Notice[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}
