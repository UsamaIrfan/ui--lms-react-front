"use client";

import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiFilter3Line, RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import { EnquiryStatus, EnquirySource } from "../types";
import type { EnquiryFilterType } from "../types";

interface EnquiryFilterProps {
  filter: EnquiryFilterType;
  onFilterChange: (filter: EnquiryFilterType) => void;
}

const statusOptions = Object.values(EnquiryStatus);
const sourceOptions = Object.values(EnquirySource);

export default function EnquiryFilter({
  filter,
  onFilterChange,
}: EnquiryFilterProps) {
  const { t } = useTranslation("admin-panel-students-enquiries");
  const [open, setOpen] = useState(false);

  const [localFilter, setLocalFilter] = useState<EnquiryFilterType>(filter);

  const handleApply = () => {
    onFilterChange(localFilter);
    setOpen(false);
  };

  const handleClear = () => {
    const cleared: EnquiryFilterType = {};
    setLocalFilter(cleared);
    onFilterChange(cleared);
    setOpen(false);
  };

  const hasActiveFilters = filter.status || filter.source;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 sm:max-w-xs">
        <Input
          placeholder={t("admin-panel-students-enquiries:filter.search")}
          value={filter.search ?? ""}
          onChange={(e) => {
            onFilterChange({ ...filter, search: e.target.value || undefined });
          }}
          className="pr-8"
        />
        {filter.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filter, search: undefined })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-soft-400 hover:text-text-strong-950"
          >
            <RiCloseLine className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={hasActiveFilters ? "default" : "outline"} size="sm">
            <RiFilter3Line className="mr-1 h-4 w-4" />
            {t("admin-panel-students-enquiries:filter.filters")}
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-static-white/20 px-1.5 text-label-xs">
                {[filter.status, filter.source].filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>
                {t("admin-panel-students-enquiries:filter.status.label")}
              </Label>
              <Select
                value={localFilter.status ?? "__all__"}
                onValueChange={(val) =>
                  setLocalFilter({
                    ...localFilter,
                    status:
                      val === "__all__" ? undefined : (val as EnquiryStatus),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {t("admin-panel-students-enquiries:filter.status.all")}
                  </SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`admin-panel-students-enquiries:status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t("admin-panel-students-enquiries:filter.source.label")}
              </Label>
              <Select
                value={localFilter.source ?? "__all__"}
                onValueChange={(val) =>
                  setLocalFilter({
                    ...localFilter,
                    source:
                      val === "__all__" ? undefined : (val as EnquirySource),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {t("admin-panel-students-enquiries:filter.source.all")}
                  </SelectItem>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`admin-panel-students-enquiries:source.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleApply} className="flex-1">
                {t("admin-panel-students-enquiries:actions.applyFilters")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                {t("admin-panel-students-enquiries:actions.clearFilters")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
