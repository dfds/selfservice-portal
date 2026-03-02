import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-brand)] text-inverse",
        success: "bg-[var(--color-success)] text-inverse",
        warning: "bg-[var(--color-warning)] text-inverse",
        destructive: "bg-[var(--color-error)] text-inverse",
        outline: "border border-[var(--color-border)] text-primary",
        secondary: "bg-surface-muted text-primary",
        "soft-success":
          "bg-[rgba(76,175,80,0.1)] text-[#4caf50] font-mono tracking-[0.06em]",
        "soft-warning":
          "bg-[rgba(237,136,0,0.1)] text-[#ed8800] font-mono tracking-[0.06em]",
        pending:
          "border-transparent bg-[rgba(237,136,0,0.1)] text-[#ed8800] font-mono tracking-[0.06em] animate-badge-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
