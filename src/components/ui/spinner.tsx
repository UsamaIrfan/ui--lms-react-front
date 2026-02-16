// AlignUI Spinner — Remixicon loader with AlignUI tokens
import { cn } from "@/utils/cn";
import { RiLoader4Line } from "@remixicon/react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <RiLoader4Line
        className={cn("animate-spin text-primary-base", sizeClasses[size])}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
