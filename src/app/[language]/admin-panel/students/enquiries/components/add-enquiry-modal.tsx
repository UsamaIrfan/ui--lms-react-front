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
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormSelectInput from "@/components/form/select/form-select";
import { Spinner } from "@/components/ui/spinner";
import { useCreateEnquiryMutation } from "../queries/queries";
import type { CreateAdmissionEnquiryDto } from "@/services/api/generated/model";
import { EnquirySource } from "../types";
import type { AdmissionEnquiry } from "../types";
import { useState } from "react";

type EnquiryFormData = {
  studentName: string;
  guardianName: string;
  email: string;
  phone: string;
  gradeApplyingFor: string;
  previousSchool: string;
  source: { id: string };
  notes: string;
};

const sourceOptions = Object.values(EnquirySource).map((s) => ({ id: s }));

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-enquiries");
  return yup.object().shape({
    studentName: yup
      .string()
      .required(
        t(
          "admin-panel-students-enquiries:addEnquiry.inputs.studentName.validation.required"
        )
      ),
    guardianName: yup.string().default(""),
    email: yup
      .string()
      .email(
        t(
          "admin-panel-students-enquiries:addEnquiry.inputs.email.validation.invalid"
        )
      )
      .default(""),
    phone: yup.string().default(""),
    gradeApplyingFor: yup.string().default(""),
    previousSchool: yup.string().default(""),
    source: yup
      .object()
      .shape({ id: yup.string().required() })
      .required()
      .nullable(),
    notes: yup.string().default(""),
  });
}

function SubmitButton({ addAnother }: { addAnother?: boolean }) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {addAnother
        ? t("admin-panel-students-enquiries:actions.addAnother")
        : t("admin-panel-students-enquiries:actions.submit")}
    </Button>
  );
}

interface AddEnquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: AdmissionEnquiry | null;
}

export default function AddEnquiryModal({
  open,
  onOpenChange,
  editData,
}: AddEnquiryModalProps) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateEnquiryMutation();
  const [addAnother, setAddAnother] = useState(false);

  const validationSchema = useValidationSchema();

  const methods = useForm<EnquiryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      studentName: editData?.studentName ?? "",
      guardianName: editData?.guardianName ?? "",
      email: editData?.email ?? "",
      phone: editData?.phone ?? "",
      gradeApplyingFor: editData?.gradeApplyingFor ?? "",
      previousSchool: editData?.previousSchool ?? "",
      source: editData?.source
        ? { id: editData.source }
        : { id: EnquirySource.WALK_IN },
      notes: editData?.notes ?? "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await createMutation.mutateAsync({
        studentName: formData.studentName,
        guardianName: formData.guardianName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        gradeApplyingFor: formData.gradeApplyingFor || undefined,
        previousSchool: formData.previousSchool || undefined,
        source: formData.source?.id || undefined,
        notes: formData.notes || undefined,
      } as CreateAdmissionEnquiryDto);

      enqueueSnackbar(t("admin-panel-students-enquiries:addEnquiry.success"), {
        variant: "success",
      });

      if (addAnother) {
        reset();
      } else {
        onOpenChange(false);
        reset();
      }
    } catch {
      enqueueSnackbar("Failed to create enquiry", { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t("admin-panel-students-enquiries:addEnquiry.editTitle")
              : t("admin-panel-students-enquiries:addEnquiry.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin-panel-students-enquiries:addEnquiry.title")}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormTextInput<EnquiryFormData>
              name="studentName"
              label={t(
                "admin-panel-students-enquiries:addEnquiry.inputs.studentName.label"
              )}
              testId="enquiry-student-name"
              autoFocus
            />

            <FormTextInput<EnquiryFormData>
              name="guardianName"
              label={t(
                "admin-panel-students-enquiries:addEnquiry.inputs.guardianName.label"
              )}
              testId="enquiry-guardian-name"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormTextInput<EnquiryFormData>
                name="email"
                type="email"
                label={t(
                  "admin-panel-students-enquiries:addEnquiry.inputs.email.label"
                )}
                testId="enquiry-email"
              />
              <FormTextInput<EnquiryFormData>
                name="phone"
                label={t(
                  "admin-panel-students-enquiries:addEnquiry.inputs.phone.label"
                )}
                testId="enquiry-phone"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormTextInput<EnquiryFormData>
                name="gradeApplyingFor"
                label={t(
                  "admin-panel-students-enquiries:addEnquiry.inputs.gradeApplyingFor.label"
                )}
                testId="enquiry-grade"
              />
              <FormTextInput<EnquiryFormData>
                name="previousSchool"
                label={t(
                  "admin-panel-students-enquiries:addEnquiry.inputs.previousSchool.label"
                )}
                testId="enquiry-prev-school"
              />
            </div>

            <FormSelectInput<EnquiryFormData, { id: string }>
              name="source"
              label={t(
                "admin-panel-students-enquiries:addEnquiry.inputs.source.label"
              )}
              options={sourceOptions}
              keyValue="id"
              renderOption={(option) =>
                t(`admin-panel-students-enquiries:source.${option.id}`)
              }
              testId="enquiry-source"
            />

            <FormTextInput<EnquiryFormData>
              name="notes"
              label={t(
                "admin-panel-students-enquiries:addEnquiry.inputs.notes.label"
              )}
              multiline
              minRows={3}
              testId="enquiry-notes"
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddAnother(true);
                  void onSubmit();
                }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && addAnother && (
                  <Spinner size="sm" className="mr-2" />
                )}
                {t("admin-panel-students-enquiries:actions.addAnother")}
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
