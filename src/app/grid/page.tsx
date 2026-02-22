"use client";

import { motion } from "motion/react";

import { HyperText } from "@/components/ui/magicui/hyper-text";
import { SphereIcon } from "@/components/orv/sphere-icon";
import { SPHERE_TYPES, type SphereType } from "@/lib/orv/constants";
import { GraphCanvas, type GraphNode, type GraphEdge } from "@/components/grid/graph-canvas";
import { usePlayer } from "@/features/player/context";
import { useGridDesign } from "@/features/grid-design/context";

// Four linear arms radiating from the hub — each node has at most 2 connections.
// The hub (C) is the only node with degree > 2 (one edge per arm).
const NODES: GraphNode[] = [
  { id: "C",   x: 350, y: 250, isStart: true },
  // Power arm — NE
  { id: "P1",  x: 400, y: 195, type: "power" },
  { id: "P2",  x: 450, y: 145, type: "power" },
  { id: "P3",  x: 500, y: 100, type: "power" },
  { id: "P4",  x: 545, y: 58,  type: "power" },
  // Speed arm — NW
  { id: "S1",  x: 300, y: 195, type: "speed" },
  { id: "S2",  x: 250, y: 145, type: "speed" },
  { id: "S3",  x: 200, y: 100, type: "speed" },
  { id: "S4",  x: 155, y: 58,  type: "speed" },
  // Defense arm — SW
  { id: "D1",  x: 300, y: 305, type: "defense" },
  { id: "D2",  x: 250, y: 355, type: "defense" },
  { id: "D3",  x: 200, y: 400, type: "defense" },
  { id: "D4",  x: 155, y: 442, type: "defense" },
  // Energy arm — SE
  { id: "E1",  x: 400, y: 305, type: "energy" },
  { id: "E2",  x: 450, y: 355, type: "energy" },
  { id: "E3",  x: 500, y: 400, type: "energy" },
  { id: "E4",  x: 545, y: 442, type: "energy" },
];

const EDGES: GraphEdge[] = [
  { from: "C",  to: "P1" }, { from: "P1", to: "P2" }, { from: "P2", to: "P3" }, { from: "P3", to: "P4" },
  { from: "C",  to: "S1" }, { from: "S1", to: "S2" }, { from: "S2", to: "S3" }, { from: "S3", to: "S4" },
  { from: "C",  to: "D1" }, { from: "D1", to: "D2" }, { from: "D2", to: "D3" }, { from: "D3", to: "D4" },
  { from: "C",  to: "E1" }, { from: "E1", to: "E2" }, { from: "E2", to: "E3" }, { from: "E3", to: "E4" },
];

const CENTER = { x: 350, y: 250 };
const EASE = [0.23, 1, 0.32, 1] as const;

export default function GridPage(): React.JSX.Element {
  const { player, dispatch } = usePlayer();
  const { design } = useGridDesign();

  const activeNodes = design?.nodes ?? NODES;
  const activeEdges = design?.edges ?? EDGES;
  const activeCenter = design?.center ?? CENTER;

  function handleActivate(_nodeId: string, sphereType: SphereType, cost: { spheres: number; coins: number }): void {
    dispatch({ type: "SPEND_FOR_ACTIVATION", payload: { sphereType, spheres: cost.spheres, coins: cost.coins } });
  }

  function handleMove(apCost: number): void {
    dispatch({ type: "SPEND_AP", payload: { amount: apCost } });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <HyperText
          className="font-display text-2xl font-bold tracking-[0.1em] uppercase text-foreground"
          startOnView={false}
        >
          DOKKAEBI'S BAG
        </HyperText>
        <p className="section-header mt-1.5">Sphere Grid Progression System</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="flex flex-wrap items-center gap-6"
      >
        {SPHERE_TYPES.map((type, i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.06, ease: EASE }}
          >
            <SphereIcon type={type} size="md" count={player.spheres[type]} />
          </motion.div>
        ))}

        {/* AP badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.15 + SPHERE_TYPES.length * 0.06, ease: EASE }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(20,40,100,0.6) 0%, rgba(10,18,55,0.7) 100%)",
            border: "1px solid rgba(91,140,255,0.3)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <polygon
              points="7,1 13,5 13,9 7,13 1,9 1,5"
              fill="rgba(91,140,255,0.15)"
              stroke="rgba(91,140,255,0.85)"
              strokeWidth="1.2"
            />
            <polygon
              points="7,3.5 11,6 11,8.5 7,11 3,8.5 3,6"
              fill="rgba(91,140,255,0.4)"
            />
          </svg>
          <span
            className="font-mono font-bold text-sm leading-none"
            style={{ color: "rgba(140,190,255,0.95)" }}
          >
            {player.ap}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest leading-none"
            style={{ color: "rgba(100,170,255,0.5)" }}
          >
            AP
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="h-[500px] rounded-xl border border-[rgba(100,170,255,0.15)] overflow-hidden"
      >
        <GraphCanvas
          nodes={activeNodes}
          edges={activeEdges}
          center={activeCenter}
          spheres={player.spheres}
          coins={player.coins}
          ap={player.ap}
          onActivate={handleActivate}
          onMove={handleMove}
        />
      </motion.div>
    </div>
  );
}
