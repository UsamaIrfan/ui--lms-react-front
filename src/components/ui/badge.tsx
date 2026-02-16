// AlignUI Badge — tv() variant system with AlignUI tokens
import * as React from "react";

import { cn } from "@/utils/cn";
import { tv, type VariantProps } from "@/utils/tv";

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-label-xs transition-colors focus:outline-none",
  variants: {
    variant: {
      default: "border-transparent bg-primary-base text-static-white",
      secondary: "border-transparent bg-bg-weak-50 text-text-sub-600",
      destructive: "border-transparent bg-error-base text-static-white",
      outline: "border-stroke-soft-200 text-text-sub-600",
      success: "border-transparent bg-success-base text-static-white",
      warning: "border-transparent bg-warning-base text-static-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
