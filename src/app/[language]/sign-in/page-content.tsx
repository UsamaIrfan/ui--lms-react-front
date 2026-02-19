"use client";

import { useCallback } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import FormTextInput from "@/components/form/text-input/form-text-input";
import Link from "@/components/link";
import SocialAuth from "@/services/social-auth/social-auth";

import { authControllerLoginV1 } from "@/services/api/generated/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import useTenant from "@/services/tenant/use-tenant";
import useLanguage from "@/services/i18n/use-language";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { getDefaultRouteForRole } from "@/services/auth/role-routes";

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
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="sign-in-submit"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("sign-in:actions.submit")}
        </span>
      ) : (
        t("sign-in:actions.submit")
      )}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const { tenants } = useTenant();
  const { t } = useTranslation("sign-in");
  const language = useLanguage();
  const router = useRouter();
  const validationSchema = useValidationSchema();

  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const handlePostLogin = useCallback(
    (loggedInUser: User) => {
      const defaultRoute = getDefaultRouteForRole(
        loggedInUser.role?.id,
        language
      );

      if (tenants.length > 1) {
        router.push(
          `/${language}/select-tenant?returnTo=${encodeURIComponent(defaultRoute)}`
        );
      } else {
        router.push(defaultRoute);
      }
    },
    [tenants.length, router, language]
  );

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const { data } = await authControllerLoginV1(formData);

      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      const loggedInUser = data.user as unknown as User;
      setUser(loggedInUser);
      handlePostLogin(loggedInUser);
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

  const hasSocialAuth = [isGoogleAuthEnabled, isFacebookAuthEnabled].some(
    Boolean
  );

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-title-h4 text-text-strong-950">
              {t("sign-in:title")}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("sign-in:description")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-5">
                <FormTextInput<SignInFormData>
                  name="email"
                  label={t("sign-in:inputs.email.label")}
                  type="email"
                  testId="email"
                  autoFocus
                  autoComplete="email"
                />

                <FormTextInput<SignInFormData>
                  name="password"
                  label={t("sign-in:inputs.password.label")}
                  type="password"
                  testId="password"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    data-testid="forgot-password"
                    className="text-label-xs text-primary-base transition-colors hover:text-primary-dark"
                  >
                    {t("sign-in:actions.forgotPassword")}
                  </Link>
                </div>

                <FormActions />
              </div>
            </form>

            {hasSocialAuth && (
              <div className="mt-6">
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge
                      variant="secondary"
                      className="px-3 text-text-soft-400"
                    >
                      {t("sign-in:or")}
                    </Badge>
                  </div>
                </div>

                <SocialAuth />
              </div>
            )}
          </CardContent>

          {IS_SIGN_UP_ENABLED && (
            <CardFooter className="justify-center border-t border-stroke-soft-200 py-4">
              <p className="text-paragraph-sm text-text-sub-600">
                {t("sign-in:noAccount")}{" "}
                <Link
                  href="/sign-up"
                  data-testid="create-account"
                  className="text-label-sm text-primary-base transition-colors hover:text-primary-dark"
                >
                  {t("sign-in:actions.createAccount")}
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </FormProvider>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);
