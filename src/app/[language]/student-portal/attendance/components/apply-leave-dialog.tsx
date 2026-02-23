"use client";

import { useCallback, useState } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiAddLine } from "@remixicon/react";

import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attendanceControllerApplyLeaveV1 } from "@/services/api/generated/attendance/attendance";
import { useStudentId, studentAttendanceQueryKeys } from "../queries/queries";
import type { LeaveFormData, LeaveType } from "../types";

const LEAVE_TYPES: LeaveType[] = [
  "sick",
  "casual",
  "earned",
  "maternity",
  "paternity",
  "unpaid",
  "other",
];

interface ApplyLeaveDialogProps {
  trigger?: React.ReactNode;
}

export function ApplyLeaveDialog({ trigger }: ApplyLeaveDialogProps) {
  const { t } = useTranslation("student-portal-attendance");
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: studentId } = useStudentId();

  const methods = useForm<LeaveFormData>({
    defaultValues: {
      leaveType: "sick",
      fromDate: "",
      toDate: "",
      reason: "",
    },
  });

  const { handleSubmit, reset, register } = methods;
  const { errors } = useFormState({ control: methods.control });

  const mutation = useMutation({
    mutationFn: (data: LeaveFormData) =>
      attendanceControllerApplyLeaveV1({
        attendableType: "student",
        attendableId: studentId ?? 0,
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason,
        leaveType: data.leaveType,
      }),
    onSuccess: () => {
      enqueueSnackbar(t("leave.success"), { variant: "success" });
      queryClient.invalidateQueries({
        queryKey: studentAttendanceQueryKeys.page().key,
      });
      setOpen(false);
      reset();
    },
    onError: () => {
      enqueueSnackbar(t("leave.error"), { variant: "error" });
    },
  });

  const onSubmit = useCallback(
    (data: LeaveFormData) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ?? (
        <Button onClick={() => setOpen(true)}>
          <RiAddLine className="mr-1.5 size-4" />
          {t("leave.applyLeave")}
        </Button>
      )}

      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>{t("leave.applyLeave")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label-sm text-text-sub-600">
                {t("leave.leaveType")}
              </Label>
              <select
                className="flex h-9 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 focus:border-primary-base focus:outline-none"
                {...register("leaveType", {
                  required: t("leave.validation.leaveTypeRequired"),
                })}
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`leave.types.${type}`)}
                  </option>
                ))}
              </select>
              {errors.leaveType && (
                <p className="text-paragraph-xs text-error-base">
                  {errors.leaveType.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-label-sm text-text-sub-600">
                  {t("leave.fromDate")}
                </Label>
                <Input
                  type="date"
                  {...register("fromDate", {
                    required: t("leave.validation.fromDateRequired"),
                  })}
                />
                {errors.fromDate && (
                  <p className="text-paragraph-xs text-error-base">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-label-sm text-text-sub-600">
                  {t("leave.toDate")}
                </Label>
                <Input
                  type="date"
                  {...register("toDate", {
                    required: t("leave.validation.toDateRequired"),
                  })}
                />
                {errors.toDate && (
                  <p className="text-paragraph-xs text-error-base">
                    {errors.toDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-label-sm text-text-sub-600">
                {t("leave.reason")}
              </Label>
              <textarea
                className="flex min-h-20 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:border-primary-base focus:outline-none"
                {...register("reason", {
                  required: t("leave.validation.reasonRequired"),
                })}
              />
              {errors.reason && (
                <p className="text-paragraph-xs text-error-base">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  {t("leave.cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "..." : t("leave.submit")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
