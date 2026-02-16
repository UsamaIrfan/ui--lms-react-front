// AlignUI Button — tv-based with AlignUI tokens
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/utils/cn";
import { tv, type VariantProps } from "@/utils/tv";

const buttonVariants = tv({
  base: [
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-label-sm",
    "transition duration-200 ease-out",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:border-stroke-soft-200",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  variants: {
    variant: {
      default:
        "bg-primary-base text-static-white shadow-fancy-buttons-primary hover:bg-primary-dark focus-visible:shadow-button-primary-focus",
      destructive:
        "bg-error-base text-static-white shadow-fancy-buttons-error hover:bg-error-dark focus-visible:shadow-button-error-focus",
      outline:
        "border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 shadow-regular-xs hover:bg-bg-weak-50 hover:border-stroke-sub-300 focus-visible:shadow-button-important-focus",
      secondary:
        "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 focus-visible:shadow-button-important-focus",
      ghost:
        "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:shadow-button-important-focus",
      link: "text-primary-base underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2.5 text-label-sm [&_svg]:size-5",
      sm: "h-9 px-3.5 py-2 text-label-sm [&_svg]:size-5",
      lg: "h-11 px-5 py-2.5 text-label-md [&_svg]:size-5",
      icon: "h-10 w-10 [&_svg]:size-5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
