import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

const SectionLabel = React.forwardRef<HTMLSpanElement, SectionLabelProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-mono text-[10px] font-semibold tracking-[0.08em] uppercase text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
