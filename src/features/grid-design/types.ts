import type { GraphNode, GraphEdge } from "@/components/grid/graph-canvas";
import type { GNode, GStructure, ActiveEdge } from "../designer/types";

export interface DesignerSnapshot {
  structures: GStructure[];
  nodes: GNode[];
  edges: ActiveEdge[];
  nextId: number;
}

export interface GridDesign {
  nodes: GraphNode[];
  edges: GraphEdge[];
  center: { x: number; y: number };
  designer: DesignerSnapshot;
}
