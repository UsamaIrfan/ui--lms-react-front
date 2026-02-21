"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useExpenseListQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "./queries/queries";
import type { ExpenseItem } from "./queries/queries";
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
import { Badge } from "@/components/ui/badge";
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

function AccountsExpenses() {
  const { t } = useTranslation("admin-panel-accounts-expenses");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: items, isLoading } = useExpenseListQuery();
  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseItem | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [status, setStatus] = useState("pending");
  const [remarks, setRemarks] = useState("");

  const resetForm = useCallback(() => {
    setCategory("");
    setDescription("");
    setAmount("");
    setDate("");
    setReferenceNumber("");
    setPaidTo("");
    setStatus("pending");
    setRemarks("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: ExpenseItem) => {
    setEditItem(item);
    setCategory(item.category);
    setDescription(item.description ?? "");
    setAmount(String(item.amount));
    setDate(item.date?.split("T")[0] ?? "");
    setReferenceNumber(item.referenceNumber ?? "");
    setPaidTo(item.paidTo ?? "");
    setStatus(item.status ?? "pending");
    setRemarks(item.remarks ?? "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!category || !amount || !date) {
      enqueueSnackbar(
        t("admin-panel-accounts-expenses:form.validation.required"),
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
        paidTo: paidTo || undefined,
        status: status as "pending" | "approved" | "paid" | "rejected",
        remarks: remarks || undefined,
      } as any;
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        enqueueSnackbar(
          t("admin-panel-accounts-expenses:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          ...payload,
        });
        enqueueSnackbar(
          t("admin-panel-accounts-expenses:notifications.created"),
          { variant: "success" }
        );
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-accounts-expenses:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    category,
    description,
    amount,
    date,
    referenceNumber,
    paidTo,
    status,
    remarks,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: ExpenseItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-accounts-expenses:confirm.deleteTitle"),
        message: t("admin-panel-accounts-expenses:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-accounts-expenses:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-accounts-expenses:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const statusVariant = (s?: string | null) => {
    if (s === "paid" || s === "approved") return "default" as const;
    if (s === "rejected") return "destructive" as const;
    return "outline" as const;
  };

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-accounts-expenses:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-accounts-expenses:actions.create")}
          </Button>
        </div>
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin-panel-accounts-expenses:table.columns.category")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-expenses:table.columns.amount")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-expenses:table.columns.date")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-expenses:table.columns.paidTo")}
                </TableHead>
                <TableHead>
                  {t("admin-panel-accounts-expenses:table.columns.status")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-accounts-expenses:table.columns.actions")}
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
                    {t("admin-panel-accounts-expenses:table.empty")}
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
                      {item.paidTo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status ?? "pending"}
                      </Badge>
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
                            {t("admin-panel-accounts-expenses:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-accounts-expenses:actions.delete")}
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
                ? t("admin-panel-accounts-expenses:actions.edit")
                : t("admin-panel-accounts-expenses:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-accounts-expenses:form.category")}
                </Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-expenses:form.amount")}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-expenses:form.date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-expenses:form.paidTo")}</Label>
                <Input
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-accounts-expenses:form.description")}
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-accounts-expenses:form.referenceNumber")}
                </Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-accounts-expenses:form.status")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-accounts-expenses:form.remarks")}</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-accounts-expenses:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-accounts-expenses:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AccountsExpenses, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT],
});
