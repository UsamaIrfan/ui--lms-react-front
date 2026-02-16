// AlignUI Switch — Radix primitive with AlignUI tokens
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/utils/cn";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      "bg-bg-soft-200 shadow-toggle-switch",
      "transition duration-200 ease-out",
      "focus-visible:outline-none focus-visible:shadow-button-important-focus",
      "disabled:cursor-not-allowed disabled:bg-bg-weak-50",
      "data-[state=checked]:bg-primary-base",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-static-white shadow-switch-thumb",
        "transition-transform duration-200 ease-out",
        "data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
