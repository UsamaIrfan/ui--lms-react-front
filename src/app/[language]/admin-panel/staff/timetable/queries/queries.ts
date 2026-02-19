import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  timetablesControllerFindAllV1,
  timetablesControllerCreateV1,
  timetablesControllerUpdateV1,
  timetablesControllerRemoveV1,
  timetablesControllerAddPeriodV1,
  timetablesControllerFindPeriodsV1,
  timetablesControllerRemovePeriodV1,
} from "@/services/api/generated/endpoints/timetables/timetables";
import type {
  CreateTimetableDto,
  UpdateTimetableDto,
  AddPeriodDto,
} from "@/services/api/generated/models";

export type TimetableItem = {
  id: string;
  classId: string;
  academicYearId: string;
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
