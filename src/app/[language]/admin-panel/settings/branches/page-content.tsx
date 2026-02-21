"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useState } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useTenant from "@/services/tenant/use-tenant";
import {
  useBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} from "./queries/queries";
import type { Branch } from "@/services/api/generated/model";
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
  RiGitBranchLine,
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
} from "@remixicon/react";

function BranchManagement() {
  const { t } = useTranslation("admin-panel-settings");
  const { tenantId } = useTenant();
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: branches, isLoading } = useBranchesQuery(tenantId ?? undefined);
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const deleteMutation = useDeleteBranchMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setCode("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setPhone("");
    setEmail("");
    setIsHeadquarters(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: Branch) => {
    setEditItem(item);
    setName(item.name);
    setCode(item.code);
    setAddress(String(item.address ?? ""));
    setCity(String(item.city ?? ""));
    setState(String(item.state ?? ""));
    setCountry(String(item.country ?? ""));
    setPhone(String(item.phone ?? ""));
    setEmail(String(item.email ?? ""));
    setIsHeadquarters(item.isHeadquarters ?? false);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !code.trim()) {
      enqueueSnackbar(
        t("admin-panel-settings:branches.validation.nameRequired"),
        {
          variant: "error",
        }
      );
      return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: {
            name,
            code,
            address: address || undefined,
            city: city || undefined,
            state: state || undefined,
            country: country || undefined,
            phone: phone || undefined,
            email: email || undefined,
            isHeadquarters,
          },
        });
        enqueueSnackbar(
          t("admin-panel-settings:branches.notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          name,
          code,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
          phone: phone || undefined,
          email: email || undefined,
        });
        enqueueSnackbar(
          t("admin-panel-settings:branches.notifications.created"),
          { variant: "success" }
        );
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-settings:branches.notifications.error"), {
        variant: "error",
      });
    }
  }, [
    name,
    code,
    address,
    city,
    state,
    country,
    phone,
    email,
    isHeadquarters,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: Branch) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-settings:branches.confirm.deleteTitle"),
        message: t("admin-panel-settings:branches.confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-settings:branches.notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-settings:branches.notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-panel/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50"
            >
              <RiArrowLeftLine className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base">
                <RiGitBranchLine className="h-5 w-5" />
              </div>
              <h3 className="text-title-h5 text-text-strong-950">
                {t("admin-panel-settings:branches.title")}
              </h3>
            </div>
          </div>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-settings:branches.actions.create")}
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.name")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.code")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.city")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.email")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.status")}
                  </TableHead>
                  <TableHead>
                    {t("admin-panel-settings:branches.table.headquarters")}
                  </TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <p className="text-paragraph-sm text-text-sub-600">
                        {t("admin-panel-settings:branches.table.empty")}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
                {branches?.map((branch: any) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.code}</TableCell>
                    <TableCell>{String(branch.city ?? "—")}</TableCell>
                    <TableCell>{String(branch.email ?? "—")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={branch.isActive ? "default" : "secondary"}
                      >
                        {branch.isActive
                          ? t("admin-panel-settings:branches.status.active")
                          : t("admin-panel-settings:branches.status.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {branch.isHeadquarters && (
                        <Badge variant="outline">
                          {t(
                            "admin-panel-settings:branches.table.headquarters"
                          )}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <RiMoreLine className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(branch)}
                          >
                            <RiEditLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-settings:branches.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => void handleDelete(branch)}
                            className="text-error-base"
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-settings:branches.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog.Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.DialogContent className="max-w-lg">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-settings:branches.form.titleEdit")
                : t("admin-panel-settings:branches.form.titleCreate")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Main Campus"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.code")}</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="MAIN"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>{t("admin-panel-settings:branches.form.address")}</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 University Ave"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.city")}</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.state")}</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.country")}</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("admin-panel-settings:branches.form.phone")}</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>{t("admin-panel-settings:branches.form.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@institution.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-headquarters"
                checked={isHeadquarters}
                onChange={(e) => setIsHeadquarters(e.target.checked)}
                className="h-4 w-4 rounded border-stroke-soft-200 text-primary-base focus:ring-primary-base"
              />
              <Label htmlFor="is-headquarters">
                {t("admin-panel-settings:branches.form.isHeadquarters")}
              </Label>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-settings:branches.actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {editItem
                ? t("admin-panel-settings:branches.actions.save")
                : t("admin-panel-settings:branches.actions.create")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(BranchManagement, {
  roles: [RoleEnum.ADMIN],
});
