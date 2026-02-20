import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  examControllerCreateV1,
  examControllerFindAllV1,
  examControllerFindOneV1,
  examControllerUpdateV1,
  examControllerRemoveV1,
} from "@/services/api/generated/lms-exams/lms-exams";
import {
  examSubjectControllerFindAllV1,
  examSubjectControllerFindOneV1,
  examSubjectControllerCreateV1,
  examSubjectControllerUpdateV1,
  examSubjectControllerRemoveV1,
} from "@/services/api/generated/lms-exam-subjects/lms-exam-subjects";
import { termControllerFindAllV1 } from "@/services/api/generated/lms-terms/lms-terms";
import {
  examsControllerCreateGradingScaleV1,
  examsControllerListGradingScalesV1,
  examsControllerGetGradingScaleV1,
  examsControllerCreateScheduleV1,
  examsControllerGetScheduleV1,
  examsControllerUpdateStatusV1,
  examsControllerEnterMarksV1,
  examsControllerBulkImportMarksV1,
  examsControllerGetMarksV1,
  examsControllerPublishResultsV1,
  examsControllerGetStudentResultsV1,
  examsControllerGetStudentExamResultV1,
  examsControllerGetReportCardV1,
  examsControllerGetExamAnalyticsV1,
  examsControllerGetSubjectAnalyticsV1,
} from "@/services/api/generated/examination-results/examination-results";
import type { CreateExamDto } from "@/services/api/generated/model/createExamDto";
import type { UpdateExamDto } from "@/services/api/generated/model/updateExamDto";
import type { CreateExamSubjectDto } from "@/services/api/generated/model/createExamSubjectDto";
import type { CreateExamScheduleDto } from "@/services/api/generated/model/createExamScheduleDto";
import type { UpdateExamStatusDto } from "@/services/api/generated/model/updateExamStatusDto";
import type { EnterMarksDto } from "@/services/api/generated/model/enterMarksDto";
import type { BulkMarksImportDto } from "@/services/api/generated/model/bulkMarksImportDto";
import type { PublishResultsDto } from "@/services/api/generated/model/publishResultsDto";
import type { CreateGradingScaleDto } from "@/services/api/generated/model/createGradingScaleDto";
import type { UpdateExamSubjectDto } from "@/services/api/generated/model/updateExamSubjectDto";

// ── Types ──────────────────────────────────────────────────────────────────

export type ExamItem = {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status?: string;
  termId?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ExamSubjectItem = {
  id: number;
  examId: number;
  subjectId: number;
  examDate?: string;
  totalMarks: number;
  passingMarks: number;
  subject?: { id: number; name: string };
};

export type MarkResult = {
  id: number;
  studentId: number;
  marksObtained: number | null;
  grade: string | null;
  isAbsent: boolean;
  remarks: string | null;
  percentage?: number;
  rank?: number;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    rollNumber?: string;
  };
};

export type GradeDefinition = {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  gradePoint: number;
  description?: string;
};

export type GradingScaleItem = {
  id: number;
  name: string;
  grades: GradeDefinition[];
  createdAt?: string;
};

export type ExamAnalytics = {
  examId: number;
  examName: string;
  totalStudents: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  passRate: number;
  subjectWise: SubjectAnalytics[];
};

export type SubjectAnalytics = {
  examSubjectId: number;
  subjectName: string;
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passRate: number;
  totalMarks: number;
};

export type StudentExamResult = {
  examId: number;
  examName: string;
  subjects: {
    subjectName: string;
    totalMarks: number;
    marksObtained: number;
    percentage: number;
    grade: string;
    isAbsent: boolean;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
};

// ── Query Keys ─────────────────────────────────────────────────────────────

const EXAMS_KEY = ["exams"];
const EXAM_SUBJECTS_KEY = ["exam-subjects"];
const GRADING_SCALES_KEY = ["grading-scales"];
const MARKS_KEY = ["marks"];
const RESULTS_KEY = ["exam-results"];
const ANALYTICS_KEY = ["exam-analytics"];

// ── Exam CRUD ──────────────────────────────────────────────────────────────

export function useExamsQuery() {
  return useQuery<ExamItem[]>({
    queryKey: EXAMS_KEY,
    queryFn: async ({ signal }) => {
      const res = await examControllerFindAllV1({ signal });
      const items = (res as unknown as { data: ExamItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useExamQuery(id: number) {
  return useQuery<ExamItem>({
    queryKey: [...EXAMS_KEY, id],
    queryFn: async ({ signal }) => {
      const res = await examControllerFindOneV1(id, { signal });
      return (res as unknown as { data: ExamItem })?.data;
    },
    enabled: id > 0,
  });
}

export function useCreateExamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamDto) => examControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
}

export function useUpdateExamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamDto }) =>
      examControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
}

export function useDeleteExamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
}

// ── Exam Schedule (combined create with subjects) ──────────────────────────

export function useCreateExamScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamScheduleDto) =>
      examsControllerCreateScheduleV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
      void qc.invalidateQueries({ queryKey: EXAM_SUBJECTS_KEY });
    },
  });
}

export function useExamScheduleQuery(id: number) {
  return useQuery({
    queryKey: [...EXAMS_KEY, "schedule", id],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetScheduleV1(id, { signal });
      return (
        res as unknown as { data: ExamItem & { subjects: ExamSubjectItem[] } }
      )?.data;
    },
    enabled: id > 0,
  });
}

// ── Exam Status ────────────────────────────────────────────────────────────

export function useUpdateExamStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamStatusDto }) =>
      examsControllerUpdateStatusV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
}

// ── Exam Subjects ──────────────────────────────────────────────────────────

export function useExamSubjectsQuery() {
  return useQuery<ExamSubjectItem[]>({
    queryKey: EXAM_SUBJECTS_KEY,
    queryFn: async ({ signal }) => {
      const res = await examSubjectControllerFindAllV1({ signal });
      const items = (res as unknown as { data: ExamSubjectItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useCreateExamSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamSubjectDto) =>
      examSubjectControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAM_SUBJECTS_KEY });
    },
  });
}

export function useExamSubjectDetailQuery(id: number) {
  return useQuery<ExamSubjectItem>({
    queryKey: [...EXAM_SUBJECTS_KEY, id],
    queryFn: async ({ signal }) => {
      const res = await examSubjectControllerFindOneV1(id, { signal });
      return (res as unknown as { data: ExamSubjectItem })?.data;
    },
    enabled: id > 0,
  });
}

export function useUpdateExamSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamSubjectDto }) =>
      examSubjectControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAM_SUBJECTS_KEY });
    },
  });
}

export function useDeleteExamSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examSubjectControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAM_SUBJECTS_KEY });
    },
  });
}

// ── Marks Entry ────────────────────────────────────────────────────────────

export function useEnterMarksMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EnterMarksDto) => examsControllerEnterMarksV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MARKS_KEY });
      void qc.invalidateQueries({ queryKey: RESULTS_KEY });
    },
  });
}

export function useBulkImportMarksMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkMarksImportDto) =>
      examsControllerBulkImportMarksV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MARKS_KEY });
      void qc.invalidateQueries({ queryKey: RESULTS_KEY });
    },
  });
}

export function useGetMarksQuery(examSubjectId: number) {
  return useQuery<MarkResult[]>({
    queryKey: [...MARKS_KEY, examSubjectId],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetMarksV1(examSubjectId, { signal });
      const items = (res as unknown as { data: MarkResult[] })?.data;
      return Array.isArray(items) ? items : [];
    },
    enabled: examSubjectId > 0,
  });
}

// ── Publish Results ────────────────────────────────────────────────────────

export function usePublishResultsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      data,
    }: {
      examId: number;
      data: PublishResultsDto;
    }) => examsControllerPublishResultsV1(examId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXAMS_KEY });
      void qc.invalidateQueries({ queryKey: RESULTS_KEY });
    },
  });
}

// ── Student Results ────────────────────────────────────────────────────────

export function useStudentResultsQuery(studentId: number) {
  return useQuery<StudentExamResult[]>({
    queryKey: [...RESULTS_KEY, "student", studentId],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetStudentResultsV1(studentId, {
        signal,
      });
      const items = (res as unknown as { data: StudentExamResult[] })?.data;
      return Array.isArray(items) ? items : [];
    },
    enabled: studentId > 0,
  });
}

export function useStudentExamResultQuery(studentId: number, examId: number) {
  return useQuery<StudentExamResult>({
    queryKey: [...RESULTS_KEY, "student", studentId, "exam", examId],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetStudentExamResultV1(
        studentId,
        examId,
        { signal }
      );
      return (res as unknown as { data: StudentExamResult })?.data;
    },
    enabled: studentId > 0 && examId > 0,
  });
}

// ── Report Card ────────────────────────────────────────────────────────────

export function useReportCardDownload() {
  return useMutation({
    mutationFn: async ({
      studentId,
      examId,
    }: {
      studentId: number;
      examId: number;
    }) => {
      const res = await examsControllerGetReportCardV1(studentId, examId);
      return res;
    },
  });
}

// ── Grading Scales ─────────────────────────────────────────────────────────

export function useGradingScalesQuery() {
  return useQuery<GradingScaleItem[]>({
    queryKey: GRADING_SCALES_KEY,
    queryFn: async ({ signal }) => {
      const res = await examsControllerListGradingScalesV1({ signal });
      const items = (res as unknown as { data: GradingScaleItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

export function useGradingScaleQuery(id: number) {
  return useQuery<GradingScaleItem>({
    queryKey: [...GRADING_SCALES_KEY, id],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetGradingScaleV1(id, { signal });
      return (res as unknown as { data: GradingScaleItem })?.data;
    },
    enabled: id > 0,
  });
}

export function useCreateGradingScaleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradingScaleDto) =>
      examsControllerCreateGradingScaleV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: GRADING_SCALES_KEY });
    },
  });
}

// ── Analytics ──────────────────────────────────────────────────────────────

export function useExamAnalyticsQuery(examId: number) {
  return useQuery<ExamAnalytics>({
    queryKey: [...ANALYTICS_KEY, "exam", examId],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetExamAnalyticsV1(examId, { signal });
      return (res as unknown as { data: ExamAnalytics })?.data;
    },
    enabled: examId > 0,
  });
}

export function useSubjectAnalyticsQuery(examSubjectId: number) {
  return useQuery<SubjectAnalytics>({
    queryKey: [...ANALYTICS_KEY, "subject", examSubjectId],
    queryFn: async ({ signal }) => {
      const res = await examsControllerGetSubjectAnalyticsV1(examSubjectId, {
        signal,
      });
      return (res as unknown as { data: SubjectAnalytics })?.data;
    },
    enabled: examSubjectId > 0,
  });
}

// ── Terms Lookup ───────────────────────────────────────────────────────────

export type TermItem = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: number;
};

const TERMS_KEY = ["terms", "list"];

export function useTermsListQuery() {
  return useQuery<TermItem[]>({
    queryKey: TERMS_KEY,
    queryFn: async ({ signal }) => {
      const res = await termControllerFindAllV1({ signal });
      const raw = (res as unknown as Record<string, unknown>)?.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 5 * 60_000,
  });
}
