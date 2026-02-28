import * as React from "react";
import { cn } from "@/lib/utils";

// Compatibility shim mapping DFDS Typography styledAs variants to Tailwind classes
const styleMap: Record<string, string> = {
  heroHeadline: "text-2xl font-bold text-primary",
  sectionHeadline: "text-lg font-bold text-primary",
  subHeadline: "text-xl text-primary",
  smallHeadline: "text-sm font-bold text-primary",
  bodyInterface: "text-base text-primary",
  bodyInterfaceBold: "text-base font-bold text-primary",
  bodyInterfaceSmall: "text-sm text-primary",
  bodyInterfaceSmallBold: "text-sm font-bold text-primary",
  bodyText: "text-base text-primary",
  bodyTextBold: "text-base font-bold text-primary",
  action: "text-sm text-action",
  actionBold: "text-sm font-bold text-action",
  actionText: "text-sm text-action",
  label: "text-sm font-bold text-primary",
  labelBold: "text-sm font-bold text-primary",
  labelSmall: "text-xs text-primary",
  caption: "text-xs text-muted",
};

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  styledAs?: string;
  as?: React.ElementType | string;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ styledAs, as, className, children, ...props }, ref) => {
    const Tag = (as as React.ElementType) ?? "p";
    const styleClass = styledAs ? (styleMap[styledAs] ?? "text-base text-primary") : "";
    return (
      <Tag
        ref={ref as any}
        className={cn(styleClass, className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Text.displayName = "Text";

export { Text };
