"use client";

import { useCallback } from "react";
import { RiArrowDownSLine, RiGitBranchLine } from "@remixicon/react";
import useTenant from "@/services/tenant/use-tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface BranchSelectorProps {
  className?: string;
  /** Compact mode for app bar (no label text) */
  compact?: boolean;
}

function BranchSelector({ className, compact = false }: BranchSelectorProps) {
  const { branches, currentBranch, branchId, tenantId, selectBranch } =
    useTenant();

  const handleSelect = useCallback(
    (newBranchId: string | null) => {
      if (newBranchId === branchId) return;
      selectBranch(newBranchId);
    },
    [branchId, selectBranch]
  );

  // Don't show if no tenant is selected or no branches available
  if (!tenantId || branches.length === 0) return null;

  const displayName = currentBranch?.name ?? "All Branches";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2 text-static-white hover:bg-primary-dark",
            className
          )}
          data-testid="branch-selector"
        >
          <RiGitBranchLine className="h-4 w-4" />
          {!compact && (
            <span className="max-w-[140px] truncate">{displayName}</span>
          )}
          <RiArrowDownSLine className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Option to clear branch filter */}
        <DropdownMenuItem
          onClick={() => handleSelect(null)}
          className={cn(
            "cursor-pointer",
            !branchId && "bg-bg-weak-50 font-medium"
          )}
          data-testid="branch-option-all"
        >
          <RiGitBranchLine className="mr-2 h-4 w-4 text-text-sub-600" />
          <span>All Branches</span>
          {!branchId && (
            <span className="ml-auto text-xs text-text-sub-600">&#10003;</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleSelect(branch.id)}
            className={cn(
              "cursor-pointer",
              branch.id === branchId && "bg-bg-weak-50 font-medium"
            )}
            data-testid={`branch-option-${branch.id}`}
          >
            <RiGitBranchLine className="mr-2 h-4 w-4 text-text-sub-600" />
            <div className="flex flex-col">
              <span className="truncate">{branch.name}</span>
              {branch.code && (
                <span className="text-xs text-text-sub-600">{branch.code}</span>
              )}
            </div>
            {branch.isHeadquarters && (
              <span className="ml-auto text-xs text-text-sub-600">HQ</span>
            )}
            {branch.id === branchId && (
              <span className="ml-auto text-xs text-text-sub-600">
                &#10003;
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BranchSelector;
