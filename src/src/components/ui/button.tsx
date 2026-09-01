import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium transition-[transform,box-shadow,background-color,color] duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.015] hover:-translate-y-px hover:shadow-sm active:scale-[0.97] active:translate-y-0 active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#002b45] text-white hover:bg-[#003d61] focus-visible:ring-[#002b45] dark:bg-[#334155] dark:hover:bg-[#475569] dark:focus-visible:ring-[#60a5fa]",
        action:
          "bg-[#0e7cc1] text-white hover:bg-[#0a6aaa] focus-visible:ring-[#0e7cc1] dark:bg-[#1d6fa8] dark:hover:bg-[#1a5e8f] dark:focus-visible:ring-[#60a5fa]",
        outline:
          "border border-[#002b45] bg-white text-[#002b45] hover:bg-[#f2f2f2] focus-visible:ring-[#002b45] dark:border-[#475569] dark:bg-transparent dark:text-[#e2e8f0] dark:hover:bg-[#334155] dark:focus-visible:ring-[#60a5fa]",
        destructive:
          "bg-[#be1e2d] text-white hover:bg-[#a01a26] focus-visible:ring-[#be1e2d] dark:bg-[#9f1239] dark:hover:bg-[#881337] dark:focus-visible:ring-[#f87171]",
        ghost:
          "bg-transparent text-[#002b45] hover:bg-[#f2f2f2] focus-visible:ring-[#002b45] dark:text-[#e2e8f0] dark:hover:bg-[#334155] dark:focus-visible:ring-[#60a5fa]",
        link: "text-[#0e7cc1] underline-offset-4 hover:underline focus-visible:ring-[#0e7cc1] dark:text-[#60a5fa] dark:focus-visible:ring-[#60a5fa]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
