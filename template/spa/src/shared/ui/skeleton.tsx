import { cn } from "@/shared/lib/cn";

/**
 * A placeholder shaped like the content it stands in for.
 *
 * The animation is disabled wholesale under `prefers-reduced-motion` in
 * `globals.css`, so this component does not need to know about it.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-container", className)}
    />
  );
}
