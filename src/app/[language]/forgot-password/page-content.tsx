"use client";

import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import FormTextInput from "@/components/form/text-input/form-text-input";
import Link from "@/components/link";

import { authControllerForgotPasswordV1 } from "@/services/api/generated/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";

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
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="send-email"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("forgot-password:actions.submit")}
        </span>
      ) : (
        t("forgot-password:actions.submit")
      )}
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-title-h4 text-text-strong-950">
              {t("forgot-password:title")}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("forgot-password:description")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-5">
                <FormTextInput<ForgotPasswordFormData>
                  name="email"
                  label={t("forgot-password:inputs.email.label")}
                  type="email"
                  autoFocus
                  testId="email"
                  autoComplete="email"
                />

                <FormActions />
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-stroke-soft-200 py-4">
            <p className="text-paragraph-sm text-text-sub-600">
              {t("forgot-password:rememberPassword")}{" "}
              <Link
                href="/sign-in"
                className="text-label-sm text-primary-base transition-colors hover:text-primary-dark"
              >
                {t("forgot-password:backToSignIn")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  );
}

function ForgotPassword() {
  return <Form />;
}

export default withPageRequiredGuest(ForgotPassword);
