"use client";

import { RiSearchLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MaterialType, MaterialFilters } from "../types";

// ─────────────────────────────────────────────
// Material Filter Bar
// ─────────────────────────────────────────────

interface MaterialFilterBarProps {
  filters: MaterialFilters;
  onFiltersChange: (filters: MaterialFilters) => void;
  labels: {
    all: string;
    document: string;
    video: string;
    presentation: string;
    link: string;
    search: string;
  };
}

const TYPE_OPTIONS: {
  value: MaterialType | undefined;
  labelKey: keyof MaterialFilterBarProps["labels"];
}[] = [
  { value: undefined, labelKey: "all" },
  { value: "document", labelKey: "document" },
  { value: "video", labelKey: "video" },
  { value: "presentation", labelKey: "presentation" },
  { value: "link", labelKey: "link" },
];

export function MaterialFilterBar({
  filters,
  onFiltersChange,
  labels,
}: MaterialFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <Button
            key={opt.labelKey}
            variant={filters.type === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFiltersChange({ ...filters, type: opt.value, page: undefined })
            }
          >
            {labels[opt.labelKey]}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-soft-400" />
        <Input
          placeholder={labels.search}
          value={filters.search ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value || undefined,
              page: undefined,
            })
          }
          className="pl-9"
        />
      </div>
    </div>
  );
}
