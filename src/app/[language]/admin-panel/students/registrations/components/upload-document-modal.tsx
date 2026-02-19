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

function SubmitButton() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting}>
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

  const validationSchema = useValidationSchema();

  const methods = useForm<UploadDocumentFormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      documentType: documentTypeOptions[0],
      remarks: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await uploadMutation.mutateAsync({
        studentId,
        data: {
          documentType: formData.documentType.id,
          remarks: (formData.remarks || undefined) as any,
        },
      });

      enqueueSnackbar(
        t("admin-panel-students-registrations:uploadDocument.success"),
        { variant: "success" }
      );
      onOpenChange(false);
      reset();
    } catch {
      enqueueSnackbar("Failed to upload document", { variant: "error" });
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

            <FormTextInput<UploadDocumentFormData>
              name="remarks"
              label={t(
                "admin-panel-students-registrations:uploadDocument.inputs.remarks.label"
              )}
              multiline
              minRows={2}
              testId="upload-doc-remarks"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("admin-panel-students-registrations:actions.cancel")}
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
