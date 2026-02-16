"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeeCollectionItem } from "../types";

const CHART_COLORS = {
  collected: "#22c55e",
  pending: "#ef4444",
  grid: "#e1e4ea",
  text: "#868c98",
};

// ─────────────────────────────────────────────
// Fee Collection Chart
// ─────────────────────────────────────────────

interface FeeCollectionChartProps {
  data: FeeCollectionItem[];
  title: string;
  collectedLabel: string;
  pendingLabel: string;
}

export function FeeCollectionChart({
  data,
  title,
  collectedLabel,
  pendingLabel,
}: FeeCollectionChartProps) {
  const formatAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatAmount}
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => formatAmount(Number(value))}
                contentStyle={{
                  borderRadius: "0.625rem",
                  border: "1px solid #e1e4ea",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  fontSize: "0.875rem",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
              />
              <Bar
                dataKey="collected"
                name={collectedLabel}
                fill={CHART_COLORS.collected}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name={pendingLabel}
                fill={CHART_COLORS.pending}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeeCollectionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
