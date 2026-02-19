"use client";

import { Button } from "@/components/ui/button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useEffect } from "react";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import FormAvatarInput from "@/components/form/avatar-input/form-avatar-input";
import { FileEntity } from "@/services/api/types/file-entity";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { useTranslation } from "@/services/i18n/client";
import {
  usersControllerFindOneV1,
  usersControllerUpdateV1,
} from "@/services/api/generated/users/users";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import { useParams } from "next/navigation";
import { Role, RoleEnum } from "@/services/api/types/role";
import FormSelectInput from "@/components/form/select/form-select";
import { Card, CardContent } from "@/components/ui/card";
import { RiArrowLeftLine, RiEditLine, RiLockLine } from "@remixicon/react";
import { Spinner } from "@/components/ui/spinner";

type EditUserFormData = {
  email: string;
  firstName: string;
  lastName: string;
  photo?: FileEntity;
  role: Role;
};

type ChangeUserPasswordFormData = {
  password: string;
  passwordConfirmation: string;
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-users-edit");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("admin-panel-users-edit:inputs.email.validation.invalid"))
      .required(
        t("admin-panel-users-edit:inputs.firstName.validation.required")
      ),
    firstName: yup
      .string()
      .required(
        t("admin-panel-users-edit:inputs.firstName.validation.required")
      ),
    lastName: yup
      .string()
      .required(
        t("admin-panel-users-edit:inputs.lastName.validation.required")
      ),
    role: yup
      .object()
      .shape({
        id: yup.mixed<string | number>().required(),
        name: yup.string(),
      })
      .required(t("admin-panel-users-edit:inputs.role.validation.required")),
  });
};

const useValidationChangePasswordSchema = () => {
  const { t } = useTranslation("admin-panel-users-edit");

  return yup.object().shape({
    password: yup
      .string()
      .min(6, t("admin-panel-users-edit:inputs.password.validation.min"))
      .required(
        t("admin-panel-users-edit:inputs.password.validation.required")
      ),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("admin-panel-users-edit:inputs.passwordConfirmation.validation.match")
      )
      .required(
        t(
          "admin-panel-users-edit:inputs.passwordConfirmation.validation.required"
        )
      ),
  });
};

function EditUserFormActions() {
  const { t } = useTranslation("admin-panel-users-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-users-edit:actions.submit")}
    </Button>
  );
}

function ChangePasswordUserFormActions() {
  const { t } = useTranslation("admin-panel-users-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-users-edit:actions.changePassword")}
    </Button>
  );
}

function FormEditUser() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { t } = useTranslation("admin-panel-users-edit");
  const validationSchema = useValidationEditUserSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditUserFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: undefined,
      photo: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const isEmailDirty = methods.getFieldState("email").isDirty;
    try {
      await usersControllerUpdateV1(userId, {
        ...formData,
        email: isEmailDirty ? formData.email : undefined,
        photo: formData.photo ? { id: String(formData.photo.id) } : undefined,
        role: formData.role ? { id: Number(formData.role.id) } : undefined,
      });
      reset(formData);
      enqueueSnackbar(t("admin-panel-users-edit:alerts.user.success"), {
        variant: "success",
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<keyof EditUserFormData>
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `admin-panel-users-edit:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { data: user } = await usersControllerFindOneV1(userId);

      reset({
        email: user?.email ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        role: {
          id: Number(user?.role?.id),
        },
        photo: user?.photo,
      });
    };

    getInitialDataForEdit();
  }, [userId, reset]);

  return (
    <FormProvider {...methods}>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-5">
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-base/10">
                  <RiEditLine className="h-4 w-4 text-primary-base" />
                </div>
                <div>
                  <h6 className="text-label-md font-semibold text-text-strong-950">
                    {t("admin-panel-users-edit:title1")}
                  </h6>
                  <p className="text-paragraph-xs text-text-sub-600">
                    {t("admin-panel-users-edit:description1")}
                  </p>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <FormAvatarInput<EditUserFormData>
                  name="photo"
                  testId="photo"
                />
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormTextInput<EditUserFormData>
                  name="firstName"
                  testId="first-name"
                  label={t("admin-panel-users-edit:inputs.firstName.label")}
                />
                <FormTextInput<EditUserFormData>
                  name="lastName"
                  testId="last-name"
                  label={t("admin-panel-users-edit:inputs.lastName.label")}
                />
              </div>

              {/* Email */}
              <FormTextInput<EditUserFormData>
                name="email"
                testId="email"
                label={t("admin-panel-users-edit:inputs.email.label")}
              />

              {/* Role */}
              <FormSelectInput<EditUserFormData, Pick<Role, "id">>
                name="role"
                testId="role"
                label={t("admin-panel-users-edit:inputs.role.label")}
                options={[
                  { id: RoleEnum.ADMIN },
                  { id: RoleEnum.USER },
                  { id: RoleEnum.STUDENT },
                  { id: RoleEnum.TEACHER },
                  { id: RoleEnum.STAFF },
                  { id: RoleEnum.ACCOUNTANT },
                  { id: RoleEnum.PARENT },
                ]}
                keyValue="id"
                renderOption={(option) =>
                  t(`admin-panel-users-edit:inputs.role.options.${option.id}`)
                }
              />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-stroke-soft-200 pt-4">
                <EditUserFormActions />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function FormChangePasswordUser() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { t } = useTranslation("admin-panel-users-edit");
  const validationSchema = useValidationChangePasswordSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<ChangeUserPasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await usersControllerUpdateV1(userId, {
        password: formData.password,
      });
      reset();
      enqueueSnackbar(t("admin-panel-users-edit:alerts.password.success"), {
        variant: "success",
      });
    } catch (error) {
      if (isValidationError(error)) {
        (
          Object.keys(error.body.errors) as Array<
            keyof ChangeUserPasswordFormData
          >
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `admin-panel-users-edit:inputs.${key}.validation.server.${error.body.errors[key]}`
            ),
          });
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-5">
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-base/10">
                  <RiLockLine className="h-4 w-4 text-warning-base" />
                </div>
                <div>
                  <h6 className="text-label-md font-semibold text-text-strong-950">
                    {t("admin-panel-users-edit:title2")}
                  </h6>
                  <p className="text-paragraph-xs text-text-sub-600">
                    {t("admin-panel-users-edit:description2")}
                  </p>
                </div>
              </div>

              {/* Password fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormTextInput<ChangeUserPasswordFormData>
                  name="password"
                  type="password"
                  label={t("admin-panel-users-edit:inputs.password.label")}
                />
                <FormTextInput<ChangeUserPasswordFormData>
                  name="passwordConfirmation"
                  label={t(
                    "admin-panel-users-edit:inputs.passwordConfirmation.label"
                  )}
                  type="password"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-stroke-soft-200 pt-4">
                <ChangePasswordUserFormActions />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function EditUser() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-8">
      <div className="grid gap-6 pt-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/admin-panel/users">
              <RiArrowLeftLine className="h-4 w-4" />
            </Link>
          </Button>
          <h3 className="text-title-h5 font-bold text-text-strong-950">
            Edit User
          </h3>
        </div>

        <FormEditUser />
        <FormChangePasswordUser />

        {/* ── Back to users link ─────────────────── */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin-panel/users">
              <RiArrowLeftLine className="mr-1 h-3.5 w-3.5" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(EditUser, {
  roles: [RoleEnum.ADMIN],
});
