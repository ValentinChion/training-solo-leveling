import {
  RADII,
  SPACING_ORTHO,
  SPACING_DIAG,
  HUB_X,
  HUB_Y,
  SVG_W,
  SVG_H,
  MAX_STRUCTURES,
} from "./types";
import type { GNode, GStructure, GStructureKind, NodeId } from "./types";

export function nodeXY(
  ring: number,
  pos: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  if (ring === 0) return { x: cx, y: cy };
  const angle = ((pos * 45 - 90) * Math.PI) / 180;
  return {
    x: Math.round(cx + RADII[ring] * Math.cos(angle)),
    y: Math.round(cy + RADII[ring] * Math.sin(angle)),
  };
}

export function outerRing(kind: GStructureKind): number {
  if (kind === "large") return 3;
  if (kind === "small") return 1;
  return 0; // single
}

export function buildNodes(s: GStructure): GNode[] {
  const center: GNode = {
    id: `${s.id}_C`,
    structId: s.id,
    baseId: "C",
    ring: 0,
    pos: 0,
    type: null,
    ...nodeXY(0, 0, s.cx, s.cy),
  };

  if (s.kind === "single") return [center];

  if (s.kind === "small") {
    const ring1 = [0, 2, 4, 6].map(
      (p): GNode => ({
        id: `${s.id}_R1P${p}`,
        structId: s.id,
        baseId: `R1P${p}`,
        ring: 1,
        pos: p,
        type: null,
        ...nodeXY(1, p, s.cx, s.cy),
      }),
    );
    return [center, ...ring1];
  }

  // large
  const ringNodes = [1, 2, 3].flatMap((r) =>
    Array.from(
      { length: 8 },
      (_, p): GNode => ({
        id: `${s.id}_R${r}P${p}`,
        structId: s.id,
        baseId: `R${r}P${p}`,
        ring: r,
        pos: p,
        type: null,
        ...nodeXY(r, p, s.cx, s.cy),
      }),
    ),
  );

  return [center, ...ringNodes];
}

// Index 0 = hub (center). Indices 1–8 = N, NE, E, SE, S, SW, W, NW.
const STRUCT_OFFSETS: Array<[number, number]> = [
  [0, 0],                               // 0: hub
  [0, -SPACING_ORTHO],                  // 1: N
  [SPACING_DIAG, -SPACING_DIAG],        // 2: NE
  [SPACING_ORTHO, 0],                   // 3: E
  [SPACING_DIAG, SPACING_DIAG],         // 4: SE
  [0, SPACING_ORTHO],                   // 5: S
  [-SPACING_DIAG, SPACING_DIAG],        // 6: SW
  [-SPACING_ORTHO, 0],                  // 7: W
  [-SPACING_DIAG, -SPACING_DIAG],       // 8: NW
];

export function structCenter(index: number): { cx: number; cy: number } {
  const [dx, dy] = STRUCT_OFFSETS[Math.min(index, MAX_STRUCTURES - 1)];
  return { cx: HUB_X + dx, cy: HUB_Y + dy };
}

export function svgSize(_count: number): { W: number; H: number } {
  return { W: SVG_W, H: SVG_H };
}

export function intraCandidates(s: GStructure): Array<[NodeId, NodeId]> {
  const n = (base: string): NodeId => `${s.id}_${base}`;

  if (s.kind === "single") return [];

  if (s.kind === "small") {
    const positions = [0, 2, 4, 6];
    const centerToRing1: Array<[NodeId, NodeId]> = positions.map(
      (p): [NodeId, NodeId] => [n("C"), n(`R1P${p}`)],
    );
    const circumferential: Array<[NodeId, NodeId]> = positions.map(
      (p, i): [NodeId, NodeId] => [
        n(`R1P${p}`),
        n(`R1P${positions[(i + 1) % 4]}`),
      ],
    );
    return [...centerToRing1, ...circumferential];
  }

  // large
  const centerToRing1 = Array.from(
    { length: 8 },
    (_, p): [NodeId, NodeId] => [n("C"), n(`R1P${p}`)],
  );

  const radial = [1, 2].flatMap((r) =>
    Array.from(
      { length: 8 },
      (_, p): [NodeId, NodeId] => [n(`R${r}P${p}`), n(`R${r + 1}P${p}`)],
    ),
  );

  const circumferential = [1, 2, 3].flatMap((r) =>
    Array.from(
      { length: 8 },
      (_, p): [NodeId, NodeId] => [
        n(`R${r}P${p}`),
        n(`R${r}P${(p + 1) % 8}`),
      ],
    ),
  );

  return [...centerToRing1, ...radial, ...circumferential];
}

export function ekey(a: NodeId, b: NodeId): string {
  return [a, b].sort().join("|");
}

export function structOf(id: NodeId): string {
  return id.split("_")[0];
}
