import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: "sm" | "md" | "lg";
  instant?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = "md", instant: _instant, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn("animate-spin", sizeMap[size], className)}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="#002b45"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#002b45"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
);
Spinner.displayName = "Spinner";

export { Spinner };
