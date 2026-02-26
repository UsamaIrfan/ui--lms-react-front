import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  timetablesControllerFindAllV1,
  timetablesControllerFindOneV1,
  timetablesControllerFindByBranchV1,
  timetablesControllerCheckConflictsV1,
  timetablesControllerCreateV1,
  timetablesControllerUpdateV1,
  timetablesControllerRemoveV1,
  timetablesControllerAddPeriodV1,
  timetablesControllerFindPeriodsV1,
  timetablesControllerRemovePeriodV1,
} from "@/services/api/generated/timetables/timetables";
import { usersControllerFindAllV1 } from "@/services/api/generated/users/users";
import type {
  CreateTimetableDto,
  UpdateTimetableDto,
  AddPeriodDto,
  TimetablesControllerCheckConflictsV1Params,
} from "@/services/api/generated/model";

export type TimetableItem = {
  id: string;
  classId: number;
  className?: string;
  sectionId?: number | null;
  sectionName?: string | null;
  academicYearId: number;
  academicYearName?: string;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type PeriodItem = {
  id: string;
  timetableId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  createdAt: string;
};

const TIMETABLE_KEY = ["timetables"];
const PERIODS_KEY = ["timetable-periods"];

export function useTimetablesQuery() {
  return useQuery<TimetableItem[]>({
    queryKey: TIMETABLE_KEY,
    queryFn: async ({ signal }) => {
      const res = await timetablesControllerFindAllV1({ signal });
      const items = (res as unknown as { data: TimetableItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateTimetableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetableDto) =>
      timetablesControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TIMETABLE_KEY });
    },
  });
}

export function useUpdateTimetableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateTimetableDto>;
    }) => timetablesControllerUpdateV1(id, data as UpdateTimetableDto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TIMETABLE_KEY });
    },
  });
}

export function useDeleteTimetableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timetablesControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TIMETABLE_KEY });
    },
  });
}

export function usePeriodsQuery(timetableId?: string) {
  return useQuery<PeriodItem[]>({
    queryKey: [...PERIODS_KEY, timetableId],
    enabled: !!timetableId,
    queryFn: async ({ signal }) => {
      const res = await timetablesControllerFindPeriodsV1(timetableId!, {
        signal,
      });
      const items = (res as unknown as { data: PeriodItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useAddPeriodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      timetableId,
      data,
    }: {
      timetableId: string;
      data: AddPeriodDto;
    }) => timetablesControllerAddPeriodV1(timetableId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PERIODS_KEY });
    },
  });
}

export function useDeletePeriodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) =>
      timetablesControllerRemovePeriodV1(periodId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PERIODS_KEY });
    },
  });
}

export function useTimetableDetailQuery(id?: string) {
  return useQuery<TimetableItem>({
    queryKey: [...TIMETABLE_KEY, id],
    queryFn: async ({ signal }) => {
      const res = await timetablesControllerFindOneV1(id!, { signal });
      return (res as unknown as { data: TimetableItem })?.data;
    },
    enabled: !!id,
  });
}

export function useTimetablesByBranchQuery(branchId?: string) {
  return useQuery<TimetableItem[]>({
    queryKey: [...TIMETABLE_KEY, "branch", branchId],
    queryFn: async ({ signal }) => {
      const res = await timetablesControllerFindByBranchV1(branchId!, {
        signal,
      });
      const items = (res as unknown as { data: TimetableItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
    enabled: !!branchId,
  });
}

export function useCheckTimetableConflictsQuery(
  params: TimetablesControllerCheckConflictsV1Params | undefined
) {
  return useQuery({
    queryKey: [...TIMETABLE_KEY, "conflicts", params],
    queryFn: async ({ signal }) => {
      const res = await timetablesControllerCheckConflictsV1(params!, {
        signal,
      });
      return (res as unknown as { data: unknown })?.data;
    },
    enabled: !!params?.teacherId && !!params?.startTime && !!params?.endTime,
  });
}

export type TeacherDropdownItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export function useTeachersQuery() {
  return useQuery<TeacherDropdownItem[]>({
    queryKey: ["teachers-dropdown"],
    queryFn: async ({ signal }) => {
      const res = await usersControllerFindAllV1(
        {
          page: 1,
          limit: 200,
          filters: JSON.stringify({ roles: [{ id: 4 }] }),
        },
        { signal }
      );
      const inner = (res as any)?.data?.data;
      return Array.isArray(inner) ? (inner as TeacherDropdownItem[]) : [];
    },
  });
}
