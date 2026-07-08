import type {
  CatalogApplication,
  CatalogDependency,
  CatalogNamespace,
} from "@/state/remote/queries/catalog";
import {
  ingressHostsFor,
  kafkaTopicsFor,
  prettifyDbSystem,
  repoShortName,
} from "./catalogView";

export type HasDocsFilter = "all" | "yes" | "no";

export interface LabelSelector {
  key: string;
  value: string;
}

export interface ServiceFilters {
  search: string;
  namespaces: string[];
  capabilities: string[];
  kinds: string[];
  hasDocs: HasDocsFilter;
  selectors: LabelSelector[];
}

export const EMPTY_FILTERS: ServiceFilters = {
  search: "",
  namespaces: [],
  capabilities: [],
  kinds: [],
  hasDocs: "all",
  selectors: [],
};

export function filtersAreEmpty(f: ServiceFilters): boolean {
  return (
    !f.search.trim() &&
    f.namespaces.length === 0 &&
    f.capabilities.length === 0 &&
    f.kinds.length === 0 &&
    f.hasDocs === "all" &&
    f.selectors.length === 0
  );
}

export type NamespaceLabelIndex = Map<string, Record<string, string>>;

const nsKey = (cluster: string, namespace: string) => `${cluster}/${namespace}`;

export function buildNamespaceLabelIndex(
  namespaces: CatalogNamespace[],
): NamespaceLabelIndex {
  const index: NamespaceLabelIndex = new Map();
  for (const ns of namespaces) {
    if (ns.labels && Object.keys(ns.labels).length > 0) {
      index.set(nsKey(ns.cluster, ns.name), ns.labels);
    }
  }
  return index;
}

export function appHasDocs(app: CatalogApplication): boolean {
  return (app.services || []).some((s) => (s.apiDocs || []).length > 0);
}

export function labelKeys(index: NamespaceLabelIndex): string[] {
  const keys = new Set<string>();
  for (const labels of index.values()) {
    for (const k of Object.keys(labels)) keys.add(k);
  }
  return [...keys].sort();
}

export function labelValues(index: NamespaceLabelIndex, key: string): string[] {
  const values = new Set<string>();
  for (const labels of index.values()) {
    if (key in labels) values.add(labels[key]);
  }
  return [...values].sort();
}

export interface Option {
  value: string;
  label: string;
}

export function namespaceOptions(apps: CatalogApplication[]): Option[] {
  const seen = new Set<string>();
  for (const app of apps) if (app.namespace) seen.add(app.namespace);
  return [...seen].sort().map((n) => ({ value: n, label: n }));
}

export function capabilityOptions(apps: CatalogApplication[]): Option[] {
  const byId = new Map<string, string>();
  for (const app of apps) {
    if (!app.capabilityId) continue;
    const label = app.capabilityName || app.capabilityId;
    if (!byId.has(app.capabilityId) || app.capabilityName) {
      byId.set(app.capabilityId, label);
    }
  }
  return [...byId.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function kindOptions(apps: CatalogApplication[]): Option[] {
  const seen = new Set<string>();
  for (const app of apps) if (app.kind) seen.add(app.kind);
  return [...seen].sort().map((k) => ({ value: k, label: k }));
}

export function applyFilters(
  apps: CatalogApplication[],
  filters: ServiceFilters,
  labelIndex: NamespaceLabelIndex,
): CatalogApplication[] {
  const q = filters.search.trim().toLowerCase();
  const nsSet = new Set(filters.namespaces);
  const capSet = new Set(filters.capabilities);
  const kindSet = new Set(filters.kinds);

  return apps.filter((app) => {
    if (q && !app.name?.toLowerCase().includes(q)) return false;
    if (nsSet.size && !nsSet.has(app.namespace)) return false;
    if (capSet.size && !capSet.has(app.capabilityId)) return false;
    if (kindSet.size && !kindSet.has(app.kind)) return false;

    if (filters.hasDocs !== "all") {
      const docs = appHasDocs(app);
      if (filters.hasDocs === "yes" && !docs) return false;
      if (filters.hasDocs === "no" && docs) return false;
    }

    if (filters.selectors.length) {
      const labels = labelIndex.get(nsKey(app.cluster, app.namespace)) ?? {};
      for (const sel of filters.selectors) {
        if (sel.value === "") {
          if (!(sel.key in labels)) return false;
        } else if (labels[sel.key] !== sel.value) {
          return false;
        }
      }
    }

    return true;
  });
}

export type FacetKey =
  | "runtime"
  | "gitops"
  | "image"
  | "tag"
  | "repo"
  | "ingress"
  | "db"
  | "kafka"
  | "connects";

export const FACET_KEYS: FacetKey[] = [
  "runtime",
  "gitops",
  "image",
  "tag",
  "repo",
  "ingress",
  "db",
  "kafka",
  "connects",
];

export const FACET_LABELS: Record<FacetKey, string> = {
  runtime: "Runtime",
  gitops: "GitOps",
  image: "Image repo",
  tag: "Image tag",
  repo: "Source repo",
  ingress: "Ingress host",
  db: "Database",
  kafka: "Kafka topic",
  connects: "Connects to",
};

export type Facets = Record<FacetKey, string[]>;

export function emptyFacets(): Facets {
  return {
    runtime: [],
    gitops: [],
    image: [],
    tag: [],
    repo: [],
    ingress: [],
    db: [],
    kafka: [],
    connects: [],
  };
}

export function facetsAreEmpty(f: Facets): boolean {
  return FACET_KEYS.every((k) => f[k].length === 0);
}

export function facetCount(f: Facets): number {
  return FACET_KEYS.reduce((n, k) => n + f[k].length, 0);
}

export function toggleFacetValue(
  f: Facets,
  key: FacetKey,
  value: string,
): Facets {
  const cur = f[key];
  const next = cur.includes(value)
    ? cur.filter((v) => v !== value)
    : [...cur, value];
  return { ...f, [key]: next };
}

export const GITOPS_UNMANAGED = "unmanaged";

const GITOPS_LABELS: Record<string, string> = {
  argocd: "Argo CD",
  "flux-helm": "Flux (Helm)",
  "flux-kustomize": "Flux (Kustomize)",
  [GITOPS_UNMANAGED]: "Unmanaged",
};

export type ConnectsIndex = Map<string, Set<string>>;

const appKey = (cluster: string, namespace: string, name: string) =>
  `${cluster}/${namespace}/${name}`;

const UNATTRIBUTED_TARGETS = new Set(["", "outgoing", "incoming"]);

function isRealExternalTarget(dep: CatalogDependency): boolean {
  if (!dep.target.external) return false;
  return !UNATTRIBUTED_TARGETS.has(
    (dep.target.service || "").trim().toLowerCase(),
  );
}

export function connectsIndex(deps: CatalogDependency[]): ConnectsIndex {
  const index: ConnectsIndex = new Map();
  for (const dep of deps) {
    if (!isRealExternalTarget(dep)) continue;
    const key = appKey(
      dep.source.cluster,
      dep.source.namespace,
      dep.source.service,
    );
    let set = index.get(key);
    if (!set) {
      set = new Set();
      index.set(key, set);
    }
    set.add(dep.target.service);
  }
  return index;
}

export function connectsOptions(deps: CatalogDependency[]): Option[] {
  const hosts = new Set<string>();
  for (const dep of deps) {
    if (!isRealExternalTarget(dep)) continue;
    hosts.add(dep.target.service);
  }
  return [...hosts].sort().map((v) => ({ value: v, label: v }));
}

function sortedOptions(
  values: Iterable<string>,
  label?: (v: string) => string,
): Option[] {
  const seen = new Set<string>();
  for (const v of values) if (v) seen.add(v);
  return [...seen]
    .map((value) => ({ value, label: label ? label(value) : value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function facetOptions(
  key: FacetKey,
  apps: CatalogApplication[],
  connectsOpts: Option[],
): Option[] {
  switch (key) {
    case "runtime":
      return sortedOptions(apps.flatMap((a) => (a.runtime ? [a.runtime] : [])));
    case "gitops": {
      const tools = new Set<string>();
      let hasUnmanaged = false;
      for (const a of apps) {
        const tool = a.deploymentSource?.tool;
        if (tool) tools.add(tool);
        else hasUnmanaged = true;
      }
      const opts = [...tools]
        .map((value) => ({ value, label: GITOPS_LABELS[value] ?? value }))
        .sort((a, b) => a.label.localeCompare(b.label));
      if (hasUnmanaged)
        opts.push({
          value: GITOPS_UNMANAGED,
          label: GITOPS_LABELS[GITOPS_UNMANAGED],
        });
      return opts;
    }
    case "image":
      return sortedOptions(
        apps.flatMap((a) => (a.containers || []).map((c) => c.image)),
      );
    case "tag":
      return sortedOptions(
        apps.flatMap((a) => (a.containers || []).map((c) => c.imageTag)),
      );
    case "repo":
      return sortedOptions(
        apps.flatMap((a) => a.repoUrls || []),
        repoShortName,
      );
    case "ingress":
      return sortedOptions(
        apps.flatMap((a) => ingressHostsFor(a.services || [])),
      );
    case "db":
      return sortedOptions(
        apps.flatMap((a) => (a.databases || []).map((d) => d.system)),
        (v) => prettifyDbSystem(v) || v,
      );
    case "kafka":
      return sortedOptions(
        apps.flatMap((a) => kafkaTopicsFor(a).map((t) => t.name)),
      );
    case "connects":
      return connectsOpts;
  }
}

function anyMatch(selected: string[], values: Iterable<string>): boolean {
  if (selected.length === 0) return true;
  const set = new Set(selected);
  for (const v of values) if (set.has(v)) return true;
  return false;
}

export function matchesFacets(
  app: CatalogApplication,
  facets: Facets,
  connects: ConnectsIndex,
): boolean {
  if (!anyMatch(facets.runtime, app.runtime ? [app.runtime] : [])) return false;

  if (facets.gitops.length) {
    const tool = app.deploymentSource?.tool || GITOPS_UNMANAGED;
    if (!facets.gitops.includes(tool)) return false;
  }

  if (
    !anyMatch(
      facets.image,
      (app.containers || []).map((c) => c.image),
    )
  )
    return false;
  if (
    !anyMatch(
      facets.tag,
      (app.containers || []).map((c) => c.imageTag),
    )
  )
    return false;
  if (!anyMatch(facets.repo, app.repoUrls || [])) return false;
  if (!anyMatch(facets.ingress, ingressHostsFor(app.services || [])))
    return false;
  if (
    !anyMatch(
      facets.db,
      (app.databases || []).map((d) => d.system),
    )
  )
    return false;
  if (
    !anyMatch(
      facets.kafka,
      kafkaTopicsFor(app).map((t) => t.name),
    )
  )
    return false;

  if (facets.connects.length) {
    const hosts =
      connects.get(appKey(app.cluster, app.namespace, app.name)) ?? EMPTY_SET;
    if (!anyMatch(facets.connects, hosts)) return false;
  }

  return true;
}

const EMPTY_SET: Set<string> = new Set();

export function applyFacets(
  apps: CatalogApplication[],
  facets: Facets,
  connects: ConnectsIndex,
): CatalogApplication[] {
  if (facetsAreEmpty(facets)) return apps;
  return apps.filter((app) => matchesFacets(app, facets, connects));
}

const FACET_KEY_SET = new Set<string>(FACET_KEYS);

export function formatFacetParam(key: FacetKey, value: string): string {
  return `${key}:${value}`;
}

export function facetsFromParams(raws: string[]): Facets {
  const f = emptyFacets();
  for (const raw of raws) {
    const colon = raw.indexOf(":");
    if (colon === -1) continue;
    const key = raw.slice(0, colon);
    const value = raw.slice(colon + 1);
    if (!value || !FACET_KEY_SET.has(key)) continue;
    const fk = key as FacetKey;
    if (!f[fk].includes(value)) f[fk].push(value);
  }
  return f;
}

export function facetsToParams(f: Facets): string[] {
  const out: string[] = [];
  for (const key of FACET_KEYS)
    for (const v of f[key]) out.push(formatFacetParam(key, v));
  return out;
}
