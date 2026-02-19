"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useCallback } from "react";
import {
  useExamsQuery,
  useCreateExamScheduleMutation,
  useDeleteExamMutation,
  useUpdateExamStatusMutation,
  useGradingScalesQuery,
  useCreateGradingScaleMutation,
  useExamAnalyticsQuery,
  type ExamItem,
  type GradingScaleItem,
  type GradeDefinition,
} from "./queries/queries";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiBarChartBoxLine,
  RiFileEditLine,
} from "@remixicon/react";

// ── Helpers ────────────────────────────────────────────────────────────────

const EXAM_TYPES = [
  "class_test",
  "midterm",
  "final",
  "quiz",
  "practical",
  "assignment",
] as const;

const EXAM_STATUSES = [
  "draft",
  "scheduled",
  "in_progress",
  "completed",
  "results_published",
] as const;

function statusBadgeVariant(
  status: string
): "success" | "destructive" | "warning" | "default" {
  switch (status) {
    case "results_published":
      return "success";
    case "completed":
      return "success";
    case "in_progress":
      return "warning";
    case "scheduled":
      return "default";
    case "draft":
      return "default";
    default:
      return "default";
  }
}

// ── Component ──────────────────────────────────────────────────────────────

function ExamsPageContent() {
  const { t } = useTranslation("admin-panel-students-exams");
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<
    "schedules" | "results" | "gradingScales" | "analytics"
  >("schedules");

  // ── Schedules tab state ──────────────────────────────────────────────────
  const { data: exams, isLoading: examsLoading } = useExamsQuery();
  const createSchedule = useCreateExamScheduleMutation();
  const deleteExam = useDeleteExamMutation();
  const updateStatus = useUpdateExamStatusMutation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [statusValue, setStatusValue] = useState("");

  // Create form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("midterm");
  const [formTermId, setFormTermId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubjects, setFormSubjects] = useState<
    Array<{
      subjectId: string;
      examDate: string;
      totalMarks: string;
      passingMarks: string;
    }>
  >([]);

  const resetCreateForm = useCallback(() => {
    setFormName("");
    setFormType("midterm");
    setFormTermId("");
    setFormStartDate("");
    setFormEndDate("");
    setFormDescription("");
    setFormSubjects([]);
  }, []);

  const handleCreateExam = useCallback(async () => {
    if (!formName || !formTermId || !formStartDate || !formEndDate) return;
    try {
      await createSchedule.mutateAsync({
        name: formName,
        type: formType as (typeof EXAM_TYPES)[number],
        termId: Number(formTermId),
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription || undefined,
        subjects: formSubjects
          .filter((s) => s.subjectId && s.totalMarks && s.passingMarks)
          .map((s) => ({
            subjectId: Number(s.subjectId),
            examDate: s.examDate || undefined,
            totalMarks: Number(s.totalMarks),
            passingMarks: Number(s.passingMarks),
          })),
      });
      enqueueSnackbar(t("notifications.created"), { variant: "success" });
      setShowCreateDialog(false);
      resetCreateForm();
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [
    formName,
    formType,
    formTermId,
    formStartDate,
    formEndDate,
    formDescription,
    formSubjects,
    createSchedule,
    enqueueSnackbar,
    resetCreateForm,
    t,
  ]);

  const handleDeleteExam = useCallback(
    async (id: number) => {
      try {
        await deleteExam.mutateAsync(id);
        enqueueSnackbar(t("notifications.deleted"), { variant: "success" });
      } catch {
        enqueueSnackbar(t("notifications.error"), { variant: "error" });
      }
    },
    [deleteExam, enqueueSnackbar, t]
  );

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedExam || !statusValue) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedExam.id,
        data: {
          status: statusValue as (typeof EXAM_STATUSES)[number],
        },
      });
      enqueueSnackbar(t("notifications.updated"), { variant: "success" });
      setShowStatusDialog(false);
      setSelectedExam(null);
      setStatusValue("");
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [selectedExam, statusValue, updateStatus, enqueueSnackbar, t]);

  const addSubjectRow = useCallback(() => {
    setFormSubjects((prev) => [
      ...prev,
      { subjectId: "", examDate: "", totalMarks: "", passingMarks: "" },
    ]);
  }, []);

  const updateSubjectRow = useCallback(
    (idx: number, field: string, value: string) => {
      setFormSubjects((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const removeSubjectRow = useCallback((idx: number) => {
    setFormSubjects((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ── Grading Scales tab state ─────────────────────────────────────────────
  const { data: gradingScales, isLoading: gradingLoading } =
    useGradingScalesQuery();
  const createGradingScale = useCreateGradingScaleMutation();
  const [showGradingDialog, setShowGradingDialog] = useState(false);
  const [gradingName, setGradingName] = useState("");
  const [gradingGrades, setGradingGrades] = useState<GradeDefinition[]>([
    {
      minPercentage: 90,
      maxPercentage: 100,
      grade: "A+",
      gradePoint: 4.0,
      description: "Outstanding",
    },
    {
      minPercentage: 80,
      maxPercentage: 89,
      grade: "A",
      gradePoint: 3.7,
      description: "Excellent",
    },
    {
      minPercentage: 70,
      maxPercentage: 79,
      grade: "B",
      gradePoint: 3.0,
      description: "Good",
    },
    {
      minPercentage: 60,
      maxPercentage: 69,
      grade: "C",
      gradePoint: 2.0,
      description: "Satisfactory",
    },
    {
      minPercentage: 0,
      maxPercentage: 59,
      grade: "F",
      gradePoint: 0,
      description: "Fail",
    },
  ]);

  const handleCreateGradingScale = useCallback(async () => {
    if (!gradingName || gradingGrades.length === 0) return;
    try {
      await createGradingScale.mutateAsync({
        name: gradingName,
        grades: gradingGrades,
      });
      enqueueSnackbar(t("notifications.created"), { variant: "success" });
      setShowGradingDialog(false);
      setGradingName("");
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [gradingName, gradingGrades, createGradingScale, enqueueSnackbar, t]);

  // ── Analytics tab state ──────────────────────────────────────────────────
  const [analyticsExamId, setAnalyticsExamId] = useState(0);
  const { data: examAnalytics, isLoading: analyticsLoading } =
    useExamAnalyticsQuery(analyticsExamId);

  // ── Tab bar ──────────────────────────────────────────────────────────────
  const tabClass = (tab: string) =>
    `px-4 py-2 text-paragraph-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"}`;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold tracking-tight">{t("title")}</h3>
          {activeTab === "schedules" && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <RiAddLine className="mr-2 size-4" />
              {t("schedules.actions.create")}
            </Button>
          )}
          {activeTab === "gradingScales" && (
            <Button onClick={() => setShowGradingDialog(true)}>
              <RiAddLine className="mr-2 size-4" />
              {t("gradingScales.actions.create")}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(
            ["schedules", "results", "gradingScales", "analytics"] as const
          ).map((tab) => (
            <button
              key={tab}
              className={tabClass(tab)}
              onClick={() => setActiveTab(tab)}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* ── Schedules Tab ─────────────────────────────────────────────── */}
        {activeTab === "schedules" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("schedules.table.columns.name")}</TableHead>
                  <TableHead>{t("schedules.table.columns.type")}</TableHead>
                  <TableHead>{t("schedules.table.columns.date")}</TableHead>
                  <TableHead>{t("schedules.table.columns.status")}</TableHead>
                  <TableHead>{t("schedules.table.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !exams || exams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("schedules.table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {exam.name}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {t(
                          `schedules.types.${exam.type}` as `schedules.types.class_test`
                        )}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {new Date(exam.startDate).toLocaleDateString()} -{" "}
                        {new Date(exam.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadgeVariant(exam.status ?? "draft")}
                        >
                          {t(
                            `schedules.statuses.${exam.status ?? "draft"}` as `schedules.statuses.draft`
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin-panel/students/exams/marks?examId=${exam.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <RiFileEditLine className="size-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/admin-panel/students/exams/results?examId=${exam.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <RiEyeLine className="size-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedExam(exam);
                              setStatusValue(exam.status ?? "draft");
                              setShowStatusDialog(true);
                            }}
                          >
                            <RiEditLine className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            <RiDeleteBinLine className="size-4 text-error-base" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Results Tab ───────────────────────────────────────────────── */}
        {activeTab === "results" && (
          <div className="grid gap-4">
            <p className="text-paragraph-sm text-text-soft-400">
              {t("results.title")}
            </p>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("schedules.table.columns.name")}</TableHead>
                    <TableHead>{t("schedules.table.columns.type")}</TableHead>
                    <TableHead>{t("schedules.table.columns.status")}</TableHead>
                    <TableHead>
                      {t("schedules.table.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !exams || exams.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("schedules.table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium text-paragraph-sm">
                          {exam.name}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {t(
                            `schedules.types.${exam.type}` as `schedules.types.class_test`
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(exam.status ?? "draft")}
                          >
                            {t(
                              `schedules.statuses.${exam.status ?? "draft"}` as `schedules.statuses.draft`
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin-panel/students/exams/results?examId=${exam.id}`}
                            >
                              <Button variant="outline" size="sm">
                                <RiEyeLine className="mr-1 size-4" />
                                {t("results.actions.reportCard")}
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Grading Scales Tab ────────────────────────────────────────── */}
        {activeTab === "gradingScales" && (
          <div className="grid gap-4">
            {gradingLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : !gradingScales || gradingScales.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-paragraph-sm text-text-soft-400">
                No grading scales found. Create one to get started.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gradingScales.map((scale: GradingScaleItem) => (
                  <div
                    key={scale.id}
                    className="rounded-lg border border-stroke-soft-200 p-4"
                  >
                    <h4 className="mb-3 text-label-md font-semibold">
                      {scale.name}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">
                            {t("gradingScales.form.grade")}
                          </TableHead>
                          <TableHead className="text-xs">
                            {t("gradingScales.form.minPercentage")}
                          </TableHead>
                          <TableHead className="text-xs">
                            {t("gradingScales.form.maxPercentage")}
                          </TableHead>
                          <TableHead className="text-xs">
                            {t("gradingScales.form.gradePoint")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(scale.grades ?? []).map(
                          (g: GradeDefinition, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="text-paragraph-sm font-medium">
                                {g.grade}
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {g.minPercentage}%
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {g.maxPercentage}%
                              </TableCell>
                              <TableCell className="text-paragraph-sm">
                                {g.gradePoint}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Analytics Tab ─────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="grid gap-4">
            <div className="flex items-end gap-4">
              <div className="grid gap-1">
                <Label className="text-label-sm">
                  {t("schedules.table.columns.name")}
                </Label>
                <Select
                  value={analyticsExamId > 0 ? String(analyticsExamId) : ""}
                  onValueChange={(v) => setAnalyticsExamId(Number(v))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {(exams ?? []).map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {analyticsExamId > 0 && (
                <Link
                  href={`/admin-panel/students/exams/analytics?examId=${analyticsExamId}`}
                >
                  <Button variant="outline">
                    <RiBarChartBoxLine className="mr-2 size-4" />
                    {t("analytics.title")}
                  </Button>
                </Link>
              )}
            </div>

            {analyticsExamId > 0 && (
              <>
                {analyticsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Spinner size="md" />
                  </div>
                ) : examAnalytics ? (
                  <div className="grid gap-4">
                    {/* Metric cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-lg border border-stroke-soft-200 p-4">
                        <p className="text-paragraph-sm text-text-soft-400">
                          {t("analytics.metrics.average")}
                        </p>
                        <p className="text-2xl font-bold">
                          {examAnalytics.averagePercentage?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 p-4">
                        <p className="text-paragraph-sm text-text-soft-400">
                          {t("analytics.metrics.highest")}
                        </p>
                        <p className="text-2xl font-bold text-success-base">
                          {examAnalytics.highestPercentage?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 p-4">
                        <p className="text-paragraph-sm text-text-soft-400">
                          {t("analytics.metrics.lowest")}
                        </p>
                        <p className="text-2xl font-bold text-error-base">
                          {examAnalytics.lowestPercentage?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 p-4">
                        <p className="text-paragraph-sm text-text-soft-400">
                          {t("analytics.metrics.passRate")}
                        </p>
                        <p className="text-2xl font-bold">
                          {examAnalytics.passRate?.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Subject-wise table */}
                    {examAnalytics.subjectWise &&
                      examAnalytics.subjectWise.length > 0 && (
                        <div className="rounded-lg border border-stroke-soft-200">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  {t("schedules.table.columns.subject")}
                                </TableHead>
                                <TableHead>
                                  {t("analytics.metrics.average")}
                                </TableHead>
                                <TableHead>
                                  {t("analytics.metrics.highest")}
                                </TableHead>
                                <TableHead>
                                  {t("analytics.metrics.lowest")}
                                </TableHead>
                                <TableHead>
                                  {t("analytics.metrics.passRate")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {examAnalytics.subjectWise.map((s) => (
                                <TableRow key={s.examSubjectId}>
                                  <TableCell className="font-medium text-paragraph-sm">
                                    {s.subjectName}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm">
                                    {s.averageMarks?.toFixed(1)} /{" "}
                                    {s.totalMarks}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-success-base">
                                    {s.highestMarks}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm text-error-base">
                                    {s.lowestMarks}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm">
                                    {s.passRate?.toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-paragraph-sm text-text-soft-400">
                    No analytics data available for this exam.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Create Exam Schedule Dialog ────────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("schedules.actions.create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-label-sm">
                  {t("schedules.table.columns.name")}
                </Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Midterm 2025"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-label-sm">
                  {t("schedules.table.columns.type")}
                </Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`schedules.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-label-sm">Term ID</Label>
              <Input
                type="number"
                value={formTermId}
                onChange={(e) => setFormTermId(e.target.value)}
                placeholder="Academic Term ID"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-label-sm">Start Date</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-label-sm">End Date</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-label-sm">Description</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            {/* Subjects section */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-label-sm">Exam Subjects</Label>
                <Button variant="outline" size="sm" onClick={addSubjectRow}>
                  <RiAddLine className="mr-1 size-3" />
                  Add Subject
                </Button>
              </div>
              {formSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 items-end gap-2 rounded border border-stroke-soft-200 p-2"
                >
                  <div className="grid gap-1">
                    <Label className="text-xs">Subject ID</Label>
                    <Input
                      type="number"
                      value={sub.subjectId}
                      onChange={(e) =>
                        updateSubjectRow(idx, "subjectId", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Exam Date</Label>
                    <Input
                      type="date"
                      value={sub.examDate}
                      onChange={(e) =>
                        updateSubjectRow(idx, "examDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("schedules.table.columns.totalMarks")}
                    </Label>
                    <Input
                      type="number"
                      value={sub.totalMarks}
                      onChange={(e) =>
                        updateSubjectRow(idx, "totalMarks", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Passing Marks</Label>
                    <Input
                      type="number"
                      value={sub.passingMarks}
                      onChange={(e) =>
                        updateSubjectRow(idx, "passingMarks", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubjectRow(idx)}
                  >
                    <RiDeleteBinLine className="size-4 text-error-base" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreateExam}
              disabled={createSchedule.isPending}
            >
              {createSchedule.isPending ? <Spinner size="sm" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Update Status Dialog ──────────────────────────────────────── */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label className="text-label-sm">
                {t("schedules.table.columns.status")}
              </Label>
              <Select value={statusValue} onValueChange={setStatusValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`schedules.statuses.${s}`)}
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
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? <Spinner size="sm" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Grading Scale Dialog ───────────────────────────────── */}
      <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("gradingScales.actions.create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label className="text-label-sm">
                {t("gradingScales.form.name")}
              </Label>
              <Input
                value={gradingName}
                onChange={(e) => setGradingName(e.target.value)}
                placeholder="e.g. Standard Grading"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-label-sm">
                  {t("gradingScales.form.grades")}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGradingGrades((prev) => [
                      ...prev,
                      {
                        minPercentage: 0,
                        maxPercentage: 0,
                        grade: "",
                        gradePoint: 0,
                        description: "",
                      },
                    ])
                  }
                >
                  <RiAddLine className="mr-1 size-3" />
                  Add Grade
                </Button>
              </div>
              {gradingGrades.map((g, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-6 items-end gap-2 rounded border border-stroke-soft-200 p-2"
                >
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("gradingScales.form.grade")}
                    </Label>
                    <Input
                      value={g.grade}
                      onChange={(e) => {
                        const updated = [...gradingGrades];
                        updated[idx] = {
                          ...updated[idx],
                          grade: e.target.value,
                        };
                        setGradingGrades(updated);
                      }}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("gradingScales.form.minPercentage")}
                    </Label>
                    <Input
                      type="number"
                      value={g.minPercentage}
                      onChange={(e) => {
                        const updated = [...gradingGrades];
                        updated[idx] = {
                          ...updated[idx],
                          minPercentage: Number(e.target.value),
                        };
                        setGradingGrades(updated);
                      }}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("gradingScales.form.maxPercentage")}
                    </Label>
                    <Input
                      type="number"
                      value={g.maxPercentage}
                      onChange={(e) => {
                        const updated = [...gradingGrades];
                        updated[idx] = {
                          ...updated[idx],
                          maxPercentage: Number(e.target.value),
                        };
                        setGradingGrades(updated);
                      }}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("gradingScales.form.gradePoint")}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={g.gradePoint}
                      onChange={(e) => {
                        const updated = [...gradingGrades];
                        updated[idx] = {
                          ...updated[idx],
                          gradePoint: Number(e.target.value),
                        };
                        setGradingGrades(updated);
                      }}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t("gradingScales.form.description")}
                    </Label>
                    <Input
                      value={g.description ?? ""}
                      onChange={(e) => {
                        const updated = [...gradingGrades];
                        updated[idx] = {
                          ...updated[idx],
                          description: e.target.value,
                        };
                        setGradingGrades(updated);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setGradingGrades((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    <RiDeleteBinLine className="size-4 text-error-base" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreateGradingScale}
              disabled={createGradingScale.isPending}
            >
              {createGradingScale.isPending ? <Spinner size="sm" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withPageRequiredAuth(ExamsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
