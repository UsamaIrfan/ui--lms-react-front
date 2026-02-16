// AlignUI RadioGroup — Radix primitive with AlignUI tokens
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/utils/cn";

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-5 w-5 rounded-full border-2 border-stroke-soft-200 text-primary-base",
        "transition-colors hover:border-primary-base",
        "focus:outline-none focus-visible:shadow-button-primary-focus",
        "disabled:cursor-not-allowed disabled:border-stroke-soft-200 disabled:opacity-50",
        "data-[state=checked]:border-primary-base",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary-base" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
