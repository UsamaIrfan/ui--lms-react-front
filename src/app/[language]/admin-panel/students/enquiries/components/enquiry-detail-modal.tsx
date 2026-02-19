"use client";

import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RiEditLine,
  RiDeleteBinLine,
  RiUserAddLine,
  RiTimeLine,
} from "@remixicon/react";
import { StatusBadge } from "./status-badge";
import FollowUpForm from "./follow-up-form";
import ConvertToStudentModal from "./convert-to-student-modal";
import {
  useEnquiryDetailQuery,
  useUpdateEnquiryMutation,
  useDeleteEnquiryMutation,
} from "../queries/queries";
import { EnquiryStatus, type AdmissionEnquiry } from "../types";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useState } from "react";

const statusOptions = Object.values(EnquiryStatus);

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-label-xs text-text-soft-400">{label}</p>
      <div className="text-paragraph-sm text-text-strong-950">{children}</div>
    </div>
  );
}

function parseFollowUpNotes(
  notes: string | null
): Array<{ date: string; content: string }> {
  if (!notes) return [];
  const entries = notes.split("\n\n---\n").filter(Boolean);
  return entries.map((entry) => {
    const match = entry.match(/^\[(.+?)\]\s*([\s\S]*)$/);
    if (match) {
      return { date: match[1], content: match[2] };
    }
    return { date: "", content: entry };
  });
}

interface EnquiryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiryId: number;
  onEdit?: (enquiry: AdmissionEnquiry) => void;
  onDeleted?: () => void;
}

export default function EnquiryDetailModal({
  open,
  onOpenChange,
  enquiryId,
  onEdit,
  onDeleted,
}: EnquiryDetailModalProps) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const updateMutation = useUpdateEnquiryMutation();
  const deleteMutation = useDeleteEnquiryMutation();
  const [convertOpen, setConvertOpen] = useState(false);

  const {
    data: enquiry,
    isLoading,
    refetch,
  } = useEnquiryDetailQuery(enquiryId);

  const handleStatusChange = async (newStatus: string) => {
    if (!enquiry) return;
    try {
      await updateMutation.mutateAsync({
        id: enquiry.id,
        data: { status: newStatus },
      });
      enqueueSnackbar("Status updated", { variant: "success" });
      void refetch();
    } catch {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (!enquiry) return;
    const confirmed = await confirmDialog({
      title: t("admin-panel-students-enquiries:confirm.delete.title"),
      message: t("admin-panel-students-enquiries:confirm.delete.message"),
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(enquiry.id);
      enqueueSnackbar("Enquiry deleted", { variant: "success" });
      onOpenChange(false);
      onDeleted?.();
    } catch {
      enqueueSnackbar("Failed to delete enquiry", { variant: "error" });
    }
  };

  const canConvert =
    enquiry &&
    [
      EnquiryStatus.APPLIED,
      EnquiryStatus.ACCEPTED,
      EnquiryStatus.VISIT_DONE,
    ].includes(enquiry.status);

  const followUpNotes = enquiry ? parseFollowUpNotes(enquiry.notes) : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("admin-panel-students-enquiries:detail.title")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("admin-panel-students-enquiries:detail.title")}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : enquiry ? (
            <div className="grid gap-6">
              {/* Header with actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-title-sm font-semibold text-text-strong-950">
                    {enquiry.studentName}
                  </h3>
                  <StatusBadge status={enquiry.status} />
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(enquiry)}
                    >
                      <RiEditLine className="mr-1 h-4 w-4" />
                      {t("admin-panel-students-enquiries:actions.edit")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-error-base hover:bg-error-base hover:text-static-white"
                    onClick={handleDelete}
                  >
                    <RiDeleteBinLine className="mr-1 h-4 w-4" />
                    {t("admin-panel-students-enquiries:actions.delete")}
                  </Button>
                </div>
              </div>

              {/* Info Section */}
              <div>
                <h4 className="mb-3 text-label-sm font-semibold text-text-strong-950">
                  {t("admin-panel-students-enquiries:detail.sections.info")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.studentName"
                    )}
                  >
                    {enquiry.studentName}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.guardianName"
                    )}
                  >
                    {enquiry.guardianName || "—"}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.email"
                    )}
                  >
                    {enquiry.email || "—"}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.phone"
                    )}
                  >
                    {enquiry.phone || "—"}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.gradeApplyingFor"
                    )}
                  >
                    {enquiry.gradeApplyingFor || "—"}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.previousSchool"
                    )}
                  >
                    {enquiry.previousSchool || "—"}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.source"
                    )}
                  >
                    {t(
                      `admin-panel-students-enquiries:source.${enquiry.source}`
                    )}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.followUpDate"
                    )}
                  >
                    {enquiry.followUpDate
                      ? formatDate(enquiry.followUpDate)
                      : t(
                          "admin-panel-students-enquiries:detail.fields.noFollowUp"
                        )}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.createdAt"
                    )}
                  >
                    {formatDateTime(enquiry.createdAt)}
                  </DetailField>
                  <DetailField
                    label={t(
                      "admin-panel-students-enquiries:detail.fields.updatedAt"
                    )}
                  >
                    {formatDateTime(enquiry.updatedAt)}
                  </DetailField>
                </div>
              </div>

              {/* Status Change */}
              <div>
                <div className="space-y-2">
                  <Label>
                    {t("admin-panel-students-enquiries:actions.changeStatus")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={enquiry.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`admin-panel-students-enquiries:status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {canConvert && (
                      <Button size="sm" onClick={() => setConvertOpen(true)}>
                        <RiUserAddLine className="mr-1 h-4 w-4" />
                        {t("admin-panel-students-enquiries:actions.convert")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes / Follow-up History */}
              <div>
                <h4 className="mb-3 text-label-sm font-semibold text-text-strong-950">
                  {t(
                    "admin-panel-students-enquiries:detail.sections.followUps"
                  )}
                </h4>
                {followUpNotes.length > 0 ? (
                  <div className="mb-4 space-y-3">
                    {followUpNotes.map((note, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-lg border border-stroke-soft-200 p-3"
                      >
                        <RiTimeLine className="mt-0.5 h-4 w-4 shrink-0 text-text-soft-400" />
                        <div>
                          {note.date && (
                            <p className="text-label-xs text-text-soft-400">
                              {note.date}
                            </p>
                          )}
                          <p className="text-paragraph-sm text-text-strong-950 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-4 text-paragraph-sm text-text-soft-400">
                    {t("admin-panel-students-enquiries:followUp.noFollowUps")}
                  </p>
                )}

                <FollowUpForm
                  enquiryId={enquiry.id}
                  existingNotes={enquiry.notes}
                  onSuccess={() => void refetch()}
                />
              </div>
            </div>
          ) : (
            <p className="text-paragraph-sm text-text-soft-400">
              Enquiry not found
            </p>
          )}
        </DialogContent>
      </Dialog>

      {enquiry && (
        <ConvertToStudentModal
          open={convertOpen}
          onOpenChange={setConvertOpen}
          enquiry={enquiry}
          onSuccess={() => void refetch()}
        />
      )}
    </>
  );
}
