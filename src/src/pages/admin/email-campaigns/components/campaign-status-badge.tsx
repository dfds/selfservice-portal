import React from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { variant: string; label: string }> = {
  Draft: { variant: "outline", label: "Draft" },
  Scheduled: { variant: "soft-warning", label: "Scheduled" },
  Sending: { variant: "warning", label: "Sending" },
  Sent: { variant: "soft-success", label: "Sent" },
  Cancelled: { variant: "secondary", label: "Cancelled" },
  Failed: { variant: "destructive", label: "Failed" },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { variant: "outline", label: status };
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}
