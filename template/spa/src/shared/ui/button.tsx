import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

/**
 * Every colour here is a token name, never a literal. `DESIGN.md` §2 is the list,
 * and `check-rules` RULE 7 fails if a documented token and the theme disagree — but
 * that check only knows about tokens that exist. A hardcoded `#baf336` in this file
 * would pass every guard and still be a second source of truth.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
    "transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-contrast hover:bg-primary-hover",
        secondary:
          "bg-surface-raised text-text-primary border border-border-subtle hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-raised hover:text-text-primary",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return (
    <button
      // Defaulting to "button" is not a detail: a bare <button> inside a form
      // submits it, which is the single most common accidental submission there is.
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
