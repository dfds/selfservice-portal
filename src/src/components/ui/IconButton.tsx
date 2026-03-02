import * as React from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded transition duration-150 ease-out-expo hover:scale-[1.05] active:scale-[0.9]",
        "hover:bg-[#eeeeee] dark:hover:bg-[#334155]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-action)]",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "p-0.5" : "p-1",
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";

export { IconButton };
