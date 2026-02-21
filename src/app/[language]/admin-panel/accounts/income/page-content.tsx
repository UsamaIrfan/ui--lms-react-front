"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useIncomeListQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} from "./queries/queries";
import type { IncomeItem } from "./queries/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AccountsIncome() {
  const { t } = useTranslation("admin-panel-accounts-income");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: items, isLoading } = useIncomeListQuery();
  const createMutation = useCreateIncomeMutation();
  const updateMutation = useUpdateIncomeMutation();
  const deleteMutation = useDeleteIncomeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IncomeItem | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [remarks, setRemarks] = useState("");

  const resetForm = useCallback(() => {
    setCategory("");
    setDescription("");
    setAmount("");
    setDate("");
    setReferenceNumber("");
    setReceivedFrom("");
    setRemarks("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: IncomeItem) => {
    setEditItem(item);
    setCategory(item.category);
    setDescription(item.description ?? "");
    setAmount(String(item.amount));
    setDate(item.date?.split("T")[0] ?? "");
    setReferenceNumber(item.referenceNumber ?? "");
    setReceivedFrom(item.receivedFrom ?? "");
    setRemarks(item.remarks ?? "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!category || !amount || !date) {
      enqueueSnackbar(
        t("admin-panel-accounts-income:form.validation.required"),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        category,
        description: description || undefined,
        amount: Number(amount),
        date,
        referenceNumber: referenceNumber || undefined,
        receivedFrom: receivedFrom || undefined,
        remarks: remarks || undefined,
      } as any;
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        enqueueSnackbar(
          t("admin-panel-accounts-income:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          ...payload,
        });
        enqueueSnackbar(
          t("admin-panel-accounts-income:notifications.created"),
          { variant: "success" }
        );
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-accounts-income:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    category,
    description,
    amount,
    date,
    referenceNumber,
    receivedFrom,
    remarks,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: IncomeItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-accounts-income:confirm.deleteTitle"),
        message: t("admin-panel-accounts-income:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-accounts-income:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-accounts-income:notifications.error"),
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
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-accounts-income:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-accounts-income:actions.create")}
          </Button>
        </div>
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin-panel-accounts-income:table.columns.category")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-income:table.columns.amount")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-income:table.columns.date")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-income:table.columns.receivedFrom")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-income:table.columns.reference")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-accounts-income:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !items || items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-accounts-income:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {new Date(item.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.receivedFrom ?? "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.referenceNumber ?? "—"}
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
                            {t("admin-panel-accounts-income:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-accounts-income:actions.delete")}
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

      <Dialog.Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[550px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-accounts-income:actions.edit")
                : t("admin-panel-accounts-income:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-income:form.category")}</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-income:form.amount")}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-income:form.date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-accounts-income:form.receivedFrom")}
                </Label>
                <Input
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-accounts-income:form.description")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-accounts-income:form.referenceNumber")}
                </Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-income:form.remarks")}</Label>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-accounts-income:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-accounts-income:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AccountsIncome, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT],
});
