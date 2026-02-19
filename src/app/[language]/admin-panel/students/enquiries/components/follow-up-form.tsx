"use client";

import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormDatePickerInput from "@/components/form/date-pickers/date-picker";
import { useUpdateEnquiryMutation } from "../queries/queries";

type FollowUpFormData = {
  note: string;
  nextFollowUpDate: Date | null;
};

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-enquiries");
  return yup.object().shape({
    note: yup
      .string()
      .required(
        t(
          "admin-panel-students-enquiries:followUp.inputs.note.validation.required"
        )
      ),
    nextFollowUpDate: yup.date().nullable().default(null),
  });
}

function SubmitButton() {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting} size="sm">
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-students-enquiries:actions.submit")}
    </Button>
  );
}

interface FollowUpFormProps {
  enquiryId: number;
  existingNotes: string | null;
  onSuccess?: () => void;
}

export default function FollowUpForm({
  enquiryId,
  existingNotes,
  onSuccess,
}: FollowUpFormProps) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const { enqueueSnackbar } = useSnackbar();
  const updateMutation = useUpdateEnquiryMutation();
  const validationSchema = useValidationSchema();

  const methods = useForm<FollowUpFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      note: "",
      nextFollowUpDate: null,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const newNotes = existingNotes
        ? `${existingNotes}\n\n---\n[${new Date().toLocaleDateString()}] ${formData.note}`
        : `[${new Date().toLocaleDateString()}] ${formData.note}`;

      await updateMutation.mutateAsync({
        id: enquiryId,
        data: {
          notes: newNotes,
          followUpDate: formData.nextFollowUpDate
            ? formData.nextFollowUpDate.toISOString().split("T")[0]
            : undefined,
        },
      });

      enqueueSnackbar(t("admin-panel-students-enquiries:followUp.success"), {
        variant: "success",
      });
      reset();
      onSuccess?.();
    } catch {
      enqueueSnackbar("Failed to add follow-up note", { variant: "error" });
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="grid gap-3">
        <h4 className="text-label-sm font-semibold text-text-strong-950">
          {t("admin-panel-students-enquiries:followUp.title")}
        </h4>
        <FormTextInput<FollowUpFormData>
          name="note"
          label={t("admin-panel-students-enquiries:followUp.inputs.note.label")}
          multiline
          minRows={2}
          testId="follow-up-note"
        />
        <FormDatePickerInput<FollowUpFormData>
          name="nextFollowUpDate"
          label={t(
            "admin-panel-students-enquiries:followUp.inputs.nextFollowUpDate.label"
          )}
          minDate={new Date()}
          testId="follow-up-date"
        />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </FormProvider>
  );
}
