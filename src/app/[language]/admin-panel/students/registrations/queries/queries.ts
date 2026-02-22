import {
  studentRegistrationControllerFindAllV1,
  studentRegistrationControllerFindOneV1,
  studentRegistrationControllerRegisterV1,
  studentRegistrationControllerUpdateV1,
  studentRegistrationControllerRemoveV1,
  studentRegistrationControllerUploadDocumentV1,
  studentRegistrationControllerFindDocumentsV1,
  studentRegistrationControllerEnrollV1,
  studentRegistrationControllerAddGuardianV1,
  studentRegistrationControllerFindGuardiansV1,
  studentRegistrationControllerImportStudentsV1,
} from "@/services/api/generated/student-registration/student-registration";
import type {
  RegisterStudentDto,
  UpdateRegisteredStudentDto,
  UploadStudentDocumentDto,
  CreateGuardianDto,
} from "@/services/api/generated/model";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Student,
  StudentFilterType,
  StudentSortType,
  StudentDocument,
  StudentGuardian,
  ImportResult,
} from "../types";

export const studentsQueryKeys = {
  all: ["students"] as const,
  lists: () => [...studentsQueryKeys.all, "list"] as const,
  list: (
    filter?: StudentFilterType,
    sort?: StudentSortType,
    page?: number,
    limit?: number
  ) => [...studentsQueryKeys.lists(), { filter, sort, page, limit }] as const,
  details: () => [...studentsQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...studentsQueryKeys.details(), id] as const,
  documents: (id: number) =>
    [...studentsQueryKeys.all, "documents", id] as const,
  guardians: (id: number) =>
    [...studentsQueryKeys.all, "guardians", id] as const,
};

export function useStudentsListQuery(
  filter?: StudentFilterType,
  sort?: StudentSortType,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: studentsQueryKeys.list(filter, sort, page, limit),
    queryFn: async ({ signal }) => {
      const response = await studentRegistrationControllerFindAllV1(
        {
          page,
          limit,
          search: filter?.search,
          status: filter?.status,
          institutionId: filter?.institutionId,
        },
        { signal }
      );
      const result = response.data as unknown as {
        data: Student[];
        hasNextPage: boolean;
      };
      let items = result?.data ?? [];

      // Client-side sorting (server doesn't support sort params)
      if (sort) {
        items = [...items].sort((a, b) => {
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

      return { data: items, hasNextPage: result?.hasNextPage ?? false };
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useStudentDetailQuery(id: number) {
  return useQuery({
    queryKey: studentsQueryKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await studentRegistrationControllerFindOneV1(id, {
        signal,
      });
      return response.data as unknown as Student;
    },
    enabled: id > 0,
  });
}

export function useStudentDocumentsQuery(studentId: number) {
  return useQuery({
    queryKey: studentsQueryKeys.documents(studentId),
    queryFn: async ({ signal }) => {
      const response = await studentRegistrationControllerFindDocumentsV1(
        studentId,
        { documentType: "" },
        { signal }
      );
      return (response.data as unknown as StudentDocument[]) ?? [];
    },
    enabled: studentId > 0,
  });
}

export function useStudentGuardiansQuery(studentId: number) {
  return useQuery({
    queryKey: studentsQueryKeys.guardians(studentId),
    queryFn: async ({ signal }) => {
      const response = await studentRegistrationControllerFindGuardiansV1(
        studentId,
        { signal }
      );
      return (response.data as unknown as StudentGuardian[]) ?? [];
    },
    enabled: studentId > 0,
  });
}

export function useRegisterStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterStudentDto) => {
      const response = await studentRegistrationControllerRegisterV1(data);
      return response.data as unknown as Student;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.lists(),
      });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRegisteredStudentDto;
    }) => {
      const response = await studentRegistrationControllerUpdateV1(id, data);
      return response.data as unknown as Student;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await studentRegistrationControllerRemoveV1(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.lists(),
      });
    },
  });
}

export function useEnrollStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: number;
      data: { sectionId: number; academicYearId: number };
    }) => {
      const response = await studentRegistrationControllerEnrollV1(
        studentId,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.all,
      });
    },
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: number;
      data: UploadStudentDocumentDto;
    }) => {
      const response = await studentRegistrationControllerUploadDocumentV1(
        studentId,
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.documents(variables.studentId),
      });
    },
  });
}

export function useAddGuardianMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: number;
      data: CreateGuardianDto;
    }) => {
      const response = await studentRegistrationControllerAddGuardianV1(
        studentId,
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.guardians(variables.studentId),
      });
    },
  });
}

export function useImportStudentsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { file: Blob; institutionId?: number }) => {
      const response =
        await studentRegistrationControllerImportStudentsV1(data);
      return response.data as unknown as ImportResult;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.lists(),
      });
    },
  });
}
