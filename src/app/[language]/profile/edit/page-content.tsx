"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormAvatarInput from "@/components/form/avatar-input/form-avatar-input";
import Link from "@/components/link";

import { authControllerUpdateV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "@/hooks/use-snackbar";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { useTranslation } from "@/services/i18n/client";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { FileEntity } from "@/services/api/types/file-entity";
import { User, UserProviderEnum } from "@/services/api/types/user";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type EditProfileBasicInfoFormData = {
  firstName: string;
  lastName: string;
  photo?: FileEntity;
};

type EditProfileChangePasswordFormData = {
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
};

type EditProfileChangeEmailFormData = {
  email: string;
  emailConfirmation: string;
};

// ─────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────

const useValidationBasicInfoSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("profile:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("profile:inputs.lastName.validation.required")),
  });
};

const useValidationChangeEmailSchema = () => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();

  return yup.object().shape({
    email: yup
      .string()
      .notOneOf(
        [user?.email],
        t("profile:inputs.email.validation.currentEmail")
      )
      .email(t("profile:inputs.email.validation.email"))
      .required(t("profile:inputs.email.validation.required")),
    emailConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("email")],
        t("profile:inputs.emailConfirmation.validation.match")
      )
      .required(t("profile:inputs.emailConfirmation.validation.required")),
  });
};

const useValidationChangePasswordSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    oldPassword: yup
      .string()
      .min(6, t("profile:inputs.password.validation.min"))
      .required(t("profile:inputs.password.validation.required")),
    password: yup
      .string()
      .min(6, t("profile:inputs.password.validation.min"))
      .required(t("profile:inputs.password.validation.required")),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("profile:inputs.passwordConfirmation.validation.match")
      )
      .required(t("profile:inputs.passwordConfirmation.validation.required")),
  });
};

// ─────────────────────────────────────────────
// Form Action Components
// ─────────────────────────────────────────────

function FormSubmitButton({
  testId,
  label,
}: {
  testId: string;
  label: string;
}) {
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid={testId}>
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {label}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

// ─────────────────────────────────────────────
// Basic Info Form
// ─────────────────────────────────────────────

function FormBasicInfo() {
  const { setUser } = useAuthActions();
  const { user } = useAuth();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationBasicInfoSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProfileBasicInfoFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      photo: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const { data } = await authControllerUpdateV1({
        firstName: formData.firstName,
        lastName: formData.lastName,
        photo: formData.photo ? { id: formData.photo.id } : undefined,
      });

      setUser(data as unknown as User);

      enqueueSnackbar(t("profile:alerts.profile.success"), {
        variant: "success",
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<
            keyof EditProfileBasicInfoFormData
          >
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `profile:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      photo: user?.photo,
    });
  }, [user, reset]);

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <h2 className="text-label-md text-text-strong-950">
            {t("profile:title1")}
          </h2>
          <p className="text-paragraph-xs text-text-sub-600">
            {t("profile:editProfileDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-5">
              <div className="flex justify-center">
                <FormAvatarInput<EditProfileBasicInfoFormData>
                  name="photo"
                  testId="photo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormTextInput<EditProfileBasicInfoFormData>
                  name="firstName"
                  label={t("profile:inputs.firstName.label")}
                  testId="first-name"
                  autoComplete="given-name"
                />

                <FormTextInput<EditProfileBasicInfoFormData>
                  name="lastName"
                  label={t("profile:inputs.lastName.label")}
                  testId="last-name"
                  autoComplete="family-name"
                />
              </div>

              <div className="flex items-center gap-3">
                <FormSubmitButton
                  testId="save-profile"
                  label={t("profile:actions.submit")}
                />
                <Button variant="outline" asChild>
                  <Link href="/profile" data-testid="cancel-edit-profile">
                    {t("profile:actions.cancel")}
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

// ─────────────────────────────────────────────
// Change Email Form
// ─────────────────────────────────────────────

function FormChangeEmail() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationChangeEmailSchema();
  const { user } = useAuth();

  const methods = useForm<EditProfileChangeEmailFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      emailConfirmation: "",
    },
  });

  const { handleSubmit, reset, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await authControllerUpdateV1({
        email: formData.email,
      });

      reset();

      enqueueSnackbar(t("profile:alerts.email.success"), {
        variant: "success",
        autoHideDuration: 15000,
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<
            keyof EditProfileChangeEmailFormData
          >
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `profile:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <h2 className="text-label-md text-text-strong-950">
            {t("profile:title2")}
          </h2>
          <p className="text-paragraph-sm text-text-sub-600">{user?.email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-5">
              <FormTextInput<EditProfileChangeEmailFormData>
                name="email"
                label={t("profile:inputs.email.label")}
                type="email"
                testId="email"
                autoComplete="email"
              />

              <FormTextInput<EditProfileChangeEmailFormData>
                name="emailConfirmation"
                label={t("profile:inputs.emailConfirmation.label")}
                type="email"
                testId="email-confirmation"
                autoComplete="email"
              />

              <div className="flex items-center gap-3">
                <FormSubmitButton
                  testId="save-email"
                  label={t("profile:actions.submit")}
                />
                <Button variant="outline" asChild>
                  <Link href="/profile" data-testid="cancel-edit-email">
                    {t("profile:actions.cancel")}
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

// ─────────────────────────────────────────────
// Change Password Form
// ─────────────────────────────────────────────

function FormChangePassword() {
  const { t } = useTranslation("profile");
  const validationSchema = useValidationChangePasswordSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProfileChangePasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await authControllerUpdateV1({
        password: formData.password,
        oldPassword: formData.oldPassword,
      });

      reset();

      enqueueSnackbar(t("profile:alerts.password.success"), {
        variant: "success",
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<
            keyof EditProfileChangePasswordFormData
          >
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `profile:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <h2 className="text-label-md text-text-strong-950">
            {t("profile:title3")}
          </h2>
          <p className="text-paragraph-xs text-text-sub-600">
            {t("profile:changePasswordDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-5">
              <FormTextInput<EditProfileChangePasswordFormData>
                name="oldPassword"
                label={t("profile:inputs.oldPassword.label")}
                type="password"
                testId="old-password"
                autoComplete="current-password"
              />

              <Separator />

              <FormTextInput<EditProfileChangePasswordFormData>
                name="password"
                label={t("profile:inputs.password.label")}
                type="password"
                testId="new-password"
                autoComplete="new-password"
              />

              <FormTextInput<EditProfileChangePasswordFormData>
                name="passwordConfirmation"
                label={t("profile:inputs.passwordConfirmation.label")}
                type="password"
                testId="password-confirmation"
                autoComplete="new-password"
              />

              <div className="flex items-center gap-3">
                <FormSubmitButton
                  testId="save-password"
                  label={t("profile:actions.submit")}
                />
                <Button variant="outline" asChild>
                  <Link href="/profile" data-testid="cancel-edit-password">
                    {t("profile:actions.cancel")}
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

// ─────────────────────────────────────────────
// Conditional Wrappers
// ─────────────────────────────────────────────

function FormChangeEmailWrapper() {
  const { user } = useAuth();

  return user?.provider === UserProviderEnum.EMAIL ? <FormChangeEmail /> : null;
}

function FormChangePasswordWrapper() {
  const { user } = useAuth();

  return user?.provider === UserProviderEnum.EMAIL ? (
    <FormChangePassword />
  ) : null;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

function EditProfile() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <FormBasicInfo />
      <FormChangeEmailWrapper />
      <FormChangePasswordWrapper />
    </div>
  );
}

export default withPageRequiredAuth(EditProfile);
