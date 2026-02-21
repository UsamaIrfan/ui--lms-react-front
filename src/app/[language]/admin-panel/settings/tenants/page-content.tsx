"use client";

import { useCallback, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import {
  useTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} from "./queries/queries";
import type { Tenant } from "@/services/api/generated/model";
import { useSnackbar } from "@/hooks/use-snackbar";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
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
} from "@remixicon/react";

function TenantManagement() {
  const { t } = useTranslation("admin-panel-settings");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: tenants, isLoading } = useTenantsQuery();
  const createMutation = useCreateTenantMutation();
  const updateMutation = useUpdateTenantMutation();
  const deleteMutation = useDeleteTenantMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tenant | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(
        t("admin-panel-settings:tenants.notifications.error"),
        { variant: "error" }
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
        } catch {
          enqueueSnackbar(
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
      } catch {
        enqueueSnackbar(
          t("admin-panel-settings:tenants.notifications.error"),
          { variant: "error" }
        );
      }
    },
    [updateMutation, enqueueSnackbar, t]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
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
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : null}
              {t("admin-panel-settings:tenants.actions.save")}
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
