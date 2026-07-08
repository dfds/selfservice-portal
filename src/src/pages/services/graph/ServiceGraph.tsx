import React, { useEffect, useMemo, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  CatalogApplication,
  CatalogDependency,
} from "@/state/remote/queries/catalog";
import {
  buildGraph,
  NODE_KIND_STYLES,
  STRUCTURAL_EDGE_COLOR,
  MAX_NODES,
  type BuiltGraph,
  type NodeKind,
} from "./graphModel";

let dagreRegistered = false;
function ensureDagre() {
  if (!dagreRegistered) {
    cytoscape.use(dagre);
    dagreRegistered = true;
  }
}

const KIND_ORDER: NodeKind[] = [
  "capability",
  "namespace",
  "workload",
  "service",
  "database",
  "kafka",
  "external",
];

function Legend({
  kinds,
  hasDependencies,
}: {
  kinds: NodeKind[];
  hasDependencies: boolean;
}) {
  return (
    <div className="absolute z-10 top-2 left-2 flex flex-wrap items-center gap-x-3 gap-y-1 max-w-[calc(100%-1rem)] rounded-[6px] border border-card bg-surface/90 backdrop-blur px-2.5 py-1.5 shadow-card">
      {kinds.map((k) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 text-[0.625rem] font-mono text-secondary"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-[3px] border"
            style={{ borderColor: NODE_KIND_STYLES[k].accent }}
          />
          {NODE_KIND_STYLES[k].label}
        </span>
      ))}
      {hasDependencies && (
        <span className="inline-flex items-center gap-1 text-[0.625rem] font-mono text-muted border-l border-divider pl-3">
          <span
            className="inline-block w-4 border-t-2 border-dashed"
            style={{ borderColor: "#0e9f6e" }}
          />
          runtime dependency
        </span>
      )}
    </div>
  );
}

export function GraphCanvas({
  graph,
  heightClass = "h-[600px]",
  emptyMessage = "Nothing to connect for the current selection — no services, dependencies, or other links were found.",
}: {
  graph: BuiltGraph;
  heightClass?: string;
  emptyMessage?: string;
}) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const presentKinds = useMemo(() => {
    const seen = new Set<NodeKind>();
    for (const n of graph.nodes) seen.add(n.kind);
    return KIND_ORDER.filter((k) => seen.has(k));
  }, [graph.nodes]);

  const hasDependencyEdges = useMemo(
    () => graph.edges.some((e) => e.cls === "dependency"),
    [graph.edges],
  );

  useEffect(() => {
    if (graph.capped || graph.edges.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    ensureDagre();

    const isDark = document.documentElement.classList.contains("dark");
    const nodeBg = isDark ? "#1e293b" : "#ffffff";
    const nodeText = isDark ? "#e2e8f0" : "#334155";
    const labelBg = isDark ? "#0f172a" : "#ffffff";
    const labelText = isDark ? "#94a3b8" : "#64748b";

    const elements = [
      ...graph.nodes.map((n) => ({
        data: {
          id: n.id,
          kind: n.kind,
          label: n.sublabel ? `${n.label}\n${n.sublabel}` : n.label,
        },
      })),
      ...graph.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          cls: e.cls,
          color: e.color,
          label: e.label ?? "",
        },
      })),
    ];

    const kindStyles = KIND_ORDER.map((kind) => ({
      selector: `node[kind="${kind}"]`,
      style: { "border-color": NODE_KIND_STYLES[kind].accent },
    }));

    const style: cytoscape.Stylesheet[] = [
      {
        selector: "node",
        style: {
          shape: "round-rectangle",
          "background-color": nodeBg,
          "border-width": 2,
          "border-color": STRUCTURAL_EDGE_COLOR,
          label: "data(label)",
          color: nodeText,
          "font-size": 11,
          "font-weight": 600,
          "text-valign": "center",
          "text-halign": "center",
          "text-wrap": "wrap",
          "text-max-width": 150,
          width: "label",
          height: "label",
          padding: "9px",
        },
      },
      ...kindStyles,
      {
        selector: "edge",
        style: {
          width: 1.5,
          "line-color": "data(color)",
          "target-arrow-color": "data(color)",
          "target-arrow-shape": "triangle",
          "arrow-scale": 0.85,
          "curve-style": "bezier",
        },
      },
      {
        selector: 'edge[cls="dependency"]',
        style: { "line-style": "dashed", width: 2 },
      },
      {
        selector: "edge[label]",
        style: {
          label: "data(label)",
          "font-size": 9,
          "font-family": "monospace",
          color: labelText,
          "text-background-color": labelBg,
          "text-background-opacity": 0.85,
          "text-background-padding": 2,
          "text-rotation": "autorotate",
        },
      },
    ] as cytoscape.Stylesheet[];

    const cy = cytoscape({
      container,
      elements,
      style,
      layout: {
        name: "dagre",
        rankDir: "LR",
        nodeSep: 22,
        rankSep: 84,
        edgeSep: 12,
        fit: true,
        padding: 26,
      } as cytoscape.LayoutOptions,
      minZoom: 0.15,
      maxZoom: 1.6,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
    });

    return () => cy.destroy();
  }, [graph, theme]);

  if (graph.capped) {
    return (
      <div
        className={cn(
          "rounded-[8px] border border-card bg-surface-muted flex flex-col items-center justify-center text-center gap-3 px-6",
          heightClass,
        )}
      >
        <AlertTriangle size={28} className="text-[#ed8800]" />
        <div className="text-sm font-medium text-primary">
          Too much to draw at once
        </div>
        <p className="text-[0.8125rem] text-secondary max-w-md">
          This selection resolves to {graph.totalNodes.toLocaleString()} nodes,
          above the {MAX_NODES}-node limit for the graph. Narrow your selection
          with the filters above — by namespace, capability, or a label selector
          — to render the connections.
        </p>
      </div>
    );
  }

  if (graph.edges.length === 0) {
    return (
      <div className="h-[240px] rounded-[8px] border border-card bg-surface-muted flex items-center justify-center px-6">
        <EmptyState>{emptyMessage}</EmptyState>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-[8px] border border-card overflow-hidden bg-surface-muted",
        heightClass,
      )}
    >
      <Legend kinds={presentKinds} hasDependencies={hasDependencyEdges} />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

interface ServiceGraphProps {
  apps: CatalogApplication[];
  dependencies: CatalogDependency[];
}

export default function ServiceGraph({
  apps,
  dependencies,
}: ServiceGraphProps) {
  const graph = useMemo(
    () => buildGraph(apps, dependencies),
    [apps, dependencies],
  );
  return <GraphCanvas graph={graph} />;
}
