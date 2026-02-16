"use client";
import { Button } from "@/components/ui/button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { authControllerForgotPasswordV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "@/services/i18n/client";

type ForgotPasswordFormData = {
  email: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("forgot-password");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("forgot-password:inputs.email.validation.invalid"))
      .required(t("forgot-password:inputs.email.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("forgot-password");
  const { isSubmitting } = useFormState();

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="send-email">
      {t("forgot-password:actions.submit")}
    </Button>
  );
}

function Form() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("forgot-password");
  const validationSchema = useValidationSchema();

  const methods = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await authControllerForgotPasswordV1(formData);

      enqueueSnackbar(t("forgot-password:alerts.success"), {
        variant: "success",
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<keyof ForgotPasswordFormData>
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `forgot-password:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid gap-4">
            <div className="mt-6">
              <h6 className="text-lg font-semibold">
                {t("forgot-password:title")}
              </h6>
            </div>
            <div>
              <FormTextInput<ForgotPasswordFormData>
                name="email"
                label={t("forgot-password:inputs.email.label")}
                type="email"
                testId="email"
              />
            </div>

            <div>
              <FormActions />
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

function ForgotPassword() {
  return <Form />;
}

export default withPageRequiredGuest(ForgotPassword);
