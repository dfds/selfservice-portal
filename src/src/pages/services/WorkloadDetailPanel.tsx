import React from "react";
import { Link } from "react-router-dom";
import { GitBranch, ArrowUpRight, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Code } from "@/components/ui/Code";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { CatalogApplication } from "@/state/remote/queries/catalog";
import { ServiceItem } from "./ServiceItem";
import {
  workloadDetailHref,
  repoUrlsFor,
  trafficFor,
  formatReqRate,
  formatErrorPct,
  errorChipClass,
} from "./catalogView";

export function WorkloadDetailPanel({
  app,
  onAddDescription,
}: {
  app: CatalogApplication;
  onAddDescription?: () => void;
}) {
  const services = app.services || [];
  const src = app.deploymentSource;
  const repoUrls = repoUrlsFor(app);
  const description = app.metadata?.description?.trim();
  const links = app.metadata?.links ?? [];
  const traffic = trafficFor(app);

  return (
    <div className="px-4 py-3.5 space-y-3.5">
      <div>
        <SectionLabel className="mb-1.5 block">Type</SectionLabel>
        {app.kind ? (
          <Badge variant="outline">{app.kind}</Badge>
        ) : (
          <span className="text-muted">—</span>
        )}
      </div>

      {app.runtime && (
        <div>
          <SectionLabel className="mb-1.5 block">Runtime</SectionLabel>
          <Badge variant="outline">{app.runtime}</Badge>
        </div>
      )}

      {traffic && (
        <div>
          <SectionLabel className="mb-1.5 block">Activity</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              Inbound {formatReqRate(traffic.reqRate)}
            </Badge>
            <Badge variant="outline" className={errorChipClass(traffic.health)}>
              Errors {formatErrorPct(traffic.errorPct)}
            </Badge>
          </div>
        </div>
      )}

      <div>
        <SectionLabel className="mb-1.5 block">Description</SectionLabel>
        {description ? (
          <p className="text-[0.8125rem] text-secondary leading-[1.6] whitespace-pre-line">
            {description}
          </p>
        ) : (
          <p className="text-[0.8125rem] text-muted">
            No description set.{" "}
            <button
              type="button"
              onClick={onAddDescription}
              className="text-action hover:underline"
            >
              Enrich your service
            </button>{" "}
            to add one.
          </p>
        )}
      </div>

      {links.length > 0 && (
        <div>
          <SectionLabel className="mb-1.5 block">Links</SectionLabel>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {links.map((l, i) => (
              <a
                key={`${l.label}/${i}`}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-action hover:underline text-[0.8125rem]"
              >
                <LinkIcon size={12} />
                <span>{l.label || l.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {(repoUrls.length > 0 || src) && (
        <div>
          <SectionLabel className="mb-1.5 block">Source</SectionLabel>
          <div className="space-y-2">
            {repoUrls.map((repo) => (
              <a
                key={repo}
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-action hover:underline text-[0.8125rem]"
              >
                <GitBranch size={12} className="flex-none" />
                <span className="truncate max-w-[360px]">{repo}</span>
              </a>
            ))}
            {src?.tool && (
              <div className="rounded-[5px] border border-divider bg-surface-muted/40 px-3 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                <MetaItem label="Tool">
                  <Badge variant="outline">{src.tool}</Badge>
                </MetaItem>
                {src.appName && (
                  <MetaItem label="App">
                    <Code>{src.appName}</Code>
                  </MetaItem>
                )}
                {src.revision && (
                  <MetaItem label="Revision">
                    <Code>{src.revision.slice(0, 12)}</Code>
                  </MetaItem>
                )}
                {src.path && (
                  <MetaItem label="Path">
                    <Code>{src.path}</Code>
                  </MetaItem>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <SectionLabel className="mb-1.5 block">Services</SectionLabel>
        {services.length > 0 ? (
          <div className="space-y-2">
            {services.map((svc, i) => (
              <ServiceItem key={`${svc.name}/${i}`} svc={svc} />
            ))}
          </div>
        ) : (
          <p className="text-[0.8125rem] text-muted">
            No Kubernetes Service — internal workload.
          </p>
        )}
      </div>

      <Link
        to={workloadDetailHref(app)}
        className="inline-flex items-center gap-1 text-action hover:underline font-mono text-[0.75rem]"
      >
        View full details
        <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}
