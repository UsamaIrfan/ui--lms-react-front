"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import type { DayOfWeek, TimetablePeriod } from "../types";

// ─────────────────────────────────────────────
// Day Selector Tabs
// ─────────────────────────────────────────────

/** Days we display (Mon→Sat, skip Sunday) */
const DISPLAY_DAYS: { day: DayOfWeek; key: string }[] = [
  { day: 1, key: "monday" },
  { day: 2, key: "tuesday" },
  { day: 3, key: "wednesday" },
  { day: 4, key: "thursday" },
  { day: 5, key: "friday" },
  { day: 6, key: "saturday" },
];

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  periodsByDay: Record<number, TimetablePeriod[]>;
  dayLabels: Record<string, string>;
  todayLabel: string;
  periodsLabel: string;
}

export function DaySelector({
  selectedDay,
  onDayChange,
  periodsByDay,
  dayLabels,
  todayLabel,
  periodsLabel,
}: DaySelectorProps) {
  const today = new Date().getDay() as DayOfWeek;

  return (
    <div className="flex flex-wrap gap-2">
      {DISPLAY_DAYS.map(({ day, key }) => {
        const isToday = day === today;
        const isSelected = day === selectedDay;
        const periodCount = (periodsByDay[day] ?? []).length;

        return (
          <Button
            key={day}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onDayChange(day)}
            className={cn(
              "relative gap-1.5",
              isToday && !isSelected && "border-primary-base"
            )}
          >
            {dayLabels[key]}
            {isToday && (
              <Badge
                variant={isSelected ? "secondary" : "default"}
                className="ml-0.5 px-1.5 py-0 text-[9px]"
              >
                {todayLabel}
              </Badge>
            )}
            {periodCount > 0 && (
              <span
                className={cn(
                  "text-paragraph-xs",
                  isSelected ? "text-static-white/70" : "text-text-soft-400"
                )}
              >
                {periodCount} {periodsLabel}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

export { DISPLAY_DAYS };
