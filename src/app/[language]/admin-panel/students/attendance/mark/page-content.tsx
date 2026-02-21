"use client";

import { useCallback, useMemo, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiArrowLeftLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
} from "@remixicon/react";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  useAttendanceListQuery,
  useBulkAttendanceMutation,
} from "../queries/queries";
import { AttendanceStatus, ATTENDANCE_STATUSES } from "../types";
import type { AttendanceRecord } from "../types";
import {
  useClassesListQuery,
  useSectionsListQuery,
} from "../../../academics/classes/queries/queries";

const NS = "admin-panel-students-attendance";

function formatDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface StudentRow {
  attendableId: number;
  name: string;
  studentId: string;
  initials: string;
  status: AttendanceStatus | null;
  remarks: string;
}

function MarkAttendance() {
  const { t } = useTranslation(NS);
  const { enqueueSnackbar } = useSnackbar();
  const bulkMutation = useBulkAttendanceMutation();

  const today = formatDateInput(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const { data: classes } = useClassesListQuery();
  const { data: sections } = useSectionsListQuery();

  // Filter sections by selected class
  const filteredSections = useMemo(() => {
    if (!sections) return [];
    if (!classId) return sections;
    return sections.filter((s) => s.gradeClassId === Number(classId));
  }, [sections, classId]);

  // Fetch existing attendance for the selected date+section
  const { data: existingData, isLoading } = useAttendanceListQuery({
    startDate: selectedDate,
    endDate: selectedDate,
    attendableType: "student",
    sectionId: sectionId ? Number(sectionId) : undefined,
    limit: 500,
  });

  // Build student rows from existing data
  const [statusOverrides, setStatusOverrides] = useState<
    Map<number, { status: AttendanceStatus | null; remarks: string }>
  >(new Map());

  const students: StudentRow[] = useMemo(() => {
    const records = existingData?.data ?? [];
    return records.map((r: AttendanceRecord) => {
      const override = statusOverrides.get(r.attendableId);
      const firstName = r.studentName?.split(" ")[0] ?? "";
      const lastName = r.studentName?.split(" ").slice(1).join(" ") ?? "";
      return {
        attendableId: r.attendableId,
        name: r.studentName ?? `Student #${r.attendableId}`,
        studentId: r.rollNumber ?? r.studentId ?? String(r.attendableId),
        initials:
          `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?",
        status: override?.status ?? r.status ?? null,
        remarks: override?.remarks ?? r.remarks ?? "",
      };
    });
  }, [existingData, statusOverrides]);

  const isFutureDate = selectedDate > today;

  const allMarked = students.length > 0 && students.every((s) => s.status);
  const unmarkedCount = students.filter((s) => !s.status).length;

  const handleStatusChange = useCallback(
    (attendableId: number, status: AttendanceStatus) => {
      setStatusOverrides((prev) => {
        const next = new Map(prev);
        const existing = next.get(attendableId);
        next.set(attendableId, {
          status,
          remarks: existing?.remarks ?? "",
        });
        return next;
      });
    },
    []
  );

  const handleRemarksChange = useCallback(
    (attendableId: number, remarks: string) => {
      setStatusOverrides((prev) => {
        const next = new Map(prev);
        const existing = next.get(attendableId);
        next.set(attendableId, {
          status: existing?.status ?? null,
          remarks,
        });
        return next;
      });
    },
    []
  );

  const handleMarkAll = useCallback(
    (status: AttendanceStatus) => {
      setStatusOverrides((prev) => {
        const next = new Map(prev);
        for (const s of students) {
          const existing = next.get(s.attendableId);
          next.set(s.attendableId, {
            status,
            remarks: existing?.remarks ?? "",
          });
        }
        return next;
      });
    },
    [students]
  );

  const handleSubmit = useCallback(async () => {
    if (!allMarked) {
      enqueueSnackbar(t(`${NS}:mark.unmarked`), { variant: "error" });
      return;
    }

    try {
      const result = await bulkMutation.mutateAsync({
        date: selectedDate,
        sectionId: sectionId ? Number(sectionId) : 0,
        records: students.map((s) => ({
          attendableType: "student" as const,
          attendableId: s.attendableId,
          status: s.status!,
          remarks: s.remarks || undefined,
        })),
      });

      enqueueSnackbar(t(`${NS}:mark.success`, { count: result.marked }), {
        variant: "success",
      });
      setSubmitted(true);
    } catch {
      enqueueSnackbar(t(`${NS}:mark.error`), { variant: "error" });
    }
  }, [
    allMarked,
    bulkMutation,
    enqueueSnackbar,
    sectionId,
    selectedDate,
    students,
    t,
  ]);

  const handleAnotherClass = useCallback(() => {
    setSubmitted(false);
    setClassId("");
    setSectionId("");
    setStatusOverrides(new Map());
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin-panel/students/attendance">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RiArrowLeftLine className="h-4 w-4" />
            </Button>
          </Link>
          <h3 className="text-3xl font-bold tracking-tight">
            {t(`${NS}:mark.title`)}
          </h3>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:mark.selectDate`)}
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setStatusOverrides(new Map());
                setSubmitted(false);
              }}
              max={today}
              className="w-44"
            />
            {isFutureDate && (
              <p className="text-paragraph-xs text-error-base">
                {t(`${NS}:mark.futureDate`)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:mark.selectClass`)}
            </label>
            <Select
              value={classId}
              onValueChange={(v) => {
                setClassId(v);
                setSectionId("");
                setStatusOverrides(new Map());
                setSubmitted(false);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t(`${NS}:mark.selectClass`)} />
              </SelectTrigger>
              <SelectContent>
                {(classes ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-label-sm text-text-sub-600">
              {t(`${NS}:mark.selectSection`)}
            </label>
            <Select
              value={sectionId}
              onValueChange={(v) => {
                setSectionId(v);
                setStatusOverrides(new Map());
                setSubmitted(false);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t(`${NS}:mark.selectSection`)} />
              </SelectTrigger>
              <SelectContent>
                {filteredSections.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-success-base bg-success-lighter p-8">
            <RiCheckDoubleLine className="h-12 w-12 text-success-base" />
            <p className="text-lg font-medium text-success-base">
              {t(`${NS}:mark.success`, { count: students.length })}
            </p>
            <Button onClick={handleAnotherClass}>
              {t(`${NS}:mark.anotherClass`)}
            </Button>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {students.length > 0 && !isFutureDate && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll(AttendanceStatus.PRESENT)}
                >
                  <RiCheckDoubleLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:mark.markAllPresent`)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll(AttendanceStatus.ABSENT)}
                >
                  <RiCloseCircleLine className="mr-1 h-4 w-4" />
                  {t(`${NS}:mark.markAllAbsent`)}
                </Button>
                {unmarkedCount > 0 && (
                  <span className="text-paragraph-sm text-text-soft-400">
                    {unmarkedCount} unmarked
                  </span>
                )}
              </div>
            )}

            {/* Student Table */}
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 50 }}>#</TableHead>
                    <TableHead style={{ width: 60 }} />
                    <TableHead style={{ width: 100 }}>
                      {t(`${NS}:mark.studentId`)}
                    </TableHead>
                    <TableHead>{t(`${NS}:mark.studentName`)}</TableHead>
                    <TableHead style={{ width: 300 }}>
                      {t(`${NS}:mark.status`)}
                    </TableHead>
                    <TableHead>{t(`${NS}:mark.remarks`)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t(`${NS}:mark.noStudents`)}
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, idx) => (
                      <TableRow key={student.attendableId}>
                        <TableCell className="text-paragraph-sm text-text-soft-400">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          {student.studentId}
                        </TableCell>
                        <TableCell className="font-medium text-paragraph-sm">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {ATTENDANCE_STATUSES.map((status) => (
                              <button
                                key={status}
                                disabled={isFutureDate}
                                onClick={() =>
                                  handleStatusChange(
                                    student.attendableId,
                                    status
                                  )
                                }
                                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                  student.status === status
                                    ? statusColorClass(status)
                                    : "bg-bg-weak-50 text-text-soft-400 hover:bg-bg-soft-200"
                                }`}
                              >
                                {t(`${NS}:status.${status}`)}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="..."
                            value={student.remarks}
                            onChange={(e) =>
                              handleRemarksChange(
                                student.attendableId,
                                e.target.value
                              )
                            }
                            className="h-8 w-32 text-xs"
                            disabled={isFutureDate}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Submit */}
            {students.length > 0 && !isFutureDate && (
              <div className="flex justify-end pb-4">
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={!allMarked || bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {t(`${NS}:mark.submitting`)}
                    </>
                  ) : (
                    t(`${NS}:mark.submit`)
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function statusColorClass(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "bg-success-lighter text-success-base";
    case AttendanceStatus.ABSENT:
      return "bg-error-lighter text-error-base";
    case AttendanceStatus.LATE:
      return "bg-warning-lighter text-warning-base";
    case AttendanceStatus.HALF_DAY:
      return "bg-orange-100 text-orange-700";
    case AttendanceStatus.EXCUSED:
      return "bg-primary-lighter text-primary-base";
    default:
      return "bg-bg-weak-50 text-text-soft-400";
  }
}

export default withPageRequiredAuth(MarkAttendance, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
