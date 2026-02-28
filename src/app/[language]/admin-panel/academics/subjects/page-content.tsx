"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useSubjectsListQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "./queries/queries";
import type { SubjectItem } from "./queries/queries";
import { useDepartmentsListQuery } from "../courses/queries/queries";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AcademicSubjects() {
  const { t } = useTranslation("admin-panel-academics-subjects");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const createMutation = useCreateSubjectMutation();
  const updateMutation = useUpdateSubjectMutation();
  const deleteMutation = useDeleteSubjectMutation();

  const { data, isLoading } = useSubjectsListQuery();
  const { data: departments } = useDepartmentsListQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubjectItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formCreditHours, setFormCreditHours] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const resetForm = useCallback(() => {
    setFormName("");
    setFormCode("");
    setFormDepartmentId("");
    setFormCreditHours("");
    setFormDescription("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: SubjectItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormDepartmentId(String(item.departmentId));
    setFormCreditHours(String(item.creditHours));
    setFormDescription(item.description ?? "");
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formName || !formCode || !formDepartmentId) {
      enqueueSnackbar(
        t("admin-panel-academics-subjects:form.validation.nameRequired"),
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
            code: formCode,
            departmentId: Number(formDepartmentId),
            creditHours: formCreditHours ? Number(formCreditHours) : undefined,
            description: formDescription || undefined,
          } as any,
        });
        enqueueSnackbar(
          t("admin-panel-academics-subjects:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createMutation.mutateAsync({
          name: formName,
          code: formCode,
          departmentId: Number(formDepartmentId),
          creditHours: formCreditHours ? Number(formCreditHours) : undefined,
          description: formDescription || undefined,
        } as any);
        enqueueSnackbar(
          t("admin-panel-academics-subjects:notifications.created"),
          { variant: "success" }
        );
      }
      setModalOpen(false);
      resetForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-subjects:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    formName,
    formCode,
    formDepartmentId,
    formCreditHours,
    formDescription,
    editItem,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (item: SubjectItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-subjects:confirm.deleteTitle"),
        message: t("admin-panel-academics-subjects:confirm.delete"),
      });
      if (isConfirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-subjects:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-academics-subjects:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  return (
    <div data-testid="admin-academics-subjects-page" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-academics-subjects:title")}
          </h3>
          <Button onClick={handleOpenCreate}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-academics-subjects:actions.create")}
          </Button>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-academics-subjects:table.columns.name")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t("admin-panel-academics-subjects:table.columns.code")}
                </TableHead>
                <TableHead style={{ width: 120 }}>
                  {t(
                    "admin-panel-academics-subjects:table.columns.creditHours"
                  )}
                </TableHead>
                <TableHead style={{ width: 250 }}>
                  {t(
                    "admin-panel-academics-subjects:table.columns.description"
                  )}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {t("admin-panel-academics-subjects:table.columns.actions")}
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
                    {t("admin-panel-academics-subjects:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.code}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.creditHours}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {item.description ?? "—"}
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
                            {t("admin-panel-academics-subjects:actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-base focus:text-error-base"
                            onClick={() => void handleDelete(item)}
                          >
                            <RiDeleteBinLine className="mr-2 h-4 w-4" />
                            {t("admin-panel-academics-subjects:actions.delete")}
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
                ? t("admin-panel-academics-subjects:actions.edit")
                : t("admin-panel-academics-subjects:actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-academics-subjects:form.name")}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-academics-subjects:form.code")}</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-subjects:form.departmentId")}
              </Label>
              <Select
                value={formDepartmentId}
                onValueChange={(v) => setFormDepartmentId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departments ?? []).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-subjects:form.creditHours")}
              </Label>
              <Input
                type="number"
                value={formCreditHours}
                onChange={(e) => setFormCreditHours(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-subjects:form.description")}
              </Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t("admin-panel-academics-subjects:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-subjects:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AcademicSubjects, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
