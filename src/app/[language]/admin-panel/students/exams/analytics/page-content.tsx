"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useExamsQuery,
  useExamAnalyticsQuery,
  useSubjectAnalyticsQuery,
  useExamSubjectsQuery,
  type ExamItem,
  type ExamSubjectItem,
  type SubjectAnalytics,
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
import Link from "@/components/link";
import { RiArrowLeftLine } from "@remixicon/react";

// ── Simple bar component (no external chart lib needed) ────────────────────

function ProgressBar({
  value,
  max = 100,
  color = "bg-primary-base",
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-bg-weak-50">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="min-w-12 text-right text-paragraph-sm font-medium">
        {label ?? `${pct.toFixed(0)}%`}
      </span>
    </div>
  );
}

function AnalyticsDashboard() {
  const { t } = useTranslation("admin-panel-students-exams");
  const searchParams = useSearchParams();

  const preselectedExamId = Number(searchParams.get("examId") || 0);

  const { data: exams } = useExamsQuery();
  const { data: examSubjects } = useExamSubjectsQuery();

  const [selectedExamId, setSelectedExamId] = useState(preselectedExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(0);

  const { data: examAnalytics, isLoading: examAnalyticsLoading } =
    useExamAnalyticsQuery(selectedExamId);
  const { data: subjectAnalytics, isLoading: subjectAnalyticsLoading } =
    useSubjectAnalyticsQuery(selectedSubjectId);

  const subjectsForExam = useMemo(
    () =>
      (examSubjects ?? []).filter(
        (s: ExamSubjectItem) => s.examId === selectedExamId
      ),
    [examSubjects, selectedExamId]
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
            {t("analytics.title")}
          </h3>
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
              <Label className="text-label-sm">
                {t("analytics.subjectAnalytics")}
              </Label>
              <Select
                value={selectedSubjectId > 0 ? String(selectedSubjectId) : ""}
                onValueChange={(v) => setSelectedSubjectId(Number(v))}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select subject (optional)" />
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
        </div>

        {/* ── Exam Analytics ──────────────────────────────────────────── */}
        {selectedExamId > 0 && (
          <>
            {examAnalyticsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : examAnalytics ? (
              <div className="grid gap-6">
                {/* Summary metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="rounded-lg border border-stroke-soft-200 p-4">
                    <p className="text-paragraph-sm text-text-soft-400">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold">
                      {examAnalytics.totalStudents}
                    </p>
                  </div>
                  <div className="rounded-lg border border-stroke-soft-200 p-4">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("analytics.metrics.average")}
                    </p>
                    <p className="text-2xl font-bold">
                      {examAnalytics.averagePercentage?.toFixed(1)}%
                    </p>
                    <ProgressBar
                      value={examAnalytics.averagePercentage ?? 0}
                      color="bg-primary-base"
                    />
                  </div>
                  <div className="rounded-lg border border-stroke-soft-200 p-4">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("analytics.metrics.highest")}
                    </p>
                    <p className="text-2xl font-bold text-success-base">
                      {examAnalytics.highestPercentage?.toFixed(1)}%
                    </p>
                    <ProgressBar
                      value={examAnalytics.highestPercentage ?? 0}
                      color="bg-success-base"
                    />
                  </div>
                  <div className="rounded-lg border border-stroke-soft-200 p-4">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("analytics.metrics.lowest")}
                    </p>
                    <p className="text-2xl font-bold text-error-base">
                      {examAnalytics.lowestPercentage?.toFixed(1)}%
                    </p>
                    <ProgressBar
                      value={examAnalytics.lowestPercentage ?? 0}
                      color="bg-error-base"
                    />
                  </div>
                  <div className="rounded-lg border border-stroke-soft-200 p-4">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("analytics.metrics.passRate")}
                    </p>
                    <p className="text-2xl font-bold">
                      {examAnalytics.passRate?.toFixed(1)}%
                    </p>
                    <ProgressBar
                      value={examAnalytics.passRate ?? 0}
                      color={
                        (examAnalytics.passRate ?? 0) >= 50
                          ? "bg-success-base"
                          : "bg-error-base"
                      }
                    />
                  </div>
                </div>

                {/* Subject-wise comparison */}
                {examAnalytics.subjectWise &&
                  examAnalytics.subjectWise.length > 0 && (
                    <div className="grid gap-4">
                      <h4 className="text-label-lg font-semibold">
                        Subject-wise Comparison
                      </h4>

                      {/* Visual bar comparison */}
                      <div className="grid gap-3 rounded-lg border border-stroke-soft-200 p-6">
                        {examAnalytics.subjectWise.map(
                          (s: SubjectAnalytics) => (
                            <div key={s.examSubjectId} className="grid gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-paragraph-sm font-medium">
                                  {s.subjectName}
                                </span>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      s.passRate >= 50
                                        ? "success"
                                        : "destructive"
                                    }
                                  >
                                    {s.passRate?.toFixed(0)}% pass
                                  </Badge>
                                  <span className="text-paragraph-sm text-text-soft-400">
                                    Avg: {s.averageMarks?.toFixed(1)}/
                                    {s.totalMarks}
                                  </span>
                                </div>
                              </div>
                              <ProgressBar
                                value={s.averageMarks ?? 0}
                                max={s.totalMarks}
                                color="bg-primary-base"
                                label={`${((((s.averageMarks ?? 0) / (s.totalMarks || 1)) * 100) as number).toFixed(0)}%`}
                              />
                            </div>
                          )
                        )}
                      </div>

                      {/* Detailed table */}
                      <div className="rounded-lg border border-stroke-soft-200">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Students</TableHead>
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
                            {examAnalytics.subjectWise.map(
                              (s: SubjectAnalytics) => (
                                <TableRow key={s.examSubjectId}>
                                  <TableCell className="font-medium text-paragraph-sm">
                                    {s.subjectName}
                                  </TableCell>
                                  <TableCell className="text-paragraph-sm">
                                    {s.totalStudents}
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
                                    <Badge
                                      variant={
                                        s.passRate >= 50
                                          ? "success"
                                          : "destructive"
                                      }
                                    >
                                      {s.passRate?.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
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

        {/* ── Subject-specific Analytics ──────────────────────────────── */}
        {selectedSubjectId > 0 && (
          <div className="grid gap-4">
            <h4 className="text-label-lg font-semibold">
              {t("analytics.subjectAnalytics")}
            </h4>
            {subjectAnalyticsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : subjectAnalytics ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded-lg border border-stroke-soft-200 p-4">
                  <p className="text-paragraph-sm text-text-soft-400">
                    Subject
                  </p>
                  <p className="text-lg font-bold">
                    {subjectAnalytics.subjectName}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-4">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("analytics.metrics.average")}
                  </p>
                  <p className="text-2xl font-bold">
                    {subjectAnalytics.averageMarks?.toFixed(1)} /{" "}
                    {subjectAnalytics.totalMarks}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-4">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("analytics.metrics.highest")}
                  </p>
                  <p className="text-2xl font-bold text-success-base">
                    {subjectAnalytics.highestMarks}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-4">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("analytics.metrics.lowest")}
                  </p>
                  <p className="text-2xl font-bold text-error-base">
                    {subjectAnalytics.lowestMarks}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-soft-200 p-4">
                  <p className="text-paragraph-sm text-text-soft-400">
                    {t("analytics.metrics.passRate")}
                  </p>
                  <p className="text-2xl font-bold">
                    {subjectAnalytics.passRate?.toFixed(1)}%
                  </p>
                  <ProgressBar
                    value={subjectAnalytics.passRate ?? 0}
                    color={
                      (subjectAnalytics.passRate ?? 0) >= 50
                        ? "bg-success-base"
                        : "bg-error-base"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-paragraph-sm text-text-soft-400">
                No analytics data for this subject.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AnalyticsDashboard, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF],
});
