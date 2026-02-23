"use client";

import { useState } from "react";
import { RiTrophyLine, RiDownloadLine } from "@remixicon/react";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StudentExamResult, SubjectResult, ExamType } from "../types";

interface ResultsListProps {
  results: StudentExamResult[];
  studentId: number;
}

const TYPE_VARIANTS: Record<
  ExamType,
  "default" | "success" | "warning" | "secondary" | "destructive"
> = {
  class_test: "secondary",
  midterm: "warning",
  final: "destructive",
  quiz: "default",
  practical: "success",
  assignment: "default",
};

function SubjectStatusBadge({ result }: { result: SubjectResult }) {
  const { t } = useTranslation("student-portal-exams");

  if (result.isAbsent || result.status === "absent") {
    return <Badge variant="warning">Absent</Badge>;
  }
  if (result.status === "pass") {
    return <Badge variant="success">{t("resultDetail.passed")}</Badge>;
  }
  return <Badge variant="destructive">{t("resultDetail.failed")}</Badge>;
}

// ─────────────────────────────────────────────
// Result Detail Dialog
// ─────────────────────────────────────────────

function ResultDetailDialog({
  result,
  studentId,
}: {
  result: StudentExamResult;
  studentId: number;
}) {
  const { t } = useTranslation("student-portal-exams");
  const [open, setOpen] = useState(false);

  const handleDownloadReportCard = async () => {
    try {
      const { examsControllerGetReportCardV1 } = await import(
        "@/services/api/generated/examination-results/examination-results"
      );
      const response = await examsControllerGetReportCardV1(
        studentId,
        result.examId
      );
      // The report card endpoint likely returns a PDF blob
      const { downloadBlob } = await import("@/utils/pdf");
      if (response instanceof Blob) {
        downloadBlob(response, `report-card-${result.examName}.pdf`);
      }
    } catch {
      // Silently handle if report card is not available
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("results.viewDetails")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{result.examName}</DialogTitle>
        </DialogHeader>

        {/* Overall summary */}
        <div className="mb-5 grid grid-cols-2 gap-4 rounded-16 bg-bg-weak-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-label-sm text-text-sub-600">
              {t("results.totalMarks")}
            </p>
            <p className="text-title-h5 text-text-strong-950">
              {result.totalMarks}
            </p>
          </div>
          <div className="text-center">
            <p className="text-label-sm text-text-sub-600">
              {t("results.marksObtained")}
            </p>
            <p className="text-title-h5 text-text-strong-950">
              {result.marksObtained}
            </p>
          </div>
          <div className="text-center">
            <p className="text-label-sm text-text-sub-600">
              {t("results.percentage")}
            </p>
            <p className="text-title-h5 text-text-strong-950">
              {result.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-label-sm text-text-sub-600">
              {t("results.grade")}
            </p>
            <p className="text-title-h5 text-text-strong-950">
              {result.grade ?? "—"}
            </p>
          </div>
        </div>

        {/* Subject-wise results */}
        <h4 className="mb-3 text-label-md text-text-strong-950">
          {t("results.subjectWise")}
        </h4>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke-soft-200">
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.subject")}
                </th>
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.marksObtained")}
                </th>
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.totalMarks")}
                </th>
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.percentage")}
                </th>
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.grade")}
                </th>
                <th className="pb-2 text-left text-label-sm text-text-sub-600">
                  {t("resultDetail.passStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub) => (
                <tr
                  key={sub.subjectId}
                  className="border-b border-stroke-soft-200 last:border-b-0"
                >
                  <td className="py-2 text-paragraph-sm text-text-strong-950">
                    {sub.subjectName}
                  </td>
                  <td className="py-2 text-paragraph-sm text-text-strong-950">
                    {sub.isAbsent ? "—" : (sub.marksObtained ?? "—")}
                  </td>
                  <td className="py-2 text-paragraph-sm text-text-sub-600">
                    {sub.totalMarks}
                  </td>
                  <td className="py-2 text-paragraph-sm text-text-sub-600">
                    {sub.percentage !== null
                      ? `${sub.percentage.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="py-2 text-paragraph-sm text-text-sub-600">
                    {sub.grade ?? "—"}
                  </td>
                  <td className="py-2">
                    <SubjectStatusBadge result={sub} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remarks for subjects */}
        {result.subjects.some((s) => s.remarks) && (
          <div className="mt-3">
            {result.subjects
              .filter((s) => s.remarks)
              .map((s) => (
                <p
                  key={s.subjectId}
                  className="text-paragraph-xs text-text-sub-600"
                >
                  <span className="font-medium">{s.subjectName}:</span>{" "}
                  {s.remarks}
                </p>
              ))}
          </div>
        )}

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReportCard}
          >
            <RiDownloadLine className="mr-1.5 size-4" />
            {t("results.downloadReportCard")}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              {t("resultDetail.close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Results List
// ─────────────────────────────────────────────

export function ResultsList({ results, studentId }: ResultsListProps) {
  const { t } = useTranslation("student-portal-exams");

  if (results.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("results.title")}
        </h3>
        <div className="flex flex-col items-center gap-2 py-8">
          <RiTrophyLine className="size-10 text-text-disabled-300" />
          <p className="text-paragraph-sm text-text-sub-600">
            {t("results.noResults")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("results.title")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke-soft-200">
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.examName")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.marksObtained")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.totalMarks")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.overallPercentage")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.grade")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("results.rank")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600" />
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result.examId}
                className="border-b border-stroke-soft-200 last:border-b-0 hover:bg-bg-weak-50 transition-colors"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-paragraph-sm text-text-strong-950">
                      {result.examName}
                    </span>
                    <Badge
                      variant={TYPE_VARIANTS[result.examType] ?? "default"}
                    >
                      {t(`upcoming.types.${result.examType}`)}
                    </Badge>
                  </div>
                </td>
                <td className="py-3 text-paragraph-sm text-text-strong-950">
                  {result.marksObtained}
                </td>
                <td className="py-3 text-paragraph-sm text-text-sub-600">
                  {result.totalMarks}
                </td>
                <td className="py-3">
                  <span
                    className={`text-paragraph-sm font-medium ${
                      result.percentage >= 80
                        ? "text-success-base"
                        : result.percentage >= 50
                          ? "text-warning-base"
                          : "text-error-base"
                    }`}
                  >
                    {result.percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-paragraph-sm text-text-strong-950">
                  {result.grade ?? "—"}
                </td>
                <td className="py-3 text-paragraph-sm text-text-sub-600">
                  {result.rank ? `#${result.rank}` : "—"}
                </td>
                <td className="py-3">
                  <ResultDetailDialog result={result} studentId={studentId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultsListSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-12 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-12 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
