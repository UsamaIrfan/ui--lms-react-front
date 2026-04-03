"use client";

import { useCallback, useMemo, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import {
  useTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useTenantUsersQuery,
  useAssignUserToTenantMutation,
  useRemoveUserFromTenantMutation,
} from "./queries/queries";
import type { Tenant, TenantUser } from "@/services/api/generated/model";
import { useSnackbar } from "@/hooks/use-snackbar";
import { getHttpErrorMessage } from "@/services/api/generated/custom-fetch";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import useAuthActions from "@/services/auth/use-auth-actions";
import useTenant from "@/services/tenant/use-tenant";
import { usersControllerFindAllV1 } from "@/services/api/generated/users/users";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import * as Dialog from "@/components/ui/dialog";
import {
  RiArrowLeftLine,
  RiBuildingLine,
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLogoutBoxRLine,
  RiUserLine,
  RiCloseLine,
  RiSearchLine,
} from "@remixicon/react";

const ROLE_LABELS: Record<number, string> = {
  [RoleEnum.ADMIN]: "Admin",
  [RoleEnum.USER]: "User",
  [RoleEnum.STUDENT]: "Student",
  [RoleEnum.TEACHER]: "Teacher",
  [RoleEnum.STAFF]: "Staff",
  [RoleEnum.ACCOUNTANT]: "Accountant",
  [RoleEnum.PARENT]: "Parent",
};

function getRoleBadgeVariant(
  roleId?: number
): "default" | "secondary" | "warning" | "success" | "destructive" | "outline" {
  switch (roleId) {
    case RoleEnum.ADMIN:
      return "default";
    case RoleEnum.STUDENT:
      return "success";
    case RoleEnum.TEACHER:
      return "warning";
    case RoleEnum.ACCOUNTANT:
      return "destructive";
    case RoleEnum.STAFF:
      return "outline";
    default:
      return "secondary";
  }
}

interface UserOption {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  roleId?: number;
}

function TenantManagement() {
  const { t } = useTranslation("admin-panel-settings");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: tenants, isLoading } = useTenantsQuery();
  const createMutation = useCreateTenantMutation();
  const updateMutation = useUpdateTenantMutation();
  const deleteMutation = useDeleteTenantMutation();
  const { logOut } = useAuthActions();
  const { clearTenant } = useTenant();

  const [modalOpen, setModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tenant | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ─── Manage Users state ────────────────────────────────
  const [manageUsersTenant, setManageUsersTenant] = useState<Tenant | null>(
    null
  );
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const { data: tenantUsers, isLoading: isLoadingTenantUsers } =
    useTenantUsersQuery(manageUsersTenant?.id ?? null);
  const assignMutation = useAssignUserToTenantMutation();
  const removeMutation = useRemoveUserFromTenantMutation();

  const resetForm = useCallback(() => {
    setName("");
    setSlug("");
    setContactEmail("");
    setContactPhone("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: Tenant) => {
    setEditItem(item);
    setName(item.name);
    setSlug(item.slug);
    setContactEmail(
      typeof item.contactEmail === "string" ? item.contactEmail : ""
    );
    setContactPhone(
      typeof item.contactPhone === "string" ? item.contactPhone : ""
    );
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !slug.trim()) {
      enqueueSnackbar(t("admin-panel-settings:tenants.validation.required"), {
        variant: "error",
      });
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      };

      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: { ...payload, isActive: editItem.isActive },
        });
        enqueueSnackbar(
          t("admin-panel-settings:tenants.notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync(payload);
        enqueueSnackbar(
          t("admin-panel-settings:tenants.notifications.created"),
          { variant: "success" }
        );
        setModalOpen(false);
        resetForm();
        setLogoutDialogOpen(true);
        return;
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      enqueueSnackbar(
        getHttpErrorMessage(error) ??
          t("admin-panel-settings:tenants.notifications.error"),
        {
          variant: "error",
        }
      );
    }
  }, [
    name,
    slug,
    contactEmail,
    contactPhone,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: Tenant) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-settings:tenants.confirm.deleteTitle"),
        message: t("admin-panel-settings:tenants.confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-settings:tenants.notifications.deleted"),
            { variant: "success" }
          );
        } catch (error) {
          enqueueSnackbar(
            getHttpErrorMessage(error) ??
              t("admin-panel-settings:tenants.notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const handleToggleActive = useCallback(
    async (item: Tenant) => {
      try {
        await updateMutation.mutateAsync({
          id: item.id,
          data: { isActive: !item.isActive },
        });
        enqueueSnackbar(
          t("admin-panel-settings:tenants.notifications.updated"),
          { variant: "success" }
        );
      } catch (error) {
        enqueueSnackbar(
          getHttpErrorMessage(error) ??
            t("admin-panel-settings:tenants.notifications.error"),
          {
            variant: "error",
          }
        );
      }
    },
    [updateMutation, enqueueSnackbar, t]
  );

  // ─── Manage Users handlers ────────────────────────────

  const handleOpenManageUsers = useCallback((item: Tenant) => {
    setManageUsersTenant(item);
    setUserSearch("");
    setUserOptions([]);
  }, []);

  const handleCloseManageUsers = useCallback(() => {
    setManageUsersTenant(null);
    setUserSearch("");
    setUserOptions([]);
  }, []);

  const handleSearchUsers = useCallback(async (query: string) => {
    setUserSearch(query);
    if (query.trim().length < 2) {
      setUserOptions([]);
      return;
    }
    setIsLoadingUsers(true);
    try {
      const res = await usersControllerFindAllV1({ page: 1, limit: 20 });
      const raw = res.data as unknown;
      const list = (
        Array.isArray(raw)
          ? raw
          : ((raw as Record<string, unknown>)?.data ?? [])
      ) as UserOption[];

      const lower = query.toLowerCase();
      const filtered = list.filter(
        (u) =>
          (u.firstName ?? "").toLowerCase().includes(lower) ||
          (u.lastName ?? "").toLowerCase().includes(lower) ||
          (u.email ?? "").toLowerCase().includes(lower)
      );
      setUserOptions(filtered);
    } catch {
      setUserOptions([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const assignedUserIds = useMemo(
    () => new Set((tenantUsers ?? []).map((tu: TenantUser) => tu.userId)),
    [tenantUsers]
  );

  const filteredUserOptions = useMemo(
    () => userOptions.filter((u) => !assignedUserIds.has(u.id)),
    [userOptions, assignedUserIds]
  );

  const handleAssignUser = useCallback(
    async (userId: number) => {
      if (!manageUsersTenant) return;
      try {
        await assignMutation.mutateAsync({
          tenantId: manageUsersTenant.id,
          userId,
        });
        enqueueSnackbar(
          t("admin-panel-settings:tenants.users.notifications.assigned"),
          { variant: "success" }
        );
        setUserSearch("");
        setUserOptions([]);
      } catch (error) {
        enqueueSnackbar(
          getHttpErrorMessage(error) ??
            t("admin-panel-settings:tenants.users.notifications.error"),
          { variant: "error" }
        );
      }
    },
    [manageUsersTenant, assignMutation, enqueueSnackbar, t]
  );

  const handleRemoveUser = useCallback(
    async (tu: TenantUser) => {
      if (!manageUsersTenant) return;
      const confirmed = await confirmDialog({
        title: t("admin-panel-settings:tenants.users.confirm.removeTitle"),
        message: t("admin-panel-settings:tenants.users.confirm.remove"),
      });
      if (!confirmed) return;
      try {
        await removeMutation.mutateAsync({
          tenantId: manageUsersTenant.id,
          userId: tu.userId,
        });
        enqueueSnackbar(
          t("admin-panel-settings:tenants.users.notifications.removed"),
          { variant: "success" }
        );
      } catch (error) {
        enqueueSnackbar(
          getHttpErrorMessage(error) ??
            t("admin-panel-settings:tenants.users.notifications.error"),
          { variant: "error" }
        );
      }
    },
    [manageUsersTenant, removeMutation, confirmDialog, enqueueSnackbar, t]
  );

  const handleLogOut = useCallback(async () => {
    clearTenant();
    await logOut();
  }, [clearTenant, logOut]);

  return (
    <div
      data-testid="admin-settings-tenants-page"
      className="mx-auto max-w-7xl px-4"
    >
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin-panel/settings">
            <Button variant="outline" size="sm">
              <RiArrowLeftLine className="h-4 w-4" />
            </Button>
          </Link>
          <RiBuildingLine className="h-6 w-6 text-primary-base" />
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              {t("admin-panel-settings:tenants.title")}
            </h3>
          </div>
          <div className="ml-auto">
            <Button onClick={handleOpenCreate}>
              <RiAddLine className="mr-1 h-4 w-4" />
              {t("admin-panel-settings:tenants.actions.create")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin-panel-settings:tenants.table.columns.name")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-settings:tenants.table.columns.slug")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-settings:tenants.table.columns.email")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-settings:tenants.table.columns.phone")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-settings:tenants.table.columns.status")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-settings:tenants.table.columns.created")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-settings:tenants.table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !tenants || tenants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-settings:tenants.table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-paragraph-sm text-text-sub-600">
                      {item.slug}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {String(item.contactEmail ?? "—")}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {String(item.contactPhone ?? "—")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.isActive ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => void handleToggleActive(item)}
                      >
                        {item.isActive
                          ? t("admin-panel-settings:tenants.status.active")
                          : t("admin-panel-settings:tenants.status.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <RiMoreLine className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            data-testid={`manage-tenant-users-${item.id}`}
                            onClick={() => handleOpenManageUsers(item)}
                          >
                            <RiUserLine className="mr-2 h-4 w-4" />
                            {t(
                              "admin-panel-settings:tenants.users.manageUsers"
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(item)}
                          >
                            <RiEditLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-settings:tenants.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-settings:tenants.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog.Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.DialogContent className="sm:max-w-125">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-settings:tenants.form.titleEdit")
                : t("admin-panel-settings:tenants.form.titleCreate")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-settings:tenants.form.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(
                  "admin-panel-settings:tenants.form.namePlaceholder"
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-settings:tenants.form.slug")}</Label>
              <Input
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                  )
                }
                placeholder={t(
                  "admin-panel-settings:tenants.form.slugPlaceholder"
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-settings:tenants.form.contactEmail")}
                </Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-settings:tenants.form.contactPhone")}
                </Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-settings:tenants.actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : null}
              {t("admin-panel-settings:tenants.actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Logout prompt after tenant creation */}
      <Dialog.Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <Dialog.DialogContent className="sm:max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-settings:tenants.notifications.logoutTitle")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>

          <div className="flex items-start gap-3 py-4">
            <RiLogoutBoxRLine className="mt-0.5 h-5 w-5 shrink-0 text-primary-base" />
            <p className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-settings:tenants.notifications.logoutMessage")}
            </p>
          </div>

          <Dialog.DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              {t("admin-panel-settings:tenants.notifications.logoutCancel")}
            </Button>
            <Button onClick={() => void handleLogOut()}>
              <RiLogoutBoxRLine className="mr-1 h-4 w-4" />
              {t("admin-panel-settings:tenants.notifications.logoutConfirm")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Manage Users Dialog */}
      <Dialog.Dialog
        open={!!manageUsersTenant}
        onOpenChange={(open) => {
          if (!open) handleCloseManageUsers();
        }}
      >
        <Dialog.DialogContent
          className="sm:max-w-2xl"
          data-testid="manage-tenant-users-dialog"
        >
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-settings:tenants.users.title")} —{" "}
              {manageUsersTenant?.name}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>

          {/* Add User Search */}
          <div className="border-b border-stroke-soft-200 pb-4">
            <Label className="mb-2 block">
              {t("admin-panel-settings:tenants.users.addUser")}
            </Label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
              <Input
                data-testid="search-users-input"
                value={userSearch}
                onChange={(e) => void handleSearchUsers(e.target.value)}
                placeholder={t(
                  "admin-panel-settings:tenants.users.searchPlaceholder"
                )}
                className="pl-9"
              />
            </div>

            {isLoadingUsers && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            )}

            {!isLoadingUsers && filteredUserOptions.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-stroke-soft-200">
                {filteredUserOptions.map((user) => (
                  <button
                    key={user.id}
                    data-testid={`assign-user-${user.id}`}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-paragraph-sm hover:bg-bg-weak-50"
                    onClick={() => void handleAssignUser(user.id)}
                    disabled={assignMutation.isPending}
                  >
                    <div>
                      <span className="font-medium text-text-strong-950">
                        {[user.firstName, user.lastName]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </span>
                      <span className="ml-2 text-text-soft-400">
                        {user.email}
                      </span>
                    </div>
                    {user.roleId && (
                      <Badge
                        variant={getRoleBadgeVariant(user.roleId)}
                        className="ml-2 shrink-0"
                      >
                        {ROLE_LABELS[user.roleId] ?? "Unknown"}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!isLoadingUsers &&
              userSearch.trim().length >= 2 &&
              filteredUserOptions.length === 0 && (
                <p className="mt-2 text-paragraph-sm text-text-soft-400">
                  {t("admin-panel-settings:tenants.users.noUsersFound")}
                </p>
              )}
          </div>

          {/* Assigned Users List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoadingTenantUsers ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : !tenantUsers || tenantUsers.length === 0 ? (
              <p className="py-8 text-center text-paragraph-sm text-text-soft-400">
                {t("admin-panel-settings:tenants.users.noUsers")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-settings:tenants.users.columns.name")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-settings:tenants.users.columns.email")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-settings:tenants.users.columns.role")}
                    </TableHead>
                    <TableHead style={{ width: 80 }}>
                      {t("admin-panel-settings:tenants.users.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantUsers.map((tu: TenantUser) => (
                    <TableRow key={tu.id}>
                      <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                        {tu.userName
                          ? String(tu.userName)
                          : `User #${tu.userId}`}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-text-sub-600">
                        {tu.userEmail
                          ? String(tu.userEmail)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {tu.userRole ? (
                          <Badge
                            variant={getRoleBadgeVariant(
                              Number(tu.userRole)
                            )}
                          >
                            {ROLE_LABELS[
                              Number(tu.userRole)
                            ] ?? "Unknown"}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          data-testid={`remove-user-from-tenant-${tu.userId}`}
                          variant="outline"
                          size="sm"
                          className="h-7 text-error-base hover:text-error-base"
                          onClick={() => void handleRemoveUser(tu)}
                          disabled={removeMutation.isPending}
                        >
                          <RiCloseLine className="mr-1 h-3.5 w-3.5" />
                          {t("admin-panel-settings:tenants.users.removeUser")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Dialog.DialogFooter>
            <Button variant="outline" onClick={handleCloseManageUsers}>
              {t("admin-panel-settings:tenants.actions.cancel")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(TenantManagement, {
  roles: [RoleEnum.ADMIN],
});
