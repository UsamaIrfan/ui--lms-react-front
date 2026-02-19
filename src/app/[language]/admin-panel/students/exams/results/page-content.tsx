"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useExamsQuery,
  useExamSubjectsQuery,
  useGetMarksQuery,
  useGradingScalesQuery,
  usePublishResultsMutation,
  useReportCardDownload,
  type ExamItem,
  type ExamSubjectItem,
  type MarkResult,
  type GradingScaleItem,
} from "../queries/queries";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import {
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiFileChartLine,
} from "@remixicon/react";

function ResultsPageContent() {
  const { t } = useTranslation("admin-panel-students-exams");
  const { enqueueSnackbar } = useSnackbar();
  const searchParams = useSearchParams();

  const preselectedExamId = Number(searchParams.get("examId") || 0);

  const { data: exams } = useExamsQuery();
  const { data: examSubjects } = useExamSubjectsQuery();
  const { data: gradingScales } = useGradingScalesQuery();
  const publishResults = usePublishResultsMutation();
  const reportCard = useReportCardDownload();

  const [selectedExamId, setSelectedExamId] = useState(preselectedExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(0);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [gradingScaleId, setGradingScaleId] = useState("");

  const subjectsForExam = useMemo(
    () =>
      (examSubjects ?? []).filter(
        (s: ExamSubjectItem) => s.examId === selectedExamId
      ),
    [examSubjects, selectedExamId]
  );

  const { data: marks, isLoading: marksLoading } =
    useGetMarksQuery(selectedSubjectId);

  const selectedExam = useMemo(
    () => (exams ?? []).find((e: ExamItem) => e.id === selectedExamId),
    [exams, selectedExamId]
  );

  const selectedSubject = useMemo(
    () => subjectsForExam.find((s) => s.id === selectedSubjectId),
    [subjectsForExam, selectedSubjectId]
  );

  const handlePublish = useCallback(async () => {
    if (!gradingScaleId || selectedExamId <= 0) return;
    try {
      await publishResults.mutateAsync({
        examId: selectedExamId,
        data: { gradingScaleId: Number(gradingScaleId) },
      });
      enqueueSnackbar(t("notifications.resultsPublished"), {
        variant: "success",
      });
      setShowPublishDialog(false);
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [gradingScaleId, selectedExamId, publishResults, enqueueSnackbar, t]);

  const handleDownloadReportCard = useCallback(
    async (studentId: number) => {
      try {
        const res = await reportCard.mutateAsync({
          studentId,
          examId: selectedExamId,
        });
        // The API returns a PDF buffer; create a blob download
        const blob = new Blob([res as unknown as BlobPart], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-card-${studentId}-exam-${selectedExamId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        enqueueSnackbar(t("notifications.error"), { variant: "error" });
      }
    },
    [selectedExamId, reportCard, enqueueSnackbar, t]
  );

  // Stats
  const stats = useMemo(() => {
    if (!marks || marks.length === 0)
      return { total: 0, passed: 0, failed: 0, absent: 0, avg: 0 };
    const total = marks.length;
    const absent = marks.filter((m: MarkResult) => m.isAbsent).length;
    const present = marks.filter((m: MarkResult) => !m.isAbsent);
    const passingMarks = selectedSubject?.passingMarks ?? 0;
    const passed = present.filter(
      (m: MarkResult) => (m.marksObtained ?? 0) >= passingMarks
    ).length;
    const failed = present.length - passed;
    const avg =
      present.length > 0
        ? present.reduce(
            (sum: number, m: MarkResult) => sum + (m.marksObtained ?? 0),
            0
          ) / present.length
        : 0;
    return { total, passed, failed, absent, avg };
  }, [marks, selectedSubject]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-panel/students/exams">
              <Button variant="ghost" size="sm">
                <RiArrowLeftLine className="size-4" />
              </Button>
            </Link>
            <h3 className="text-3xl font-bold tracking-tight">
              {t("results.title")}
            </h3>
          </div>
          {selectedExamId > 0 && (
            <div className="flex gap-2">
              <Link
                href={`/admin-panel/students/exams/analytics?examId=${selectedExamId}`}
              >
                <Button variant="outline">
                  <RiFileChartLine className="mr-2 size-4" />
                  Analytics
                </Button>
              </Link>
              <Button onClick={() => setShowPublishDialog(true)}>
                <RiCheckboxCircleLine className="mr-2 size-4" />
                {t("results.actions.publish")}
              </Button>
            </div>
          )}
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1">
            <Label className="text-label-sm">Exam</Label>
            <Select
              value={selectedExamId > 0 ? String(selectedExamId) : ""}
              onValueChange={(v) => {
                setSelectedExamId(Number(v));
                setSelectedSubjectId(0);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {(exams ?? []).map((e: ExamItem) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExamId > 0 && (
            <div className="grid gap-1">
              <Label className="text-label-sm">Subject</Label>
              <Select
                value={selectedSubjectId > 0 ? String(selectedSubjectId) : ""}
                onValueChange={(v) => setSelectedSubjectId(Number(v))}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsForExam.map((s: ExamSubjectItem) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.subject?.name ?? `Subject #${s.subjectId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedExam && (
            <Badge variant="default" className="h-fit">
              {selectedExam.status ?? "draft"}
            </Badge>
          )}
        </div>

        {/* Stats cards */}
        {selectedSubjectId > 0 && marks && marks.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <p className="text-paragraph-sm text-text-soft-400">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <p className="text-paragraph-sm text-text-soft-400">Passed</p>
              <p className="text-2xl font-bold text-success-base">
                {stats.passed}
              </p>
            </div>
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <p className="text-paragraph-sm text-text-soft-400">Failed</p>
              <p className="text-2xl font-bold text-error-base">
                {stats.failed}
              </p>
            </div>
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <p className="text-paragraph-sm text-text-soft-400">Absent</p>
              <p className="text-2xl font-bold text-warning-base">
                {stats.absent}
              </p>
            </div>
            <div className="rounded-lg border border-stroke-soft-200 p-4">
              <p className="text-paragraph-sm text-text-soft-400">Average</p>
              <p className="text-2xl font-bold">{stats.avg.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Results table */}
        {selectedSubjectId > 0 && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>
                    {t("results.table.columns.studentName")}
                  </TableHead>
                  <TableHead>{t("results.table.columns.totalMarks")}</TableHead>
                  <TableHead>
                    {t("results.table.columns.obtainedMarks")}
                  </TableHead>
                  <TableHead>{t("results.table.columns.percentage")}</TableHead>
                  <TableHead>{t("results.table.columns.grade")}</TableHead>
                  <TableHead>{t("results.table.columns.rank")}</TableHead>
                  <TableHead>{t("results.table.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marksLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !marks || marks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("results.table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  marks.map((m: MarkResult, idx: number) => {
                    const totalMarks = selectedSubject?.totalMarks ?? 0;
                    const pct =
                      totalMarks > 0
                        ? (((m.marksObtained ?? 0) / totalMarks) * 100).toFixed(
                            1
                          )
                        : "-";
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="text-paragraph-sm text-text-soft-400">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-paragraph-sm">
                          {m.student
                            ? `${m.student.firstName} ${m.student.lastName}`
                            : `Student #${m.studentId}`}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {totalMarks}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {m.isAbsent ? (
                            <Badge variant="warning">Absent</Badge>
                          ) : (
                            (m.marksObtained ?? "-")
                          )}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {m.isAbsent ? "-" : `${pct}%`}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {m.grade ? (
                            <Badge variant="default">{m.grade}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {m.rank ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadReportCard(m.studentId)
                            }
                            disabled={reportCard.isPending}
                          >
                            <RiDownloadLine className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Publish Results Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("results.actions.publish")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-paragraph-sm text-text-soft-400">
              Select a grading scale to apply when publishing results for{" "}
              <strong>{selectedExam?.name}</strong>.
            </p>
            <div className="grid gap-1">
              <Label className="text-label-sm">Grading Scale</Label>
              <Select value={gradingScaleId} onValueChange={setGradingScaleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grading scale" />
                </SelectTrigger>
                <SelectContent>
                  {(gradingScales ?? []).map((s: GradingScaleItem) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handlePublish}
              disabled={publishResults.isPending || !gradingScaleId}
            >
              {publishResults.isPending ? (
                <Spinner size="sm" />
              ) : (
                t("results.actions.publish")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withPageRequiredAuth(ResultsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
