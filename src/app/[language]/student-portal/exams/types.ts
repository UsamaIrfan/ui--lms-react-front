// ─────────────────────────────────────────────
// Student Exams & Results Page Types
// ─────────────────────────────────────────────

export type ExamType =
  | "class_test"
  | "midterm"
  | "final"
  | "quiz"
  | "practical"
  | "assignment";

export type ExamStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "results_published";

// ── Exam Schedule ──

export interface ExamSchedule {
  id: number;
  termId: number;
  name: string;
  type: ExamType;
  status: ExamStatus;
  startDate: string;
  endDate: string;
  description?: string;
  subjects: ExamSubject[];
}

export interface ExamSubject {
  id: number;
  examId: number;
  subjectId: number;
  subjectName?: string;
  examDate?: string;
  totalMarks: number;
  passingMarks: number;
}

// ── Results ──

export interface StudentExamResult {
  examId: number;
  examName: string;
  examType: ExamType;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  grade?: string;
  rank?: number;
  status: "pass" | "fail";
  publishedAt?: string;
  subjects: SubjectResult[];
}

export interface SubjectResult {
  subjectId: number;
  subjectName: string;
  totalMarks: number;
  marksObtained: number | null;
  passingMarks: number;
  percentage: number | null;
  grade?: string;
  isAbsent: boolean;
  remarks?: string;
  status: "pass" | "fail" | "absent";
}

// ── Grading Scale ──

export interface GradeDefinition {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  gradePoint: number;
  description?: string;
}

// ── Aggregated Page Data ──

export interface StudentExamsPageData {
  upcomingExams: ExamSchedule[];
  results: StudentExamResult[];
  studentId: number;
}

export type ExamsTab = "upcoming" | "results";
