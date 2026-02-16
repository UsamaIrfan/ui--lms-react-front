"use client";
import { Button } from "@/components/ui/button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import {
  authControllerLoginV1,
  authControllerRegisterV1,
} from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormCheckboxInput from "@/components/form/checkbox/form-checkbox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SocialAuth from "@/services/social-auth/social-auth";
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
    <Button type="submit" disabled={isSubmitting} data-testid="sign-up-submit">
      {t("sign-up:actions.submit")}
    </Button>
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

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid gap-4">
            <div className="mt-6">
              <h6 className="text-lg font-semibold">{t("sign-up:title")}</h6>
            </div>
            <div>
              <FormTextInput<SignUpFormData>
                name="firstName"
                label={t("sign-up:inputs.firstName.label")}
                type="text"
                autoFocus
                testId="first-name"
              />
            </div>

            <div>
              <FormTextInput<SignUpFormData>
                name="lastName"
                label={t("sign-up:inputs.lastName.label")}
                type="text"
                testId="last-name"
              />
            </div>

            <div>
              <FormTextInput<SignUpFormData>
                name="email"
                label={t("sign-up:inputs.email.label")}
                type="email"
                testId="email"
              />
            </div>

            <div>
              <FormTextInput<SignUpFormData>
                name="password"
                label={t("sign-up:inputs.password.label")}
                type="password"
                testId="password"
              />
            </div>
            <div>
              <FormCheckboxInput
                name="policy"
                label=""
                testId="privacy"
                options={policyOptions}
                keyValue="id"
                keyExtractor={(option) => option.id.toString()}
                renderOption={(option) => (
                  <span>
                    {option.name}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      className="text-primary-base underline hover:opacity-80"
                    >
                      {t("sign-up:inputs.policy.label")}
                    </a>
                  </span>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <FormActions />
              <Button variant="secondary" asChild>
                <Link data-testid="login" href="/sign-in">
                  {t("sign-up:actions.accountAlreadyExists")}
                </Link>
              </Button>
            </div>

            {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
              <div>
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary">{t("sign-up:or")}</Badge>
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

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
