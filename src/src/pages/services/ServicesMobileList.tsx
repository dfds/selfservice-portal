import React from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Database,
  FileText,
  Globe,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CatalogApplication } from "@/state/remote/queries/catalog";
import {
  workloadStatus,
  workloadDetailHref,
  ingressHostsFor,
  apiDocsCountFor,
  trafficFor,
  formatErrorPct,
  errorChipClass,
  workloadReachability,
  reachabilityBadgeVariant,
  reachabilityLabel,
  reachabilityTooltip,
  type WorkloadStatus,
} from "./catalogView";

const leadBorder: Record<WorkloadStatus, string> = {
  healthy: "border-l-card",
  degraded: "border-l-warning",
  down: "border-l-error",
};
const healthText: Record<WorkloadStatus, string> = {
  healthy: "text-primary",
  degraded: "text-warning",
  down: "text-error",
};
const barFill: Record<WorkloadStatus, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

export function ServicesMobileList({
  apps,
  hideCapabilityColumn = false,
  showErrors = false,
  onAddDescription,
}: {
  apps: CatalogApplication[];
  hideCapabilityColumn?: boolean;
  showErrors?: boolean;
  onAddDescription?: () => void;
}) {
  return (
    <div className="space-y-2">
      {apps.map((app, i) => {
        const st = workloadStatus(app);
        const ready = app.readyReplicas ?? 0;
        const desired = app.replicas ?? 0;
        const pct = desired > 0 ? Math.round((100 * ready) / desired) : 0;
        const hosts = ingressHostsFor(app.services || []);
        const docs = apiDocsCountFor(app);
        const traffic = showErrors ? trafficFor(app) : null;
        const reach = workloadReachability(app);
        const description = app.metadata?.description?.trim();
        const KindIcon = app.kind === "StatefulSet" ? Database : Boxes;

        return (
          <Link
            key={`${app.cluster}/${app.namespace}/${app.name}/${i}`}
            to={workloadDetailHref(app)}
            className={cn(
              "block rounded-[8px] border border-card bg-surface px-3 py-2.5 border-l-[3px]",
              leadBorder[st],
              "hover:bg-surface-subtle transition-colors",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <KindIcon size={14} className="text-muted flex-none" />
              <span className="font-semibold text-primary text-[0.875rem] truncate">
                {app.name}
              </span>
              <span className="font-mono text-[10px] text-muted flex-none">
                {app.kind}
              </span>
              <ChevronRight
                size={15}
                className="text-muted flex-none ml-auto"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-3 flex-wrap font-mono text-[11px] text-secondary">
              <span className="truncate">
                <span className="text-primary font-semibold">
                  {app.cluster}
                </span>
                /{app.namespace}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={healthText[st]}>
                  {ready}/{desired}
                </span>
                <span className="w-[36px] h-[5px] rounded-[3px] bg-divider overflow-hidden">
                  <span
                    className={cn("block h-full", barFill[st])}
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  hosts.length ? "text-secondary" : "text-muted",
                )}
              >
                <Globe size={11} />
                {hosts.length}
              </span>
              {reach !== "none" && (
                <Badge
                  variant={reachabilityBadgeVariant(reach)}
                  className="font-mono tracking-[0.06em]"
                  title={reachabilityTooltip(app)}
                >
                  {reachabilityLabel(reach)}
                </Badge>
              )}
              {traffic && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    traffic.errorPct <= 0
                      ? "text-muted"
                      : errorChipClass(traffic.health) || "text-secondary",
                  )}
                  title="5xx share of inbound HTTP"
                >
                  <AlertTriangle size={11} />
                  {formatErrorPct(traffic.errorPct)}
                </span>
              )}
            </div>

            {description ? (
              <p className="mt-1.5 text-[0.8125rem] text-secondary leading-snug line-clamp-2">
                {description}
              </p>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddDescription?.();
                }}
                className="mt-1.5 text-[11px] text-muted hover:text-action transition-colors"
              >
                Enrich your services to add a description
              </button>
            )}

            {!hideCapabilityColumn &&
              (app.capabilityName || app.capabilityId) && (
                <div className="mt-1 text-[11px] text-action truncate">
                  {app.capabilityName || app.capabilityId}
                </div>
              )}
          </Link>
        );
      })}
    </div>
  );
}
