"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EnrollmentTrendItem } from "../types";

// ─────────────────────────────────────────────
// Chart theme colors (AlignUI tokens)
// ─────────────────────────────────────────────

const CHART_COLORS = {
  primary: "#335cff",
  grid: "#e1e4ea",
  text: "#868c98",
};

// ─────────────────────────────────────────────
// Enrollment Trend Chart
// ─────────────────────────────────────────────

interface EnrollmentTrendChartProps {
  data: EnrollmentTrendItem[];
  title: string;
}

export function EnrollmentTrendChart({
  data,
  title,
}: EnrollmentTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              <Line
                type="monotone"
                dataKey="students"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS.primary }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnrollmentTrendChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
