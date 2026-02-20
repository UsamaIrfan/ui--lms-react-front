"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useTenant from "@/services/tenant/use-tenant";
import { useSnackbar } from "@/hooks/use-snackbar";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import FormTextInput from "@/components/form/text-input/form-text-input";

import {
  sendInvitation,
  listInvitations,
  cancelInvitation,
  resendInvitation,
  type InvitationResponse,
} from "@/services/api/services/invitations";
import { HttpError } from "@/services/api/generated/custom-fetch";
import {
  RiMailSendLine,
  RiRefreshLine,
  RiCloseLine,
  RiAddLine,
} from "@remixicon/react";

type InvitationFormData = {
  email: string;
  roleId: string;
  branchId: string;
};

const INVITABLE_ROLES = [
  { id: RoleEnum.STUDENT, label: "Student" },
  { id: RoleEnum.TEACHER, label: "Teacher" },
  { id: RoleEnum.STAFF, label: "Staff" },
  { id: RoleEnum.ACCOUNTANT, label: "Accountant" },
  { id: RoleEnum.PARENT, label: "Parent" },
];

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-invitations");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("admin-panel-invitations:form.email.validation.invalid"))
      .required(t("admin-panel-invitations:form.email.validation.required")),
    roleId: yup
      .string()
      .required(t("admin-panel-invitations:form.role.validation.required")),
    branchId: yup.string().default(""),
  });
};

function FormActions() {
  const { t } = useTranslation("admin-panel-invitations");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
      data-testid="send-invitation-submit"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("admin-panel-invitations:actions.send")}
        </span>
      ) : (
        <>
          <RiMailSendLine className="mr-2 h-4 w-4" />
          {t("admin-panel-invitations:actions.send")}
        </>
      )}
    </Button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("admin-panel-invitations");

  const variantMap: Record<
    string,
    "default" | "success" | "destructive" | "secondary" | "warning"
  > = {
    pending: "warning",
    accepted: "success",
    expired: "destructive",
    cancelled: "secondary",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {t(`admin-panel-invitations:status.${status}`)}
    </Badge>
  );
}

function getRoleName(roleId: number): string {
  const role = INVITABLE_ROLES.find((r) => r.id === roleId);
  return role?.label ?? "Unknown";
}

function InvitationsSettings() {
  const { t } = useTranslation("admin-panel-invitations");
  const { tenantId, branches } = useTenant();
  const { enqueueSnackbar } = useSnackbar();
  const validationSchema = useValidationSchema();

  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const methods = useForm<InvitationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      roleId: "",
      branchId: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // Load invitations
  const loadInvitations = useCallback(async () => {
    if (!tenantId) return;
    try {
      const { data } = await listInvitations(tenantId);
      setInvitations(data);
    } catch {
      // API might return empty
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // Send invitation
  const onSubmit = handleSubmit(async (formData) => {
    if (!tenantId) return;

    try {
      await sendInvitation({
        email: formData.email,
        roleId: parseInt(formData.roleId, 10),
        tenantId,
        branchId: formData.branchId || undefined,
      });

      enqueueSnackbar(t("admin-panel-invitations:notifications.sent"), {
        variant: "success",
      });
      reset();
      setDialogOpen(false);
      await loadInvitations();
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        enqueueSnackbar(
          t("admin-panel-invitations:notifications.duplicateError"),
          { variant: "error" }
        );
      } else {
        enqueueSnackbar(t("admin-panel-invitations:notifications.error"), {
          variant: "error",
        });
      }
    }
  });

  // Resend invitation
  const handleResend = async (id: string) => {
    try {
      await resendInvitation(id);
      enqueueSnackbar(t("admin-panel-invitations:notifications.resent"), {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(t("admin-panel-invitations:notifications.error"), {
        variant: "error",
      });
    }
  };

  // Cancel invitation
  const handleCancel = async (id: string) => {
    try {
      await cancelInvitation(id);
      enqueueSnackbar(t("admin-panel-invitations:notifications.cancelled"), {
        variant: "success",
      });
      await loadInvitations();
    } catch {
      enqueueSnackbar(t("admin-panel-invitations:notifications.error"), {
        variant: "error",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-title-h4 text-text-strong-950">
              {t("admin-panel-invitations:title")}
            </h3>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t("admin-panel-invitations:description")}
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            data-testid="send-invitation-btn"
          >
            <RiAddLine className="mr-2 h-4 w-4" />
            {t("admin-panel-invitations:sendInvitation")}
          </Button>
        </div>

        {/* Invitations List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <RiMailSendLine className="h-12 w-12 text-text-soft-400" />
                <p className="text-paragraph-sm text-text-sub-600">
                  {t("admin-panel-invitations:noInvitations")}
                </p>
                <p className="text-paragraph-xs text-text-soft-400">
                  {t("admin-panel-invitations:noInvitationsDescription")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stroke-soft-200">
                      <th className="px-4 py-3 text-left text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.email")}
                      </th>
                      <th className="px-4 py-3 text-left text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.role")}
                      </th>
                      <th className="px-4 py-3 text-left text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.branch")}
                      </th>
                      <th className="px-4 py-3 text-left text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.sentAt")}
                      </th>
                      <th className="px-4 py-3 text-right text-label-xs text-text-sub-600">
                        {t("admin-panel-invitations:table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-stroke-soft-200 last:border-0"
                      >
                        <td className="px-4 py-3 text-paragraph-sm text-text-strong-950">
                          {inv.email}
                        </td>
                        <td className="px-4 py-3 text-paragraph-sm text-text-sub-600">
                          {getRoleName(inv.roleId)}
                        </td>
                        <td className="px-4 py-3 text-paragraph-sm text-text-sub-600">
                          {inv.branchName ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="px-4 py-3 text-paragraph-xs text-text-soft-400">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inv.status === "pending" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleResend(inv.id)}
                                data-testid={`resend-${inv.id}`}
                              >
                                <RiRefreshLine className="mr-1 h-3 w-3" />
                                {t("admin-panel-invitations:actions.resend")}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCancel(inv.id)}
                                data-testid={`cancel-${inv.id}`}
                              >
                                <RiCloseLine className="mr-1 h-3 w-3" />
                                {t("admin-panel-invitations:actions.cancel")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Invitation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("admin-panel-invitations:sendInvitation")}
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="grid gap-5 p-1">
                <FormTextInput<InvitationFormData>
                  name="email"
                  label={t("admin-panel-invitations:form.email.label")}
                  type="email"
                  testId="invitation-email"
                  autoComplete="email"
                />

                {/* Role select */}
                <div>
                  <label className="text-label-sm text-text-strong-950">
                    {t("admin-panel-invitations:form.role.label")}
                  </label>
                  <select
                    {...methods.register("roleId")}
                    className="mt-1 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 outline-none transition-colors focus:border-primary-base"
                    data-testid="invitation-role"
                  >
                    <option value="">
                      {t("admin-panel-invitations:form.role.placeholder")}
                    </option>
                    {INVITABLE_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {methods.formState.errors.roleId && (
                    <p className="mt-1 text-paragraph-xs text-error-base">
                      {methods.formState.errors.roleId.message}
                    </p>
                  )}
                </div>

                {/* Branch select */}
                {branches.length > 0 && (
                  <div>
                    <label className="text-label-sm text-text-strong-950">
                      {t("admin-panel-invitations:form.branch.label")}
                    </label>
                    <select
                      {...methods.register("branchId")}
                      className="mt-1 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 outline-none transition-colors focus:border-primary-base"
                      data-testid="invitation-branch"
                    >
                      <option value="">
                        {t("admin-panel-invitations:form.branch.placeholder")}
                      </option>
                      {branches.map((branch) => (
                        <option
                          key={branch.id as string}
                          value={branch.id as string}
                        >
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <FormActions />
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(InvitationsSettings, {
  roles: [RoleEnum.ADMIN],
});
