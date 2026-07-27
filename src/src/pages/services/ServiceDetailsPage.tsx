import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Boxes,
  Database,
  GitBranch,
  Globe,
  ExternalLink,
  LineChart,
  ScrollText,
  Radio,
  Link2,
} from "lucide-react";
import PageSection from "@/components/PageSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code } from "@/components/ui/Code";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SkeletonCapabilityHeader } from "@/components/ui/skeleton";
import { LastUpdated, catalogUpdatedAt } from "@/components/ui/LastUpdated";
import { cn } from "@/lib/utils";
import {
  useCatalogApplicationsByNamespace,
  useCatalogDependencies,
} from "@/state/remote/queries/catalog";
import { ServiceItem } from "./ServiceItem";
import { WorkloadGraphView } from "./WorkloadGraphView";
import {
  workloadStatus,
  ingressHostsFor,
  kafkaTopicsFor,
  workloadUrlsFor,
  grafanaMetricsUrl,
  grafanaLogsUrl,
  reachabilityForUrl,
  reachabilityBadgeVariant,
  reachabilityLabel,
  reachabilityResultTooltip,
  repoUrlsFor,
  repoShortName,
  prettifyDbSystem,
  trafficFor,
  formatReqRate,
  formatErrorPct,
  errorChipClass,
  type WorkloadStatus,
} from "./catalogView";
import {
  workloadConnections,
  NODE_KIND_STYLES,
  type ConnectionEndpoint,
} from "./graph/graphModel";

const statusLabel: Record<WorkloadStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
};
const statusColor: Record<WorkloadStatus, string> = {
  healthy: "text-success",
  degraded: "text-warning",
  down: "text-error",
};
const statusDot: Record<WorkloadStatus, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

const BackLink = () => (
  <Link
    to="/services"
    className="inline-flex items-center font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] no-underline hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] mb-3 transition-colors"
  >
    ← Services
  </Link>
);

export default function ServiceDetailsPage() {
  const { cluster, namespace, name } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cluster, namespace, name]);

  const appsQuery = useCatalogApplicationsByNamespace(namespace ?? "");
  const meta = appsQuery.data?.meta;
  const catalogUnavailable =
    appsQuery.isError || meta?.catalogAvailable === false;

  const depsQuery = useCatalogDependencies();

  const app = useMemo(() => {
    const list = appsQuery.data?.data ?? [];
    return list.find(
      (a) =>
        a.cluster === cluster && a.namespace === namespace && a.name === name,
    );
  }, [appsQuery.data, cluster, namespace, name]);

  const connections = useMemo(() => {
    if (!app || depsQuery.data?.meta?.catalogAvailable === false) return null;
    return workloadConnections(app, depsQuery.data?.data ?? []);
  }, [app, depsQuery.data]);

  if (!appsQuery.isFetched) {
    return (
      <div className="p-8">
        <SkeletonCapabilityHeader />
      </div>
    );
  }

  if (catalogUnavailable) {
    return (
      <div className="p-8">
        <BackLink />
        <InfoAlert variant="warning">
          The platform catalog is currently unavailable. This service can't be
          shown right now — try again later.
        </InfoAlert>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8">
        <BackLink />
        <EmptyState>
          No workload named <Code>{name}</Code> was found in{" "}
          <Code>
            {cluster}/{namespace}
          </Code>
          .
        </EmptyState>
      </div>
    );
  }

  const st = workloadStatus(app);
  const ready = app.readyReplicas ?? 0;
  const desired = app.replicas ?? 0;
  const hosts = ingressHostsFor(app.services || []);
  const urls = workloadUrlsFor(app);
  const repoUrls = repoUrlsFor(app);
  const services = app.services || [];
  const kafkaTopics = kafkaTopicsFor(app);
  const databases = app.databases || [];
  const description = app.metadata?.description?.trim();
  const links = app.metadata?.links ?? [];
  const capabilityHref = app.capabilityId
    ? `/capabilities/${encodeURIComponent(app.capabilityId)}`
    : undefined;
  const KindIcon = app.kind === "StatefulSet" ? Database : Boxes;
  const lastUpdatedAt = catalogUpdatedAt(meta, appsQuery.dataUpdatedAt);
  const traffic = trafficFor(app);
  // Grafana host is injected at build time; the observability links are hidden when it's unset
  const grafanaBase = (process.env.REACT_APP_GRAFANA_BASE_URL || "").trim();

  return (
    <div className="p-8">
      <BackLink />

      {/* Page header */}
      <div className="flex items-start gap-3 mb-5">
        <KindIcon size={22} className="text-muted flex-none mt-1" />
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold text-[#002b45] dark:text-[#e2e8f0] tracking-[-0.01em] leading-tight">
            {app.name}
          </h1>
          <LastUpdated
            updatedAt={lastUpdatedAt}
            isFetching={appsQuery.isFetching}
            className="mt-1"
          />
        </div>
        <div
          className={cn(
            "ml-auto inline-flex items-center gap-2 font-mono text-[0.8125rem] border border-card rounded-[6px] px-3 py-1.5",
            statusColor[st],
          )}
        >
          <span className={cn("w-2.5 h-2.5 rounded-full", statusDot[st])} />
          {statusLabel[st]}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {urls.length > 0 && (
          <Button asChild variant="action" size="sm">
            <a href={urls[0].url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Open
            </a>
          </Button>
        )}
        {repoUrls.map((repo) => (
          <Button key={repo} asChild variant="outline" size="sm">
            <a href={repo} target="_blank" rel="noopener noreferrer">
              <GitBranch size={14} />
              {repoUrls.length > 1 ? repoShortName(repo) : "Repo"}
            </a>
          </Button>
        ))}
        {grafanaBase && (
          <>
            <Button asChild variant="outline" size="sm">
              <a
                href={grafanaMetricsUrl(grafanaBase, app)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LineChart size={14} />
                Metrics
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={grafanaLogsUrl(grafanaBase, app)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ScrollText size={14} />
                Logs
              </a>
            </Button>
          </>
        )}
      </div>

      {/* Metric tiles */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <Tile label="Replicas ready" valueClassName={statusColor[st]}>
          {ready}/{desired}
        </Tile>
        <Tile label="Ingress">
          <span className="inline-flex items-center gap-1.5">
            <Globe size={15} className="text-muted" />
            {hosts.length}
          </span>
        </Tile>
        <Tile label="Services">{services.length}</Tile>
        <Tile label="Kafka topics">{kafkaTopics.length}</Tile>
        <Tile label="Databases">{databases.length}</Tile>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div>
          <PageSection id="placement" headline="Placement">
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-6 gap-y-3.5 m-0">
              <Def term="Type">
                <Badge variant="outline">{app.kind}</Badge>
              </Def>
              <Def term="Cluster">
                <Code>{app.cluster}</Code>
              </Def>
              <Def term="Namespace">
                <Code>{app.namespace}</Code>
              </Def>
              <Def term="Image">
                <span className="flex flex-col items-start gap-1.5 min-w-0">
                  {(app.containers || []).map((c, i) => (
                    <Code
                      key={i}
                      title={c.name}
                      className="max-w-full break-all"
                    >
                      {c.image}
                      {c.imageTag ? `:${c.imageTag}` : ""}
                    </Code>
                  ))}
                </span>
              </Def>
            </dl>
          </PageSection>

          {description && (
            <PageSection id="description" headline="Description">
              <p className="text-[0.8125rem] text-secondary leading-[1.6] whitespace-pre-line m-0">
                {description}
              </p>
            </PageSection>
          )}

          {links.length > 0 && (
            <PageSection id="links" headline="Links">
              <div className="flex flex-col gap-2">
                {links.map((l, i) => (
                  <a
                    key={`${l.label}/${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-action hover:underline font-mono text-[0.8125rem]"
                  >
                    <Link2 size={13} className="flex-none" />
                    <span className="font-semibold">{l.label || l.url}</span>
                    {l.label && (
                      <span className="text-muted truncate">
                        {l.url.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </PageSection>
          )}

          {(repoUrls.length > 0 || app.deploymentSource) && (
            <PageSection id="source" headline="Source">
              {repoUrls.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {repoUrls.map((repo) => (
                    <a
                      key={repo}
                      href={repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-action hover:underline font-mono text-[0.8125rem]"
                    >
                      <GitBranch size={13} className="flex-none" />
                      {repo.replace(/^https?:\/\//, "")}
                    </a>
                  ))}
                </div>
              )}
              {app.deploymentSource && (
                <div className="rounded-[6px] border border-divider bg-surface-muted grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-x-5 gap-y-3 px-3.5 py-3">
                  <Def term="Tool">
                    <Badge variant="outline">{app.deploymentSource.tool}</Badge>
                  </Def>
                  {app.deploymentSource.appName && (
                    <Def term="App">
                      <Code>{app.deploymentSource.appName}</Code>
                    </Def>
                  )}
                  {app.deploymentSource.revision && (
                    <Def term="Revision">
                      <Code>{app.deploymentSource.revision.slice(0, 12)}</Code>
                    </Def>
                  )}
                  {app.deploymentSource.path && (
                    <Def term="Path">
                      <Code>{app.deploymentSource.path}</Code>
                    </Def>
                  )}
                </div>
              )}
            </PageSection>
          )}

          {urls.length > 0 && (
            <PageSection
              id="exposed"
              headline={`Exposed at · ${hosts.length} host${
                hosts.length === 1 ? "" : "s"
              }`}
            >
              <div className="flex flex-col gap-2">
                {urls.map((u, i) => {
                  const verdict = reachabilityForUrl(services, u);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2 border border-divider rounded-[6px] bg-surface-muted"
                    >
                      <Globe size={15} className="text-action flex-none" />
                      <a
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[0.8125rem] font-medium text-action hover:underline truncate"
                      >
                        {u.host}
                        {u.path || ""}
                      </a>
                      <div className="ml-auto flex items-center gap-2.5 flex-none">
                        {verdict && (
                          <Badge
                            variant={reachabilityBadgeVariant(verdict.status)}
                            className="font-mono tracking-[0.06em]"
                            title={reachabilityResultTooltip(verdict)}
                          >
                            {reachabilityLabel(verdict.status)}
                          </Badge>
                        )}
                        <span className="font-mono text-[11px] text-muted">
                          {u.service}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PageSection>
          )}

          <PageSection id="services" headline="Services">
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
          </PageSection>

          {(kafkaTopics.length > 0 || databases.length > 0) && (
            <PageSection id="dependencies" headline="Dependencies">
              {kafkaTopics.length > 0 && (
                <div className="mb-3.5">
                  <SectionLabel className="mb-2 block">
                    Kafka topics
                  </SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {kafkaTopics.map((t, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="inline-flex items-center gap-1"
                        title={`${t.direction}${
                          t.source ? ` · ${t.source}` : ""
                        }`}
                      >
                        <Radio size={11} />
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {databases.length > 0 && (
                <div>
                  <SectionLabel className="mb-2 block">Databases</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {databases.map((d, i) => {
                      const engine = prettifyDbSystem(d.system);
                      return (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="inline-flex items-center gap-1"
                          title={engine || d.name}
                        >
                          <Database size={11} />
                          {d.name || engine}
                          {engine && d.name && engine !== d.name && (
                            <span className="font-normal text-muted">
                              {engine}
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </PageSection>
          )}

          <PageSection id="graph" headline="Connections">
            <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-3 mt-0">
              Runtime connections observed to and from this workload's services,
              overlaid on its structure. Dependency edges appear when telemetry
              is available.
            </p>
            <WorkloadGraphView app={app} />
            {connections &&
              (connections.calls.length > 0 ||
                connections.calledBy.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <ConnectionList
                    title="Calls"
                    endpoints={connections.calls}
                    emptyText="No observed outbound calls."
                  />
                  <ConnectionList
                    title="Called by"
                    endpoints={connections.calledBy}
                    emptyText="No observed callers."
                  />
                </div>
              )}
          </PageSection>
        </div>

        <div>
          <PageSection id="owner" headline="Owner">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                name={app.capabilityName || app.capabilityId}
                size="md"
              />
              <div className="min-w-0">
                <div className="font-semibold text-[0.8125rem] text-primary truncate">
                  {app.capabilityName || app.capabilityId}
                </div>
                {capabilityHref ? (
                  <Link
                    to={capabilityHref}
                    className="font-mono text-[11px] text-action hover:underline truncate block"
                  >
                    {app.capabilityId}
                  </Link>
                ) : (
                  <span className="font-mono text-[11px] text-muted truncate block">
                    {app.capabilityId}
                  </span>
                )}
              </div>
            </div>
          </PageSection>

          <PageSection id="at-a-glance" headline="At a glance">
            {app.deploymentSource?.tool && (
              <RailRow k="GitOps" v={app.deploymentSource.tool} />
            )}
            {app.deploymentSource?.revision && (
              <RailRow
                k="Revision"
                v={app.deploymentSource.revision.slice(0, 7)}
              />
            )}
            {app.runtime && <RailRow k="Runtime" v={app.runtime} />}
            {traffic && (
              <RailRow k="Inbound" v={formatReqRate(traffic.reqRate)} />
            )}
            {traffic && (
              <RailRow
                k="Errors"
                v={
                  <span className={errorChipClass(traffic.health)}>
                    {formatErrorPct(traffic.errorPct)}
                  </span>
                }
              />
            )}
            <RailRow
              k="Status"
              v={<span className={statusColor[st]}>{statusLabel[st]}</span>}
            />
          </PageSection>
        </div>
      </div>
    </div>
  );
}

function endpointIcon(kind: ConnectionEndpoint["kind"], color: string) {
  const Icon =
    kind === "database"
      ? Database
      : kind === "kafka"
      ? Radio
      : kind === "external"
      ? Globe
      : Boxes;
  return <Icon size={14} className="flex-none" style={{ color }} />;
}

const CONNECTION_ROW_HEIGHT = 38; // row (≈32px) + 6px gap

function ConnectionList({
  title,
  endpoints,
  emptyText,
}: {
  title: string;
  endpoints: ConnectionEndpoint[];
  emptyText: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: endpoints.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CONNECTION_ROW_HEIGHT,
    overscan: 12,
  });

  return (
    <div>
      <SectionLabel className="mb-2 flex items-center gap-1.5">
        <span>{title}</span>
        {endpoints.length > 0 && (
          <span className="text-muted font-normal">
            {endpoints.length.toLocaleString()}
          </span>
        )}
      </SectionLabel>
      {endpoints.length > 0 ? (
        <div
          ref={scrollRef}
          className="overflow-y-auto max-h-[22rem] -mr-1 pr-1"
        >
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((vi) => {
              const ep = endpoints[vi.index];
              return (
                <div
                  key={ep.key}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full pb-1.5"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border border-divider rounded-[6px] bg-surface-muted min-w-0">
                    {endpointIcon(ep.kind, NODE_KIND_STYLES[ep.kind].accent)}
                    <span className="font-mono text-[0.8125rem] text-primary truncate">
                      {ep.label}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-muted truncate flex-none max-w-[45%]">
                      {ep.sublabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[0.8125rem] text-muted m-0">{emptyText}</p>
      )}
    </div>
  );
}

function Tile({
  label,
  children,
  valueClassName,
}: {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="border border-card rounded-[8px] px-4 py-2.5 min-w-[118px] bg-surface">
      <div
        className={cn(
          "font-mono text-[1.25rem] font-semibold leading-tight text-primary",
          valueClassName,
        )}
      >
        {children}
      </div>
      <div className="mt-1 font-mono text-[0.5625rem] tracking-[0.06em] uppercase text-muted">
        {label}
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted mb-1">
        {term}
      </dt>
      <dd className="m-0 text-[0.8125rem]">{children}</dd>
    </div>
  );
}

function RailRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-t border-divider first:border-t-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
        {k}
      </span>
      <span className="font-mono text-[12px] text-primary text-right">{v}</span>
    </div>
  );
}
