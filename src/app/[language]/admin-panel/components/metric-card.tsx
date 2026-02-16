"use client";

import type { ReactNode } from "react";
import { RiArrowUpSLine, RiArrowDownSLine } from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import { cn } from "@/utils/cn";

// ─────────────────────────────────────────────
// MetricCard
// ─────────────────────────────────────────────

interface MetricCardProps {
  icon: RemixiconComponentType;
  iconClassName?: string;
  title: string;
  value: string | number;
  trend?: number; // percentage change — positive = up, negative = down
  trendLabel?: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export function MetricCard({
  icon: Icon,
  iconClassName,
  title,
  value,
  trend,
  trendLabel,
  subtitle,
  href,
  linkLabel,
}: MetricCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <Card className="flex flex-col gap-4 p-5">
      {/* Icon + Title */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-10",
            "bg-primary-alpha-10 text-primary-base",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-paragraph-sm text-text-sub-600">{title}</span>
      </div>

      {/* Main metric */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-title-h4 text-text-strong-950">{value}</span>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-label-xs",
              isPositiveTrend ? "text-success-base" : "text-error-base"
            )}
          >
            {isPositiveTrend ? (
              <RiArrowUpSLine className="h-4 w-4" />
            ) : (
              <RiArrowDownSLine className="h-4 w-4" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Subtitle + Link */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-paragraph-xs text-text-soft-400">
            {subtitle}
          </span>
        )}
        {trendLabel && !subtitle && (
          <span className="text-paragraph-xs text-text-soft-400">
            {trendLabel}
          </span>
        )}
        {href && linkLabel && (
          <Link
            href={href}
            className="text-label-xs text-primary-base hover:text-primary-dark"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// MetricCardSkeleton
// ─────────────────────────────────────────────

export function MetricCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-10" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// CompactMetricCard (for secondary metrics)
// ─────────────────────────────────────────────

interface CompactMetricCardProps {
  icon: RemixiconComponentType;
  iconClassName?: string;
  title: string;
  value: string | number;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}

export function CompactMetricCard({
  icon: Icon,
  iconClassName,
  title,
  value,
  href,
  linkLabel,
  children,
}: CompactMetricCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-10",
          "bg-warning-alpha-10 text-warning-base",
          iconClassName
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-paragraph-xs text-text-sub-600">{title}</span>
        <span className="text-label-md text-text-strong-950">{value}</span>
        {children}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="shrink-0 text-label-xs text-primary-base hover:text-primary-dark"
        >
          {linkLabel}
        </Link>
      )}
    </Card>
  );
}

export function CompactMetricCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-10" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-3 w-14" />
    </Card>
  );
}
