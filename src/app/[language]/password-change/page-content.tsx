"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import FormTextInput from "@/components/form/text-input/form-text-input";
import Link from "@/components/link";

import { authControllerResetPasswordV1 } from "@/services/api/generated/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";

type PasswordChangeFormData = {
  password: string;
  passwordConfirmation: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("password-change");

  return yup.object().shape({
    password: yup
      .string()
      .min(6, t("password-change:inputs.password.validation.min"))
      .required(t("password-change:inputs.password.validation.required")),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("password-change:inputs.passwordConfirmation.validation.match")
      )
      .required(
        t("password-change:inputs.passwordConfirmation.validation.required")
      ),
  });
};

function FormActions() {
  const { t } = useTranslation("password-change");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="set-password"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("password-change:actions.submit")}
        </span>
      ) : (
        t("password-change:actions.submit")
      )}
    </Button>
  );
}

function ExpiresAlert() {
  const { t } = useTranslation("password-change");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const expires = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return Number(params.get("expires"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      if (expires < now) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expires]);

  const isExpired = expires < currentTime;

  return (
    isExpired && (
      <div
        className="rounded-lg border border-error-lighter bg-error-lighter/10 px-4 py-3 text-paragraph-sm text-error-base"
        data-testid="reset-link-expired-alert"
      >
        {t("password-change:alerts.expired")}
      </div>
    )
  );
}

function Form() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("password-change");
  const validationSchema = useValidationSchema();
  const router = useRouter();

  const methods = useForm<PasswordChangeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");
    if (!hash) return;

    try {
      await authControllerResetPasswordV1({
        password: formData.password,
        hash,
      });

      enqueueSnackbar(t("password-change:alerts.success"), {
        variant: "success",
      });

      router.replace("/sign-in");
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<keyof PasswordChangeFormData>
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `password-change:inputs.${key}.validation.server.${error.body.errors[key]}`
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
              {t("password-change:title")}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("password-change:description")}
            </p>
          </CardHeader>

          <CardContent>
            <ExpiresAlert />

            <form onSubmit={onSubmit} className="mt-1">
              <div className="grid gap-5">
                <FormTextInput<PasswordChangeFormData>
                  name="password"
                  label={t("password-change:inputs.password.label")}
                  type="password"
                  autoFocus
                  testId="password"
                  autoComplete="new-password"
                />

                <FormTextInput<PasswordChangeFormData>
                  name="passwordConfirmation"
                  label={t("password-change:inputs.passwordConfirmation.label")}
                  type="password"
                  testId="password-confirmation"
                  autoComplete="new-password"
                />

                <FormActions />
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-stroke-soft-200 py-4">
            <p className="text-paragraph-sm text-text-sub-600">
              {t("password-change:backToSignIn")}{" "}
              <Link
                href="/sign-in"
                className="text-label-sm text-primary-base transition-colors hover:text-primary-dark"
              >
                {t("password-change:signIn")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  );
}

function PasswordChange() {
  return <Form />;
}

export default withPageRequiredGuest(PasswordChange);
