"use client";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { authControllerUpdateV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useEffect } from "react";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import FormAvatarInput from "@/components/form/avatar-input/form-avatar-input";
import { FileEntity } from "@/services/api/types/file-entity";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { useTranslation } from "@/services/i18n/client";
import { User, UserProviderEnum } from "@/services/api/types/user";

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

function BasicInfoFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-profile">
      {t("profile:actions.submit")}
    </Button>
  );
}

function ChangeEmailFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-email">
      {t("profile:actions.submit")}
    </Button>
  );
}

function ChangePasswordFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-password">
      {t("profile:actions.submit")}
    </Button>
  );
}

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
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-6 mt-6 grid gap-4">
            <div>
              <h6 className="text-lg font-semibold">{t("profile:title1")}</h6>
            </div>
            <div>
              <FormAvatarInput<EditProfileBasicInfoFormData>
                name="photo"
                testId="photo"
              />
            </div>

            <div>
              <FormTextInput<EditProfileBasicInfoFormData>
                name="firstName"
                label={t("profile:inputs.firstName.label")}
                testId="first-name"
              />
            </div>

            <div>
              <FormTextInput<EditProfileBasicInfoFormData>
                name="lastName"
                label={t("profile:inputs.lastName.label")}
                testId="last-name"
              />
            </div>

            <div className="flex items-center gap-2">
              <BasicInfoFormActions />
              <Button variant="secondary" asChild>
                <Link href="/profile" data-testid="cancel-edit-profile">
                  {t("profile:actions.cancel")}
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

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
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-6 grid gap-4">
            <div>
              <h6 className="text-lg font-semibold">{t("profile:title2")}</h6>
            </div>
            <div>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <FormTextInput<EditProfileChangeEmailFormData>
                name="email"
                label={t("profile:inputs.email.label")}
                type="email"
                testId="email"
              />
            </div>

            <div>
              <FormTextInput<EditProfileChangeEmailFormData>
                name="emailConfirmation"
                label={t("profile:inputs.emailConfirmation.label")}
                type="email"
                testId="email-confirmation"
              />
            </div>

            <div className="flex items-center gap-2">
              <ChangeEmailFormActions />
              <Button variant="secondary" asChild>
                <Link href="/profile" data-testid="cancel-edit-email">
                  {t("profile:actions.cancel")}
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

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
      <div className="mx-auto max-w-xs px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid gap-4">
            <div>
              <h6 className="text-lg font-semibold">{t("profile:title3")}</h6>
            </div>
            <div>
              <FormTextInput<EditProfileChangePasswordFormData>
                name="oldPassword"
                label={t("profile:inputs.oldPassword.label")}
                type="password"
                testId="old-password"
              />
            </div>

            <div>
              <FormTextInput<EditProfileChangePasswordFormData>
                name="password"
                label={t("profile:inputs.password.label")}
                type="password"
                testId="new-password"
              />
            </div>

            <div>
              <FormTextInput<EditProfileChangePasswordFormData>
                name="passwordConfirmation"
                label={t("profile:inputs.passwordConfirmation.label")}
                type="password"
                testId="password-confirmation"
              />
            </div>

            <div className="flex items-center gap-2">
              <ChangePasswordFormActions />
              <Button variant="secondary" asChild>
                <Link href="/profile" data-testid="cancel-edit-password">
                  {t("profile:actions.cancel")}
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

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

function EditProfile() {
  return (
    <>
      <FormBasicInfo />
      <FormChangeEmailWrapper />
      <FormChangePasswordWrapper />
    </>
  );
}

export default withPageRequiredAuth(EditProfile);
