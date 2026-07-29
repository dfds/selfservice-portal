import type { TourDefinition } from "../types";
import { waitForSelector } from "../tourDom";

const DEMO_WORKLOAD = "gh-member-activity-api";
const DEMO_ROUTE = "/services/hellman/ssu-mgmt-dznts/gh-member-activity-api";
const DEMO_FILTERED = `/services?q=${DEMO_WORKLOAD}`;

async function expandDemoRow() {
  await waitForSelector('[data-tour="services-table-head"]');
  const row = document.querySelector('[data-tour="services-row"]');
  const alreadyOpen = Array.from(
    document.querySelectorAll('[data-tour="services-detail-panel"]'),
  ).some((el) => el.getBoundingClientRect().height > 0);
  if (row && !alreadyOpen) (row as HTMLElement).click();
}

export const tour_2026_q3_service_catalogue: TourDefinition = {
  id: "2026-q3-service-catalogue",
  release: "2026-Q3",
  releaseDate: "2026-07-29",
  title: "Getting started with the service catalogue",
  summary:
    "A tour of the catalogue: what the headline numbers mean, switching between table and graph, the four ways to filter, how to shape the table's columns — then down into a single workload's detail page.",
  category: "feature",
  visibleTo: ({ isCloudEngineer }) => isCloudEngineer,
  steps: [
    {
      target: '[data-tour="services-stats"]',
      title: "Your platform at a glance",
      body: "These five numbers are global — every workload the catalogue discovers across all clusters, not just what the table below is currently showing. Workloads is the total, then the health split (healthy, degraded, down), and Ingress counts how many hostnames are exposed to the outside world.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-view-toggle"]',
      title: "Two ways to look at it",
      body: "Table is for scanning and filtering — one row per workload. Graph draws the dependency map so you can see what talks to what. Your choice lands in the URL, so a filtered view is a link you can paste to a colleague.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-search"]',
      title: "Search across names",
      body: "Free-text search over workload name, namespace and owning capability. It matches on partial words, so 'ship' finds shipping-api.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-quick-filters"]',
      title: "One-click presets",
      body: "Toggle straight to the workloads that need attention, or to the ones that have documentation. Selecting a preset replaces the previous one — All clears it.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-tag-filters"]',
      title: "Filter by capability metadata",
      body: "Add a tag filter to narrow by the metadata your capabilities carry — cost centre, criticality, team, anything you've defined. Stack several and use the AND / OR switch to decide whether a workload has to match all of them or any of them.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-add-filter"]',
      title: "Filter by what a workload actually is",
      body: "Add filter opens a list of dimensions read straight from the cluster: runtime, GitOps managed, image repo and tag, source repo, ingress host, database, Kafka topic, and what it connects to. Pick values and they become removable chips under the toolbar, so you can always see what's narrowing the list.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-columns"]',
      title: "Choose your columns",
      body: "The table carries more columns than fit comfortably. Hide the ones you don't care about and the layout is remembered for next time — it's your view, not a shared default.",
      route: "/services",
      position: "left",
      skipIf: ({ isMobile }) => isMobile,
    },
    {
      target: '[data-tour="services-table-head"]',
      title: "Sort and resize",
      body: "Click any header to sort by it, click again to reverse — the sort order goes into the URL along with your filters. Drag the right edge of a header to resize a column; a Reset widths button appears next to Columns once you've changed anything.",
      route: "/services",
      position: "bottom",
      skipIf: ({ isMobile }) => isMobile,
    },
    {
      target: '[data-tour="services-search"]',
      title: "Let's follow one workload",
      body: `We've searched for ${DEMO_WORKLOAD}, so the table is down to a single row. Notice the filter went into the URL — that's what makes a narrowed catalogue shareable.`,
      route: DEMO_FILTERED,
      position: "bottom",
      skipIf: ({ isMobile }) => isMobile,
    },
    {
      target: '[data-tour="services-row"]',
      title: "Expand a row in place",
      body: "Click anywhere on a row to expand it. No navigation, no losing your filters — the row opens underneath itself.",
      route: DEMO_FILTERED,
      position: "bottom",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="services-detail-panel"]',
      title: "A glance at the workload",
      body: "Enough to answer most questions without leaving the list: what kind of workload it is, its runtime, live inbound traffic and error rate, the description and links its owners wrote, the repo and GitOps revision it was deployed from, and the Kubernetes Services in front of it.",
      route: DEMO_FILTERED,
      position: "top",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="services-full-details"]',
      title: "When you need the whole picture",
      body: "Two ways through to the full page: View full details at the bottom of the expanded panel, or the Open button at the right-hand end of the row itself. Let's take it.",
      route: DEMO_FILTERED,
      position: "top",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="service-observability"]',
      title: "Logs and metrics, already scoped",
      body: "Metrics and Logs jump into Grafana pre-filtered to this exact workload — the right cluster, namespace and pod selector are already applied, so there's no dashboard hunting or hand-written query.",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#placement",
      title: "Exactly what is running, and where",
      body: "Kind, cluster and namespace — plus the container image and the precise tag currently deployed. This is the fastest way to answer 'which version is actually out there?'.",
      route: DEMO_ROUTE,
      position: "bottom",
    },
    {
      target: "#source",
      title: "Extra detail for GitOps workloads",
      body: "When a workload is deployed through GitOps, the catalogue reads straight from the deployment tool: which application object owns it, the exact revision it's synced to, and the path in the manifest repo it came from.",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#exposed",
      title: "Where it's reachable",
      body: "Every ingress host this workload answers on, each with the Service behind it and a live reachability check — so you can tell 'exposed' from 'actually responding'.",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#services",
      title: "The Kubernetes Services",
      body: "The Services sitting in front of the workload, their type and ports, and any external hosts routed to them.",
      route: DEMO_ROUTE,
      position: "bottom",
    },
    {
      target: "#dependencies",
      title: "What it depends on",
      body: "Kafka topics it produces to or consumes from, and the databases it talks to — discovered from the workload itself, not from a document someone has to remember to update.",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#graph",
      title: "What it talks to",
      body: "Runtime connections observed to and from this workload — everything it calls, and everything that calls it — drawn over its own structure. That's the tour: from a platform-wide count down to a single workload's live dependencies.",
      route: DEMO_ROUTE,
      position: "top",
    },
  ],
};
