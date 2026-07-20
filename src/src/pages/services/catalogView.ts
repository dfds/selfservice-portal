import type {
  CatalogApplication,
  CatalogKafkaTopicRef,
  CatalogReachability,
  CatalogService,
} from "@/state/remote/queries/catalog";

export type WorkloadStatus = "healthy" | "degraded" | "down";

export function workloadStatus(app: CatalogApplication): WorkloadStatus {
  const ready = app.readyReplicas ?? 0;
  const desired = app.replicas ?? 0;
  if (ready >= desired && desired > 0) return "healthy";
  if (ready > 0) return "degraded";
  return "down";
}

export type TrafficHealth = "healthy" | "degraded" | "erroring";

export interface TrafficView {
  reqRate: number;
  errorPct: number; // 0..100, for display
  health: TrafficHealth | null; // null below the volume floor
}

const TRAFFIC_HEALTH_FLOOR = 0.05;

export function trafficFor(app: CatalogApplication): TrafficView | null {
  const reqRate = app.requestRate ?? 0;
  if (reqRate <= 0) return null;
  const errorRatio = app.errorRate ?? 0;
  const errorPct = errorRatio * 100;
  let health: TrafficHealth | null = null;
  if (reqRate >= TRAFFIC_HEALTH_FLOOR) {
    if (errorRatio < 0.01) health = "healthy";
    else if (errorRatio < 0.05) health = "degraded";
    else health = "erroring";
  }
  return { reqRate, errorPct, health };
}

export function formatReqRateValue(reqRate: number): string {
  const digits = reqRate >= 10 ? 0 : reqRate >= 1 ? 1 : 2;
  return reqRate.toFixed(digits);
}

// Compact "42.3 req/s" / "0.42 req/s" formatting for the Inbound chip.
export function formatReqRate(reqRate: number): string {
  return `${formatReqRateValue(reqRate)} req/s`;
}

// Compact "none" / "0.4%" / "12%" formatting for the Errors chip.
export function formatErrorPct(errorPct: number): string {
  if (errorPct <= 0) return "none";
  if (errorPct < 1) return `${errorPct.toFixed(1)}%`;
  return `${Math.round(errorPct)}%`;
}

export function errorChipClass(health: TrafficHealth | null): string {
  switch (health) {
    case "healthy":
      return "text-success";
    case "degraded":
      return "text-warning";
    case "erroring":
      return "text-error";
    default:
      return "";
  }
}

export function workloadDetailHref(app: CatalogApplication): string {
  return `/services/${encodeURIComponent(app.cluster)}/${encodeURIComponent(
    app.namespace,
  )}/${encodeURIComponent(app.name)}`;
}

export function ingressHostsFor(services: CatalogService[]): string[] {
  const hosts = new Set<string>();
  for (const svc of services || []) {
    for (const h of svc.externalHosts || []) hosts.add(h);
  }
  return [...hosts];
}

export interface ServiceUrl {
  host: string;
  path: string;
  url: string;
}

export function serviceUrlsFor(svc: CatalogService): ServiceUrl[] {
  const routes = svc.routes || [];
  const seen = new Set<string>();
  const out: ServiceUrl[] = [];

  for (const host of svc.externalHosts || []) {
    const paths = new Set<string>();
    for (const r of routes) {
      if ((r.hosts || []).includes(host)) {
        for (const p of r.pathPrefixes || []) if (p) paths.add(p);
      }
    }
    const emit = (path: string) => {
      const url = `https://${host}${path}`;
      if (seen.has(url)) return;
      seen.add(url);
      out.push({ host, path, url });
    };
    if (paths.size === 0) emit("");
    else for (const p of paths) emit(p);
  }

  return out;
}

export interface WorkloadUrl extends ServiceUrl {
  service: string;
}

export function workloadUrlsFor(app: CatalogApplication): WorkloadUrl[] {
  const out: WorkloadUrl[] = [];
  for (const svc of app.services || []) {
    for (const u of serviceUrlsFor(svc)) out.push({ ...u, service: svc.name });
  }
  return out;
}

export type ReachabilityStatus = "reachable" | "unreachable" | "unknown";

// Five-state aggregate for a whole workload's exposure:
//   none        — no external hosts at all (nothing to probe)
//   reachable   — every exposed host reachable
//   unreachable — every exposed host failed (responded but wrong status)
//   unknown     — every exposed host indeterminate / not-yet-probed
//   partial     — any other mix
export type WorkloadReachability =
  | "none"
  | "reachable"
  | "unreachable"
  | "unknown"
  | "partial";

export function reachabilityForHost(
  services: CatalogService[],
  host: string,
): CatalogReachability | undefined {
  for (const svc of services || []) {
    for (const r of svc.reachability || []) {
      if (r.host === host) return r;
    }
  }
  return undefined;
}

export function reachabilityForUrl(
  services: CatalogService[],
  url: WorkloadUrl,
): CatalogReachability | undefined {
  return reachabilityForHost(services, url.host);
}

export function workloadReachability(
  app: CatalogApplication,
): WorkloadReachability {
  const services = app.services || [];
  const hosts = ingressHostsFor(services);
  if (hosts.length === 0) return "none";

  let reachable = 0;
  let unreachable = 0;
  let unknown = 0;
  for (const host of hosts) {
    const verdict = reachabilityForHost(services, host);
    const status: ReachabilityStatus = verdict?.status ?? "unknown";
    if (status === "reachable") reachable++;
    else if (status === "unreachable") unreachable++;
    else unknown++;
  }

  const total = hosts.length;
  if (reachable === total) return "reachable";
  if (unreachable === total) return "unreachable";
  if (unknown === total) return "unknown";
  return "partial";
}

export function reachabilityBadgeVariant(
  state: WorkloadReachability | ReachabilityStatus,
): "soft-success" | "soft-warning" | "destructive" | "outline" {
  switch (state) {
    case "reachable":
      return "soft-success";
    case "partial":
      return "soft-warning";
    case "unreachable":
      return "destructive";
    default:
      return "outline";
  }
}

export function reachabilityRank(state: WorkloadReachability): number {
  switch (state) {
    case "unreachable":
      return 0;
    case "partial":
      return 1;
    case "unknown":
      return 2;
    case "reachable":
      return 3;
    default:
      return 4; // none
  }
}

export function reachabilityTooltip(app: CatalogApplication): string {
  const services = app.services || [];
  const hosts = ingressHostsFor(services);
  if (hosts.length === 0) return "";
  return hosts
    .map((host) => {
      const v = reachabilityForHost(services, host);
      const status: ReachabilityStatus = v?.status ?? "unknown";
      const code = v && v.statusCode > 0 ? ` (${v.statusCode})` : "";
      const when = v?.checkedAt
        ? ` · ${new Date(v.checkedAt).toLocaleString()}`
        : "";
      return `${host} — ${status}${code}${when}`;
    })
    .join("\n");
}

export function reachabilityStatusIconKey(status: ReachabilityStatus): string {
  if (status === "reachable") return "ok";
  if (status === "unreachable") return "failed";
  return "unknown";
}

export function reachabilityResultTooltip(v: {
  status: string;
  statusCode: number;
  expected: string;
  reason: string;
  checkedAt: string;
}): string {
  const parts: string[] = [v.status];
  if (v.statusCode > 0) parts[0] += ` (${v.statusCode})`;
  if (v.expected) parts.push(`expected ${v.expected}`);
  if (v.reason) parts.push(v.reason);
  if (v.checkedAt) parts.push(new Date(v.checkedAt).toLocaleString());
  return parts.join(" · ");
}

export function reachabilityLabel(state: WorkloadReachability): string {
  switch (state) {
    case "reachable":
      return "Reachable";
    case "partial":
      return "Partial";
    case "unreachable":
      return "Unreachable";
    case "unknown":
      return "Unknown";
    default:
      return "";
  }
}

export function repoUrlsFor(app: CatalogApplication): string[] {
  return (app.repoUrls || []).filter(Boolean);
}

export function repoShortName(url: string): string {
  try {
    const { pathname, hostname } = new URL(url);
    const parts = pathname
      .replace(/\.git$/, "")
      .split("/")
      .filter(Boolean);
    if (parts.length >= 2) return parts.slice(-2).join("/");
    return parts.join("/") || hostname;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function hasApiDocs(app: CatalogApplication): boolean {
  return (app.services || []).some((s) => (s.apiDocs || []).length > 0);
}

export function apiDocsCountFor(app: CatalogApplication): number {
  let n = 0;
  for (const s of app.services || []) n += (s.apiDocs || []).length;
  return n;
}

const DB_SYSTEM_LABELS: Record<string, string> = {
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
  redis: "Redis",
  mongodb: "MongoDB",
  "microsoft.sql_server": "SQL Server",
  mssql: "SQL Server",
  sqlserver: "SQL Server",
  other_sql: "SQL",
  elasticsearch: "Elasticsearch",
  opensearch: "OpenSearch",
  cassandra: "Cassandra",
  cosmosdb: "Cosmos DB",
  dynamodb: "DynamoDB",
  "oracle.db": "Oracle",
  oracle: "Oracle",
  db2: "Db2",
  sqlite: "SQLite",
  clickhouse: "ClickHouse",
  cockroachdb: "CockroachDB",
  couchbase: "Couchbase",
  couchdb: "CouchDB",
  memcached: "Memcached",
  influxdb: "InfluxDB",
  neo4j: "Neo4j",
};

export function prettifyDbSystem(system: string | null | undefined): string {
  if (!system) return "";
  const key = system.trim().toLowerCase();
  if (key in DB_SYSTEM_LABELS) return DB_SYSTEM_LABELS[key];
  return key.replace(/[._]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function grafanaMetricsUrl(
  base: string,
  app: CatalogApplication,
): string {
  const b = base.replace(/\/$/, "");
  const params = new URLSearchParams({
    orgId: "1",
    from: "now-7d",
    to: "now",
    timezone: "browser",
    "var-datasource": "grafanacloud-prom",
    "var-cluster": app.cluster,
    "var-namespace": app.namespace,
    "var-type": "$__all",
    "var-workload": app.name,
  });
  return `${b}/d/emzcqc8/ssu-catalog-workload?${params.toString()}`;
}

export function grafanaLogsUrl(base: string, app: CatalogApplication): string {
  const b = base.replace(/\/$/, "");
  const expr = `{cluster="${app.cluster}", namespace="${app.namespace}", pod=~"${app.name}.+"} |= \`\``;
  const panes = {
    kxo: {
      datasource: "grafanacloud-logs",
      queries: [
        {
          refId: "A",
          expr,
          queryType: "range",
          datasource: { type: "loki", uid: "grafanacloud-logs" },
          editorMode: "builder",
          direction: "forward",
        },
      ],
      range: { from: "now-3h", to: "now" },
      panelsState: { logs: { sortOrder: "Ascending" } },
      compact: false,
    },
  };
  const params = new URLSearchParams({
    schemaVersion: "1",
    panes: JSON.stringify(panes),
    orgId: "1",
  });
  return `${b}/explore?${params.toString()}`;
}

const KAFKA_BROKER_HOST_SUFFIXES = [
  ".amazonaws.com",
  ".confluent.cloud",
  ".sentry.io",
  ".compute.internal",
  ".internal",
  ".local",
  ".svc",
];

function looksLikeKafkaBrokerEndpoint(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  // A ':' (host:port) or '/' can't appear in a topic name → it's an endpoint.
  if (/[^a-z0-9._-]/.test(n)) return true;
  // A bare IPv4 address.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(n)) return true;
  // AWS EC2 public DNS name (ec2-<ip-with-dashes>.<region>.compute.amazonaws.com).
  if (/^ec2(-\d+){4}\./.test(n)) return true;
  return KAFKA_BROKER_HOST_SUFFIXES.some((s) => n.endsWith(s));
}

function hasMessagingDirection(direction: string | null | undefined): boolean {
  const d = (direction || "").trim().toLowerCase();
  return d === "consume" || d === "produce";
}

export function isRealKafkaTopic(t: CatalogKafkaTopicRef): boolean {
  if (!t.name || !t.name.trim()) return false;
  if (hasMessagingDirection(t.direction)) return true;
  return !looksLikeKafkaBrokerEndpoint(t.name);
}

export function kafkaTopicsFor(
  app: CatalogApplication,
): CatalogKafkaTopicRef[] {
  return (app.kafkaTopics || []).filter(isRealKafkaTopic);
}
