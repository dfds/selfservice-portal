/**
 * One-sentence explanations for every label the service catalogue shows —
 * column headers, row-panel section labels, detail-page rail keys and tiles.
 *
 * Keyed by the lowercased label text so the same word explains itself the same
 * way wherever it appears. Look up with {@link hintFor}.
 */
export const LABEL_HINTS: Record<string, string> = {
  // ── Table columns ──────────────────────────────────────────────────────────
  workload:
    "A detected Kubernetes resource (Deployment, StatefulSet, or Service) running in a capability's namespace.",
  capability: "The capability that owns this workload.",
  location: "The cluster and namespace where the workload runs.",
  health:
    "Replica readiness: how many of the desired pod replicas are currently ready. Orange if some are not ready, red if none are.",
  "req/s": "Inbound HTTP request rate (Beyla-observed).",
  errors: "Share of inbound requests returning 5xx errors (Beyla-observed).",
  ingress:
    "External hostnames the workload is exposed on. Colour reflects probe reachability: green = all reachable, orange = partial, red = unreachable, grey = unknown.",
  "api docs":
    "Number of API documentation specs (e.g. OpenAPI) discovered for the workload.",

  // ── Workload attributes ────────────────────────────────────────────────────
  type: "The kind of Kubernetes resource this workload is — Deployment, StatefulSet, DaemonSet, or a standalone Service.",
  runtime:
    "The language runtime Beyla fingerprinted for this workload (go, dotnet, java, …). Absent when it could not be detected.",
  activity:
    "Inbound HTTP throughput and the 5xx share of that traffic, observed by Beyla over the recent lookback window.",
  description:
    "Author-provided summary of the workload, set via the dfds.cloud/description annotation.",
  links:
    "Author-provided reference links — runbooks, dashboards, docs — set via dfds.cloud/link.<label> annotations.",
  status:
    "Overall workload health, derived from how many of the desired replicas are ready.",
  "replicas ready": "Ready pod replicas out of the desired replica count.",

  // ── Source / deployment ────────────────────────────────────────────────────
  source:
    "The GitOps tool and revision that deployed this workload, plus its source repositories.",
  gitops: "The GitOps controller that manages this workload — Argo CD or Flux.",
  tool: "The GitOps controller that deployed this workload — Argo CD or Flux.",
  app: "The Argo CD / Flux application this workload was deployed as part of.",
  revision:
    "The Git commit the GitOps controller last reconciled this workload to.",
  path: "The path inside the source repository the manifests were rendered from.",
  image: "The container image and tag the workload is currently running.",

  // ── Placement ──────────────────────────────────────────────────────────────
  cluster: "The Kubernetes cluster the workload runs in.",
  namespace: "The Kubernetes namespace the workload runs in.",

  // ── Networking ─────────────────────────────────────────────────────────────
  services:
    "The Kubernetes Services fronting this workload. Background consumers with no inbound traffic have none.",
  "exposed at":
    "The external hostnames and paths this Service is routed on, from its Ingress or Traefik IngressRoute.",
  inbound: "Inbound HTTP request rate (Beyla-observed).",

  // ── Dependencies / connections ─────────────────────────────────────────────
  "kafka topics":
    "Kafka topics this workload produces to or consumes from, inferred from OpenTelemetry messaging traces.",
  databases:
    "Databases this workload talks to, inferred from OpenTelemetry client traces. Best-effort — only instrumented calls appear.",
  calls:
    "Services, databases, and endpoints this workload was observed calling.",
  "called by": "Workloads observed sending traffic to this workload.",

  // ── Detail-page sections ───────────────────────────────────────────────────
  placement: "Where and how the workload is deployed in Kubernetes.",
  dependencies:
    "Kafka topics and databases this workload was observed talking to, from OpenTelemetry traces.",
  connections:
    "The workload's structure overlaid with the runtime traffic observed to and from it.",
  owner: "The capability responsible for this workload.",
  "at a glance": "Key facts about this workload, summarised.",
};

/** Returns the hint for a label, or undefined when none is defined. */
export function hintFor(label: string): string | undefined {
  return LABEL_HINTS[label.trim().toLowerCase()];
}
