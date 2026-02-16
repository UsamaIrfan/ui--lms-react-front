"use client";

import { useForm, FormProvider, useFormState, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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
import FormCheckboxInput from "@/components/form/checkbox/form-checkbox";
import Link from "@/components/link";
import SocialAuth from "@/services/social-auth/social-auth";

import {
  authControllerLoginV1,
  authControllerRegisterV1,
} from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";

import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { User } from "@/services/api/types/user";

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  policy: TPolicy[];
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("sign-up:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("sign-up:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-up:inputs.password.validation.min"))
      .required(t("sign-up:inputs.password.validation.required")),
    policy: yup
      .array()
      .min(1, t("sign-up:inputs.policy.validation.required"))
      .required(),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="sign-up-submit"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("sign-up:actions.submit")}
        </span>
      ) : (
        t("sign-up:actions.submit")
      )}
    </Button>
  );
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { t } = useTranslation("sign-up");

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  if (!password) return null;

  const levels = [
    { label: t("sign-up:passwordStrength.weak"), color: "bg-error-base" },
    { label: t("sign-up:passwordStrength.fair"), color: "bg-warning-base" },
    { label: t("sign-up:passwordStrength.good"), color: "bg-warning-base" },
    { label: t("sign-up:passwordStrength.strong"), color: "bg-success-base" },
    {
      label: t("sign-up:passwordStrength.veryStrong"),
      color: "bg-success-base",
    },
  ];

  const level = levels[Math.min(strength, levels.length) - 1] ?? levels[0];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? level.color : "bg-bg-soft-200"
            }`}
          />
        ))}
      </div>
      <p className="text-paragraph-xs text-text-soft-400">{level.label}</p>
    </div>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();
  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      policy: [],
    },
  });

  const { handleSubmit, setError } = methods;
  const passwordValue = useWatch({
    control: methods.control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await authControllerRegisterV1(formData);
    } catch (error) {
      if (isValidationError(error)) {
        (Object.keys(error.body.errors) as Array<keyof SignUpFormData>).forEach(
          (key) => {
            setError(key, {
              type: "manual",
              message: t(
                `sign-up:inputs.${key}.validation.server.${error.body.errors[key]}`
              ),
            });
          }
        );
      }

      return;
    }

    try {
      const { data: dataSignIn } = await authControllerLoginV1({
        email: formData.email,
        password: formData.password,
      });

      setTokensInfo({
        token: dataSignIn.token,
        refreshToken: dataSignIn.refreshToken,
        tokenExpires: dataSignIn.tokenExpires,
      });
      setUser(dataSignIn.user as unknown as User);
    } catch {
      // Login after registration failed — user can try logging in manually
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
              {t("sign-up:title")}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("sign-up:description")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormTextInput<SignUpFormData>
                    name="firstName"
                    label={t("sign-up:inputs.firstName.label")}
                    type="text"
                    autoFocus
                    testId="first-name"
                    autoComplete="given-name"
                  />

                  <FormTextInput<SignUpFormData>
                    name="lastName"
                    label={t("sign-up:inputs.lastName.label")}
                    type="text"
                    testId="last-name"
                    autoComplete="family-name"
                  />
                </div>

                <FormTextInput<SignUpFormData>
                  name="email"
                  label={t("sign-up:inputs.email.label")}
                  type="email"
                  testId="email"
                  autoComplete="email"
                />

                <div>
                  <FormTextInput<SignUpFormData>
                    name="password"
                    label={t("sign-up:inputs.password.label")}
                    type="password"
                    testId="password"
                    autoComplete="new-password"
                  />
                  <PasswordStrengthIndicator password={passwordValue} />
                </div>

                <FormCheckboxInput
                  name="policy"
                  label=""
                  testId="privacy"
                  options={policyOptions}
                  keyValue="id"
                  keyExtractor={(option) => option.id.toString()}
                  renderOption={(option) => (
                    <span className="text-paragraph-sm text-text-sub-600">
                      {option.name}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        className="text-primary-base transition-colors hover:text-primary-dark"
                      >
                        {t("sign-up:inputs.policy.label")}
                      </a>
                    </span>
                  )}
                />

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
                      {t("sign-up:or")}
                    </Badge>
                  </div>
                </div>

                <SocialAuth />
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-stroke-soft-200 py-4">
            <p className="text-paragraph-sm text-text-sub-600">
              {t("sign-up:hasAccount")}{" "}
              <Link
                data-testid="login"
                href="/sign-in"
                className="text-label-sm text-primary-base transition-colors hover:text-primary-dark"
              >
                {t("sign-up:actions.accountAlreadyExists")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  );
}

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
