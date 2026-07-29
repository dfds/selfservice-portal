import * as React from "react";
import { cn } from "@/lib/utils";
import { HintTooltip } from "@/components/ui/tooltip";

interface SectionLabelProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  /**
   * Optional one-sentence explanation of what this label means, shown on hover
   * or focus. Requires a <TooltipProvider> ancestor.
   */
  tip?: React.ReactNode;
}

const SectionLabel = React.forwardRef<HTMLElement, SectionLabelProps>(
  ({ className, children, as: Comp = "span", tip, ...props }, ref) => {
    const label = (
      <Comp
        ref={ref}
        className={cn(
          "font-mono text-[0.625rem] font-semibold tracking-[0.08em] uppercase text-muted",
          // w-fit so a block-level label hugs its text — otherwise the tooltip
          // anchors to the centre of the full-width box, far from the label.
          tip && "cursor-help w-fit",
          className,
        )}
        {...(tip ? { tabIndex: 0 } : {})}
        {...props}
      >
        {children}
      </Comp>
    );
    return tip ? <HintTooltip tip={tip}>{label}</HintTooltip> : label;
  },
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
