"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useStaffLeavesQuery,
  useLeaveBalanceQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} from "./queries/queries";
import type { LeaveItem } from "./queries/queries";
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
} from "@/components/ui/dropdown-menu";
import {
  RiAddLine,
  RiMoreLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";
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

const LEAVE_TYPES = [
  "sick",
  "casual",
  "earned",
  "maternity",
  "paternity",
  "unpaid",
  "other",
] as const;

const STATUS_COLORS: Record<string, "default" | "outline" | "destructive"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "outline",
};

function StaffLeaves() {
  const { t } = useTranslation("admin-panel-staff-leaves");
  const { enqueueSnackbar } = useSnackbar();

  const { data: leaves, isLoading } = useStaffLeavesQuery();
  const { data: balances } = useLeaveBalanceQuery();
  const { data: staffMembers } = useStaffListQuery();
  const applyMutation = useApplyLeaveMutation();
  const approveMutation = useApproveLeaveMutation();
  const rejectMutation = useRejectLeaveMutation();

  const [activeTab, setActiveTab] = useState<"leaves" | "balance">("leaves");

  const [applyOpen, setApplyOpen] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveType, setLeaveType] = useState<string>("casual");
  const [reason, setReason] = useState("");

  const [remarksOpen, setRemarksOpen] = useState(false);
  const [remarksAction, setRemarksAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [remarksLeaveId, setRemarksLeaveId] = useState(0);
  const [adminRemarks, setAdminRemarks] = useState("");

  const handleApply = useCallback(async () => {
    if (!staffId || !fromDate || !toDate || !reason) {
      enqueueSnackbar(t("admin-panel-staff-leaves:form.validation.required"), {
        variant: "error",
      });
      return;
    }
    try {
      await applyMutation.mutateAsync({
        staffId: Number(staffId),
        fromDate,
        toDate,
        leaveType: leaveType as
          | "sick"
          | "casual"
          | "earned"
          | "maternity"
          | "paternity"
          | "unpaid"
          | "other",
        reason,
      });
      enqueueSnackbar(t("admin-panel-staff-leaves:notifications.applied"), {
        variant: "success",
      });
      setApplyOpen(false);
      setStaffId("");
      setFromDate("");
      setToDate("");
      setReason("");
    } catch {
      enqueueSnackbar(t("admin-panel-staff-leaves:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    staffId,
    fromDate,
    toDate,
    leaveType,
    reason,
    applyMutation,
    enqueueSnackbar,
    t,
  ]);

  const openRemarksDialog = useCallback(
    (action: "approve" | "reject", id: number) => {
      setRemarksAction(action);
      setRemarksLeaveId(id);
      setAdminRemarks("");
      setRemarksOpen(true);
    },
    []
  );

  const handleRemarksSubmit = useCallback(async () => {
    try {
      if (remarksAction === "approve") {
        await approveMutation.mutateAsync({
          id: remarksLeaveId,
          data: { adminRemarks: adminRemarks || undefined },
        });
        enqueueSnackbar(t("admin-panel-staff-leaves:notifications.approved"), {
          variant: "success",
        });
      } else {
        await rejectMutation.mutateAsync({
          id: remarksLeaveId,
          data: { adminRemarks: adminRemarks || undefined },
        });
        enqueueSnackbar(t("admin-panel-staff-leaves:notifications.rejected"), {
          variant: "success",
        });
      }
      setRemarksOpen(false);
    } catch {
      enqueueSnackbar(t("admin-panel-staff-leaves:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    remarksAction,
    remarksLeaveId,
    adminRemarks,
    approveMutation,
    rejectMutation,
    enqueueSnackbar,
    t,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-staff-leaves:title")}
          </h3>
          <Button onClick={() => setApplyOpen(true)}>
            <RiAddLine className="mr-1 h-4 w-4" />
            {t("admin-panel-staff-leaves:actions.apply")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-stroke-soft-200">
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "leaves" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("leaves")}
          >
            {t("admin-panel-staff-leaves:tabs.applications")}
          </button>
          <button
            className={`px-4 py-2 text-paragraph-sm font-medium ${activeTab === "balance" ? "border-b-2 border-primary-base text-primary-base" : "text-text-soft-400 hover:text-text-strong-950"}`}
            onClick={() => setActiveTab("balance")}
          >
            {t("admin-panel-staff-leaves:tabs.balance")}
          </button>
        </div>

        {activeTab === "leaves" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:table.columns.staffId")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-leaves:table.columns.type")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-leaves:table.columns.from")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-leaves:table.columns.to")}
                  </TableHead>
                  <TableHead style={{ width: 200 }}>
                    {t("admin-panel-staff-leaves:table.columns.reason")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:table.columns.status")}
                  </TableHead>
                  <TableHead style={{ width: 60 }}>
                    {t("admin-panel-staff-leaves:table.columns.actions")}
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
                ) : !leaves || leaves.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-staff-leaves:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((item: LeaveItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {item.staffId}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {item.leaveType}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {new Date(item.fromDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {new Date(item.toDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-paragraph-sm truncate max-w-[200px]">
                        {item.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_COLORS[item.status] ?? "outline"}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.status === "pending" && (
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
                                onClick={() =>
                                  openRemarksDialog("approve", item.id)
                                }
                              >
                                <RiCheckLine className="mr-2 h-4 w-4" />
                                {t("admin-panel-staff-leaves:actions.approve")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-error-base focus:text-error-base"
                                onClick={() =>
                                  openRemarksDialog("reject", item.id)
                                }
                              >
                                <RiCloseLine className="mr-2 h-4 w-4" />
                                {t("admin-panel-staff-leaves:actions.reject")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "balance" && (
          <div className="rounded-lg border border-stroke-soft-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:balance.staffId")}
                  </TableHead>
                  <TableHead style={{ width: 100 }}>
                    {t("admin-panel-staff-leaves:balance.type")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:balance.total")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:balance.used")}
                  </TableHead>
                  <TableHead style={{ width: 80 }}>
                    {t("admin-panel-staff-leaves:balance.remaining")}
                  </TableHead>
                  <TableHead style={{ width: 60 }}>
                    {t("admin-panel-staff-leaves:balance.year")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!balances || balances.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-paragraph-sm text-text-soft-400"
                    >
                      {t("admin-panel-staff-leaves:table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  balances.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-paragraph-sm">
                        {b.staffId}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {b.leaveType}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {b.totalDays}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {b.usedDays}
                      </TableCell>
                      <TableCell className="text-paragraph-sm font-medium">
                        {b.totalDays - b.usedDays}
                      </TableCell>
                      <TableCell className="text-paragraph-sm">
                        {b.year}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Dialog.Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <Dialog.DialogContent className="sm:max-w-[500px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-leaves:actions.apply")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-leaves:form.staffId")}</Label>
              <Select value={staffId} onValueChange={(v) => setStaffId(v)}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-leaves:form.from")}</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("admin-panel-staff-leaves:form.to")}</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-leaves:form.type")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-leaves:form.reason")}</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              {t("admin-panel-staff-leaves:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleApply()}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-leaves:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Approve/Reject Remarks Modal */}
      <Dialog.Dialog open={remarksOpen} onOpenChange={setRemarksOpen}>
        <Dialog.DialogContent className="sm:max-w-[400px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {remarksAction === "approve"
                ? t("admin-panel-staff-leaves:actions.approve")
                : t("admin-panel-staff-leaves:actions.reject")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-leaves:form.adminRemarks")}</Label>
              <Input
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setRemarksOpen(false)}>
              {t("admin-panel-staff-leaves:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleRemarksSubmit()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {(approveMutation.isPending || rejectMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-leaves:actions.save")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StaffLeaves, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
