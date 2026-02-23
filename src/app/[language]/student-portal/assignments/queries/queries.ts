import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { assignmentsControllerFindAllV1 } from "@/services/api/generated/materials-assignments/materials-assignments";
import { assignmentsControllerSubmitV1 } from "@/services/api/generated/materials-assignments/materials-assignments";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";
import type { SubmitAssignmentDto } from "@/services/api/generated/model";
import type { AssignmentDetail, SubmissionInfo } from "../types";

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const assignmentsPageQueryKeys = createQueryKeys(
  ["student-portal-assignments"],
  {
    list: () => ({ key: [] }),
  }
);

// ─────────────────────────────────────────────
// Raw response shapes
// ─────────────────────────────────────────────

interface RawAssignment {
  id?: number;
  title?: string;
  description?: string;
  subjectId?: number;
  subject?: { id?: number; name?: string };
  subjectName?: string;
  dueDate?: string;
  totalMarks?: number;
  isActive?: boolean;
  createdAt?: string;
  submission?: {
    id?: number;
    filePath?: string;
    fileSize?: number;
    remarks?: string;
    marks?: number;
    submittedAt?: string;
    grade?: string;
  };
}

interface RawAssignmentsResponse {
  data?: RawAssignment[];
}

interface RawDashboardResponse {
  data?: {
    student?: {
      id?: number;
    };
  };
}

// ─────────────────────────────────────────────
// Data fetcher
// ─────────────────────────────────────────────

async function fetchAssignments(
  signal?: AbortSignal
): Promise<AssignmentDetail[]> {
  const res = (await assignmentsControllerFindAllV1({
    signal,
  })) as unknown as RawAssignmentsResponse;

  const assignments = res?.data ?? [];
  if (!Array.isArray(assignments)) return [];

  const now = new Date();

  return assignments.map((a): AssignmentDetail => {
    const hasSubmission = !!a.submission;
    const isGraded = hasSubmission && a.submission?.marks !== null;
    const isPastDue = a.dueDate ? new Date(a.dueDate) < now : false;

    let status: AssignmentDetail["status"];
    if (isGraded) {
      status = "graded";
    } else if (hasSubmission) {
      status = "submitted";
    } else if (isPastDue) {
      status = "overdue";
    } else {
      status = "not_submitted";
    }

    const submission: SubmissionInfo | undefined = a.submission
      ? {
          id: a.submission.id ?? 0,
          filePath: a.submission.filePath ?? undefined,
          fileSize: a.submission.fileSize ?? 0,
          remarks: a.submission.remarks ?? undefined,
          marks: a.submission.marks ?? undefined,
          submittedAt: a.submission.submittedAt ?? "",
        }
      : undefined;

    return {
      id: a.id ?? 0,
      title: a.title ?? "",
      description: a.description ?? undefined,
      subject: a.subject?.name ?? a.subjectName ?? "",
      subjectId: a.subject?.id ?? a.subjectId ?? 0,
      dueDate: a.dueDate ?? "",
      totalMarks: a.totalMarks ?? 0,
      isActive: a.isActive ?? true,
      createdAt: a.createdAt ?? "",
      status,
      submission,
    };
  });
}

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────

export function useAssignments() {
  return useQuery({
    queryKey: assignmentsPageQueryKeys.list().key,
    queryFn: ({ signal }) => fetchAssignments(signal),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get current student's numeric ID from the dashboard endpoint.
 */
export function useStudentId() {
  return useQuery({
    queryKey: ["student-portal-student-id"],
    queryFn: async ({ signal }) => {
      const res = (await portalsControllerGetStudentDashboardV1(undefined, {
        signal,
      })) as unknown as RawDashboardResponse;
      return res?.data?.student?.id ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation to submit an assignment.
 * filePath and remarks require runtime cast because Orval couldn't
 * infer the string types from the OpenAPI schema.
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      tenantId,
      studentId,
      filePath,
      fileSize,
      remarks,
    }: {
      assignmentId: number;
      tenantId: string;
      studentId: number;
      filePath?: string;
      fileSize?: number;
      remarks?: string;
    }) => {
      const dto: SubmitAssignmentDto = {
        tenantId,
        studentId,
        filePath: filePath as unknown as SubmitAssignmentDto["filePath"],
        fileSize,
        remarks: remarks as unknown as SubmitAssignmentDto["remarks"],
      };

      return assignmentsControllerSubmitV1(assignmentId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentsPageQueryKeys.list().key,
      });
    },
  });
}
