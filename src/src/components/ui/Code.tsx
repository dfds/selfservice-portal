import * as React from "react";
import { cn } from "@/lib/utils";

const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "font-mono bg-surface-muted px-[5px] py-[1px] rounded-[3px] text-[12px]",
        className,
      )}
      {...props}
    />
  ),
);
Code.displayName = "Code";

export { Code };
