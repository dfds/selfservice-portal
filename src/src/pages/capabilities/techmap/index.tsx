import React, { useCallback, useEffect } from "react";
import Dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const nodesDemo = [
  {
    title: "Cloud Engineering",
    parent: null,
  },
  {
    title: "SAAS services",
    parent: "Cloud Engineering",
  },
  {
    title: "Cloud providers",
    parent: "Cloud Engineering",
  },
];

function GenerateEdgesAndNodes() {
  let edges = new Map();
  nodesDemo.forEach((c) => {
    if (c.parent == null) {
      mapped.set(c.title, c);
    } else {
      mapped.set()
    }
  });
}

const initialEdges = [
  { id: "1-2", source: "1", target: "2", animated: true },
  { id: "1-3", source: "1", target: "3", animated: true },
];

const initialNodes = [
  {
    id: "1",
    data: { label: "Cloud Engineering" },
    position: { x: 0, y: 0 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "SAAS services" },
    position: { x: 0, y: 100 },
  },
  {
    id: "3",
    data: { label: "Cloud providers" },
    position: { x: 0, y: 100 },
  },
];

export function TechMap({ children }) {
  const { fitView } = useReactFlow();
  const layouted = getLayoutedElements(initialNodes, initialEdges, {
    direction: "TB",
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  const onLayout = useCallback(
    (direction) => {
      console.log(nodes);
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges],
  );

  window.requestAnimationFrame(() => {
    fitView();
  });

  useEffect(() => {
    onLayout("TB");
  }, [nodes, edges]);

  return (
    <>
      <div>Hi</div>
      <div style={{ height: "800px", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Background />
          {/* <Panel position="top-right">
            <button onClick={() => onLayout("TB")}>vertical layout</button>
            <button onClick={() => onLayout("LR")}>horizontal layout</button>
          </Panel> */}
        </ReactFlow>
      </div>
    </>
  );
}

export function TechMapWithProvider({ children }) {
  return (
    <>
      <ReactFlowProvider>
        <TechMap children={children} />
      </ReactFlowProvider>
    </>
  );
}

export default TechMap;
