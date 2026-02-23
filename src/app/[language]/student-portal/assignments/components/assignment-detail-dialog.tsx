"use client";

import { useCallback, useState } from "react";
import {
  RiUploadCloud2Line,
  RiFileTextLine,
  RiDeleteBinLine,
  RiCheckboxCircleLine,
  RiCalendarLine,
  RiDownloadLine,
} from "@remixicon/react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { uploadFile } from "@/services/api/upload-file";
import useTenant from "@/services/tenant/use-tenant";
import type { AssignmentDetail } from "../types";
import { useStudentId, useSubmitAssignment } from "../queries/queries";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "image/*": [".png", ".jpg", ".jpeg"],
};

// ─────────────────────────────────────────────
// Assignment Detail + Submit Dialog
// ─────────────────────────────────────────────

interface AssignmentDetailDialogProps {
  assignment: AssignmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: {
    title: string;
    description: string;
    dueDate: string;
    totalMarks: string;
    subject: string;
    close: string;
    submitAssignment: string;
    file: string;
    fileHint: string;
    remarks: string;
    remarksPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    dragDrop: string;
    maxSize: string;
    removeFile: string;
    yourSubmission: string;
    submittedOn: string;
    marks: string;
  };
}

export function AssignmentDetailDialog({
  assignment,
  open,
  onOpenChange,
  labels,
}: AssignmentDetailDialogProps) {
  const { tenantId } = useTenant();
  const { data: studentId } = useStudentId();
  const submitMutation = useSubmitAssignment();

  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0] ?? null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!assignment || !tenantId || !studentId) return;

    setIsUploading(true);
    try {
      let filePath: string | undefined;
      let fileSize: number | undefined;

      if (file) {
        const uploaded = await uploadFile(file);
        filePath = uploaded.path;
        fileSize = file.size;
      }

      await submitMutation.mutateAsync({
        assignmentId: assignment.id,
        tenantId,
        studentId,
        filePath,
        fileSize,
        remarks: remarks || undefined,
      });

      toast.success(labels.success);
      setFile(null);
      setRemarks("");
      onOpenChange(false);
    } catch {
      toast.error(labels.error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!assignment) return null;

  const canSubmit =
    assignment.status === "not_submitted" || assignment.status === "overdue";
  const hasSubmission = !!assignment.submission;
  const isSubmitting = isUploading || submitMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-title-h5 text-text-strong-950">
            {assignment.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {labels.title}
          </DialogDescription>
        </DialogHeader>

        {/* Assignment Info */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-soft-400">
            <RiCalendarLine className="size-3.5" />
            {labels.dueDate}: {formatDate(assignment.dueDate)}
          </div>
          <Badge variant="secondary">{assignment.subject}</Badge>
          <span className="text-paragraph-xs text-text-soft-400">
            {labels.totalMarks}: {assignment.totalMarks}
          </span>
        </div>

        {assignment.description && (
          <>
            <Separator />
            <div>
              <span className="text-label-xs text-text-sub-600">
                {labels.description}
              </span>
              <p className="mt-1 whitespace-pre-wrap text-paragraph-sm text-text-sub-600">
                {assignment.description}
              </p>
            </div>
          </>
        )}

        {/* Existing Submission */}
        {hasSubmission && assignment.submission && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-label-xs text-success-base">
                <RiCheckboxCircleLine className="size-3.5" />
                {labels.yourSubmission}
              </span>
              <div className="rounded-10 border border-stroke-soft-200 p-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-paragraph-xs text-text-soft-400">
                    {labels.submittedOn}:{" "}
                    {formatDate(assignment.submission.submittedAt)}
                  </span>
                  {assignment.submission.filePath && (
                    <a
                      href={assignment.submission.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-paragraph-xs text-primary-base hover:underline"
                    >
                      <RiDownloadLine className="size-3" />
                      Download Submission
                    </a>
                  )}
                  {assignment.submission.remarks && (
                    <p className="text-paragraph-xs text-text-sub-600">
                      {assignment.submission.remarks}
                    </p>
                  )}
                  {assignment.submission.marks !== null && (
                    <span className="text-label-sm text-text-strong-950">
                      {labels.marks}: {assignment.submission.marks}/
                      {assignment.totalMarks}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Submit Form */}
        {canSubmit && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <span className="text-label-xs text-text-sub-600">
                {labels.submitAssignment}
              </span>

              {/* File Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-10 border-2 border-dashed p-6 transition-colors",
                  isDragActive
                    ? "border-primary-base bg-primary-alpha-10"
                    : "border-stroke-soft-200 hover:border-primary-base"
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex w-full items-center gap-3">
                    <RiFileTextLine className="size-8 text-primary-base" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-label-xs text-text-strong-950">
                        {file.name}
                      </span>
                      <span className="text-paragraph-xs text-text-soft-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <RiDeleteBinLine className="size-4 text-error-base" />
                      {labels.removeFile}
                    </Button>
                  </div>
                ) : (
                  <>
                    <RiUploadCloud2Line className="size-8 text-text-soft-400" />
                    <p className="text-center text-paragraph-xs text-text-soft-400">
                      {labels.dragDrop}
                    </p>
                    <p className="text-center text-paragraph-xs text-text-soft-400">
                      {labels.fileHint}
                    </p>
                  </>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="text-label-xs text-text-sub-600">
                  {labels.remarks}
                </label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={labels.remarksPlaceholder}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{labels.close}</Button>
          </DialogClose>
          {canSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !tenantId || !studentId}
            >
              {isSubmitting ? labels.submitting : labels.submit}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
