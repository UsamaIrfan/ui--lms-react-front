"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  useExamsQuery,
  useStudentExamResultQuery,
  useReportCardDownload,
  type ExamItem,
} from "../queries/queries";
import { useStudentsListQuery } from "../../../students/registrations/queries/queries";
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
import {
  RiArrowLeftLine,
  RiDownloadLine,
  RiPrinterLine,
} from "@remixicon/react";

function ReportCardContent() {
  const { t } = useTranslation("admin-panel-students-exams");
  const { enqueueSnackbar } = useSnackbar();
  const searchParams = useSearchParams();

  const preselectedExamId = Number(searchParams.get("examId") || 0);
  const preselectedStudentId = Number(searchParams.get("studentId") || 0);

  const { data: exams } = useExamsQuery();
  const { data: students } = useStudentsListQuery();
  const reportCard = useReportCardDownload();

  const [selectedExamId, setSelectedExamId] = useState(preselectedExamId);
  const [studentId, setStudentId] = useState(
    preselectedStudentId > 0 ? String(preselectedStudentId) : ""
  );

  const studentIdNum = Number(studentId) || 0;

  const { data: result, isLoading: resultLoading } = useStudentExamResultQuery(
    studentIdNum,
    selectedExamId
  );

  const handleDownload = useCallback(async () => {
    if (studentIdNum <= 0 || selectedExamId <= 0) return;
    try {
      const res = await reportCard.mutateAsync({
        studentId: studentIdNum,
        examId: selectedExamId,
      });
      const blob = new Blob([res as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-card-${studentIdNum}-exam-${selectedExamId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      enqueueSnackbar(t("notifications.error"), { variant: "error" });
    }
  }, [studentIdNum, selectedExamId, reportCard, enqueueSnackbar, t]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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
              {t("results.actions.reportCard")}
            </h3>
          </div>
          {result && (
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <RiPrinterLine className="mr-2 size-4" />
                Print
              </Button>
              <Button onClick={handleDownload} disabled={reportCard.isPending}>
                {reportCard.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <RiDownloadLine className="mr-2 size-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4 print:hidden">
          <div className="grid gap-1">
            <Label className="text-label-sm">Exam</Label>
            <Select
              value={selectedExamId > 0 ? String(selectedExamId) : ""}
              onValueChange={(v) => setSelectedExamId(Number(v))}
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
          <div className="grid gap-1">
            <Label className="text-label-sm">Student</Label>
            <Select value={studentId} onValueChange={(v) => setStudentId(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.firstName && s.lastName
                      ? `${s.firstName} ${s.lastName}`
                      : (s.rollNumber ?? `#${s.id}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Card Preview */}
        {studentIdNum > 0 && selectedExamId > 0 && (
          <>
            {resultLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : result ? (
              <div className="rounded-lg border border-stroke-soft-200 bg-white p-8">
                {/* Report card header */}
                <div className="mb-6 text-center">
                  <h2 className="text-title-lg font-bold">{result.examName}</h2>
                  <p className="text-paragraph-sm text-text-soft-400">
                    Student ID: {studentIdNum}
                  </p>
                </div>

                {/* Summary row */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded border border-stroke-soft-200 p-3 text-center">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("results.table.columns.totalMarks")}
                    </p>
                    <p className="text-xl font-bold">{result.totalMarks}</p>
                  </div>
                  <div className="rounded border border-stroke-soft-200 p-3 text-center">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("results.table.columns.obtainedMarks")}
                    </p>
                    <p className="text-xl font-bold text-primary-base">
                      {result.obtainedMarks}
                    </p>
                  </div>
                  <div className="rounded border border-stroke-soft-200 p-3 text-center">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("results.table.columns.percentage")}
                    </p>
                    <p className="text-xl font-bold">
                      {result.percentage?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded border border-stroke-soft-200 p-3 text-center">
                    <p className="text-paragraph-sm text-text-soft-400">
                      {t("results.table.columns.grade")}
                    </p>
                    <p className="text-xl font-bold">
                      <Badge variant="success">{result.grade}</Badge>
                    </p>
                  </div>
                </div>

                {result.rank && (
                  <div className="mb-6 text-center">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      Rank: #{result.rank}
                    </Badge>
                  </div>
                )}

                {/* Subject-wise results */}
                <div className="rounded-lg border border-stroke-soft-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>
                          {t("results.table.columns.totalMarks")}
                        </TableHead>
                        <TableHead>
                          {t("results.table.columns.obtainedMarks")}
                        </TableHead>
                        <TableHead>
                          {t("results.table.columns.percentage")}
                        </TableHead>
                        <TableHead>
                          {t("results.table.columns.grade")}
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(result.subjects ?? []).map((sub, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-paragraph-sm text-text-soft-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-paragraph-sm">
                            {sub.subjectName}
                          </TableCell>
                          <TableCell className="text-paragraph-sm">
                            {sub.totalMarks}
                          </TableCell>
                          <TableCell className="text-paragraph-sm">
                            {sub.isAbsent ? (
                              <Badge variant="warning">Absent</Badge>
                            ) : (
                              sub.marksObtained
                            )}
                          </TableCell>
                          <TableCell className="text-paragraph-sm">
                            {sub.isAbsent
                              ? "-"
                              : `${sub.percentage?.toFixed(1)}%`}
                          </TableCell>
                          <TableCell className="text-paragraph-sm">
                            {sub.grade || "-"}
                          </TableCell>
                          <TableCell>
                            {sub.isAbsent ? (
                              <Badge variant="warning">Absent</Badge>
                            ) : sub.percentage >= 40 ? (
                              <Badge variant="success">Pass</Badge>
                            ) : (
                              <Badge variant="destructive">Fail</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-paragraph-sm text-text-soft-400">
                No results found for this student and exam combination.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(ReportCardContent, {
  roles: [
    RoleEnum.ADMIN,
    RoleEnum.TEACHER,
    RoleEnum.STAFF,
    RoleEnum.STUDENT,
    RoleEnum.PARENT,
  ],
});
