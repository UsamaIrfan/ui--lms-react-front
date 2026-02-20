"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useAcademicYearsListQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
} from "./queries/queries";
import type { AcademicYearItem } from "./queries/queries";
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
import useTenant from "@/services/tenant/use-tenant";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstitutionsListQuery } from "../courses/queries/queries";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AcademicYear() {
  const { t } = useTranslation("admin-panel-academics-year");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const { tenantId } = useTenant();
  const deleteMutation = useDeleteAcademicYearMutation();
  const createMutation = useCreateAcademicYearMutation();
  const updateMutation = useUpdateAcademicYearMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYearItem | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formInstitutionId, setFormInstitutionId] = useState("");
  const [formIsCurrent, setFormIsCurrent] = useState(false);

  const { data, isLoading } = useAcademicYearsListQuery();
  const { data: institutions } = useInstitutionsListQuery();

  const resetForm = useCallback(() => {
    setFormName("");
    setFormStartDate("");
    setFormEndDate("");
    setFormInstitutionId("");
    setFormIsCurrent(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: AcademicYearItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormStartDate(item.startDate?.split("T")[0] ?? "");
    setFormEndDate(item.endDate?.split("T")[0] ?? "");
    setFormInstitutionId(String(item.institutionId));
    setFormIsCurrent(item.isCurrent ?? false);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formName || !formStartDate || !formEndDate || !formInstitutionId) {
      enqueueSnackbar(
        t("admin-panel-academics-year:form.validation.nameRequired"),
        { variant: "error" }
      );
      return;
    }

    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: {
            name: formName,
            startDate: formStartDate,
            endDate: formEndDate,
            institutionId: Number(formInstitutionId),
            isCurrent: formIsCurrent,
          },
        });
        enqueueSnackbar(t("admin-panel-academics-year:notifications.updated"), {
          variant: "success",
        });
      } else {
        await createMutation.mutateAsync({
          tenantId: tenantId ?? "",
          name: formName,
          startDate: formStartDate,
          endDate: formEndDate,
          institutionId: Number(formInstitutionId),
          isCurrent: formIsCurrent,
        });
        enqueueSnackbar(t("admin-panel-academics-year:notifications.created"), {
          variant: "success",
        });
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-year:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    formName,
    formStartDate,
    formEndDate,
    formInstitutionId,
    formIsCurrent,
    editItem,
    tenantId,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: AcademicYearItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-year:confirm.deleteTitle"),
        message: t("admin-panel-academics-year:confirm.delete"),
      });

      if (isConfirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-year:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(t("admin-panel-academics-year:notifications.error"), {
            variant: "error",
          });
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
            {t("admin-panel-academics-year:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-academics-year:actions.create")}
          </Button>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-year:table.columns.name")}
                </TableHead>
                <TableHead style={{ width: 150 }}>
                  {t("admin-panel-academics-year:table.columns.startDate")}
                </TableHead>
                <TableHead style={{ width: 150 }}>
                  {t("admin-panel-academics-year:table.columns.endDate")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-academics-year:table.columns.isCurrent")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-academics-year:table.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-academics-year:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {formatDate(item.startDate)}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {formatDate(item.endDate)}
                    </TableCell>
                    <TableCell>
                      {item.isCurrent ? (
                        <Badge variant="default">
                          {t("admin-panel-academics-year:status.active")}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {t("admin-panel-academics-year:status.inactive")}
                        </Badge>
                      )}
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
                            {t("admin-panel-academics-year:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-academics-year:actions.delete")}
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
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-academics-year:actions.edit")
                : t("admin-panel-academics-year:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-academics-year:form.name")}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("admin-panel-academics-year:form.name")}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-year:form.institutionId")}
              </Label>
              <Select
                value={formInstitutionId}
                onValueChange={(v) => setFormInstitutionId(v)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "admin-panel-academics-year:form.institutionId"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(institutions ?? []).map((inst) => (
                    <SelectItem key={inst.id} value={String(inst.id)}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-academics-year:form.startDate")}</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-academics-year:form.endDate")}</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formIsCurrent}
                onChange={(e) => setFormIsCurrent(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isCurrent">
                {t("admin-panel-academics-year:form.isCurrent")}
              </Label>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-academics-year:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-year:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AcademicYear, {
  roles: [RoleEnum.ADMIN],
});
