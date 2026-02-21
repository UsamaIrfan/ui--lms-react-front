"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useState } from "react";
import {
  useStaffAttendanceReportsQuery,
  useCheckInMutation,
  useCheckOutMutation,
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
import { RiLoginBoxLine, RiLogoutBoxLine } from "@remixicon/react";
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
  present: "default",
  absent: "destructive",
  late: "outline",
  half_day: "outline",
  excused: "outline",
};

function StaffAttendance() {
  const { t } = useTranslation("admin-panel-staff-attendance");
  const { enqueueSnackbar } = useSnackbar();

  const [filterStaffId, setFilterStaffId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const params = {
    ...(filterStaffId ? { staffId: Number(filterStaffId) } : {}),
    ...(filterStartDate ? { startDate: filterStartDate } : {}),
    ...(filterEndDate ? { endDate: filterEndDate } : {}),
  };

  const { data: records, isLoading } = useStaffAttendanceReportsQuery(params);
  const { data: staffMembers } = useStaffListQuery();
  const checkInMutation = useCheckInMutation();
  const checkOutMutation = useCheckOutMutation();

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInStaffId, setCheckInStaffId] = useState("");
  const [checkInRemarks, setCheckInRemarks] = useState("");

  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkOutStaffId, setCheckOutStaffId] = useState("");

  const handleCheckIn = useCallback(async () => {
    if (!checkInStaffId) {
      enqueueSnackbar(
        t("admin-panel-staff-attendance:form.validation.staffIdRequired"),
        { variant: "error" }
      );
      return;
    }
    try {
      await checkInMutation.mutateAsync({
        staffId: Number(checkInStaffId),
        remarks: checkInRemarks || undefined,
      } as any);
      enqueueSnackbar(
        t("admin-panel-staff-attendance:notifications.checkedIn"),
        { variant: "success" }
      );
      setCheckInOpen(false);
      setCheckInStaffId("");
      setCheckInRemarks("");
    } catch {
      enqueueSnackbar(t("admin-panel-staff-attendance:notifications.error"), {
        variant: "error",
      });
    }
  }, [
    checkInStaffId,
    checkInRemarks,
    checkInMutation,
    enqueueSnackbar,
    t,
  ]);

  const handleCheckOut = useCallback(async () => {
    if (!checkOutStaffId) {
      enqueueSnackbar(
        t("admin-panel-staff-attendance:form.validation.staffIdRequired"),
        { variant: "error" }
      );
      return;
    }
    try {
      await checkOutMutation.mutateAsync({
        staffId: Number(checkOutStaffId),
      });
      enqueueSnackbar(
        t("admin-panel-staff-attendance:notifications.checkedOut"),
        { variant: "success" }
      );
      setCheckOutOpen(false);
      setCheckOutStaffId("");
    } catch {
      enqueueSnackbar(t("admin-panel-staff-attendance:notifications.error"), {
        variant: "error",
      });
    }
  }, [checkOutStaffId, checkOutMutation, enqueueSnackbar, t]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-3xl font-bold tracking-tight">
            {t("admin-panel-staff-attendance:title")}
          </h3>
          <div className="flex gap-2">
            <Button onClick={() => setCheckInOpen(true)}>
              <RiLoginBoxLine className="mr-1 h-4 w-4" />
              {t("admin-panel-staff-attendance:actions.checkIn")}
            </Button>
            <Button variant="outline" onClick={() => setCheckOutOpen(true)}>
              <RiLogoutBoxLine className="mr-1 h-4 w-4" />
              {t("admin-panel-staff-attendance:actions.checkOut")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="grid gap-1">
            <Label className="text-label-xs">
              {t("admin-panel-staff-attendance:filters.staffId")}
            </Label>
            <Select
              value={filterStaffId}
              onValueChange={(v) => setFilterStaffId(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All staff" />
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
          <div className="grid gap-1">
            <Label className="text-label-xs">
              {t("admin-panel-staff-attendance:filters.startDate")}
            </Label>
            <Input
              type="date"
              className="w-40"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-label-xs">
              {t("admin-panel-staff-attendance:filters.endDate")}
            </Label>
            <Input
              type="date"
              className="w-40"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 80 }}>
                  {t("admin-panel-staff-attendance:table.columns.staffId")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff-attendance:table.columns.date")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff-attendance:table.columns.status")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff-attendance:table.columns.checkIn")}
                </TableHead>
                <TableHead style={{ width: 100 }}>
                  {t("admin-panel-staff-attendance:table.columns.checkOut")}
                </TableHead>
                <TableHead style={{ width: 200 }}>
                  {t("admin-panel-staff-attendance:table.columns.remarks")}
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
              ) : !records || records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    {t("admin-panel-staff-attendance:table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-paragraph-sm">
                      {r.staffId}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {new Date(r.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[r.status] ?? "outline"}>
                        {r.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {r.checkInTime
                        ? new Date(r.checkInTime).toLocaleTimeString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {r.checkOutTime
                        ? new Date(r.checkOutTime).toLocaleTimeString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-paragraph-sm">
                      {r.remarks ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Check In Modal */}
      <Dialog.Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <Dialog.DialogContent className="sm:max-w-[400px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-attendance:actions.checkIn")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-attendance:form.staffId")}</Label>
              <Select
                value={checkInStaffId}
                onValueChange={(v) => setCheckInStaffId(v)}
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
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-attendance:form.remarks")}</Label>
              <Input
                value={checkInRemarks}
                onChange={(e) => setCheckInRemarks(e.target.value)}
              />
            </div>
          </div>
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setCheckInOpen(false)}>
              {t("admin-panel-staff-attendance:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleCheckIn()}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-attendance:actions.checkIn")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      {/* Check Out Modal */}
      <Dialog.Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
        <Dialog.DialogContent className="sm:max-w-[400px]">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("admin-panel-staff-attendance:actions.checkOut")}
            </Dialog.DialogTitle>
          </Dialog.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin-panel-staff-attendance:form.staffId")}</Label>
              <Select
                value={checkOutStaffId}
                onValueChange={(v) => setCheckOutStaffId(v)}
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
          <Dialog.DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutOpen(false)}>
              {t("admin-panel-staff-attendance:actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleCheckOut()}
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              {t("admin-panel-staff-attendance:actions.checkOut")}
            </Button>
          </Dialog.DialogFooter>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}

export default withPageRequiredAuth(StaffAttendance, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
