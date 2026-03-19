import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

/**
 * Returns a status icon for compliance-style statuses
 * (compliant/passed/ok → green, noncompliant/failed/error → red, otherwise amber).
 */
export function statusIcon(status: string): React.ReactNode {
  const s = (status ?? "").toLowerCase();
  if (s === "compliant" || s === "passed" || s === "ok")
    return <CheckCircle2 size={13} strokeWidth={1.75} className="text-success flex-shrink-0" />;
  if (s === "noncompliant" || s === "failed" || s === "error")
    return <XCircle size={13} strokeWidth={1.75} className="text-destructive flex-shrink-0" />;
  return <AlertCircle size={13} strokeWidth={1.75} className="text-warning flex-shrink-0" />;
}

/**
 * Returns a Badge variant for capability statuses.
 */
export function capabilityStatusVariant(
  status: string,
): "soft-success" | "soft-warning" | "outline" {
  if (status === "Active") return "soft-success";
  if (status === "Pending Deletion") return "soft-warning";
  return "outline";
}

/**
 * Returns a Badge variant for compliance-style statuses.
 */
export function complianceStatusVariant(
  status: string,
): "soft-success" | "soft-warning" | "destructive" | "outline" {
  const s = (status ?? "").toLowerCase();
  if (s === "compliant" || s === "passed" || s === "ok") return "soft-success";
  if (s === "noncompliant" || s === "failed" || s === "error") return "destructive";
  return "soft-warning";
}
