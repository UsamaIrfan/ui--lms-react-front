"use client";
import { Button } from "@/components/ui/button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { authControllerResetPasswordV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/services/i18n/client";
import { useEffect, useMemo, useState } from "react";

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
    <Button type="submit" disabled={isSubmitting} data-testid="set-password">
      {t("password-change:actions.submit")}
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
      <div>
        <div
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          data-testid="reset-link-expired-alert"
        >
          {t("password-change:alerts.expired")}
        </div>
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
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid gap-4">
            <div className="mt-6">
              <h6 className="text-lg font-semibold">
                {t("password-change:title")}
              </h6>
            </div>
            <ExpiresAlert />
            <div>
              <FormTextInput<PasswordChangeFormData>
                name="password"
                label={t("password-change:inputs.password.label")}
                type="password"
                testId="password"
              />
            </div>
            <div>
              <FormTextInput<PasswordChangeFormData>
                name="passwordConfirmation"
                label={t("password-change:inputs.passwordConfirmation.label")}
                type="password"
                testId="password-confirmation"
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

function PasswordChange() {
  return <Form />;
}

export default withPageRequiredGuest(PasswordChange);
