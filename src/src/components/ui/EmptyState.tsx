import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-2.5 text-[13px] text-muted italic", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
