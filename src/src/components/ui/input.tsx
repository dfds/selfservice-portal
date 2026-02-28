import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[5px] border border-[#d3d3d3] dark:border-[#334155] bg-white dark:bg-[#0f172a] px-3 py-1 text-sm text-[#002b45] dark:text-[#e2e8f0] shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#afafaf] dark:placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002b45] dark:focus-visible:ring-[#60a5fa] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
