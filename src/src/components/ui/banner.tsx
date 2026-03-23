import * as React from "react";
import { cn } from "@/lib/utils";

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
  countdown?: number;
}

const variantStyles: Record<string, string> = {
  info: "bg-[#e8f4fc] border-[#0e7cc1] text-[#002b45] dark:bg-[#0e7cc1]/10 dark:border-[#60a5fa] dark:text-slate-200",
  warning:
    "bg-[#fff3e0] border-[#ed8800] text-[#002b45] dark:bg-[#ed8800]/10 dark:border-[#ed8800] dark:text-slate-200",
  error:
    "bg-[#fdecea] border-[#be1e2d] text-[#002b45] dark:bg-[#be1e2d]/10 dark:border-[#f87171] dark:text-slate-200",
  success:
    "bg-[#e8f5e9] border-[#4caf50] text-[#002b45] dark:bg-[#4caf50]/10 dark:border-[#4ade80] dark:text-slate-200",
};

const variantBarStyles: Record<string, string> = {
  info: "bg-[#0e7cc1] dark:bg-[#60a5fa]",
  warning: "bg-[#ed8800]",
  error: "bg-[#be1e2d] dark:bg-[#f87171]",
  success: "bg-[#4caf50] dark:bg-[#4ade80]",
};

function CountdownBar({
  duration,
  variant,
}: {
  duration: number;
  variant: string;
}) {
  const [width, setWidth] = React.useState(100);

  React.useEffect(() => {
    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => setWidth(0));
      return () => cancelAnimationFrame(inner);
    });
    return () => cancelAnimationFrame(outer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px]">
      <div
        className={cn(
          "h-full opacity-60",
          variantBarStyles[variant] ?? variantBarStyles.info,
        )}
        style={{
          width: `${width}%`,
          transition: `width ${duration}ms linear`,
        }}
      />
    </div>
  );
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ variant = "warning", countdown, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[5px] border-l-4 p-4 overflow-hidden",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
      {countdown !== undefined && (
        <CountdownBar duration={countdown} variant={variant} />
      )}
    </div>
  ),
);
Banner.displayName = "Banner";

const BannerParagraph = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm", className)} {...props} />
));
BannerParagraph.displayName = "BannerParagraph";

export { Banner, BannerParagraph };
