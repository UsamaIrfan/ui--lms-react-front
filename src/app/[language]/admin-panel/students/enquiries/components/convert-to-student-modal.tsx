"use client";

import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateEnquiryMutation } from "../queries/queries";
import type { AdmissionEnquiry } from "../types";
import { EnquiryStatus } from "../types";
import { useState } from "react";

interface ConvertToStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiry: AdmissionEnquiry;
  onSuccess?: () => void;
}

export default function ConvertToStudentModal({
  open,
  onOpenChange,
  enquiry,
  onSuccess,
}: ConvertToStudentModalProps) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { enqueueSnackbar } = useSnackbar();
  const updateMutation = useUpdateEnquiryMutation();
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      await updateMutation.mutateAsync({
        id: enquiry.id,
        data: {
          status: EnquiryStatus.ENROLLED,
        },
      });

      enqueueSnackbar(t("admin-panel-students-enquiries:convert.success"), {
        variant: "success",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      enqueueSnackbar("Failed to convert enquiry", { variant: "error" });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin-panel-students-enquiries:convert.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin-panel-students-enquiries:convert.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-label-xs text-text-soft-400">
                {t(
                  "admin-panel-students-enquiries:convert.inputs.studentName.label"
                )}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {enquiry.studentName}
              </p>
            </div>
            <div>
              <p className="text-label-xs text-text-soft-400">
                {t(
                  "admin-panel-students-enquiries:convert.inputs.guardianName.label"
                )}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {enquiry.guardianName || "—"}
              </p>
            </div>
            <div>
              <p className="text-label-xs text-text-soft-400">
                {t("admin-panel-students-enquiries:convert.inputs.email.label")}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {enquiry.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-label-xs text-text-soft-400">
                {t("admin-panel-students-enquiries:convert.inputs.phone.label")}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {enquiry.phone || "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-label-xs text-text-soft-400">
                {t(
                  "admin-panel-students-enquiries:convert.inputs.gradeApplyingFor.label"
                )}
              </p>
              <p className="text-paragraph-sm text-text-strong-950">
                {enquiry.gradeApplyingFor || "—"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
          >
            {t("admin-panel-students-enquiries:actions.cancel")}
          </Button>
          <Button onClick={handleConvert} disabled={isConverting}>
            {isConverting && <Spinner size="sm" className="mr-2" />}
            {t("admin-panel-students-enquiries:actions.convert")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
