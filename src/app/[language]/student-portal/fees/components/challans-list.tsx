"use client";

import { useState } from "react";
import { format } from "date-fns";

import { cn } from "@/utils/cn";
import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RiEyeLine } from "@remixicon/react";
import type { FeeChallan, PaymentStatus } from "../types";

interface ChallansListProps {
  challans: FeeChallan[];
}

const STATUS_VARIANT: Record<
  PaymentStatus,
  "success" | "destructive" | "warning" | "default" | "secondary"
> = {
  paid: "success",
  overdue: "destructive",
  pending: "warning",
  partially_paid: "default",
  cancelled: "secondary",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ChallansList({ challans }: ChallansListProps) {
  const { t } = useTranslation("student-portal-fees");
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(
    null
  );

  if (challans.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("challans.title")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("challans.noChallans")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("challans.title")}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke-soft-200">
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.challanNumber")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.amount")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.paidAmount")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.balance")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.dueDate")}
                </th>
                <th className="pb-3 text-left text-label-sm text-text-sub-600">
                  {t("challans.status")}
                </th>
                <th className="pb-3 text-right text-label-sm text-text-sub-600">
                  {t("challans.viewDetails")}
                </th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan) => (
                <tr
                  key={challan.id}
                  className={cn(
                    "border-b border-stroke-soft-200 last:border-b-0",
                    "hover:bg-bg-weak-50 transition-colors"
                  )}
                >
                  <td className="py-3 text-paragraph-sm font-medium text-text-strong-950">
                    {challan.challanNumber}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {formatCurrency(challan.netAmount)}
                  </td>
                  <td className="py-3 text-paragraph-sm text-success-base">
                    {formatCurrency(challan.paidAmount)}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {formatCurrency(challan.balance)}
                  </td>
                  <td className="py-3 text-paragraph-sm text-text-sub-600">
                    {challan.dueDate
                      ? format(new Date(challan.dueDate), "MMM dd, yyyy")
                      : "—"}
                  </td>
                  <td className="py-3">
                    <Badge variant={STATUS_VARIANT[challan.status]}>
                      {t(`challans.statuses.${challan.status}`)}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChallan(challan)}
                    >
                      <RiEyeLine className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challan Detail Dialog */}
      <Dialog
        open={selectedChallan !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedChallan(null);
        }}
      >
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>{t("challanDetail.title")}</DialogTitle>
          </DialogHeader>

          {selectedChallan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label={t("challanDetail.challanNumber")}
                  value={selectedChallan.challanNumber}
                />
                <DetailRow
                  label={t("challanDetail.status")}
                  value={
                    <Badge variant={STATUS_VARIANT[selectedChallan.status]}>
                      {t(`challans.statuses.${selectedChallan.status}`)}
                    </Badge>
                  }
                />
                {selectedChallan.student && (
                  <>
                    <DetailRow
                      label={t("challanDetail.studentName")}
                      value={`${selectedChallan.student.firstName} ${selectedChallan.student.lastName}`}
                    />
                    <DetailRow
                      label={t("challanDetail.class")}
                      value={`${selectedChallan.student.gradeClass?.name ?? ""} ${selectedChallan.student.section?.name ? `- ${selectedChallan.student.section.name}` : ""}`}
                    />
                  </>
                )}
                {selectedChallan.feeStructure && (
                  <DetailRow
                    label={t("challanDetail.feeStructure")}
                    value={selectedChallan.feeStructure.name}
                  />
                )}
                <DetailRow
                  label={t("challanDetail.amount")}
                  value={formatCurrency(selectedChallan.amount)}
                />
                {selectedChallan.discount > 0 && (
                  <DetailRow
                    label={t("challanDetail.discount")}
                    value={formatCurrency(selectedChallan.discount)}
                  />
                )}
                <DetailRow
                  label={t("challanDetail.netAmount")}
                  value={formatCurrency(selectedChallan.netAmount)}
                />
                <DetailRow
                  label={t("challanDetail.paidAmount")}
                  value={formatCurrency(selectedChallan.paidAmount)}
                />
                <DetailRow
                  label={t("challanDetail.balance")}
                  value={formatCurrency(selectedChallan.balance)}
                />
                <DetailRow
                  label={t("challanDetail.dueDate")}
                  value={
                    selectedChallan.dueDate
                      ? format(
                          new Date(selectedChallan.dueDate),
                          "MMMM dd, yyyy"
                        )
                      : "—"
                  }
                />
              </div>

              {/* Payment history within this challan */}
              {selectedChallan.payments &&
                selectedChallan.payments.length > 0 && (
                  <div className="border-t border-stroke-soft-200 pt-3">
                    <h4 className="mb-2 text-label-sm text-text-strong-950">
                      {t("payments.title")}
                    </h4>
                    <div className="space-y-2">
                      {selectedChallan.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-8 bg-bg-weak-50 px-3 py-2"
                        >
                          <div>
                            <span className="text-label-sm text-text-strong-950">
                              {formatCurrency(payment.amount)}
                            </span>
                            <span className="ml-2 text-paragraph-xs text-text-sub-600">
                              {payment.method}
                            </span>
                          </div>
                          <span className="text-paragraph-xs text-text-sub-600">
                            {format(new Date(payment.paidAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("challanDetail.close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-paragraph-xs text-text-sub-600">{label}</p>
      <div className="text-label-sm text-text-strong-950">{value}</div>
    </div>
  );
}

export function ChallansListSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-28 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-28 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-16 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
