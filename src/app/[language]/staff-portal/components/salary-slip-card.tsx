"use client";

import {
  RiMoneyDollarCircleLine,
  RiDownloadLine,
  RiCheckDoubleLine,
} from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import type { SalarySlipSummary } from "../types";

// ─────────────────────────────────────────────
// Salary Slip Card
// ─────────────────────────────────────────────

interface SalarySlipCardProps {
  slip: SalarySlipSummary | null;
  title: string;
  labels: {
    noSlip: string;
    month: string;
    netPay: string;
    earnings: string;
    deductions: string;
    status: string;
    download: string;
    paid: string;
    pending: string;
    draft: string;
  };
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export function SalarySlipCard({ slip, title, labels }: SalarySlipCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiMoneyDollarCircleLine className="h-4 w-4 text-primary-base" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {!slip ? (
          <p className="py-6 text-center text-paragraph-sm text-text-sub-600">
            {labels.noSlip}
          </p>
        ) : (
          <div className="space-y-3">
            {/* Month/Year header */}
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-text-sub-600">
                {labels.month}
              </span>
              <span className="text-label-sm text-text-strong-950">
                {slip.month} {slip.year}
              </span>
            </div>

            {/* Net Pay - prominent */}
            <div className="rounded-lg bg-primary-alpha-10 px-4 py-3 text-center">
              <p className="text-paragraph-xs text-text-sub-600">
                {labels.netPay}
              </p>
              <p className="text-title-h4 font-bold text-primary-base">
                {formatCurrency(slip.netPay)}
              </p>
            </div>

            {/* Earnings & Deductions */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-success-alpha-10 px-3 py-2 text-center">
                <p className="text-paragraph-xs text-text-sub-600">
                  {labels.earnings}
                </p>
                <p className="text-label-sm font-semibold text-success-base">
                  {formatCurrency(slip.totalEarnings)}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-error-alpha-10 px-3 py-2 text-center">
                <p className="text-paragraph-xs text-text-sub-600">
                  {labels.deductions}
                </p>
                <p className="text-label-sm font-semibold text-error-base">
                  {formatCurrency(slip.totalDeductions)}
                </p>
              </div>
            </div>

            {/* Status & Download */}
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  "gap-1.5 text-label-xs",
                  slip.status === "paid"
                    ? "bg-success-alpha-10 text-success-base"
                    : slip.status === "processed"
                      ? "bg-information-alpha-10 text-information-base"
                      : "bg-warning-alpha-10 text-warning-base"
                )}
              >
                {slip.status === "paid" && (
                  <RiCheckDoubleLine className="h-3 w-3" />
                )}
                {slip.status === "paid"
                  ? labels.paid
                  : slip.status === "draft"
                    ? labels.draft
                    : labels.pending}
              </Badge>
              <button
                type="button"
                className="flex items-center gap-1.5 text-label-xs text-primary-base transition-colors hover:text-primary-dark"
              >
                <RiDownloadLine className="h-3.5 w-3.5" />
                {labels.download}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Salary Slip Card Skeleton
// ─────────────────────────────────────────────

export function SalarySlipCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
