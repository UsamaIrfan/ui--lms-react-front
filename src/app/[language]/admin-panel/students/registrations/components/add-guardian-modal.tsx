"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import FormCheckboxInput from "@/components/form/checkbox-boolean/form-checkbox-boolean";
import { useAddGuardianMutation } from "../queries/queries";
import { GUARDIAN_RELATIONS } from "../types";

type AddGuardianFormData = {
  name: string;
  phone: string;
  email: string;
  relation: { id: string };
  isPrimary: boolean;
};

const relationOptions = GUARDIAN_RELATIONS.map((r) => ({ id: r }));

function useValidationSchema() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return yup.object().shape({
    name: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addGuardian.inputs.name.validation.required"
        )
      ),
    phone: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addGuardian.inputs.phone.validation.required"
        )
      ),
    email: yup.string().email().default(""),
    relation: yup
      .object()
      .shape({ id: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:addGuardian.inputs.relation.validation.required"
        )
      ),
    isPrimary: yup.boolean().default(false),
  });
}

function SubmitButton() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-students-registrations:addGuardian.submit")}
    </Button>
  );
}

interface AddGuardianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
}

export default function AddGuardianModal({
  open,
  onOpenChange,
  studentId,
}: AddGuardianModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const addGuardianMutation = useAddGuardianMutation();

  const validationSchema = useValidationSchema();

  const methods = useForm<AddGuardianFormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      relation: relationOptions[0],
      isPrimary: false,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await addGuardianMutation.mutateAsync({
        studentId,
        data: {
          name: formData.name,
          phone: formData.phone,
          email: (formData.email || undefined) as any,
          relation: formData.relation.id,
          isPrimary: formData.isPrimary,
        },
      });

      enqueueSnackbar(
        t("admin-panel-students-registrations:addGuardian.success"),
        { variant: "success" }
      );
      onOpenChange(false);
      reset();
    } catch {
      enqueueSnackbar("Failed to add guardian", { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("admin-panel-students-registrations:addGuardian.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin-panel-students-registrations:addGuardian.description")}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="grid gap-4">
            <FormTextInput<AddGuardianFormData>
              name="name"
              label={t(
                "admin-panel-students-registrations:addGuardian.inputs.name.label"
              )}
              testId="guardian-name"
            />

            <FormTextInput<AddGuardianFormData>
              name="phone"
              label={t(
                "admin-panel-students-registrations:addGuardian.inputs.phone.label"
              )}
              testId="guardian-phone"
            />

            <FormTextInput<AddGuardianFormData>
              name="email"
              label={t(
                "admin-panel-students-registrations:addGuardian.inputs.email.label"
              )}
              testId="guardian-email"
            />

            <FormSelectInput<AddGuardianFormData, { id: string }>
              name="relation"
              label={t(
                "admin-panel-students-registrations:addGuardian.inputs.relation.label"
              )}
              options={relationOptions}
              keyValue="id"
              renderOption={(o) =>
                t(`admin-panel-students-registrations:guardianRelation.${o.id}`)
              }
              testId="guardian-relation"
            />

            <FormCheckboxInput<AddGuardianFormData>
              name="isPrimary"
              label={t(
                "admin-panel-students-registrations:addGuardian.inputs.isPrimary.label"
              )}
              testId="guardian-primary"
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
