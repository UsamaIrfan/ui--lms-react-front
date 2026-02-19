"use client";

import { Button } from "@/components/ui/button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import FormAvatarInput from "@/components/form/avatar-input/form-avatar-input";
import { FileEntity } from "@/services/api/types/file-entity";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { useTranslation } from "@/services/i18n/client";
import { usersControllerCreateV1 } from "@/services/api/generated/users/users";
import { isValidationError } from "@/services/api/generated/custom-fetch";
import { useRouter } from "next/navigation";
import { Role, RoleEnum } from "@/services/api/types/role";
import FormSelectInput from "@/components/form/select/form-select";
import { Card, CardContent } from "@/components/ui/card";
import { RiArrowLeftLine, RiUserAddLine } from "@remixicon/react";
import { Spinner } from "@/components/ui/spinner";

type CreateFormData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirmation: string;
  photo?: FileEntity;
  role: Role;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-users-create");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("admin-panel-users-create:inputs.email.validation.invalid"))
      .required(
        t("admin-panel-users-create:inputs.firstName.validation.required")
      ),
    firstName: yup
      .string()
      .required(
        t("admin-panel-users-create:inputs.firstName.validation.required")
      ),
    lastName: yup
      .string()
      .required(
        t("admin-panel-users-create:inputs.lastName.validation.required")
      ),
    password: yup
      .string()
      .min(6, t("admin-panel-users-create:inputs.password.validation.min"))
      .required(
        t("admin-panel-users-create:inputs.password.validation.required")
      ),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t(
          "admin-panel-users-create:inputs.passwordConfirmation.validation.match"
        )
      )
      .required(
        t(
          "admin-panel-users-create:inputs.passwordConfirmation.validation.required"
        )
      ),
    role: yup
      .object()
      .shape({
        id: yup.mixed<string | number>().required(),
        name: yup.string(),
      })
      .required(t("admin-panel-users-create:inputs.role.validation.required")),
  });
};

function CreateUserFormActions() {
  const { t } = useTranslation("admin-panel-users-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-users-create:actions.submit")}
    </Button>
  );
}

function FormCreateUser() {
  const router = useRouter();
  const { t } = useTranslation("admin-panel-users-create");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      passwordConfirmation: "",
      role: {
        id: RoleEnum.USER,
      },
      photo: undefined,
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      await usersControllerCreateV1({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        photo: formData.photo ? { id: String(formData.photo.id) } : undefined,
        role: { id: Number(formData.role.id) },
      });
      enqueueSnackbar(t("admin-panel-users-create:alerts.user.success"), {
        variant: "success",
      });
      router.push("/admin-panel/users");
    } catch (error) {
      if (isValidationError(error)) {
        (Object.keys(error.body.errors) as Array<keyof CreateFormData>).forEach(
          (key) => {
            setError(key, {
              type: "manual",
              message: t(
                `admin-panel-users-create:inputs.${key}.validation.server.${error.body.errors[key]}`
              ),
            });
          }
        );
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-lg px-4 pb-8">
        <div className="grid gap-6 pt-6">
          {/* ── Page header ─────────────────────────── */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/admin-panel/users">
                <RiArrowLeftLine className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
                <RiUserAddLine className="h-5 w-5 text-primary-base" />
              </div>
              <div>
                <h3 className="text-title-h5 font-bold text-text-strong-950">
                  {t("admin-panel-users-create:title")}
                </h3>
                <p className="text-paragraph-sm text-text-sub-600">
                  {t("admin-panel-users-create:description")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Form card ─────────────────────────── */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} autoComplete="create-new-user">
                <div className="grid gap-5">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <FormAvatarInput<CreateFormData>
                      name="photo"
                      testId="photo"
                    />
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormTextInput<CreateFormData>
                      name="firstName"
                      testId="first-name"
                      label={t(
                        "admin-panel-users-create:inputs.firstName.label"
                      )}
                    />
                    <FormTextInput<CreateFormData>
                      name="lastName"
                      testId="last-name"
                      label={t(
                        "admin-panel-users-create:inputs.lastName.label"
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormTextInput<CreateFormData>
                    name="email"
                    testId="new-user-email"
                    autoComplete="new-user-email"
                    label={t("admin-panel-users-create:inputs.email.label")}
                  />

                  {/* Password fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormTextInput<CreateFormData>
                      name="password"
                      type="password"
                      testId="new-user-password"
                      autoComplete="new-user-password"
                      label={t(
                        "admin-panel-users-create:inputs.password.label"
                      )}
                    />
                    <FormTextInput<CreateFormData>
                      name="passwordConfirmation"
                      testId="new-user-password-confirmation"
                      label={t(
                        "admin-panel-users-create:inputs.passwordConfirmation.label"
                      )}
                      type="password"
                    />
                  </div>

                  {/* Role */}
                  <FormSelectInput<CreateFormData, Pick<Role, "id">>
                    name="role"
                    testId="role"
                    label={t("admin-panel-users-create:inputs.role.label")}
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
                      t(
                        `admin-panel-users-create:inputs.role.options.${option.id}`
                      )
                    }
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 border-t border-stroke-soft-200 pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/admin-panel/users">
                        {t("admin-panel-users-create:actions.cancel")}
                      </Link>
                    </Button>
                    <CreateUserFormActions />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}

function CreateUser() {
  return <FormCreateUser />;
}

export default withPageRequiredAuth(CreateUser, {
  roles: [RoleEnum.ADMIN],
});
