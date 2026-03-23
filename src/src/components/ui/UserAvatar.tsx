import * as React from "react";
import { cn } from "@/lib/utils";

function getInitials(name?: string): string {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase() || "?";
}

const sizeMap = {
  sm: "w-[26px] h-[26px] text-[10px]",
  md: "w-7 h-7 text-[10px]",
  lg: "w-8 h-8 text-[11px]",
};

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  pictureUrl?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({
  name,
  pictureUrl,
  size = "md",
  className,
  ...props
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "rounded-full bg-[#002b45] dark:bg-[#0e7cc1] text-white flex items-center justify-center font-mono font-bold flex-shrink-0 overflow-hidden",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {pictureUrl ? (
        <img
          src={pictureUrl}
          alt={name ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
