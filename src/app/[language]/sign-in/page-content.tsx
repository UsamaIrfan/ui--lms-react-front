"use client";
import { Button } from "@/components/ui/button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { authControllerLoginV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";
import SocialAuth from "@/services/social-auth/social-auth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import { User } from "@/services/api/types/user";

type SignInFormData = {
  email: string;
  password: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-in:inputs.password.validation.min"))
      .required(t("sign-in:inputs.password.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-in");
  const { isSubmitting } = useFormState();

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="sign-in-submit">
      {t("sign-in:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const { t } = useTranslation("sign-in");
  const validationSchema = useValidationSchema();

  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const { data } = await authControllerLoginV1(formData);

      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user as unknown as User);
    } catch (error) {
      if (isValidationError(error)) {
        (Object.keys(error.body.errors) as Array<keyof SignInFormData>).forEach(
          (key) => {
            setError(key, {
              type: "manual",
              message: t(
                `sign-in:inputs.${key}.validation.server.${error.body.errors[key]}`
              ),
            });
          }
        );
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid gap-4">
            <div className="mt-6">
              <h6 className="text-lg font-semibold">{t("sign-in:title")}</h6>
            </div>
            <div>
              <FormTextInput<SignInFormData>
                name="email"
                label={t("sign-in:inputs.email.label")}
                type="email"
                testId="email"
                autoFocus
              />
            </div>

            <div>
              <FormTextInput<SignInFormData>
                name="password"
                label={t("sign-in:inputs.password.label")}
                type="password"
                testId="password"
              />
            </div>
            <div>
              <Link
                href="/forgot-password"
                data-testid="forgot-password"
                className="text-sm text-primary-base underline hover:opacity-80"
              >
                {t("sign-in:actions.forgotPassword")}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <FormActions />

              {IS_SIGN_UP_ENABLED && (
                <Button variant="secondary" asChild>
                  <Link href="/sign-up" data-testid="create-account">
                    {t("sign-in:actions.createAccount")}
                  </Link>
                </Button>
              )}
            </div>

            {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
              <div>
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary">{t("sign-in:or")}</Badge>
                  </div>
                </div>

                <SocialAuth />
              </div>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);
