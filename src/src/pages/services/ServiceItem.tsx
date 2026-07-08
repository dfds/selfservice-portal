import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Code } from "@/components/ui/Code";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { CatalogService } from "@/state/remote/queries/catalog";
import {
  serviceUrlsFor,
  reachabilityForHost,
  reachabilityBadgeVariant,
  reachabilityLabel,
  reachabilityResultTooltip,
} from "./catalogView";

// A single Kubernetes Service belonging to a workload: identity + ports, the
// correct externally-exposed URLs (host + Traefik pathPrefix), and API docs.
// Shared by the inline detail panel and the single-service detail page.
export function ServiceItem({ svc }: { svc: CatalogService }) {
  const ports = svc.ports || [];
  const urls = serviceUrlsFor(svc);
  const apiDocs = svc.apiDocs || [];

  return (
    <div className="border border-divider rounded-[5px] px-3 py-2 text-[0.8125rem] space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-primary">{svc.name}</span>
        {svc.type && <Badge variant="outline">{svc.type}</Badge>}
        {svc.clusterIP && svc.clusterIP !== "None" ? (
          <Code title="Cluster IP">{svc.clusterIP}</Code>
        ) : (
          <Badge variant="secondary">headless</Badge>
        )}
        {ports.map((p, i) => (
          <Code key={i} title={p.protocol || "TCP"}>
            {p.port}
            {p.targetPort ? `→${p.targetPort}` : ""}
          </Code>
        ))}
      </div>

      {urls.length > 0 && (
        <div>
          <SectionLabel className="mb-1 block">Exposed at</SectionLabel>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {urls.map((u, i) => {
              const verdict = reachabilityForHost([svc], u.host);
              return (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-action hover:underline"
                  >
                    <ExternalLink size={11} />
                    {u.host}
                    {u.path && <span className="text-muted">{u.path}</span>}
                  </a>
                  {verdict && (
                    <Badge
                      variant={reachabilityBadgeVariant(verdict.status)}
                      className="font-mono tracking-[0.06em]"
                      title={reachabilityResultTooltip(verdict)}
                    >
                      {reachabilityLabel(verdict.status)}
                    </Badge>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {apiDocs.length > 0 && (
        <div>
          <SectionLabel className="mb-1 block">API docs</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <FileText size={11} className="text-muted" />
            {apiDocs.map((doc, i) => {
              // Externally-available docs link to the reachable ingress URL; the
              // in-cluster `url` only resolves inside the cluster, so it stays the
              // fallback (flagged "Internal only") for docs without external routes.
              const href =
                doc.externallyAvailable && doc.externalUrl
                  ? doc.externalUrl
                  : doc.url;
              return (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-action hover:underline"
                    >
                      <ExternalLink size={11} />
                      {doc.path || href}
                    </a>
                  ) : (
                    <Code>
                      {doc.path}
                      {doc.port ? `:${doc.port}` : ""}
                    </Code>
                  )}
                  {doc.externallyAvailable ? (
                    <Badge variant="soft-success">External</Badge>
                  ) : (
                    <Badge variant="secondary">Internal only</Badge>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
