"use client";

import { useTranslation } from "@/services/i18n/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiFilterLine, RiSearchLine } from "@remixicon/react";
import { EnrollmentStatus } from "../types";
import type { StudentFilterType } from "../types";

interface StudentFilterProps {
  filter: StudentFilterType;
  onFilterChange: (filter: StudentFilterType) => void;
}

export default function StudentFilter({
  filter,
  onFilterChange,
}: StudentFilterProps) {
  const { t } = useTranslation("admin-panel-students-registrations");

  const hasActiveFilters =
    filter.status !== undefined ||
    filter.classId !== undefined ||
    filter.sectionId !== undefined;

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
        <Input
          placeholder={t("admin-panel-students-registrations:filter.search")}
          value={filter.search ?? ""}
          onChange={(e) =>
            onFilterChange({ ...filter, search: e.target.value || undefined })
          }
          className="w-64 pl-9"
        />
      </div>

      {/* Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <RiFilterLine className="mr-1 h-4 w-4" />
            {t("admin-panel-students-registrations:filter.status")}
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-base" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-label-sm text-text-sub-600">
              {t("admin-panel-students-registrations:filter.status")}
            </label>
            <Select
              value={filter.status ?? "__all__"}
              onValueChange={(val) =>
                onFilterChange({
                  ...filter,
                  status:
                    val === "__all__" ? undefined : (val as EnrollmentStatus),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  {t("admin-panel-students-registrations:filter.allStatuses")}
                </SelectItem>
                {Object.values(EnrollmentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(
                      `admin-panel-students-registrations:enrollmentStatus.${status}`
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-label-sm text-text-sub-600">
              {t("admin-panel-students-registrations:filter.class")}
            </label>
            <Input
              placeholder={t(
                "admin-panel-students-registrations:filter.allClasses"
              )}
              value={filter.classId ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  classId: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Section */}
          <div className="space-y-2">
            <label className="text-label-sm text-text-sub-600">
              {t("admin-panel-students-registrations:filter.section")}
            </label>
            <Input
              placeholder={t(
                "admin-panel-students-registrations:filter.allSections"
              )}
              value={filter.sectionId ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  sectionId: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onFilterChange({ search: filter.search })}
            >
              {t("admin-panel-students-registrations:filter.clearFilters")}
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
