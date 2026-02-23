// ─────────────────────────────────────────────
// Assignments Page Types
// ─────────────────────────────────────────────

export type AssignmentStatus =
  | "not_submitted"
  | "submitted"
  | "graded"
  | "overdue";

export interface AssignmentDetail {
  id: number;
  title: string;
  description?: string;
  subject: string;
  subjectId: number;
  dueDate: string;
  totalMarks: number;
  isActive: boolean;
  createdAt: string;
  status: AssignmentStatus;
  submission?: SubmissionInfo;
}

export interface SubmissionInfo {
  id: number;
  filePath?: string;
  fileSize: number;
  remarks?: string;
  marks?: number;
  submittedAt: string;
}

export type AssignmentTab = "all" | "pending" | "submitted" | "graded";
