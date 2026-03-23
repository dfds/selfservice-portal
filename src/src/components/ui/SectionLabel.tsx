import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

const SectionLabel = React.forwardRef<HTMLElement, SectionLabelProps>(
  ({ className, children, as: Comp = "span", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        "font-mono text-[10px] font-semibold tracking-[0.08em] uppercase text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  ),
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
