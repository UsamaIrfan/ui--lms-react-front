import {
  admissionEnquiryControllerFindAllV1,
  admissionEnquiryControllerFindOneV1,
  admissionEnquiryControllerCreateV1,
  admissionEnquiryControllerUpdateV1,
  admissionEnquiryControllerRemoveV1,
} from "@/services/api/generated/endpoints/lms-admission-enquiries/lms-admission-enquiries";
import type { CreateAdmissionEnquiryDto } from "@/services/api/generated/models";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AdmissionEnquiry,
  EnquiryFilterType,
  EnquirySortType,
} from "../types";

export const enquiriesQueryKeys = {
  all: ["enquiries"] as const,
  lists: () => [...enquiriesQueryKeys.all, "list"] as const,
  list: (filter?: EnquiryFilterType, sort?: EnquirySortType) =>
    [...enquiriesQueryKeys.lists(), { filter, sort }] as const,
  details: () => [...enquiriesQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...enquiriesQueryKeys.details(), id] as const,
};

export function useEnquiriesListQuery(
  filter?: EnquiryFilterType,
  sort?: EnquirySortType
) {
  return useQuery({
    queryKey: enquiriesQueryKeys.list(filter, sort),
    queryFn: async ({ signal }) => {
      const response = await admissionEnquiryControllerFindAllV1({ signal });
      const items = (response.data as unknown as AdmissionEnquiry[]) ?? [];

      // Client-side filtering
      let filtered = [...items];

      if (filter?.status) {
        filtered = filtered.filter((item) => item.status === filter.status);
      }
      if (filter?.source) {
        filtered = filtered.filter((item) => item.source === filter.source);
      }
      if (filter?.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.studentName.toLowerCase().includes(search) ||
            (item.email && item.email.toLowerCase().includes(search)) ||
            (item.phone && item.phone.includes(search))
        );
      }

      // Client-side sorting
      if (sort) {
        filtered.sort((a, b) => {
          const aVal = a[sort.orderBy];
          const bVal = b[sort.orderBy];
          if (aVal === null || aVal === undefined) {
            if (bVal === null || bVal === undefined) return 0;
            return 1;
          }
          if (bVal === null || bVal === undefined) return -1;
          const cmp = String(aVal).localeCompare(String(bVal));
          return sort.order === "ASC" ? cmp : -cmp;
        });
      }

      return filtered;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useEnquiryDetailQuery(id: number) {
  return useQuery({
    queryKey: enquiriesQueryKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await admissionEnquiryControllerFindOneV1(id, {
        signal,
      });
      return response.data as unknown as AdmissionEnquiry;
    },
    enabled: id > 0,
  });
}

export function useCreateEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAdmissionEnquiryDto) => {
      const response = await admissionEnquiryControllerCreateV1(data);
      return response.data as unknown as AdmissionEnquiry;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: enquiriesQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: Record<string, any>;
    }) => {
      const response = await admissionEnquiryControllerUpdateV1(id, data);
      return response.data as unknown as AdmissionEnquiry;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: enquiriesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: enquiriesQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await admissionEnquiryControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: enquiriesQueryKeys.lists(),
      });
    },
  });
}
