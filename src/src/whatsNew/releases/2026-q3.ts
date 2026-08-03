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
    "A tour of the catalogue: what the headline numbers mean, switching between table and graph, the ways to narrow the list, how to shape the table - then down into a single workload's detail page.",
  category: "feature",
  steps: [
    {
      target: '[data-tour="services-stats"]',
      title: "Platform stats",
      body: "These five numbers are global - every workload the catalogue discovers across all clusters. For details about a specific number, hover the label below it.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-view-toggle"]',
      title: "Two ways to look at it",
      body: "Table is for querying and filtering. Graph draws the dependency map so you can see what talks to what.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-toolbar"]',
      title: "Filtering options",
      body: "The search bar is free text covering the eworkload name, namespace, capability name. The 'Add filter' button gives you a list of options to filter from, both workload specific data as well as Capability tags.",
      route: "/services",
      position: "bottom",
    },
    {
      target: '[data-tour="services-table-head"]',
      title: "Sort and resize",
      body: "Click any header to sort by it, click again to reverse.  Drag the right edge of a header to resize a column; a Reset widths button appears next to Columns if you want to go back to default settings.",
      route: "/services",
      position: "bottom",
      skipIf: ({ isMobile }) => isMobile,
    },
    {
      target: '[data-tour="services-search"]',
      title: "Let's follow one workload",
      body: `We've searched for ${DEMO_WORKLOAD}, so the table is down to a single row. Notice the filter went into the URL, so you can easily share it with a colleague`,
      route: DEMO_FILTERED,
      position: "bottom",
      skipIf: ({ isMobile }) => isMobile,
    },
    {
      target: '[data-tour="services-row"]',
      title: "Expand a row for additional details",
      body: "Click anywhere on a row to expand it",
      route: DEMO_FILTERED,
      position: "bottom",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="services-detail-panel"]',
      title: "A glance at the workload",
      body: "Enough to answer most questions without leaving the list: description, its runtime, live inbound traffic and error rate, etc..",
      route: DEMO_FILTERED,
      position: "top",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="services-full-details"]',
      title: "All the data",
      body: "If you want all available data for a workload, click on either the 'Open' button in the row itself, or with the expanded row click on 'View full details'. Let's click it.",
      route: DEMO_FILTERED,
      position: "top",
      optional: true,
      skipIf: ({ isMobile }) => isMobile,
      onEnter: expandDemoRow,
    },
    {
      target: '[data-tour="service-observability"]',
      title: "Logs and metrics",
      body: "Metrics and Logs jump into Grafana pre-filtered to this exact workload",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#placement",
      title: "Exactly what is running and where",
      body: "Kind, cluster, namespace plus the container image and the precise tag currently deployed",
      route: DEMO_ROUTE,
      position: "bottom",
    },
    {
      target: "#source",
      title: "Extra detail for GitOps workloads",
      body: "When a workload is deployed through GitOps, the catalogue surfaces that additional metadata",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#exposed",
      title: "Where it's reachable",
      body: "Every ingress host this workload answers on, each with the Service behind it and a live reachability check",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#services",
      title: "The Kubernetes Services",
      body: "The Services sitting in front of the workload, their type and ports, and any external hosts routed to them",
      route: DEMO_ROUTE,
      position: "bottom",
    },
    {
      target: "#dependencies",
      title: "What it depends on",
      body: "Kafka topics it produces to or consumes from, and the databases it talks to discovered from the workload itself. Subject to data available from Beyla.",
      route: DEMO_ROUTE,
      position: "bottom",
      optional: true,
    },
    {
      target: "#graph",
      title: "What it talks to",
      body: "Runtime connections observed to and from this workload. Everything it calls, and everything that calls it. Subject to data available from Beyla",
      route: DEMO_ROUTE,
      position: "top",
    },
  ],
};
