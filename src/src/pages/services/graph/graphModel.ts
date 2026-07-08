import type {
  CatalogApplication,
  CatalogDependency,
  CatalogDependencyNode,
} from "@/state/remote/queries/catalog";
import { kafkaTopicsFor, prettifyDbSystem } from "@/pages/services/catalogView";

export type NodeKind =
  | "capability"
  | "namespace"
  | "workload"
  | "service"
  | "database"
  | "kafka"
  | "external";

export type EdgeClass = "structural" | "dependency";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  cls: EdgeClass;
  color: string;
  label?: string;
}

export interface NodeKindStyle {
  label: string;
  accent: string;
}

export const NODE_KIND_STYLES: Record<NodeKind, NodeKindStyle> = {
  capability: { label: "Capability", accent: "#0e7cc1" },
  namespace: { label: "Namespace", accent: "#64748b" },
  workload: { label: "Workload", accent: "#1b63c1" },
  service: { label: "Service", accent: "#0e9f6e" },
  database: { label: "Database", accent: "#7c3aed" },
  kafka: { label: "Kafka topic", accent: "#ed8800" },
  external: { label: "External", accent: "#94a3b8" },
};

export const STRUCTURAL_EDGE_COLOR = "#cbd5e1";

export function dependencyEdgeColor(origin: string): string {
  const o = (origin || "").toLowerCase();
  if (
    o.includes("otel") ||
    o.includes("servicegraph") ||
    o.includes("service-graph")
  )
    return "#0e9f6e";
  if (o.includes("network") || o.includes("policy")) return "#ed8800";
  return "#1b63c1";
}

export const MAX_NODES = 500;

export function externalDescriptor(service: string): {
  label: string;
  sublabel: string;
} {
  const s = (service || "").trim().toLowerCase();
  if (s === "" || s === "outgoing")
    return { label: "External", sublabel: "unattributed egress" };
  if (s === "incoming")
    return { label: "External", sublabel: "unattributed ingress" };
  return { label: service, sublabel: "external" };
}

function isExternalDatastoreEdge(
  node: CatalogDependencyNode,
  type: string,
): boolean {
  return node.external && (type === "database" || type === "kafka");
}

// ── Node id helpers ───────────────────────────────────────────────────────────

const capId = (capabilityId: string) => `cap:${capabilityId}`;
const nsId = (cluster: string, namespace: string) =>
  `ns:${cluster}/${namespace}`;
const wlId = (cluster: string, namespace: string, name: string) =>
  `wl:${cluster}/${namespace}/${name}`;
const svcId = (cluster: string, namespace: string, service: string) =>
  `svc:${cluster}/${namespace}/${service}`;
const dbId = (
  cluster: string,
  namespace: string,
  system: string,
  name: string,
) => `db:${cluster}/${namespace}/${system}:${name}`;
const kafkaId = (name: string) => `kafka:${name}`;
const extId = (namespace: string, service: string) =>
  `ext:${namespace || "?"}/${service}`;

export interface BuiltGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalNodes: number;
  capped: boolean;
}

type AddNode = (node: GraphNode) => void;
type AddEdge = (
  source: string,
  target: string,
  opts: { key: string; cls: EdgeClass; color: string; label?: string },
) => void;

function addWorkloadStructure(
  app: CatalogApplication,
  addNode: AddNode,
  addEdge: AddEdge,
) {
  const cap = capId(app.capabilityId);
  const ns = nsId(app.cluster, app.namespace);
  const wl = wlId(app.cluster, app.namespace, app.name);

  if (app.capabilityId) {
    addNode({
      id: cap,
      kind: "capability",
      label: app.capabilityName || app.capabilityId,
      sublabel: "capability",
    });
  }
  addNode({
    id: ns,
    kind: "namespace",
    label: app.namespace,
    sublabel: app.cluster,
  });
  addNode({
    id: wl,
    kind: "workload",
    label: app.name,
    sublabel: app.kind || "workload",
  });

  if (app.capabilityId) {
    addEdge(cap, ns, {
      key: "owns",
      cls: "structural",
      color: STRUCTURAL_EDGE_COLOR,
    });
  }
  addEdge(ns, wl, {
    key: "contains",
    cls: "structural",
    color: STRUCTURAL_EDGE_COLOR,
  });

  for (const svc of app.services || []) {
    const sid = svcId(app.cluster, app.namespace, svc.name);
    addNode({
      id: sid,
      kind: "service",
      label: svc.name,
      sublabel: svc.type || "service",
    });
    addEdge(wl, sid, {
      key: "exposes",
      cls: "structural",
      color: STRUCTURAL_EDGE_COLOR,
    });
  }

  for (const db of app.databases || []) {
    const id = dbId(app.cluster, app.namespace, db.system, db.name);
    addNode({
      id,
      kind: "database",
      label: db.name,
      sublabel: prettifyDbSystem(db.system) || "database",
    });
    addEdge(wl, id, {
      key: "uses-db",
      cls: "structural",
      color: NODE_KIND_STYLES.database.accent,
    });
  }

  for (const topic of kafkaTopicsFor(app)) {
    const id = kafkaId(topic.name);
    addNode({
      id,
      kind: "kafka",
      label: topic.name,
      sublabel: topic.direction || "topic",
    });

    const consumes = /consume|in\b|read|subscribe/i.test(topic.direction || "");
    if (consumes) {
      addEdge(id, wl, {
        key: "topic",
        cls: "structural",
        color: NODE_KIND_STYLES.kafka.accent,
        label: topic.direction,
      });
    } else {
      addEdge(wl, id, {
        key: "topic",
        cls: "structural",
        color: NODE_KIND_STYLES.kafka.accent,
        label: topic.direction,
      });
    }
  }
}

function newGraphAccumulator() {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  const addNode: AddNode = (node) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  };
  const addEdge: AddEdge = (source, target, opts) => {
    const id = `${source}->${target}#${opts.key}`;
    if (edges.has(id)) return;
    edges.set(id, {
      id,
      source,
      target,
      cls: opts.cls,
      color: opts.color,
      label: opts.label,
    });
  };

  return { nodes, edges, addNode, addEdge };
}

function finalize(
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>,
): BuiltGraph {
  const total = nodes.size;
  const capped = total > MAX_NODES;
  return {
    nodes: capped ? [] : [...nodes.values()],
    edges: capped ? [] : [...edges.values()],
    totalNodes: total,
    capped,
  };
}

export function buildGraph(
  apps: CatalogApplication[],
  dependencies: CatalogDependency[],
): BuiltGraph {
  const { nodes, edges, addNode, addEdge } = newGraphAccumulator();

  for (const app of apps) addWorkloadStructure(app, addNode, addEdge);

  // ── Dependency overlay ──
  for (const dep of dependencies) {
    // Skip external DB/Kafka — already drawn as structural datastore nodes.
    if (isExternalDatastoreEdge(dep.target, dep.type)) continue;

    const sid = wlId(
      dep.source.cluster,
      dep.source.namespace,
      dep.source.service,
    );
    if (!nodes.has(sid)) continue;

    let tid: string;
    if (dep.target.external) {
      tid = extId(dep.target.namespace, dep.target.service);
      const { label, sublabel } = externalDescriptor(dep.target.service);
      addNode({ id: tid, kind: "external", label, sublabel });
    } else {
      tid = wlId(dep.target.cluster, dep.target.namespace, dep.target.service);
      if (!nodes.has(tid)) continue;
    }

    addEdge(sid, tid, {
      key: `dep:${dep.type || dep.origin || "conn"}`,
      cls: "dependency",
      color: dependencyEdgeColor(dep.origin),
      label: dep.type && dep.type !== "service" ? dep.type : undefined,
    });
  }

  return finalize(nodes, edges);
}

export function buildWorkloadGraph(
  focus: CatalogApplication,
  dependencies: CatalogDependency[],
): BuiltGraph {
  const { nodes, edges, addNode, addEdge } = newGraphAccumulator();

  addWorkloadStructure(focus, addNode, addEdge);
  const focusWl = wlId(focus.cluster, focus.namespace, focus.name);

  const isFocus = (n: CatalogDependencyNode): boolean =>
    !n.external &&
    n.namespace === focus.namespace &&
    n.service === focus.name &&
    (!n.cluster || !focus.cluster || n.cluster === focus.cluster);

  const neighbourNode = (n: CatalogDependencyNode): string => {
    if (n.external) {
      const id = extId(n.namespace, n.service);
      const { label, sublabel } = externalDescriptor(n.service);
      addNode({ id, kind: "external", label, sublabel });
      return id;
    }
    const id = wlId(n.cluster, n.namespace, n.service);
    addNode({
      id,
      kind: "workload",
      label: n.service,
      sublabel: n.namespace,
    });
    return id;
  };

  for (const dep of dependencies) {
    const srcIsFocus = isFocus(dep.source);
    const dstIsFocus = isFocus(dep.target);
    if (!srcIsFocus && !dstIsFocus) continue;

    if (
      isExternalDatastoreEdge(dep.source, dep.type) ||
      isExternalDatastoreEdge(dep.target, dep.type)
    )
      continue;

    const sid = srcIsFocus ? focusWl : neighbourNode(dep.source);
    const tid = dstIsFocus ? focusWl : neighbourNode(dep.target);
    if (sid === tid) continue; // self-edge from noisy data — skip

    addEdge(sid, tid, {
      key: `dep:${dep.type || dep.origin || "conn"}`,
      cls: "dependency",
      color: dependencyEdgeColor(dep.origin),
      label: dep.type && dep.type !== "service" ? dep.type : undefined,
    });
  }

  return finalize(nodes, edges);
}

export interface ConnectionEndpoint {
  key: string; // stable dedupe id (node id)
  kind: NodeKind; // for the row icon/accent (workload | database | kafka | external)
  label: string;
  sublabel: string;
  type: string; // dep.type verbatim (service | database | kafka | ...)
}

export interface WorkloadConnections {
  calls: ConnectionEndpoint[]; // focus → endpoint
  calledBy: ConnectionEndpoint[]; // endpoint → focus
}

function describeEndpoint(
  n: CatalogDependencyNode,
  type: string,
): ConnectionEndpoint {
  if (n.external) {
    const { label, sublabel } = externalDescriptor(n.service);
    return {
      key: extId(n.namespace, n.service),
      kind: "external",
      label,
      sublabel,
      type,
    };
  }
  const t = (type || "").toLowerCase();
  const kind: NodeKind =
    t === "database" ? "database" : t === "kafka" ? "kafka" : "workload";
  return {
    key: wlId(n.cluster, n.namespace, n.service),
    kind,
    label: n.service,
    sublabel: n.namespace,
    type,
  };
}

export function workloadConnections(
  focus: CatalogApplication,
  dependencies: CatalogDependency[],
): WorkloadConnections {
  const isFocus = (n: CatalogDependencyNode): boolean =>
    !n.external &&
    n.namespace === focus.namespace &&
    n.service === focus.name &&
    (!n.cluster || !focus.cluster || n.cluster === focus.cluster);

  const calls = new Map<string, ConnectionEndpoint>();
  const calledBy = new Map<string, ConnectionEndpoint>();

  for (const dep of dependencies) {
    const srcIsFocus = isFocus(dep.source);
    const dstIsFocus = isFocus(dep.target);
    if (!srcIsFocus && !dstIsFocus) continue;
    // External DB/Kafka are shown as the Dependencies badges, not connections.
    if (
      isExternalDatastoreEdge(dep.source, dep.type) ||
      isExternalDatastoreEdge(dep.target, dep.type)
    )
      continue;
    if (srcIsFocus && dstIsFocus) continue; // self-edge — skip

    if (srcIsFocus) {
      const ep = describeEndpoint(dep.target, dep.type);
      if (!calls.has(ep.key)) calls.set(ep.key, ep);
    } else {
      const ep = describeEndpoint(dep.source, dep.type);
      if (!calledBy.has(ep.key)) calledBy.set(ep.key, ep);
    }
  }

  return { calls: [...calls.values()], calledBy: [...calledBy.values()] };
}
