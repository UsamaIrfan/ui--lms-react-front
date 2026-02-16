// AlignUI Textarea — styled with AlignUI tokens
import * as React from "react";

import { cn } from "@/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950",
        "shadow-regular-xs transition duration-200 ease-out",
        "placeholder:text-text-soft-400",
        "hover:border-stroke-sub-300",
        "focus-visible:border-stroke-strong-950 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
