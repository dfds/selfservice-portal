import { useQuery } from "@tanstack/react-query";

const BASE = "https://dfdsit.statuspage.io/api/v2";

// Each service maps its statuspage group/component ID plus all child IDs so
// that recently-resolved incident detection covers sub-components too.
const SERVICES = [
  {
    id: "dxv8nztl04m7",
    label: "GitHub",
    componentIds: [
      "dxv8nztl04m7",
      "1dlqc294gxnp",
      "wphkyvc0k8kt",
      "42fv12rhy7c1",
      "0462v706jspf",
      "x5p7zg6ks10g",
    ],
  },
  {
    id: "j1spbl66p9w8",
    label: "AWS",
    componentIds: [
      "j1spbl66p9w8",
      "m5fss2g67gt8",
      "4vhl3vnd359h",
      "5cr14cxnks6g",
      "pmzgcl6tnm16",
      "8zn7nr99pt1b",
      "2w1sw974pb2q",
      "s8grgj073pr2",
    ],
  },
  {
    id: "59v1sm560927",
    label: "Azure DevOps",
    componentIds: ["59v1sm560927"],
  },
  {
    id: "kdq6r15420d8",
    label: "Confluent Cloud",
    componentIds: ["kdq6r15420d8", "kwc6g4nhm4qs", "pxxv9fwjx3k8", "yg910dtp6pcm"],
  },
  {
    id: "vc80n7vqvmx7",
    label: "Developer Selfservice",
    componentIds: [
      "vc80n7vqvmx7",
      "1f1m0vgdf9vq",
      "0t56w27p5kjz",
      "rmz89jpn8dx9",
      "lwh4b3pcbcms",
    ],
  },
  {
    id: "nwjyk7qsb2g9",
    label: "Kubernetes",
    componentIds: [
      "nwjyk7qsb2g9",
      "3dy04djqjfnj",
      "f1tb47l2pkq3",
      "1njqytc7vssx",
      "m3sqxtmmw24c",
      "rfqt9nbsz672",
    ],
  },
];

export type ServiceStatus =
  | "operational"
  | "recently_resolved"
  | "degraded"
  | "loading"
  | "error";

export interface ServiceStatusItem {
  id: string;
  label: string;
  status: ServiceStatus;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`statuspage HTTP ${res.status}`);
  return res.json();
}

export function useStatuspageStatus(): ServiceStatusItem[] {
  const summaryQuery = useQuery({
    queryKey: ["statuspage", "summary"],
    queryFn: () => fetchJson(`${BASE}/summary.json`),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });

  const incidentsQuery = useQuery({
    queryKey: ["statuspage", "incidents"],
    queryFn: () => fetchJson(`${BASE}/incidents.json?per_page=25`),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });

  if (summaryQuery.isError || incidentsQuery.isError) {
    return SERVICES.map(({ id, label }) => ({ id, label, status: "error" }));
  }

  if (!summaryQuery.data || !incidentsQuery.data) {
    return SERVICES.map(({ id, label }) => ({ id, label, status: "loading" }));
  }

  const components: any[] = summaryQuery.data.components ?? [];
  const incidents: any[] = incidentsQuery.data.incidents ?? [];
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Build set of component IDs that appear in incidents resolved within 2 hours
  const recentlyAffected = new Set<string>();
  for (const incident of incidents) {
    if (
      incident.status === "resolved" &&
      incident.resolved_at &&
      new Date(incident.resolved_at) > twoHoursAgo
    ) {
      for (const comp of incident.components ?? []) {
        recentlyAffected.add(comp.id);
      }
    }
  }

  return SERVICES.map(({ id, label, componentIds }) => {
    const comp = components.find((c: any) => c.id === id);
    if (!comp) return { id, label, status: "error" };

    if (comp.status !== "operational") {
      return { id, label, status: "degraded" };
    }

    const hadRecentIncident = componentIds.some((cid) => recentlyAffected.has(cid));
    return { id, label, status: hadRecentIncident ? "recently_resolved" : "operational" };
  });
}
