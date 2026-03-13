"use client";

import { RoleEnum } from "@/services/api/types/role";
import type { CreateTermDto } from "@/services/api/generated/model";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useTermsListQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
} from "./queries/queries";
import type { TermItem } from "./queries/queries";
import { useAcademicYearsListQuery } from "../year/queries/queries";
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
import { getHttpErrorMessage } from "@/services/api/generated/custom-fetch";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AcademicTerms() {
  const { t } = useTranslation("admin-panel-academics-terms");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const deleteMutation = useDeleteTermMutation();
  const createMutation = useCreateTermMutation();
  const updateMutation = useUpdateTermMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TermItem | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAcademicYearId, setFormAcademicYearId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const { data, isLoading } = useTermsListQuery();
  const { data: academicYears } = useAcademicYearsListQuery();

  const resetForm = useCallback(() => {
    setFormName("");
    setFormAcademicYearId("");
    setFormStartDate("");
    setFormEndDate("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: TermItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormAcademicYearId(String(item.academicYearId));
    setFormStartDate(item.startDate?.split("T")[0] ?? "");
    setFormEndDate(item.endDate?.split("T")[0] ?? "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formName || !formAcademicYearId || !formStartDate || !formEndDate) {
      enqueueSnackbar(
        t("admin-panel-academics-terms:form.validation.nameRequired"),
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
            academicYearId: Number(formAcademicYearId),
            startDate: formStartDate,
            endDate: formEndDate,
          },
        });
        enqueueSnackbar(
          t("admin-panel-academics-terms:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          name: formName,
          academicYearId: Number(formAcademicYearId),
          startDate: formStartDate,
          endDate: formEndDate,
        } as CreateTermDto);
        enqueueSnackbar(
          t("admin-panel-academics-terms:notifications.created"),
          { variant: "success" }
        );
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      enqueueSnackbar(
        getHttpErrorMessage(error) ??
          t("admin-panel-academics-terms:notifications.error"),
        {
          variant: "error",
        }
      );
    }
  }, [
    formName,
    formAcademicYearId,
    formStartDate,
    formEndDate,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: TermItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-terms:confirm.deleteTitle"),
        message: t("admin-panel-academics-terms:confirm.delete"),
      });

      if (isConfirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-terms:notifications.deleted"),
            { variant: "success" }
          );
        } catch (error) {
          enqueueSnackbar(
            getHttpErrorMessage(error) ??
              t("admin-panel-academics-terms:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  // Build academicYear lookup for display
  const academicYearMap = new Map(
    (academicYears ?? []).map((ay) => [ay.id, ay.name])
  );

  return (
    <div
      data-testid="admin-academics-terms-page"
      className="mx-auto max-w-7xl px-4"
    >
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-academics-terms:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-academics-terms:actions.create")}
          </Button>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-terms:table.columns.name")}
                </TableHead>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-terms:table.columns.academicYear")}
                </TableHead>
                <TableHead style={{ width: 150 }}>
                  {t("admin-panel-academics-terms:table.columns.startDate")}
                </TableHead>
                <TableHead style={{ width: 150 }}>
                  {t("admin-panel-academics-terms:table.columns.endDate")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-academics-terms:table.columns.actions")}
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
                    {t("admin-panel-academics-terms:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.academicYear?.name ??
                        academicYearMap.get(item.academicYearId) ??
                        `#${item.academicYearId}`}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {formatDate(item.startDate)}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {formatDate(item.endDate)}
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
                            {t("admin-panel-academics-terms:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-academics-terms:actions.delete")}
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
        <Dialog.DialogContent className="sm:max-w-125">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editItem
                ? t("admin-panel-academics-terms:actions.edit")
                : t("admin-panel-academics-terms:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-academics-terms:form.name")}</Label>
              <Input
                data-testid="term-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("admin-panel-academics-terms:form.name")}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-terms:form.academicYearId")}
              </Label>
              <Select
                value={formAcademicYearId}
                onValueChange={(v) => setFormAcademicYearId(v)}
              >
                <SelectTrigger data-testid="term-academic-year">
                  <SelectValue
                    placeholder={t(
                      "admin-panel-academics-terms:form.academicYearId"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(academicYears ?? []).map((ay) => (
                    <SelectItem key={ay.id} value={String(ay.id)}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-academics-terms:form.startDate")}</Label>
                <Input
                  data-testid="term-start-date"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-academics-terms:form.endDate")}</Label>
                <Input
                  data-testid="term-end-date"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-academics-terms:actions.cancel")}
            </Button>
            <Button
              data-testid="term-submit"
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-terms:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AcademicTerms, {
  roles: [RoleEnum.ADMIN],
});
