"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassDistributionItem } from "../types";

const CHART_COLORS = {
  bar: "#335cff",
  grid: "#e1e4ea",
  text: "#868c98",
};

// ─────────────────────────────────────────────
// Class Distribution Chart
// ─────────────────────────────────────────────

interface ClassDistributionChartProps {
  data: ClassDistributionItem[];
  title: string;
}

export function ClassDistributionChart({
  data,
  title,
}: ClassDistributionChartProps) {
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
                dataKey="className"
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.625rem",
                  border: "1px solid #e1e4ea",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  fontSize: "0.875rem",
                }}
              />
              <Bar
                dataKey="students"
                fill={CHART_COLORS.bar}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassDistributionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
