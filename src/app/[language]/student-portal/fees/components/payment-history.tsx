"use client";

import { format } from "date-fns";

import { useTranslation } from "@/services/i18n/client";
import { Badge } from "@/components/ui/badge";
import type { FeeChallan, PaymentMethod } from "../types";

interface PaymentHistoryProps {
  challans: FeeChallan[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  online: "Online",
  cheque: "Cheque",
  card: "Card",
};

export function PaymentHistory({ challans }: PaymentHistoryProps) {
  const { t } = useTranslation("student-portal-fees");

  // Flatten all payments from all challans
  const allPayments = challans
    .flatMap((challan) =>
      (challan.payments ?? []).map((payment) => ({
        ...payment,
        challanNumber: challan.challanNumber,
      }))
    )
    .sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    );

  if (allPayments.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("payments.title")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("payments.noPayments")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("payments.title")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke-soft-200">
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.date")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.amount")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.method")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.challanNumber")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.transactionRef")}
              </th>
              <th className="pb-3 text-left text-label-sm text-text-sub-600">
                {t("payments.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {allPayments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-stroke-soft-200 last:border-b-0 hover:bg-bg-weak-50 transition-colors"
              >
                <td className="py-3 text-paragraph-sm text-text-strong-950">
                  {format(new Date(payment.paidAt), "MMM dd, yyyy")}
                </td>
                <td className="py-3 text-paragraph-sm font-medium text-success-base">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="py-3 text-paragraph-sm text-text-sub-600">
                  {METHOD_LABELS[payment.method] ??
                    t(`payments.methods.${payment.method}`)}
                </td>
                <td className="py-3 text-paragraph-sm text-text-sub-600">
                  {payment.challanNumber}
                </td>
                <td className="py-3 text-paragraph-sm text-text-sub-600">
                  {payment.transactionRef ?? "—"}
                </td>
                <td className="py-3">
                  <Badge variant={payment.verified ? "success" : "warning"}>
                    {payment.verified ? "Verified" : "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PaymentHistorySkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-24 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-28 animate-pulse rounded-8 bg-bg-weak-50" />
            <div className="h-4 w-20 animate-pulse rounded-8 bg-bg-weak-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
