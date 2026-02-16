// AlignUI Checkbox — Radix primitive with AlignUI tokens
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { RiCheckLine } from "@remixicon/react";

import { cn } from "@/utils/cn";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md border border-stroke-soft-200 bg-bg-white-0",
      "transition duration-200 ease-out",
      "hover:border-stroke-sub-300",
      "focus-visible:border-stroke-strong-950 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:border-stroke-soft-200",
      "data-[state=checked]:bg-primary-base data-[state=checked]:border-primary-base data-[state=checked]:text-static-white",
      "data-[state=indeterminate]:bg-primary-base data-[state=indeterminate]:border-primary-base data-[state=indeterminate]:text-static-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <RiCheckLine className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
