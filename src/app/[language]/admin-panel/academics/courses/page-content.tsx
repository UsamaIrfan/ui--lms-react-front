"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useInstitutionsListQuery,
  useDepartmentsListQuery,
  useCreateInstitutionMutation,
  useUpdateInstitutionMutation,
  useDeleteInstitutionMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "./queries/queries";
import type { InstitutionItem, DepartmentItem } from "./queries/queries";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AcademicCourses() {
  const { t } = useTranslation("admin-panel-academics-courses");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const createInstMutation = useCreateInstitutionMutation();
  const updateInstMutation = useUpdateInstitutionMutation();
  const deleteInstMutation = useDeleteInstitutionMutation();
  const createDeptMutation = useCreateDepartmentMutation();
  const updateDeptMutation = useUpdateDepartmentMutation();
  const deleteDeptMutation = useDeleteDepartmentMutation();

  const { data: institutions, isLoading: instLoading } =
    useInstitutionsListQuery();
  const { data: departments, isLoading: deptLoading } =
    useDepartmentsListQuery();

  // Tab state
  const [activeTab, setActiveTab] = useState<"institutions" | "departments">(
    "institutions"
  );

  // Institution modal
  const [instModalOpen, setInstModalOpen] = useState(false);
  const [editInst, setEditInst] = useState<InstitutionItem | null>(null);
  const [instName, setInstName] = useState("");
  const [instCode, setInstCode] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [instPhone, setInstPhone] = useState("");
  const [instCity, setInstCity] = useState("");
  const [instAddress, setInstAddress] = useState("");

  // Department modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<DepartmentItem | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptInstId, setDeptInstId] = useState("");
  const [deptDescription, setDeptDescription] = useState("");

  const resetInstForm = useCallback(() => {
    setInstName("");
    setInstCode("");
    setInstEmail("");
    setInstPhone("");
    setInstCity("");
    setInstAddress("");
  }, []);

  const resetDeptForm = useCallback(() => {
    setDeptName("");
    setDeptCode("");
    setDeptInstId("");
    setDeptDescription("");
  }, []);

  // Institution handlers
  const handleOpenCreateInst = useCallback(() => {
    setEditInst(null);
    resetInstForm();
    setInstModalOpen(true);
  }, [resetInstForm]);
  const handleOpenEditInst = useCallback((item: InstitutionItem) => {
    setEditInst(item);
    setInstName(item.name);
    setInstCode(item.code);
    setInstEmail(item.email ?? "");
    setInstPhone(item.phone ?? "");
    setInstCity(item.city ?? "");
    setInstAddress(item.address ?? "");
    setInstModalOpen(true);
  }, []);

  const handleSubmitInst = useCallback(async () => {
    if (!instName || !instCode) {
      enqueueSnackbar(
        t(
          "admin-panel-academics-courses:institutions.form.validation.nameRequired"
        ),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        name: instName,
        code: instCode,
        email: instEmail || undefined,
        phone: instPhone || undefined,
        city: instCity || undefined,
        address: instAddress || undefined,
      } as any;
      if (editInst) {
        await updateInstMutation.mutateAsync({
          id: editInst.id,
          data: payload,
        });
        enqueueSnackbar(
          t("admin-panel-academics-courses:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createInstMutation.mutateAsync({
          ...payload,
        });
        enqueueSnackbar(
          t("admin-panel-academics-courses:notifications.created"),
          { variant: "success" }
        );
      }
      setInstModalOpen(false);
      resetInstForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-courses:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    instName,
    instCode,
    instEmail,
    instPhone,
    instCity,
    instAddress,
    editInst,
    createInstMutation,
    updateInstMutation,
    enqueueSnackbar,
    t,
    resetInstForm,
  ]);

  const handleDeleteInst = useCallback(
    async (item: InstitutionItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-courses:confirm.deleteTitle"),
        message: t("admin-panel-academics-courses:confirm.delete"),
      });
      if (isConfirmed) {
        try {
          await deleteInstMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-courses:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-academics-courses:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteInstMutation, enqueueSnackbar, t]
  );

  // Department handlers
  const handleOpenCreateDept = useCallback(() => {
    setEditDept(null);
    resetDeptForm();
    setDeptModalOpen(true);
  }, [resetDeptForm]);
  const handleOpenEditDept = useCallback((item: DepartmentItem) => {
    setEditDept(item);
    setDeptName(item.name);
    setDeptCode(item.code);
    setDeptInstId(String(item.institutionId));
    setDeptDescription(item.description ?? "");
    setDeptModalOpen(true);
  }, []);

  const handleSubmitDept = useCallback(async () => {
    if (!deptName || !deptCode || !deptInstId) {
      enqueueSnackbar(
        t(
          "admin-panel-academics-courses:departments.form.validation.nameRequired"
        ),
        { variant: "error" }
      );
      return;
    }
    try {
      const payload = {
        name: deptName,
        code: deptCode,
        institutionId: Number(deptInstId),
        description: deptDescription || undefined,
      } as any;
      if (editDept) {
        await updateDeptMutation.mutateAsync({
          id: editDept.id,
          data: payload,
        });
        enqueueSnackbar(
          t("admin-panel-academics-courses:notifications.updated"),
          { variant: "success" }
        );
      } else {
        await createDeptMutation.mutateAsync({
          ...payload,
        });
        enqueueSnackbar(
          t("admin-panel-academics-courses:notifications.created"),
          { variant: "success" }
        );
      }
      setDeptModalOpen(false);
      resetDeptForm();
    } catch {
      enqueueSnackbar(t("admin-panel-academics-courses:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    deptName,
    deptCode,
    deptInstId,
    deptDescription,
    editDept,
    createDeptMutation,
    updateDeptMutation,
    enqueueSnackbar,
    t,
    resetDeptForm,
  ]);

  const handleDeleteDept = useCallback(
    async (item: DepartmentItem) => {
      const isConfirmed = await confirmDialog({
        title: t("admin-panel-academics-courses:confirm.deleteTitle"),
        message: t("admin-panel-academics-courses:confirm.delete"),
      });
      if (isConfirmed) {
        try {
          await deleteDeptMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-academics-courses:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(
            t("admin-panel-academics-courses:notifications.error"),
            { variant: "error" }
          );
        }
      }
    },
    [confirmDialog, deleteDeptMutation, enqueueSnackbar, t]
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-academics-courses:title")}
          </h3>
          <Button
            onClick={
              activeTab === "institutions"
                ? handleOpenCreateInst
                : handleOpenCreateDept
            }
          >
            <RiAddLine className="mr-1 h-4 w-4" />
            {activeTab === "institutions"
              ? t("admin-panel-academics-courses:institutions.actions.create")
              : t("admin-panel-academics-courses:departments.actions.create")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-stroke-soft-200">
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "institutions" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("institutions")}
          >
            {t("admin-panel-academics-courses:tabs.institutions")}
          </button>
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "departments" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("departments")}
          >
            {t("admin-panel-academics-courses:tabs.departments")}
          </button>
        </div>

        {/* Institutions Table */}
        {activeTab === "institutions" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 200 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.name"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.code"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 150 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.city"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 150 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.email"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.status"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 60 }}>
                    {t(
                      "admin-panel-academics-courses:institutions.table.columns.actions"
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !institutions || institutions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t(
                        "admin-panel-academics-courses:institutions.table.empty"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  institutions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.code}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.city ?? "—"}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "outline"}>
                          {item.isActive ? "Active" : "Inactive"}
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
                              onClick={() => handleOpenEditInst(item)}
                            >
                              <RiEditLine className="mr-2 h-4 w-4" />
                              {t("admin-panel-academics-courses:actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error-base focus:text-error-base"
                              onClick={() => void handleDeleteInst(item)}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-academics-courses:actions.delete"
                              )}
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
        )}

        {/* Departments Table */}
        {activeTab === "departments" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 200 }}>
                    {t(
                      "admin-panel-academics-courses:departments.table.columns.name"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t(
                      "admin-panel-academics-courses:departments.table.columns.code"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 250 }}>
                    {t(
                      "admin-panel-academics-courses:departments.table.columns.description"
                    )}
                  </TableHead>
                  <TableHead style={{ width: 60 }}>
                    {t(
                      "admin-panel-academics-courses:departments.table.columns.actions"
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !departments || departments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t(
                        "admin-panel-academics-courses:departments.table.empty"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.code}
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
                              onClick={() => handleOpenEditDept(item)}
                            >
                              <RiEditLine className="mr-2 h-4 w-4" />
                              {t("admin-panel-academics-courses:actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error-base focus:text-error-base"
                              onClick={() => void handleDeleteDept(item)}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              {t(
                                "admin-panel-academics-courses:actions.delete"
                              )}
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
        )}
      </div>

      {/* Institution Modal */}
      <Dialog.Dialog open={instModalOpen} onOpenChange={setInstModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editInst
                ? t("admin-panel-academics-courses:actions.edit")
                : t(
                    "admin-panel-academics-courses:institutions.actions.create"
                  )}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.name")}
                </Label>
                <Input
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.code")}
                </Label>
                <Input
                  value={instCode}
                  onChange={(e) => setInstCode(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.email")}
                </Label>
                <Input
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.phone")}
                </Label>
                <Input
                  value={instPhone}
                  onChange={(e) => setInstPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.city")}
                </Label>
                <Input
                  value={instCity}
                  onChange={(e) => setInstCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-academics-courses:institutions.form.address")}
                </Label>
                <Input
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setInstModalOpen(false)}>
              {t("admin-panel-academics-courses:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitInst()}
              disabled={
                createInstMutation.isPending || updateInstMutation.isPending
              }
            >
              {(createInstMutation.isPending ||
                updateInstMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-courses:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Department Modal */}
      <Dialog.Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editDept
                ? t("admin-panel-academics-courses:actions.edit")
                : t("admin-panel-academics-courses:departments.actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-courses:departments.form.name")}
              </Label>
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-academics-courses:departments.form.code")}
              </Label>
              <Input
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t(
                  "admin-panel-academics-courses:departments.form.institutionId"
                )}
              </Label>
              <Select
                value={deptInstId}
                onValueChange={(v) => setDeptInstId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
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
            <div className="grid gap-2">
              <Label>
                {t(
                  "admin-panel-academics-courses:departments.form.description"
                )}
              </Label>
              <Input
                value={deptDescription}
                onChange={(e) => setDeptDescription(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setDeptModalOpen(false)}>
              {t("admin-panel-academics-courses:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitDept()}
              disabled={
                createDeptMutation.isPending || updateDeptMutation.isPending
              }
            >
              {(createDeptMutation.isPending ||
                updateDeptMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-academics-courses:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AcademicCourses, {
  roles: [RoleEnum.ADMIN],
});
