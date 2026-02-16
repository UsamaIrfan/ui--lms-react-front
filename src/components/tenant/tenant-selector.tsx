"use client";

import { useCallback, useState } from "react";
import { RiArrowDownSLine, RiBuilding2Line } from "@remixicon/react";
import useTenant from "@/services/tenant/use-tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

interface TenantSelectorProps {
  className?: string;
  /** Compact mode for app bar (no label text) */
  compact?: boolean;
}

function TenantSelector({ className, compact = false }: TenantSelectorProps) {
  const { tenants, currentTenant, tenantId, selectTenant, isFetching } =
    useTenant();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = useCallback(
    async (newTenantId: string) => {
      if (newTenantId === tenantId) return;

      try {
        setIsSelecting(true);
        await selectTenant(newTenantId);
      } catch {
        // Error handling can be extended with toast notifications
      } finally {
        setIsSelecting(false);
      }
    },
    [tenantId, selectTenant]
  );

  if (tenants.length === 0) return null;

  const displayName = currentTenant?.name ?? "Select Tenant";
  const isLoading = isFetching || isSelecting;

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
          disabled={isLoading}
          data-testid="tenant-selector"
        >
          {isLoading ? (
            <Spinner size="sm" className="text-static-white" />
          ) : (
            <RiBuilding2Line className="h-4 w-4" />
          )}
          {!compact && (
            <span className="max-w-[140px] truncate">{displayName}</span>
          )}
          <RiArrowDownSLine className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSelect(tenant.id)}
            className={cn(
              "cursor-pointer",
              tenant.id === tenantId && "bg-bg-weak-50 font-medium"
            )}
            data-testid={`tenant-option-${tenant.id}`}
          >
            <RiBuilding2Line className="mr-2 h-4 w-4 text-text-sub-600" />
            <span className="truncate">{tenant.name}</span>
            {tenant.id === tenantId && (
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

export default TenantSelector;
