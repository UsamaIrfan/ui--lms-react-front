// AlignUI Label — Radix primitive with AlignUI tokens
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/utils/cn";

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-label-sm text-text-strong-950 peer-disabled:cursor-not-allowed peer-disabled:text-text-disabled-300",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
