"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useExamsQuery,
  useExamSubjectsQuery,
  useEnterMarksMutation,
  useGetMarksQuery,
  type ExamItem,
  type ExamSubjectItem,
  type MarkResult,
} from "../queries/queries";
import { useStudentsListQuery } from "../../registrations/queries/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import { RiArrowLeftLine, RiSaveLine } from "@remixicon/react";

type MarkEntry = {
  studentId: number;
  studentName: string;
  rollNumber: string;
  marksObtained: string;
  isAbsent: boolean;
  remarks: string;
};

function MarksEntryContent() {
  const { t } = useTranslation("admin-panel-students-exams");
  const { enqueueSnackbar } = useSnackbar();
  const searchParams = useSearchParams();

  const preselectedExamId = Number(searchParams.get("examId") || 0);

  const { data: exams, isLoading: examsLoading } = useExamsQuery();
  const { data: examSubjects } = useExamSubjectsQuery();
  const { data: allStudents } = useStudentsListQuery();
  const enterMarks = useEnterMarksMutation();

  const [selectedExamId, setSelectedExamId] = useState(preselectedExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(0);

  // Filter subjects for selected exam
  const subjectsForExam = useMemo(
    () =>
      (examSubjects ?? []).filter(
        (s: ExamSubjectItem) => s.examId === selectedExamId
      ),
    [examSubjects, selectedExamId]
  );

  // When exam changes, reset subject selection
  const handleExamChange = useCallback((val: string) => {
    setSelectedExamId(Number(val));
    setSelectedSubjectId(0);
    setMarksEntries([]);
  }, []);

  // Load existing marks when subject is selected
  const { data: existingMarks, isLoading: marksLoading } =
    useGetMarksQuery(selectedSubjectId);

  const selectedSubject = useMemo(
    () => subjectsForExam.find((s) => s.id === selectedSubjectId),
    [subjectsForExam, selectedSubjectId]
  );

  const [marksEntries, setMarksEntries] = useState<MarkEntry[]>([]);

  // Populate marks entries from loaded data
  const handleSubjectChange = useCallback((val: string) => {
    const subjectId = Number(val);
    setSelectedSubjectId(subjectId);
  }, []);

  // Update marks entries when existing marks load or use all students as fallback
  useMemo(() => {
    if (selectedSubjectId <= 0) return;

    if (existingMarks && existingMarks.length > 0) {
      // Use existing marks data
      setMarksEntries(
        existingMarks.map((m: MarkResult) => ({
          studentId: m.studentId,
          studentName: m.student
            ? `${m.student.firstName} ${m.student.lastName}`
            : `Student #${m.studentId}`,
          rollNumber: m.student?.rollNumber ?? "",
          marksObtained:
            m.marksObtained !== null ? String(m.marksObtained) : "",
          isAbsent: m.isAbsent,
          remarks: m.remarks ?? "",
        }))
      );
    } else if (!marksLoading && allStudents && allStudents.length > 0) {
      // No marks entered yet — show all enrolled students for marks entry
      setMarksEntries(
        allStudents.map((s) => ({
          studentId: s.id,
          studentName:
            s.firstName && s.lastName
              ? `${s.firstName} ${s.lastName}`
              : `Student #${s.id}`,
          rollNumber: s.rollNumber ?? "",
          marksObtained: "",
          isAbsent: false,
          remarks: "",
        }))
      );
    }
  }, [existingMarks, selectedSubjectId, marksLoading, allStudents]);

  const updateEntry = useCallback(
    (idx: number, field: keyof MarkEntry, value: string | boolean) => {
      setMarksEntries((prev) =>
        prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  const handleSaveMarks = useCallback(async () => {
    if (selectedSubjectId <= 0 || marksEntries.length === 0) return;

    try {
      await enterMarks.mutateAsync({
        examSubjectId: selectedSubjectId,
        results: marksEntries.map((e) => ({
          studentId: e.studentId,
          marksObtained: e.isAbsent
            ? undefined
            : (Number(e.marksObtained) as unknown as undefined),
          isAbsent: e.isAbsent,
          remarks: e.remarks || undefined,
        })),
      });
      enqueueSnackbar(t("notifications.marksEntered"), { variant: "success" });
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [selectedSubjectId, marksEntries, enterMarks, enqueueSnackbar, t]);

  const selectedExam = useMemo(
    () => (exams ?? []).find((e: ExamItem) => e.id === selectedExamId),
    [exams, selectedExamId]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin-panel/students/exams">
            <Button variant="ghost" size="sm">
              <RiArrowLeftLine className="size-4" />
            </Button>
          </Link>
          <h3 className="text-3xl font-bold tracking-tight">
            {t("marks.title")}
          </h3>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1">
            <Label className="text-label-sm">Exam</Label>
            <Select
              value={selectedExamId > 0 ? String(selectedExamId) : ""}
              onValueChange={handleExamChange}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {examsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  (exams ?? []).map((e: ExamItem) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedExamId > 0 && (
            <div className="grid gap-1">
              <Label className="text-label-sm">Subject</Label>
              <Select
                value={selectedSubjectId > 0 ? String(selectedSubjectId) : ""}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsForExam.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No subjects found
                    </SelectItem>
                  ) : (
                    subjectsForExam.map((s: ExamSubjectItem) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.subject?.name ?? `Subject #${s.subjectId}`} (Max:{" "}
                        {s.totalMarks})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedExam && (
            <Badge variant="default" className="h-fit">
              {selectedExam.name} • Total Marks:{" "}
              {selectedSubject?.totalMarks ?? "-"} • Passing:{" "}
              {selectedSubject?.passingMarks ?? "-"}
            </Badge>
          )}
        </div>

        {/* Marks entry table */}
        {selectedSubjectId > 0 && (
          <>
            {marksLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : marksEntries.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-paragraph-sm text-text-soft-400">
                No students found for this exam subject. Make sure students are
                enrolled.
              </div>
            ) : (
              <div className="rounded-lg border border-stroke-soft-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>{t("marks.form.studentId")}</TableHead>
                      <TableHead className="w-32">
                        {t("marks.form.marksObtained")}
                      </TableHead>
                      <TableHead className="w-24">Absent</TableHead>
                      <TableHead>{t("marks.form.remarks")}</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marksEntries.map((entry, idx) => {
                      const marks = Number(entry.marksObtained);
                      const maxMarks = selectedSubject?.totalMarks ?? 0;
                      const passingMarks = selectedSubject?.passingMarks ?? 0;
                      const isPassing =
                        !entry.isAbsent && marks >= passingMarks;
                      const isOverMax = marks > maxMarks;

                      return (
                        <TableRow key={entry.studentId}>
                          <TableCell className="text-paragraph-sm text-text-soft-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-paragraph-sm">
                            {entry.rollNumber}
                          </TableCell>
                          <TableCell className="font-medium text-paragraph-sm">
                            {entry.studentName}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={entry.marksObtained}
                              onChange={(e) =>
                                updateEntry(
                                  idx,
                                  "marksObtained",
                                  e.target.value
                                )
                              }
                              disabled={entry.isAbsent}
                              className={`w-24 ${isOverMax ? "border-error-base" : ""}`}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={entry.isAbsent}
                              onChange={(e) =>
                                updateEntry(idx, "isAbsent", e.target.checked)
                              }
                              className="size-4 rounded border-stroke-soft-200"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={entry.remarks}
                              onChange={(e) =>
                                updateEntry(idx, "remarks", e.target.value)
                              }
                              placeholder="Optional"
                              className="w-40"
                            />
                          </TableCell>
                          <TableCell>
                            {entry.isAbsent ? (
                              <Badge variant="destructive">Absent</Badge>
                            ) : entry.marksObtained ? (
                              <Badge
                                variant={isPassing ? "success" : "destructive"}
                              >
                                {isPassing ? "Pass" : "Fail"}
                              </Badge>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {marksEntries.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-paragraph-sm text-text-soft-400">
                  {marksEntries.length} students •{" "}
                  {
                    marksEntries.filter((e) => e.marksObtained || e.isAbsent)
                      .length
                  }{" "}
                  filled
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setMarksEntries((prev) =>
                        prev.map((e) => ({
                          ...e,
                          marksObtained: "",
                          isAbsent: false,
                          remarks: "",
                        }))
                      )
                    }
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleSaveMarks}
                    disabled={enterMarks.isPending}
                  >
                    {enterMarks.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <RiSaveLine className="mr-2 size-4" />
                        {t("marks.actions.enter")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(MarksEntryContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
