"use client";

import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import { getHttpErrorMessage } from "@/services/api/generated/custom-fetch";
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
import FormSelectInput from "@/components/form/select/form-select";
import { useEnrollStudentMutation } from "../queries/queries";
import { useSectionsListQuery } from "../../../academics/classes/queries/queries";
import { useAcademicYearsListQuery } from "../../../academics/year/queries/queries";
import { useMemo } from "react";

type SectionOption = { id: number; name: string };
type AcademicYearOption = { id: number; name: string };

type EnrollFormData = {
  section: SectionOption | null;
  academicYear: AcademicYearOption | null;
};

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return yup.object().shape({
    section: yup
      .object()
      .shape({ id: yup.number().required(), name: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:enroll.inputs.sectionId.validation.required"
        )
      )
      .nullable(),
    academicYear: yup
      .object()
      .shape({ id: yup.number().required(), name: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:enroll.inputs.academicYearId.validation.required"
        )
      )
      .nullable(),
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

  const { data: sections } = useSectionsListQuery();
  const { data: academicYears } = useAcademicYearsListQuery();

  const sectionOptions: SectionOption[] = useMemo(
    () =>
      (sections ?? []).map((s) => ({
        id: typeof s.id === "number" ? s.id : Number(s.id),
        name: s.name ?? `Section #${s.id}`,
      })),
    [sections]
  );

  const academicYearOptions: AcademicYearOption[] = useMemo(
    () =>
      (academicYears ?? []).map((ay) => ({
        id: typeof ay.id === "number" ? ay.id : Number(ay.id),
        name: ay.name ?? `Year #${ay.id}`,
      })),
    [academicYears]
  );

  const validationSchema = useValidationSchema();

  const methods = useForm<EnrollFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      section: null,
      academicYear: null,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    if (!formData.section || !formData.academicYear) {
      return;
    }
    try {
      await enrollMutation.mutateAsync({
        studentId,
        data: {
          sectionId: formData.section.id,
          academicYearId: formData.academicYear.id,
        },
      });

      enqueueSnackbar(t("admin-panel-students-registrations:enroll.success"), {
        variant: "success",
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      enqueueSnackbar(getHttpErrorMessage(error) ?? t("admin-panel-students-registrations:enroll.error"), {
        variant: "error",
      });
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
            <FormSelectInput<EnrollFormData, SectionOption>
              name="section"
              label={t(
                "admin-panel-students-registrations:enroll.inputs.sectionId.label"
              )}
              options={sectionOptions}
              keyValue="id"
              renderOption={(o) => o.name}
              testId="enroll-section"
            />
            <FormSelectInput<EnrollFormData, AcademicYearOption>
              name="academicYear"
              label={t(
                "admin-panel-students-registrations:enroll.inputs.academicYearId.label"
              )}
              options={academicYearOptions}
              keyValue="id"
              renderOption={(o) => o.name}
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
