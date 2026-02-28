"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useSalaryStructuresQuery,
  usePayrollSlipsQuery,
  useCreateStructureMutation,
  useUpdateStructureMutation,
  useDeleteStructureMutation,
  useProcessPayrollMutation,
} from "./queries/queries";
import type {
  SalaryStructureItem,
  SalaryComponentItem,
} from "./queries/queries";
import { useStaffListQuery } from "../queries/queries";
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
  RiPlayLine,
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

const STATUS_COLORS: Record<string, "default" | "outline" | "destructive"> = {
  draft: "outline",
  processed: "default",
  paid: "default",
  held: "destructive",
};

function StaffPayroll() {
  const { t } = useTranslation("admin-panel-staff-payroll");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();

  const { data: structures, isLoading: structuresLoading } =
    useSalaryStructuresQuery();
  const { data: slips, isLoading: slipsLoading } = usePayrollSlipsQuery();
  const { data: staffMembers } = useStaffListQuery();
  const createMutation = useCreateStructureMutation();
  const updateMutation = useUpdateStructureMutation();
  const deleteMutation = useDeleteStructureMutation();
  const processMutation = useProcessPayrollMutation();

  const [activeTab, setActiveTab] = useState<"structures" | "slips">(
    "structures"
  );

  // Structure modal
  const [structureOpen, setStructureOpen] = useState(false);
  const [editStructure, setEditStructure] =
    useState<SalaryStructureItem | null>(null);
  const [structName, setStructName] = useState("");
  const [structStaffId, setStructStaffId] = useState("");
  const [components, setComponents] = useState<SalaryComponentItem[]>([]);
  const [compName, setCompName] = useState("");
  const [compType, setCompType] = useState<"earning" | "deduction">("earning");
  const [compAmount, setCompAmount] = useState("");

  // Process payroll modal
  const [processOpen, setProcessOpen] = useState(false);
  const [processMonth, setProcessMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [processYear, setProcessYear] = useState(
    String(new Date().getFullYear())
  );

  const resetStructureForm = useCallback(() => {
    setStructName("");
    setStructStaffId("");
    setComponents([]);
    setCompName("");
    setCompType("earning");
    setCompAmount("");
  }, []);

  const handleOpenCreateStructure = useCallback(() => {
    setEditStructure(null);
    resetStructureForm();
    setStructureOpen(true);
  }, [resetStructureForm]);

  const handleOpenEditStructure = useCallback((item: SalaryStructureItem) => {
    setEditStructure(item);
    setStructName(item.name);
    setStructStaffId(String(item.staffId));
    setComponents(item.components ?? []);
    setStructureOpen(true);
  }, []);

  const handleAddComponent = useCallback(() => {
    if (!compName || !compAmount) return;
    setComponents((prev) => [
      ...prev,
      { name: compName, type: compType, amount: Number(compAmount) },
    ]);
    setCompName("");
    setCompAmount("");
  }, [compName, compType, compAmount]);

  const handleRemoveComponent = useCallback((index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitStructure = useCallback(async () => {
    if (!structName || !structStaffId || components.length === 0) {
      enqueueSnackbar(t("admin-panel-staff-payroll:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      const payload = {
        name: structName,
        staffId: Number(structStaffId),
        components,
      };
      if (editStructure) {
        await updateMutation.mutateAsync({
          id: editStructure.id,
          data: payload,
        });
        enqueueSnackbar(t("admin-panel-staff-payroll:notifications.updated"), {
          variant: "success",
        });
      } else {
        await createMutation.mutateAsync({
          ...payload,
        } as any);
        enqueueSnackbar(t("admin-panel-staff-payroll:notifications.created"), {
          variant: "success",
        });
      }
      setStructureOpen(false);
      resetStructureForm();
    } catch {
      enqueueSnackbar(t("admin-panel-staff-payroll:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    structName,
    structStaffId,
    components,
    editStructure,
    createMutation,
    updateMutation,
    enqueueSnackbar,
    t,
    resetStructureForm,
  ]);

  const handleDeleteStructure = useCallback(
    async (item: SalaryStructureItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-staff-payroll:confirm.deleteTitle"),
        message: t("admin-panel-staff-payroll:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-staff-payroll:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(t("admin-panel-staff-payroll:notifications.error"), {
            variant: "error",
          });
        }
      }
    },
    [confirmDialog, deleteMutation, enqueueSnackbar, t]
  );

  const handleProcessPayroll = useCallback(async () => {
    try {
      await processMutation.mutateAsync({
        month: Number(processMonth),
        year: Number(processYear),
      } as any);
      enqueueSnackbar(t("admin-panel-staff-payroll:notifications.processed"), {
        variant: "success",
      });
      setProcessOpen(false);
    } catch {
      enqueueSnackbar(t("admin-panel-staff-payroll:notifications.error"), {
        variant: "error",
      });
    }
  }, [processMonth, processYear, processMutation, enqueueSnackbar, t]);

  return (
    <div data-testid="admin-staff-payroll-page" className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-staff-payroll:title")}
          </h3>
          <div className="flex gap-2">
            {activeTab === "structures" && (
              <Button onClick={handleOpenCreateStructure}>
                <RiAddLine className="mr-1 h-4 w-4" />
                {t("admin-panel-staff-payroll:structures.actions.create")}
              </Button>
            )}
            <Button variant="outline" onClick={() => setProcessOpen(true)}>
              <RiPlayLine className="mr-1 h-4 w-4" />
              {t("admin-panel-staff-payroll:slips.actions.process")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-stroke-soft-200">
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "structures" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("structures")}
          >
            {t("admin-panel-staff-payroll:tabs.structures")}
          </button>
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "slips" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("slips")}
          >
            {t("admin-panel-staff-payroll:tabs.slips")}
          </button>
        </div>

        {/* Salary Structures Table */}
        {activeTab === "structures" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 150 }}>
                    {t("admin-panel-staff-payroll:structures.table.name")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-payroll:structures.table.staffId")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:structures.table.earnings")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:structures.table.deductions")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:structures.table.netPay")}
                  </TableHead>
                  <TableHead style={{ width: 60 }}>
                    {t("admin-panel-staff-payroll:structures.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structuresLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !structures || structures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-staff-payroll:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  structures.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.staffId}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-success-base">
                        {item.totalEarnings?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-error-base">
                        {item.totalDeductions?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm font-medium">
                        {item.netPay?.toLocaleString()}
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
                              onClick={() => handleOpenEditStructure(item)}
                            >
                              <RiEditLine className="mr-2 h-4 w-4" />
                              {t("admin-panel-staff-payroll:actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error-base focus:text-error-base"
                              onClick={() => void handleDeleteStructure(item)}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              {t("admin-panel-staff-payroll:actions.delete")}
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

        {/* Payroll Slips Table */}
        {activeTab === "slips" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-payroll:slips.table.staffId")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:slips.table.period")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:slips.table.earnings")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:slips.table.deductions")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-payroll:slips.table.netPay")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-payroll:slips.table.days")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-payroll:slips.table.status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slipsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <Spinner size="md" />
                    </TableCell>
                  </TableRow>
                ) : !slips || slips.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-staff-payroll:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  slips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {slip.staffId}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {slip.month}/{slip.year}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-success-base">
                        {slip.totalEarnings?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm text-error-base">
                        {slip.totalDeductions?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm font-medium">
                        {slip.netPay?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {slip.presentDays}/{slip.workingDays}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_COLORS[slip.status] ?? "outline"}
                        >
                          {slip.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Salary Structure Modal */}
      <Dialog.Dialog open={structureOpen} onOpenChange={setStructureOpen}>
        <Dialog.DialogContent className="sm:max-w-[600px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editStructure
                ? t("admin-panel-staff-payroll:actions.edit")
                : t("admin-panel-staff-payroll:structures.actions.create")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-payroll:form.name")}</Label>
                <Input
                  value={structName}
                  onChange={(e) => setStructName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-payroll:form.staffId")}</Label>
                <Select
                  value={structStaffId}
                  onValueChange={(v) => setStructStaffId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {(staffMembers ?? []).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.staffId}
                        {s.designation ? ` — ${s.designation}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Components list */}
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-payroll:form.components")}</Label>
              {components.map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-stroke-soft-200 p-2"
                >
                  <span className="flex-1 text-paragraph-sm">{comp.name}</span>
                  <Badge
                    variant={
                      comp.type === "earning" ? "default" : "destructive"
                    }
                  >
                    {comp.type}
                  </Badge>
                  <span className="text-paragraph-sm font-medium">
                    {comp.amount.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveComponent(i)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            {/* Add component */}
            <div className="grid grid-cols-4 gap-2 items-end">
              <div className="grid gap-1">
                <Label className="text-label-xs">
                  {t("admin-panel-staff-payroll:form.componentName")}
                </Label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-label-xs">
                  {t("admin-panel-staff-payroll:form.componentType")}
                </Label>
                <select
                  className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                  value={compType}
                  onChange={(e) =>
                    setCompType(e.target.value as "earning" | "deduction")
                  }
                >
                  <option value="earning">Earning</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
              <div className="grid gap-1">
                <Label className="text-label-xs">
                  {t("admin-panel-staff-payroll:form.componentAmount")}
                </Label>
                <Input
                  type="number"
                  value={compAmount}
                  onChange={(e) => setCompAmount(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleAddComponent}>
                {t("admin-panel-staff-payroll:form.addComponent")}
              </Button>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setStructureOpen(false)}>
              {t("admin-panel-staff-payroll:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitStructure()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-payroll:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Process Payroll Modal */}
      <Dialog.Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <Dialog.DialogContent className="sm:max-w-[400px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-payroll:slips.actions.process")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-payroll:form.month")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={processMonth}
                  onChange={(e) => setProcessMonth(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-payroll:form.year")}</Label>
                <Input
                  type="number"
                  value={processYear}
                  onChange={(e) => setProcessYear(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
              {t("admin-panel-staff-payroll:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleProcessPayroll()}
              disabled={processMutation.isPending}
            >
              {processMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-payroll:slips.actions.process")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StaffPayroll, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT],
});
