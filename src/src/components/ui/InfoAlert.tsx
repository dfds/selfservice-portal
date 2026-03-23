import * as React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
}

const variantStyles: Record<string, string> = {
  info: "border-[rgba(14,124,193,0.2)] dark:border-[rgba(14,124,193,0.3)] bg-[#e8f4fb] dark:bg-[rgba(14,124,193,0.08)] text-[#002b45] dark:text-[#94a3b8]",
  warning:
    "border-[rgba(237,136,0,0.2)] dark:border-[rgba(237,136,0,0.3)] bg-[#fff3e0] dark:bg-[rgba(237,136,0,0.08)] text-[#002b45] dark:text-[#94a3b8]",
  error:
    "border-[rgba(190,30,45,0.3)] dark:border-[rgba(190,30,45,0.5)] bg-[rgba(190,30,45,0.05)] dark:bg-[rgba(190,30,45,0.12)] text-[#002b45] dark:text-[#94a3b8]",
  success:
    "border-[rgba(76,175,80,0.2)] dark:border-[rgba(76,175,80,0.3)] bg-[#e8f5e9] dark:bg-[rgba(76,175,80,0.08)] text-[#002b45] dark:text-[#94a3b8]",
};

const variantIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const iconColors: Record<string, string> = {
  info: "text-[#0e7cc1] dark:text-[#60a5fa]",
  warning: "text-[#ed8800]",
  error: "text-[#be1e2d] dark:text-[#f87171]",
  success: "text-[#4caf50] dark:text-[#4ade80]",
};

const InfoAlert = React.forwardRef<HTMLDivElement, InfoAlertProps>(
  ({ variant = "info", className, children, ...props }, ref) => {
    const Icon = variantIcons[variant];
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-3 rounded-[6px] border px-4 py-3.5 text-[13px] leading-[1.65]",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <Icon
          size={16}
          className={cn("mt-0.5 flex-shrink-0", iconColors[variant])}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  },
);
InfoAlert.displayName = "InfoAlert";

export { InfoAlert };
