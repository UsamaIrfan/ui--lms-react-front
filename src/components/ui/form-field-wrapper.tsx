// AlignUI FormFieldWrapper — Label + error display with AlignUI tokens
import * as React from "react";
import { cn } from "@/utils/cn";
import { Label } from "@/components/ui/label";

interface FormFieldWrapperProps {
  label?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
  testId?: string;
  htmlFor?: string;
}

function FormFieldWrapper({
  label,
  error,
  className,
  children,
  testId,
  htmlFor,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid={testId}>
      {label && (
        <Label htmlFor={htmlFor} className={cn(error && "text-error-base")}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p
          className="text-paragraph-xs text-error-base"
          data-testid={testId ? `${testId}-error` : undefined}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { FormFieldWrapper };
