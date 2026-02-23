import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { timetablesControllerFindAllV1 } from "@/services/api/generated/timetables/timetables";
import { timetablesControllerFindPeriodsV1 } from "@/services/api/generated/timetables/timetables";
import type { TimetablePeriod, TimetableInfo, DayOfWeek } from "../types";

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const timetablePageQueryKeys = createQueryKeys(
  ["student-portal-timetable"],
  {
    schedule: () => ({ key: [] }),
  }
);

// ─────────────────────────────────────────────
// Raw response shapes
// ─────────────────────────────────────────────

interface RawTimetable {
  id?: string;
  name?: unknown;
  classId?: string;
  isActive?: boolean;
}

interface RawPeriod {
  id?: string;
  subjectId?: string;
  subject?: { id?: string; name?: string };
  subjectName?: string;
  teacherId?: string;
  teacher?: { id?: string; firstName?: string; lastName?: string };
  teacherName?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  room?: unknown;
}

interface RawTimetablesResponse {
  data?: RawTimetable[];
}

interface RawPeriodsResponse {
  data?: RawPeriod[];
}

// ─────────────────────────────────────────────
// Data fetcher
// ─────────────────────────────────────────────

export interface TimetablePageData {
  timetable: TimetableInfo | null;
  periods: TimetablePeriod[];
}

async function fetchTimetable(
  signal?: AbortSignal
): Promise<TimetablePageData> {
  // 1. Get all timetables, find the active one
  const timetablesRes = (await timetablesControllerFindAllV1({
    signal,
  })) as unknown as RawTimetablesResponse;

  const timetables = timetablesRes?.data ?? [];
  if (!Array.isArray(timetables) || timetables.length === 0) {
    return { timetable: null, periods: [] };
  }

  const activeTimetable = timetables.find((t) => t.isActive) ?? timetables[0];

  if (!activeTimetable?.id) {
    return { timetable: null, periods: [] };
  }

  const timetableInfo: TimetableInfo = {
    id: activeTimetable.id,
    name:
      typeof activeTimetable.name === "string"
        ? activeTimetable.name
        : "Timetable",
    classId: activeTimetable.classId ?? "",
    isActive: activeTimetable.isActive ?? true,
  };

  // 2. Get periods for this timetable
  const periodsRes = (await timetablesControllerFindPeriodsV1(
    activeTimetable.id,
    { signal }
  )) as unknown as RawPeriodsResponse;

  const rawPeriods = periodsRes?.data ?? [];
  if (!Array.isArray(rawPeriods)) {
    return { timetable: timetableInfo, periods: [] };
  }

  const now = new Date();
  const currentDay = now.getDay() as DayOfWeek; // 0=Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse & sort periods
  const periods: TimetablePeriod[] = rawPeriods
    .map((p) => {
      const teacherName = p.teacher
        ? `${p.teacher.firstName ?? ""} ${p.teacher.lastName ?? ""}`.trim()
        : (p.teacherName ?? "");

      const startParts = (p.startTime ?? "00:00").split(":");
      const endParts = (p.endTime ?? "00:00").split(":");
      const startMin =
        parseInt(startParts[0] ?? "0") * 60 + parseInt(startParts[1] ?? "0");
      const endMin =
        parseInt(endParts[0] ?? "0") * 60 + parseInt(endParts[1] ?? "0");
      const dayOfWeek = (p.dayOfWeek ?? 0) as DayOfWeek;

      const isToday = dayOfWeek === currentDay;
      const isCurrent =
        isToday && currentMinutes >= startMin && currentMinutes < endMin;

      return {
        id: p.id ?? "",
        subject: p.subject?.name ?? p.subjectName ?? "",
        subjectId: p.subject?.id ?? p.subjectId ?? "",
        teacher: teacherName,
        teacherId: p.teacher?.id ?? p.teacherId ?? "",
        dayOfWeek,
        startTime: p.startTime ?? "00:00",
        endTime: p.endTime ?? "00:00",
        room:
          typeof p.room === "string"
            ? p.room
            : p.room
              ? String(p.room)
              : undefined,
        isCurrent,
        isNext: false, // will fill in below
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Mark only the first "isNext" for today
  let foundCurrent = false;
  for (const period of periods) {
    if (period.dayOfWeek !== currentDay) continue;
    if (period.isCurrent) {
      foundCurrent = true;
    } else if (foundCurrent && !period.isCurrent) {
      const startParts = period.startTime.split(":");
      const startMin =
        parseInt(startParts[0] ?? "0") * 60 + parseInt(startParts[1] ?? "0");
      if (startMin > currentMinutes) {
        period.isNext = true;
        break;
      }
    }
  }

  // If no current class, mark the first upcoming today as isNext
  if (!foundCurrent) {
    for (const period of periods) {
      if (period.dayOfWeek !== currentDay) continue;
      const startParts = period.startTime.split(":");
      const startMin =
        parseInt(startParts[0] ?? "0") * 60 + parseInt(startParts[1] ?? "0");
      if (startMin > currentMinutes) {
        period.isNext = true;
        break;
      }
    }
  }

  return { timetable: timetableInfo, periods };
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useTimetable() {
  return useQuery({
    queryKey: timetablePageQueryKeys.schedule().key,
    queryFn: ({ signal }) => fetchTimetable(signal),
    staleTime: 5 * 60 * 1000,
  });
}
