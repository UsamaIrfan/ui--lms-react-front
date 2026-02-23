"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useTranslation } from "@/services/i18n/client";
import type { MonthlyBreakdownItem } from "../types";

interface MonthlyTrendChartProps {
  data: MonthlyBreakdownItem[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { t } = useTranslation("student-portal-attendance");

  if (data.length === 0) return null;

  const chartData = data.map((item) => ({
    name: item.month.substring(0, 3),
    percentage: item.percentage,
    present: item.presentDays,
    absent: item.absentDays,
    late: item.lateDays,
  }));

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("monthlyTrend.title")}
      </h3>

      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-stroke-soft-200)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--color-text-sub-600)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "var(--color-text-sub-600)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--color-stroke-soft-200)",
                boxShadow: "var(--shadow-regular-xs)",
              }}
              formatter={(value) => [
                `${value ?? 0}%`,
                t("monthlyTrend.percentage"),
              ]}
            />
            <ReferenceLine
              y={75}
              stroke="var(--color-warning-base)"
              strokeDasharray="5 5"
              label={{
                value: "75%",
                position: "right",
                fill: "var(--color-warning-base)",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="percentage"
              fill="var(--color-primary-base)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyTrendChartSkeleton() {
  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="mb-4 h-5 w-32 animate-pulse rounded-8 bg-bg-weak-50" />
      <div className="h-62.5 w-full animate-pulse rounded-12 bg-bg-weak-50" />
    </div>
  );
}
