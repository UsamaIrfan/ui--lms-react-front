import { cn } from "@/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-10 bg-bg-weak-50", className)}
      {...props}
    />
  );
}

export { Skeleton };
