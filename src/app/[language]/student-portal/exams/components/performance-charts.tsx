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
  Cell,
} from "recharts";

import { useTranslation } from "@/services/i18n/client";
import type { StudentExamResult } from "../types";

interface PerformanceChartProps {
  results: StudentExamResult[];
}

export function SubjectPerformanceChart({ results }: PerformanceChartProps) {
  const { t } = useTranslation("student-portal-exams");

  // Aggregate subject performance across all exams
  const subjectMap = new Map<
    string,
    { totalPercentage: number; count: number }
  >();

  for (const result of results) {
    for (const sub of result.subjects) {
      if (sub.isAbsent || sub.percentage === null) continue;
      const existing = subjectMap.get(sub.subjectName) ?? {
        totalPercentage: 0,
        count: 0,
      };
      existing.totalPercentage += sub.percentage;
      existing.count += 1;
      subjectMap.set(sub.subjectName, existing);
    }
  }

  const chartData = Array.from(subjectMap.entries())
    .map(([name, { totalPercentage, count }]) => ({
      name,
      percentage: Math.round(totalPercentage / count),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  if (chartData.length === 0) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("analytics.subjectPerformance")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("analytics.noData")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("analytics.subjectPerformance")}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-stroke-soft-200)"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--color-text-sub-600)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "var(--color-text-sub-600)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value ?? 0}%`, t("analytics.percentage")]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-stroke-soft-200)",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={50}
            stroke="var(--color-error-base)"
            strokeDasharray="3 3"
            label={{
              value: "Pass",
              fill: "var(--color-error-base)",
              fontSize: 10,
            }}
          />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  entry.percentage >= 80
                    ? "var(--color-success-base)"
                    : entry.percentage >= 50
                      ? "var(--color-warning-base)"
                      : "var(--color-error-base)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PerformanceTrendChart({ results }: PerformanceChartProps) {
  const { t } = useTranslation("student-portal-exams");

  const trendData = results
    .slice()
    .reverse()
    .map((result) => ({
      name:
        result.examName.length > 15
          ? `${result.examName.slice(0, 15)}…`
          : result.examName,
      percentage: Math.round(result.percentage),
    }));

  if (trendData.length < 2) {
    return (
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <h3 className="mb-4 text-label-lg text-text-strong-950">
          {t("analytics.performanceTrend")}
        </h3>
        <p className="py-8 text-center text-paragraph-sm text-text-sub-600">
          {t("analytics.noData")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
      <h3 className="mb-4 text-label-lg text-text-strong-950">
        {t("analytics.performanceTrend")}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={trendData}
          margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-stroke-soft-200)"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--color-text-sub-600)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "var(--color-text-sub-600)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value ?? 0}%`, t("analytics.percentage")]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-stroke-soft-200)",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={50}
            stroke="var(--color-error-base)"
            strokeDasharray="3 3"
          />
          <Bar
            dataKey="percentage"
            fill="var(--color-primary-base)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PerformanceSummaryCards({
  results,
}: {
  results: StudentExamResult[];
}) {
  const { t } = useTranslation("student-portal-exams");

  if (results.length === 0) return null;

  const avgPercentage =
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

  // Find best and weakest subjects
  const subjectMap = new Map<
    string,
    { totalPercentage: number; count: number }
  >();
  for (const result of results) {
    for (const sub of result.subjects) {
      if (sub.isAbsent || sub.percentage === null) continue;
      const existing = subjectMap.get(sub.subjectName) ?? {
        totalPercentage: 0,
        count: 0,
      };
      existing.totalPercentage += sub.percentage;
      existing.count += 1;
      subjectMap.set(sub.subjectName, existing);
    }
  }

  const subjectAvgs = Array.from(subjectMap.entries()).map(
    ([name, { totalPercentage, count }]) => ({
      name,
      avg: totalPercentage / count,
    })
  );
  subjectAvgs.sort((a, b) => b.avg - a.avg);

  const bestSubject = subjectAvgs[0];
  const weakSubject = subjectAvgs[subjectAvgs.length - 1];

  const cards = [
    {
      label: t("analytics.averagePercentage"),
      value: `${avgPercentage.toFixed(1)}%`,
      color:
        avgPercentage >= 80
          ? "text-success-base"
          : avgPercentage >= 50
            ? "text-warning-base"
            : "text-error-base",
    },
    ...(bestSubject
      ? [
          {
            label: t("analytics.bestSubject"),
            value: bestSubject.name,
            color: "text-success-base",
          },
        ]
      : []),
    ...(weakSubject && weakSubject.name !== bestSubject?.name
      ? [
          {
            label: t("analytics.weakSubject"),
            value: weakSubject.name,
            color: "text-warning-base",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5 text-center"
        >
          <p className="text-label-sm text-text-sub-600">{card.label}</p>
          <p className={`mt-1 text-title-h5 font-bold ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PerformanceChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <div className="mb-4 h-5 w-40 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-75 animate-pulse rounded-16 bg-bg-weak-50" />
      </div>
      <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5">
        <div className="mb-4 h-5 w-40 animate-pulse rounded-8 bg-bg-weak-50" />
        <div className="h-75 animate-pulse rounded-16 bg-bg-weak-50" />
      </div>
    </div>
  );
}
