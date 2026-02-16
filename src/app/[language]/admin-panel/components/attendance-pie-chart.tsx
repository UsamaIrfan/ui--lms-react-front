"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttendanceBreakdown } from "../types";

const ATTENDANCE_COLORS = {
  present: "#22c55e",
  absent: "#ef4444",
  leave: "#eab308",
  late: "#f97316",
};

// ─────────────────────────────────────────────
// Attendance Pie Chart
// ─────────────────────────────────────────────

interface AttendancePieChartProps {
  data: AttendanceBreakdown;
  title: string;
  labels: {
    present: string;
    absent: string;
    leave: string;
    late: string;
  };
}

export function AttendancePieChart({
  data,
  title,
  labels,
}: AttendancePieChartProps) {
  const chartData = [
    {
      name: labels.present,
      value: data.present,
      color: ATTENDANCE_COLORS.present,
    },
    {
      name: labels.absent,
      value: data.absent,
      color: ATTENDANCE_COLORS.absent,
    },
    { name: labels.leave, value: data.leave, color: ATTENDANCE_COLORS.leave },
    { name: labels.late, value: data.late, color: ATTENDANCE_COLORS.late },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AttendancePieChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
