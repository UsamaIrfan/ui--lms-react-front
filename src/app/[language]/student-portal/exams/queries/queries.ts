import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { examControllerFindAllV1 } from "@/services/api/generated/lms-exams/lms-exams";
import { examsControllerGetStudentResultsV1 } from "@/services/api/generated/examination-results/examination-results";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";
import type {
  ExamSchedule,
  ExamSubject,
  StudentExamResult,
  SubjectResult,
  StudentExamsPageData,
  ExamType,
  ExamStatus,
} from "../types";

// ─────────────────────────────────────────────
// Runtime type shapes for API responses
// ─────────────────────────────────────────────

interface RawDashboardResponse {
  data?: {
    student?: { id?: number };
  };
}

interface RawExam {
  id?: number;
  termId?: number;
  name?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  subjects?: RawExamSubject[];
}

interface RawExamSubject {
  id?: number;
  examId?: number;
  subjectId?: number;
  subject?: { name?: string };
  examDate?: string;
  totalMarks?: number;
  passingMarks?: number;
}

interface RawExamsResponse {
  data?: RawExam[];
}

interface RawStudentResult {
  examId?: number;
  examName?: string;
  examType?: string;
  totalMarks?: number;
  marksObtained?: number;
  percentage?: number;
  grade?: string;
  rank?: number;
  status?: string;
  publishedAt?: string;
  subjects?: RawSubjectResult[];
}

interface RawSubjectResult {
  subjectId?: number;
  subjectName?: string;
  totalMarks?: number;
  marksObtained?: number | null;
  passingMarks?: number;
  percentage?: number | null;
  grade?: string;
  isAbsent?: boolean;
  remarks?: string;
  status?: string;
}

interface RawResultsResponse {
  data?: RawStudentResult[];
}

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────

export const studentExamsQueryKeys = createQueryKeys(["student-exams"], {
  page: () => ({ key: [] }),
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function safeFetch<T>(
  fn: (opts?: { signal?: AbortSignal }) => Promise<T>,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await fn(signal ? { signal } : undefined);
  } catch {
    return null;
  }
}

function mapExamSubject(raw: RawExamSubject): ExamSubject {
  return {
    id: raw.id ?? 0,
    examId: raw.examId ?? 0,
    subjectId: raw.subjectId ?? 0,
    subjectName: raw.subject?.name,
    examDate: raw.examDate,
    totalMarks: raw.totalMarks ?? 0,
    passingMarks: raw.passingMarks ?? 0,
  };
}

function mapExam(raw: RawExam): ExamSchedule {
  return {
    id: raw.id ?? 0,
    termId: raw.termId ?? 0,
    name: raw.name ?? "",
    type: (raw.type ?? "class_test") as ExamType,
    status: (raw.status ?? "scheduled") as ExamStatus,
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",
    description: raw.description,
    subjects: (raw.subjects ?? []).map(mapExamSubject),
  };
}

function mapSubjectResult(raw: RawSubjectResult): SubjectResult {
  const marksObtained = raw.marksObtained ?? null;
  const passingMarks = raw.passingMarks ?? 0;
  const isAbsent = raw.isAbsent ?? false;
  const status: SubjectResult["status"] = isAbsent
    ? "absent"
    : marksObtained !== null && marksObtained >= passingMarks
      ? "pass"
      : "fail";

  return {
    subjectId: raw.subjectId ?? 0,
    subjectName: raw.subjectName ?? "",
    totalMarks: raw.totalMarks ?? 0,
    marksObtained,
    passingMarks,
    percentage: raw.percentage ?? null,
    grade: raw.grade,
    isAbsent,
    remarks: raw.remarks,
    status,
  };
}

function mapStudentResult(raw: RawStudentResult): StudentExamResult {
  return {
    examId: raw.examId ?? 0,
    examName: raw.examName ?? "",
    examType: (raw.examType ?? "class_test") as ExamType,
    totalMarks: raw.totalMarks ?? 0,
    marksObtained: raw.marksObtained ?? 0,
    percentage: raw.percentage ?? 0,
    grade: raw.grade,
    rank: raw.rank,
    status: raw.status === "pass" ? "pass" : "fail",
    publishedAt: raw.publishedAt,
    subjects: (raw.subjects ?? []).map(mapSubjectResult),
  };
}

// ─────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────

async function fetchStudentExamsPage(
  signal?: AbortSignal
): Promise<StudentExamsPageData> {
  // First, get the student ID from dashboard
  const dashboardRes = await safeFetch(
    () => portalsControllerGetStudentDashboardV1(undefined, { signal }),
    signal
  );
  const dashboard = (dashboardRes as RawDashboardResponse)?.data;
  const studentId = dashboard?.student?.id ?? 0;

  // Then fetch exams and results in parallel
  const [examsRes, resultsRes] = await Promise.all([
    safeFetch(() => examControllerFindAllV1({ signal }), signal),
    studentId > 0
      ? safeFetch(
          () => examsControllerGetStudentResultsV1(studentId, { signal }),
          signal
        )
      : Promise.resolve(null),
  ]);

  const rawExams = (examsRes as RawExamsResponse)?.data;
  const allExams = Array.isArray(rawExams) ? rawExams.map(mapExam) : [];

  // Filter upcoming exams: status is scheduled or in_progress
  const now = new Date();
  const upcomingExams = allExams.filter(
    (exam) =>
      (exam.status === "scheduled" || exam.status === "in_progress") &&
      new Date(exam.endDate) >= now
  );

  const rawResults = (resultsRes as RawResultsResponse)?.data;
  const results = Array.isArray(rawResults)
    ? rawResults.map(mapStudentResult)
    : [];

  return {
    upcomingExams,
    results,
    studentId,
  };
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useStudentExams() {
  return useQuery({
    queryKey: studentExamsQueryKeys.page().key,
    queryFn: ({ signal }) => fetchStudentExamsPage(signal),
    staleTime: 2 * 60 * 1000,
  });
}
