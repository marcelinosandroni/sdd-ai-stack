import { cn } from "@/shared/lib/cn";

/**
 * shadcn/ui Skeleton. Keeps layout stable while data loads — see
 * SDD/stacks/react.md (skeletons over spinners) and SDD/DESIGN.md §4.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-container-high", className)}
      {...props}
    />
  );
}
