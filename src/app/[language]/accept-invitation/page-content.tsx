"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import FormTextInput from "@/components/form/text-input/form-text-input";
import Link from "@/components/link";

import {
  verifyInvitation,
  acceptInvitation,
  type VerifyInvitationResponse,
} from "@/services/api/services/invitations";

import { isValidationError } from "@/services/api/generated/custom-fetch";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useTranslation } from "@/services/i18n/client";
import { User } from "@/services/api/types/user";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/use-snackbar";

type AcceptFormData = {
  firstName: string;
  lastName: string;
  password: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("accept-invitation");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("accept-invitation:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("accept-invitation:inputs.lastName.validation.required")),
    password: yup
      .string()
      .min(6, t("accept-invitation:inputs.password.validation.min"))
      .required(t("accept-invitation:inputs.password.validation.required")),
  });
};

function FormActions({ isExistingUser }: { isExistingUser: boolean }) {
  const { t } = useTranslation("accept-invitation");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      size="lg"
      data-testid="accept-invitation-submit"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {isExistingUser
            ? t("accept-invitation:actions.acceptExisting")
            : t("accept-invitation:actions.accept")}
        </span>
      ) : isExistingUser ? (
        t("accept-invitation:actions.acceptExisting")
      ) : (
        t("accept-invitation:actions.accept")
      )}
    </Button>
  );
}

function AcceptInvitation() {
  const { t } = useTranslation("accept-invitation");
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const validationSchema = useValidationSchema();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] =
    useState<VerifyInvitationResponse | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const methods = useForm<AcceptFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const { handleSubmit, setError: setFormError } = methods;

  // Verify the invitation hash on mount
  const verifyHash = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get("hash");

    if (!hashParam) {
      setError(t("accept-invitation:invalidLink"));
      setLoading(false);
      return;
    }

    setHash(hashParam);

    try {
      const { data } = await verifyInvitation({ hash: hashParam });
      setInvitationData(data);
    } catch {
      setError(t("accept-invitation:invalidLink"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    verifyHash();
  }, [verifyHash]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!hash) return;

    try {
      const { data } = await acceptInvitation({
        hash,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });

      // Store tokens — user is now logged in
      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user as unknown as User);

      enqueueSnackbar(t("accept-invitation:success"), {
        variant: "success",
      });

      // Redirect to dashboard
      router.replace("/");
    } catch (err) {
      if (isValidationError(err)) {
        (Object.keys(err.body.errors) as Array<keyof AcceptFormData>).forEach(
          (key) => {
            if (key in formData) {
              setFormError(key, {
                type: "manual",
                message: err.body.errors[key],
              });
            }
          }
        );
      } else {
        enqueueSnackbar(t("accept-invitation:error"), {
          variant: "error",
        });
      }
    }
  });

  const onExistingUserAccept = async () => {
    if (!hash) return;

    try {
      const { data } = await acceptInvitation({
        hash,
        firstName: "",
        lastName: "",
        password: "",
      });

      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user as unknown as User);

      enqueueSnackbar(t("accept-invitation:success"), {
        variant: "success",
      });

      router.replace("/");
    } catch {
      enqueueSnackbar(t("accept-invitation:error"), {
        variant: "error",
      });
    }
  };

  // ─── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Spinner size="lg" />
            <p className="text-paragraph-sm text-text-sub-600">
              {t("accept-invitation:loading")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────
  if (error || !invitationData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-title-h4 text-text-strong-950">
              {t("accept-invitation:invalidLink")}
            </h1>
            <p className="mt-2 text-paragraph-sm text-text-sub-600">
              {t("accept-invitation:invalidLinkDescription")}
            </p>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Link href="/sign-in">
              <Button variant="default" size="lg">
                {t("accept-invitation:actions.goToSignIn")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Existing user flow ───────────────────────────────
  if (invitationData.existingUser) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-title-h4 text-text-strong-950">
              {t("accept-invitation:existingUserTitle")}
            </h1>
            <p className="mt-2 text-paragraph-sm text-text-sub-600">
              {t("accept-invitation:existingUserDescription")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 p-4">
                <span className="text-paragraph-sm text-text-sub-600">
                  Organization
                </span>
                <span className="text-label-sm text-text-strong-950">
                  {invitationData.tenantName}
                </span>
              </div>
              {invitationData.branchName && (
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 p-4">
                  <span className="text-paragraph-sm text-text-sub-600">
                    Branch
                  </span>
                  <span className="text-label-sm text-text-strong-950">
                    {invitationData.branchName}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 p-4">
                <span className="text-paragraph-sm text-text-sub-600">
                  Role
                </span>
                <Badge variant="default">{invitationData.roleName}</Badge>
              </div>
            </div>
            <Button
              onClick={onExistingUserAccept}
              className="w-full"
              size="lg"
              data-testid="accept-invitation-existing"
            >
              {t("accept-invitation:actions.acceptExisting")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── New user registration flow ───────────────────────
  return (
    <FormProvider {...methods}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-title-h4 text-text-strong-950">
              {t("accept-invitation:welcomeTitle")}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("accept-invitation:welcomeDescription", {
                tenantName: invitationData.tenantName,
              })}
            </p>
            {invitationData.branchName && (
              <p className="mt-1 text-paragraph-xs text-text-soft-400">
                {t("accept-invitation:branchInfo", {
                  branchName: invitationData.branchName,
                })}
              </p>
            )}
          </CardHeader>

          <CardContent>
            <div className="mb-5 flex items-center justify-center">
              <Badge variant="default">{invitationData.roleName}</Badge>
            </div>

            <form onSubmit={onSubmit}>
              <div className="grid gap-5">
                <div className="text-center text-paragraph-sm text-text-sub-600">
                  {invitationData.email}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormTextInput<AcceptFormData>
                    name="firstName"
                    label={t("accept-invitation:inputs.firstName.label")}
                    type="text"
                    autoFocus
                    testId="first-name"
                    autoComplete="given-name"
                  />

                  <FormTextInput<AcceptFormData>
                    name="lastName"
                    label={t("accept-invitation:inputs.lastName.label")}
                    type="text"
                    testId="last-name"
                    autoComplete="family-name"
                  />
                </div>

                <FormTextInput<AcceptFormData>
                  name="password"
                  label={t("accept-invitation:inputs.password.label")}
                  type="password"
                  testId="password"
                  autoComplete="new-password"
                />

                <FormActions isExistingUser={false} />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}

export default AcceptInvitation;
