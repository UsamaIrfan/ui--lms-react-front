"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useDeleteFeeStructureMutation,
  useChallansQuery,
  useGenerateChallanMutation,
  usePaymentsQuery,
  useRecordPaymentMutation,
} from "./queries/queries";
import type { FeeStructureItem, ChallanItem } from "./queries/queries";
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
  RiMoneyDollarCircleLine,
} from "@remixicon/react";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import useTenant from "@/services/tenant/use-tenant";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FREQUENCY_OPTIONS = [
  "one_time",
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
];
const PAYMENT_METHODS = ["cash", "bank_transfer", "cheque", "online", "card"];

function StudentsFees() {
  const { t } = useTranslation("admin-panel-students-fees");
  const { enqueueSnackbar } = useSnackbar();
  const { confirmDialog } = useConfirmDialog();
  const { tenantId } = useTenant();

  const [activeTab, setActiveTab] = useState<
    "structures" | "challans" | "payments"
  >("structures");

  // Fee Structures
  const { data: structures, isLoading: structLoading } =
    useFeeStructuresQuery();
  const createStructMutation = useCreateFeeStructureMutation();
  const updateStructMutation = useUpdateFeeStructureMutation();
  const deleteStructMutation = useDeleteFeeStructureMutation();

  const [structModalOpen, setStructModalOpen] = useState(false);
  const [editStruct, setEditStruct] = useState<FeeStructureItem | null>(null);
  const [structName, setStructName] = useState("");
  const [structAmount, setStructAmount] = useState("");
  const [structFrequency, setStructFrequency] = useState("one_time");
  const [structDescription, setStructDescription] = useState("");
  const [structInstitutionId, setStructInstitutionId] = useState("");

  // Challans
  const { data: challans, isLoading: challanLoading } = useChallansQuery();
  const generateChallanMutation = useGenerateChallanMutation();
  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [challanStudentId, setChallanStudentId] = useState("");
  const [challanStructureId, setChallanStructureId] = useState("");
  const [challanDueDate, setChallanDueDate] = useState("");

  // Payments
  const { data: payments, isLoading: payLoading } = usePaymentsQuery();
  const recordPaymentMutation = useRecordPaymentMutation();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payChallanId, setPayChallanId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payRef, setPayRef] = useState("");

  // Fee Structure handlers
  const resetStructForm = useCallback(() => {
    setStructName("");
    setStructAmount("");
    setStructFrequency("one_time");
    setStructDescription("");
    setStructInstitutionId("");
  }, []);

  const handleOpenCreateStruct = useCallback(() => {
    setEditStruct(null);
    resetStructForm();
    setStructModalOpen(true);
  }, [resetStructForm]);

  const handleOpenEditStruct = useCallback((item: FeeStructureItem) => {
    setEditStruct(item);
    setStructName(item.name);
    setStructAmount(String(item.amount));
    setStructFrequency(item.frequency ?? "one_time");
    setStructDescription(item.description ?? "");
    setStructInstitutionId(String(item.institutionId));
    setStructModalOpen(true);
  }, []);

  const handleSubmitStruct = useCallback(async () => {
    if (!structName || !structAmount || !structInstitutionId) {
      enqueueSnackbar(t("admin-panel-students-fees:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      const payload = {
        name: structName,
        amount: Number(structAmount),
        frequency: structFrequency,
        description: structDescription || undefined,
        institutionId: Number(structInstitutionId),
      } as any;
      if (editStruct) {
        await updateStructMutation.mutateAsync({
          id: editStruct.id,
          data: payload,
        });
        enqueueSnackbar(t("admin-panel-students-fees:notifications.updated"), {
          variant: "success",
        });
      } else {
        await createStructMutation.mutateAsync({
          tenantId: tenantId ?? "",
          ...payload,
        });
        enqueueSnackbar(t("admin-panel-students-fees:notifications.created"), {
          variant: "success",
        });
      }
      setStructModalOpen(false);
      resetStructForm();
    } catch {
      enqueueSnackbar(t("admin-panel-students-fees:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    structName,
    structAmount,
    structFrequency,
    structDescription,
    structInstitutionId,
    editStruct,
    tenantId,
    createStructMutation,
    updateStructMutation,
    enqueueSnackbar,
    t,
    resetStructForm,
  ]);

  const handleDeleteStruct = useCallback(
    async (item: FeeStructureItem) => {
      const confirmed = await confirmDialog({
        title: t("admin-panel-students-fees:confirm.deleteTitle"),
        message: t("admin-panel-students-fees:confirm.delete"),
      });
      if (confirmed) {
        try {
          await deleteStructMutation.mutateAsync(item.id);
          enqueueSnackbar(
            t("admin-panel-students-fees:notifications.deleted"),
            { variant: "success" }
          );
        } catch {
          enqueueSnackbar(t("admin-panel-students-fees:notifications.error"), {
            variant: "error",
          });
        }
      }
    },
    [confirmDialog, deleteStructMutation, enqueueSnackbar, t]
  );

  // Challan handler
  const handleGenerateChallan = useCallback(async () => {
    if (!challanStudentId || !challanStructureId || !challanDueDate) {
      enqueueSnackbar(t("admin-panel-students-fees:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      await generateChallanMutation.mutateAsync({
        studentId: Number(challanStudentId),
        feeStructureId: Number(challanStructureId),
        dueDate: challanDueDate,
      });
      enqueueSnackbar(
        t("admin-panel-students-fees:notifications.challanGenerated"),
        { variant: "success" }
      );
      setChallanModalOpen(false);
      setChallanStudentId("");
      setChallanStructureId("");
      setChallanDueDate("");
    } catch {
      enqueueSnackbar(t("admin-panel-students-fees:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    challanStudentId,
    challanStructureId,
    challanDueDate,
    generateChallanMutation,
    enqueueSnackbar,
    t,
  ]);

  // Payment handler
  const handleRecordPayment = useCallback(async () => {
    if (!payChallanId || !payAmount) {
      enqueueSnackbar(t("admin-panel-students-fees:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      await recordPaymentMutation.mutateAsync({
        challanId: Number(payChallanId),
        amount: Number(payAmount),
        method: payMethod as
          | "cash"
          | "bank_transfer"
          | "cheque"
          | "online"
          | "card",
        transactionRef: (payRef || undefined) as any,
      });
      enqueueSnackbar(
        t("admin-panel-students-fees:notifications.paymentRecorded"),
        { variant: "success" }
      );
      setPayModalOpen(false);
      setPayChallanId("");
      setPayAmount("");
      setPayMethod("cash");
      setPayRef("");
    } catch {
      enqueueSnackbar(t("admin-panel-students-fees:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    payChallanId,
    payAmount,
    payMethod,
    payRef,
    recordPaymentMutation,
    enqueueSnackbar,
    t,
  ]);

  const challanStatus = (s: string) => {
    if (s === "paid") return "default" as const;
    if (s === "overdue") return "destructive" as const;
    return "outline" as const;
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 text-paragraph-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-primary-base text-static-white" : "text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50"}`;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-students-fees:title")}
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            className={tabClass("structures")}
            onClick={() => setActiveTab("structures")}
          >
            {t("admin-panel-students-fees:tabs.structures")}
          </button>
          <button
            className={tabClass("challans")}
            onClick={() => setActiveTab("challans")}
          >
            {t("admin-panel-students-fees:tabs.challans")}
          </button>
          <button
            className={tabClass("payments")}
            onClick={() => setActiveTab("payments")}
          >
            {t("admin-panel-students-fees:tabs.payments")}
          </button>
        </div>

        {/* Fee Structures Tab */}
        {activeTab === "structures" && (
          <>
            <div className="flex justify-end">
              <Button onClick={handleOpenCreateStruct}>
                <RiAddLine className="mr-1 h-4 w-4" />
                {t("admin-panel-students-fees:actions.createStructure")}
              </Button>
            </div>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-students-fees:table.name")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.amount")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.frequency")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.description")}
                    </TableHead>
                    <TableHead style={{ width: 60 }}>
                      {t("admin-panel-students-fees:table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !structures || structures.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-students-fees:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    structures.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.frequency ?? "one_time"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm max-w-[200px] truncate">
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
                                onClick={() => handleOpenEditStruct(item)}
                              >
                                <RiEditLine className="mr-2 h-4 w-4" />
                                {t("admin-panel-students-fees:actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error-base focus:text-error-base"
                                onClick={() => void handleDeleteStruct(item)}
                              >
                                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                                {t("admin-panel-students-fees:actions.delete")}
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
          </>
        )}

        {/* Challans Tab */}
        {activeTab === "challans" && (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setChallanModalOpen(true)}>
                <RiAddLine className="mr-1 h-4 w-4" />
                {t("admin-panel-students-fees:actions.generateChallan")}
              </Button>
            </div>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-students-fees:table.challanNumber")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.studentId")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.amount")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.dueDate")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challanLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !challans || challans.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-students-fees:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (challans as ChallanItem[]).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-paragraph-sm text-text-strong-950">
                          {item.challanNumber}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={challanStatus(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setPayModalOpen(true)}>
                <RiMoneyDollarCircleLine className="mr-1 h-4 w-4" />
                {t("admin-panel-students-fees:actions.recordPayment")}
              </Button>
            </div>
            <div className="rounded-lg border border-stroke-soft-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin-panel-students-fees:table.challanId")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.amount")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.method")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.reference")}
                    </TableHead>
                    <TableHead>
                      {t("admin-panel-students-fees:table.verified")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <Spinner size="md" />
                      </TableCell>
                    </TableRow>
                  ) : !payments || payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-paragraph-sm text-text-soft-400"
                      >
                        {t("admin-panel-students-fees:table.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-paragraph-sm">
                          {item.challanId}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.method ?? "—"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm">
                          {item.transactionRef ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.verified ? "default" : "outline"}
                          >
                            {item.verified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Fee Structure Modal */}
      <Dialog.Dialog open={structModalOpen} onOpenChange={setStructModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {editStruct
                ? t("admin-panel-students-fees:actions.edit")
                : t("admin-panel-students-fees:actions.createStructure")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.name")}</Label>
              <Input
                value={structName}
                onChange={(e) => setStructName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-students-fees:form.amount")}</Label>
                <Input
                  type="number"
                  value={structAmount}
                  onChange={(e) => setStructAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t("admin-panel-students-fees:form.institutionId")}
                </Label>
                <Input
                  type="number"
                  value={structInstitutionId}
                  onChange={(e) => setStructInstitutionId(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.frequency")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                value={structFrequency}
                onChange={(e) => setStructFrequency(e.target.value)}
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.description")}</Label>
              <Input
                value={structDescription}
                onChange={(e) => setStructDescription(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setStructModalOpen(false)}>
              {t("admin-panel-students-fees:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmitStruct()}
              disabled={
                createStructMutation.isPending || updateStructMutation.isPending
              }
            >
              {(createStructMutation.isPending ||
                updateStructMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-fees:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Generate Challan Modal */}
      <Dialog.Dialog open={challanModalOpen} onOpenChange={setChallanModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[450px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-students-fees:actions.generateChallan")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.studentId")}</Label>
              <Input
                type="number"
                value={challanStudentId}
                onChange={(e) => setChallanStudentId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-fees:form.feeStructureId")}
              </Label>
              <Input
                type="number"
                value={challanStructureId}
                onChange={(e) => setChallanStructureId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.dueDate")}</Label>
              <Input
                type="date"
                value={challanDueDate}
                onChange={(e) => setChallanDueDate(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChallanModalOpen(false)}
            >
              {t("admin-panel-students-fees:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleGenerateChallan()}
              disabled={generateChallanMutation.isPending}
            >
              {generateChallanMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-fees:actions.generate")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Record Payment Modal */}
      <Dialog.Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <Dialog.DialogContent className="sm:max-w-[450px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-students-fees:actions.recordPayment")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.challanId")}</Label>
              <Input
                type="number"
                value={payChallanId}
                onChange={(e) => setPayChallanId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.amount")}</Label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-students-fees:form.method")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("admin-panel-students-fees:form.transactionRef")}
              </Label>
              <Input
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>
              {t("admin-panel-students-fees:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleRecordPayment()}
              disabled={recordPaymentMutation.isPending}
            >
              {recordPaymentMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-students-fees:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StudentsFees, {
  roles: [RoleEnum.ADMIN, RoleEnum.ACCOUNTANT],
});
