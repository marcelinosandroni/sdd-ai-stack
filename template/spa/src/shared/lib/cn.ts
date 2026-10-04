import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional classes with Tailwind conflict resolution.
 *
 * `clsx` decides which classes apply; `twMerge` decides which one wins when two
 * utilities target the same CSS property. Without the second step, a component
 * given `px-6` would end up with both `px-4` and `px-6` in the class list, and the
 * outcome would depend on stylesheet order rather than on the caller's intent.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
