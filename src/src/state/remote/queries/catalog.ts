import { createSsuQuery, createSsuParamQuery } from "../queryFactory";

export interface ResourceLink {
  href: string;
  rel?: string;
  allow?: string[];
}

export interface CatalogMeta {
  catalogAvailable: boolean;
  clustersQueried: number;
  clustersFailed: number;
  collectedAt?: string;
  publishedAt?: string;
}

export interface CatalogContainer {
  name: string;
  image: string;
  imageTag: string;
}

export interface CatalogServicePort {
  name: string;
  port: number;
  targetPort: string;
  protocol: string;
}

export interface CatalogRoute {
  name: string;
  kind: string;
  hosts: string[];
  pathPrefixes: string[];
  entryPoints: string[];
  tls: boolean;
}

export interface CatalogApiDoc {
  port: number;
  path: string;
  url: string;
  externallyAvailable: boolean;
  externalUrl: string;
}

export interface CatalogReachability {
  host: string;
  url: string;
  status: "reachable" | "unreachable" | "unknown";
  statusCode: number;
  expected: string;
  reason: string;
  checkedAt: string;
}

export interface CatalogService {
  name: string;
  type: string;
  clusterIP: string;
  ports: CatalogServicePort[];
  externalHosts: string[];
  routes: CatalogRoute[];
  apiDocs: CatalogApiDoc[];
  reachability?: CatalogReachability[];
}

export interface CatalogDeploymentSource {
  tool: string;
  repoUrl: string;
  path: string;
  revision: string;
  appName: string;
}

export interface CatalogLink {
  label: string;
  url: string;
}

export interface CatalogAppMetadata {
  description: string;
  links: CatalogLink[];
}

export interface CatalogKafkaTopicRef {
  name: string;
  direction: string;
  source: string;
}

export interface CatalogDatabaseRef {
  system: string;
  name: string;
  source: string;
}

export interface CatalogApplication {
  cluster: string;
  namespace: string;
  name: string;
  kind: string;
  capabilityId: string;
  capabilityName?: string | null;
  replicas: number;
  readyReplicas: number;
  containers: CatalogContainer[];
  repoUrls: string[];
  deploymentSource?: CatalogDeploymentSource | null;
  metadata?: CatalogAppMetadata | null;
  owner: string;
  contact: string;
  services: CatalogService[];
  kafkaTopics: CatalogKafkaTopicRef[];
  databases: CatalogDatabaseRef[];
  runtime?: string;
  /** Inbound HTTP throughput (req/s), Beyla-observed; absent when no inbound HTTP seen. */
  requestRate?: number;
  /** 5xx share of inbound traffic (0..1); meaningful only with requestRate > 0. */
  errorRate?: number;
  _links?: { capability?: ResourceLink | null };
}

export interface CatalogNamespace {
  cluster: string;
  name: string;
  capabilityId: string;
  capabilityName?: string | null;
  awsAccountId: string;
  contextId: string;
  costCentre: string;
  labels?: Record<string, string> | null;
  _links?: { capability?: ResourceLink | null };
}

export interface CatalogDependencyNode {
  cluster: string;
  namespace: string;
  service: string;
  external: boolean;
}

export interface CatalogDependency {
  source: CatalogDependencyNode;
  target: CatalogDependencyNode;
  type: string;
  origin: string;
  details: string;
}

export interface CatalogEnvelope<T> {
  data: T[];
  meta: CatalogMeta;
  _links?: { self?: ResourceLink | null };
}

export type CatalogApplicationsResponse = CatalogEnvelope<CatalogApplication>;
export type CatalogNamespacesResponse = CatalogEnvelope<CatalogNamespace>;
export type CatalogDependenciesResponse = CatalogEnvelope<CatalogDependency>;

export const useCapabilityDeployments = createSsuParamQuery<
  string,
  CatalogApplicationsResponse
>({
  queryKey: (id) => ["capabilities", id, "deployments"],
  urlSegments: (id) => ["capabilities", id, "deployments"],
  enabled: (id) => !!id,
  staleTime: 30_000,
});

export const useCatalogApplications =
  createSsuQuery<CatalogApplicationsResponse>({
    queryKey: ["catalog", "applications"],
    urlSegments: ["catalog", "applications"],
    staleTime: 30_000,
  });

export const useCatalogApplicationsByNamespace = createSsuParamQuery<
  string,
  CatalogApplicationsResponse
>({
  queryKey: (namespace) => ["catalog", "applications", { namespace }],
  urlSegments: (namespace) => [
    "catalog",
    `applications?namespace=${encodeURIComponent(namespace)}`,
  ],
  enabled: (namespace) => !!namespace,
  staleTime: 30_000,
});

export const useCatalogNamespaces = createSsuQuery<CatalogNamespacesResponse>({
  queryKey: ["catalog", "namespaces"],
  urlSegments: ["catalog", "namespaces"],
  staleTime: 30_000,
});

export const useCatalogDependencies =
  createSsuQuery<CatalogDependenciesResponse>({
    queryKey: ["catalog", "dependencies"],
    urlSegments: ["catalog", "dependencies"],
    staleTime: 30_000,
  });
