"use client";

import {
  RiMoneyDollarCircleLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiTimeLine,
} from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "@/components/link";
import type { FeeStatus } from "../types";

// ─────────────────────────────────────────────
// Fee Status Card
// ─────────────────────────────────────────────

interface FeeStatusCardProps {
  data: FeeStatus;
  title: string;
  labels: {
    totalFee: string;
    paid: string;
    pending: string;
    nextDue: string;
    recentPayments: string;
    payNow: string;
    viewAll: string;
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `₨${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₨${(amount / 1_000).toFixed(0)}K`;
  return `₨${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function FeeStatusCard({ data, title, labels }: FeeStatusCardProps) {
  const paidPercentage =
    data.totalFee > 0 ? Math.round((data.paidAmount / data.totalFee) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-information-alpha-10">
              <RiMoneyDollarCircleLine className="h-4 w-4 text-information-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Link href="/student-portal/fees">
            <Button variant="ghost" size="sm" className="gap-1">
              {labels.viewAll}
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Fee breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.totalFee}
            </span>
            <span className="text-label-md text-text-strong-950">
              {formatCurrency(data.totalFee)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.paid}
            </span>
            <span className="text-label-md text-success-base">
              {formatCurrency(data.paidAmount)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-paragraph-xs text-text-soft-400">
              {labels.pending}
            </span>
            <span className="text-label-md text-error-base">
              {formatCurrency(data.pendingAmount)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-paragraph-xs text-text-soft-400">
              {paidPercentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-weak-50">
            <div
              className="h-full rounded-full bg-success-base transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* Next due date */}
        {data.nextDueDate && (
          <div className="flex items-center justify-between rounded-10 bg-warning-alpha-10 px-3 py-2">
            <div className="flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-warning-base" />
              <span className="text-label-xs text-text-sub-600">
                {labels.nextDue}: {formatDate(data.nextDueDate)}
              </span>
            </div>
            {data.nextDueAmount && (
              <span className="text-label-sm text-text-strong-950">
                {formatCurrency(data.nextDueAmount)}
              </span>
            )}
          </div>
        )}

        <Separator />

        {/* Recent payments */}
        {data.recentPayments.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-label-xs text-text-sub-600">
              {labels.recentPayments}
            </span>
            {data.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <RiCheckboxCircleLine className="h-3.5 w-3.5 text-success-base" />
                  <span className="text-paragraph-xs text-text-sub-600">
                    {formatDate(payment.date)}
                  </span>
                </div>
                <span className="text-label-xs text-text-strong-950">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pay Now button */}
        {data.pendingAmount > 0 && (
          <Link href="/student-portal/fees">
            <Button className="w-full" size="sm">
              {labels.payNow}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function FeeStatusCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-10 w-full rounded-10" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-9 w-full rounded-10" />
    </Card>
  );
}
