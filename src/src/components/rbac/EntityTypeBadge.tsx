import React from "react";
import { Badge } from "@/components/ui/badge";

export type EntityKind = "User" | "ServicePrincipal" | "Group" | "Role";

const LABELS: Record<EntityKind, string> = {
  User: "User",
  ServicePrincipal: "Service account",
  Group: "Group",
  Role: "Role",
};

const VARIANTS: Record<
  EntityKind,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  User: "outline",
  ServicePrincipal: "soft-warning",
  Group: "secondary",
  Role: "soft-success",
};

export function EntityTypeBadge({
  kind,
  className,
}: {
  kind: EntityKind;
  className?: string;
}) {
  return (
    <Badge
      variant={VARIANTS[kind]}
      className={`text-[0.625rem] font-mono ${className ?? ""}`.trim()}
    >
      {LABELS[kind]}
    </Badge>
  );
}
