// ── Geometry constants ────────────────────────────────────────────────────────

import { GraphEdge, GraphNode } from "@/features/sphere-grid/components/GraphCanvas";

export const RADII = [0, 60, 118, 175] as const;
export const NODE_R = 11;
// Radial layout: hub at center, up to 8 surrounding structures at compass positions.
// SPACING_ORTHO = cardinal distance; SPACING_DIAG = SPACING_ORTHO / √2 keeps
// all ring-3 bridge points equidistant (~30 px gap) from neighbours in any direction.
export const SPACING_ORTHO = 380;
export const SPACING_DIAG = Math.round(SPACING_ORTHO / Math.SQRT2); // 269
// SVG canvas: SVG_PAD(30) + SPACING_ORTHO(380) + RADII[3](175) = 585 on each side
export const HUB_X = 585;
export const HUB_Y = HUB_X;
export const SVG_W = HUB_X * 2; // 1170
export const SVG_H = SVG_W;
export const MAX_STRUCTURES = 9;

// ── Sphere types & colors ────────────────────────────────────────────────────

export const SPHERE_TYPES = ["power", "speed", "defense", "energy"] as const;
export type SphereType = (typeof SPHERE_TYPES)[number];

export const COLORS: Record<SphereType, string> = {
  power: "#ef4444",
  speed: "#22c55e",
  defense: "#3b82f6",
  energy: "#f97316",
};

// ── Domain types ─────────────────────────────────────────────────────────────

export type NodeId = string;

export interface GNode {
  id: NodeId;
  structId: string;
  baseId: string;
  ring: number;
  pos: number;
  x: number;
  y: number;
  type: SphereType | null;
}

export type GStructureKind = "large" | "small" | "single";

export interface GStructure {
  id: string;
  slot: number; // 0 = hub, 1–8 = N, NE, E, SE, S, SW, W, NW; -1 = free-placed
  kind: GStructureKind;
  cx: number;
  cy: number;
}

export type EdgeKind = "intra" | "bridge";

export interface ActiveEdge {
  from: NodeId;
  to: NodeId;
  kind: EdgeKind;
}

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
