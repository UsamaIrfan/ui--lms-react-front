import type { RemixiconComponentType } from "@remixicon/react";
import { RiInboxLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: RemixiconComponentType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionElement?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = RiInboxLine,
  title,
  description,
  action,
  actionElement,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-weak-50">
        <Icon className="h-8 w-8 text-text-soft-400" />
      </div>
      <h3 className="text-label-md text-text-strong-950">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-paragraph-sm text-text-sub-600">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-5" size="sm">
          {action.label}
        </Button>
      )}
      {actionElement && <div className="mt-5">{actionElement}</div>}
    </div>
  );
}
