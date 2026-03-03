/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
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
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormSelectInput from "@/components/form/select/form-select";
import { useUploadDocumentMutation } from "../queries/queries";
import { DOCUMENT_TYPES } from "../types";
import { useCallback, useRef, useState } from "react";
import { uploadFile } from "@/services/api/upload-file";
import { RiUploadLine, RiFileTextLine, RiCloseLine } from "@remixicon/react";

type UploadDocumentFormData = {
  documentType: { id: string };
  remarks: string;
};

const documentTypeOptions = DOCUMENT_TYPES.map((dt) => ({ id: dt }));

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return yup.object().shape({
    documentType: yup
      .object()
      .shape({ id: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:uploadDocument.inputs.documentType.validation.required"
        )
      ),
    remarks: yup.string().default(""),
  });
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting || disabled}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-students-registrations:actions.uploadDocument")}
    </Button>
  );
}

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
}

export default function UploadDocumentModal({
  open,
  onOpenChange,
  studentId,
}: UploadDocumentModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const uploadMutation = useUploadDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validationSchema = useValidationSchema();

  const methods = useForm<UploadDocumentFormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      documentType: documentTypeOptions[0],
      remarks: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // 10MB max
        if (file.size > 10 * 1024 * 1024) {
          enqueueSnackbar(
            t("admin-panel-students-registrations:uploadDocument.fileTooLarge"),
            { variant: "error" }
          );
          return;
        }
        setSelectedFile(file);
      }
    },
    [enqueueSnackbar, t]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      let fileId: string | undefined;

      // Upload file first if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedFile = await uploadFile(selectedFile);
          fileId = uploadedFile.id;
        } catch {
          enqueueSnackbar(
            t("admin-panel-students-registrations:uploadDocument.uploadFailed"),
            { variant: "error" }
          );
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await uploadMutation.mutateAsync({
        studentId,
        data: {
          documentType: formData.documentType.id,
          remarks: (formData.remarks || undefined) as any,
          fileId: (fileId || undefined) as any,
        },
      });

      enqueueSnackbar(
        t("admin-panel-students-registrations:uploadDocument.success"),
        { variant: "success" }
      );
      onOpenChange(false);
      reset();
      setSelectedFile(null);
    } catch {
      enqueueSnackbar(
        t("admin-panel-students-registrations:uploadDocument.error"),
        { variant: "error" }
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin-panel-students-registrations:uploadDocument.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin-panel-students-registrations:uploadDocument.description")}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormSelectInput<UploadDocumentFormData, { id: string }>
              name="documentType"
              label={t(
                "admin-panel-students-registrations:uploadDocument.inputs.documentType.label"
              )}
              options={documentTypeOptions}
              keyValue="id"
              renderOption={(o) =>
                t(`admin-panel-students-registrations:documentType.${o.id}`)
              }
              testId="upload-doc-type"
            />

            {/* File picker area */}
            <div>
              <label className="mb-1.5 block text-label-sm font-medium text-text-strong-950">
                {t(
                  "admin-panel-students-registrations:uploadDocument.inputs.file.label"
                )}
              </label>
              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
                  <RiFileTextLine className="h-8 w-8 shrink-0 text-primary-base" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-paragraph-sm font-medium text-text-strong-950">
                      {selectedFile.name}
                    </p>
                    <p className="text-paragraph-xs text-text-soft-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="shrink-0 rounded-full p-1 text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950"
                  >
                    <RiCloseLine className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-stroke-soft-200 px-4 py-6 text-center transition-colors hover:border-primary-base hover:bg-primary-base/5"
                >
                  <RiUploadLine className="h-8 w-8 text-text-soft-400" />
                  <span className="text-paragraph-sm font-medium text-text-sub-600">
                    {t(
                      "admin-panel-students-registrations:uploadDocument.inputs.file.placeholder"
                    )}
                  </span>
                  <span className="text-paragraph-xs text-text-soft-400">
                    {t(
                      "admin-panel-students-registrations:uploadDocument.inputs.file.hint"
                    )}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="upload-doc-file"
              />
            </div>

            <FormTextInput<UploadDocumentFormData>
              name="remarks"
              label={t(
                "admin-panel-students-registrations:uploadDocument.inputs.remarks.label"
              )}
              multiline
              minRows={2}
              testId="upload-doc-remarks"
            />

            {isUploading && (
              <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
                <Spinner size="sm" />
                <span>
                  {t(
                    "admin-panel-students-registrations:uploadDocument.uploading"
                  )}
                </span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("admin-panel-students-registrations:actions.cancel")}
              </Button>
              <SubmitButton disabled={isUploading} />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
