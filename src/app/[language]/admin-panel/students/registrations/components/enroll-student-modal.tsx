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
import { useEnrollStudentMutation } from "../queries/queries";

type EnrollFormData = {
  sectionId: string;
  academicYearId: string;
};

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return yup.object().shape({
    sectionId: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:enroll.inputs.sectionId.validation.required"
        )
      ),
    academicYearId: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:enroll.inputs.academicYearId.validation.required"
        )
      ),
  });
}

function SubmitButton() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-students-registrations:actions.enroll")}
    </Button>
  );
}

interface EnrollStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  studentName: string;
}

export default function EnrollStudentModal({
  open,
  onOpenChange,
  studentId,
  studentName,
}: EnrollStudentModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const enrollMutation = useEnrollStudentMutation();

  const validationSchema = useValidationSchema();

  const methods = useForm<EnrollFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      sectionId: "",
      academicYearId: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await enrollMutation.mutateAsync({
        studentId,
        data: {
          sectionId: parseInt(formData.sectionId, 10),
          academicYearId: parseInt(formData.academicYearId, 10),
        },
      });

      enqueueSnackbar(t("admin-panel-students-registrations:enroll.success"), {
        variant: "success",
      });
      onOpenChange(false);
      reset();
    } catch {
      enqueueSnackbar("Failed to enroll student", { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin-panel-students-registrations:enroll.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin-panel-students-registrations:enroll.description")}{" "}
            <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormTextInput<EnrollFormData>
              name="sectionId"
              label={t(
                "admin-panel-students-registrations:enroll.inputs.sectionId.label"
              )}
              testId="enroll-section"
            />
            <FormTextInput<EnrollFormData>
              name="academicYearId"
              label={t(
                "admin-panel-students-registrations:enroll.inputs.academicYearId.label"
              )}
              testId="enroll-academic-year"
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
