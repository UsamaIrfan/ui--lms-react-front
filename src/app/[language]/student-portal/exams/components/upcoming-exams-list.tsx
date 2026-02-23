"use client";

import { format, differenceInDays, differenceInHours } from "date-fns";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import type { ExamSchedule, ExamType, ExamStatus } from "../types";

interface UpcomingExamsListProps {
  exams: ExamSchedule[];
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

const STATUS_VARIANTS: Record<
  ExamStatus,
  "default" | "success" | "warning" | "secondary" | "destructive"
> = {
  draft: "warning",
  scheduled: "secondary",
  in_progress: "default",
  completed: "success",
  results_published: "success",
};

function CountdownBadge({ startDate }: { startDate: string }) {
  const { t } = useTranslation("student-portal-exams");
  const now = new Date();
  const start = new Date(startDate);
  const daysLeft = differenceInDays(start, now);
  const hoursLeft = differenceInHours(start, now);

  if (daysLeft < 0) return null;
  if (daysLeft === 0 && hoursLeft <= 0) {
    return <Badge variant="destructive">{t("upcoming.today")}</Badge>;
  }
  if (daysLeft === 0) {
    return (
      <Badge variant="warning">
        {hoursLeft} {t("upcoming.hours")}
      </Badge>
    );
  }
  if (daysLeft === 1) {
    return <Badge variant="warning">{t("upcoming.tomorrow")}</Badge>;
  }
  return (
    <Badge variant="secondary">
      {daysLeft} {t("upcoming.days")}
    </Badge>
  );
}

export function UpcomingExamsList({ exams }: UpcomingExamsListProps) {
  const { t } = useTranslation("student-portal-exams");

  if (exams.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("upcoming.title")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("upcoming.noExams")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("upcoming.title")}
      </h3>

      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-16 border border-stroke-soft-200 p-4 transition-colors hover:bg-bg-weak-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-label-md text-text-strong-950">
                    {exam.name}
                  </h4>
                  <Badge variant={TYPE_VARIANTS[exam.type] ?? "default"}>
                    {t(`upcoming.types.${exam.type}`)}
                  </Badge>
                  <Badge variant={STATUS_VARIANTS[exam.status] ?? "secondary"}>
                    {t(`upcoming.statuses.${exam.status}`)}
                  </Badge>
                </div>

                {exam.description && (
                  <p className="mb-2 text-paragraph-sm text-text-sub-600">
                    {exam.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-paragraph-sm text-text-sub-600">
                  <span>
                    {t("upcoming.date")}:{" "}
                    {format(new Date(exam.startDate), "MMM dd, yyyy")}
                    {exam.endDate !== exam.startDate &&
                      ` – ${format(new Date(exam.endDate), "MMM dd, yyyy")}`}
                  </span>
                </div>

                {/* Subjects list */}
                {exam.subjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exam.subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="inline-flex items-center gap-1 rounded-full bg-bg-weak-50 px-2.5 py-0.5 text-label-xs text-text-sub-600"
                      >
                        {subject.subjectName ?? `Subject #${subject.subjectId}`}
                        {subject.examDate && (
                          <span className="text-text-disabled-300">
                            ({format(new Date(subject.examDate), "MMM dd")})
                          </span>
                        )}
                        <span className="text-text-disabled-300">
                          {subject.totalMarks} marks
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ml-4 shrink-0">
                <CountdownBadge startDate={exam.startDate} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpcomingExamsListSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-36 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-16 border border-stroke-soft-200 p-4">
            <div className="mb-2 flex gap-2">
              <div className="h-5 w-40 animate-pulse rounded-8 bg-bg-weak-50" />
              <div className="h-5 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
            </div>
            <div className="h-4 w-56 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
