"use client";

import { motion } from "motion/react";

import { HyperText } from "@/components/ui/magicui/hyper-text";
import { SphereIcon } from "@/components/orv/sphere-icon";
import { SPHERE_TYPES, type SphereType } from "@/lib/orv/constants";
import { GraphCanvas, type GraphNode, type GraphEdge } from "@/components/grid/graph-canvas";
import { usePlayer } from "@/features/player/context";

const NODES: GraphNode[] = [
  { id: "OT",  x: 350, y:  60 },
  { id: "OTL", x: 195, y: 110, type: "defense" },
  { id: "OL",  x: 145, y: 250, type: "defense" },
  { id: "OBL", x: 195, y: 390, type: "defense" },
  { id: "OB",  x: 350, y: 440 },
  { id: "OBR", x: 505, y: 390, type: "energy"  },
  { id: "OR",  x: 555, y: 250, type: "energy"  },
  { id: "OTR", x: 505, y: 110, type: "energy"  },
  { id: "LT",  x: 265, y: 155, type: "power" },
  { id: "LR",  x: 325, y: 205, type: "power" },
  { id: "LBR", x: 305, y: 305, type: "power" },
  { id: "LBL", x: 225, y: 305, type: "power" },
  { id: "LL",  x: 205, y: 205, type: "power" },
  { id: "RT",  x: 435, y: 155, type: "speed" },
  { id: "RR",  x: 490, y: 205, type: "speed" },
  { id: "RBR", x: 465, y: 305, type: "speed" },
  { id: "RBL", x: 375, y: 305, type: "speed" },
  { id: "RL",  x: 360, y: 205, type: "speed" },
  { id: "C",   x: 350, y: 250, isStart: true },
];

const EDGES: GraphEdge[] = [
  { from: "OT",  to: "OTL" },
  { from: "OTL", to: "OL"  },
  { from: "OL",  to: "OBL" },
  { from: "OBL", to: "OB"  },
  { from: "OB",  to: "OBR" },
  { from: "OBR", to: "OR"  },
  { from: "OR",  to: "OTR" },
  { from: "OTR", to: "OT"  },
  { from: "LT",  to: "LR"  },
  { from: "LR",  to: "LBR" },
  { from: "LBR", to: "LBL" },
  { from: "LBL", to: "LL"  },
  { from: "LL",  to: "LT"  },
  { from: "RT",  to: "RR"  },
  { from: "RR",  to: "RBR" },
  { from: "RBR", to: "RBL" },
  { from: "RBL", to: "RL"  },
  { from: "RL",  to: "RT"  },
  { from: "OT",  to: "LT"  },
  { from: "OTL", to: "LT"  },
  { from: "OL",  to: "LL"  },
  { from: "OBL", to: "LBL" },
  { from: "OT",  to: "RT"  },
  { from: "OTR", to: "RT"  },
  { from: "OR",  to: "RR"  },
  { from: "OBR", to: "RBR" },
  { from: "LR",  to: "RL"  },
  { from: "LBR", to: "RBL" },
  { from: "C",   to: "LR"  },
  { from: "C",   to: "RL"  },
  { from: "C",   to: "LBR" },
  { from: "C",   to: "RBL" },
];

const CENTER = { x: 350, y: 250 };
const EASE = [0.23, 1, 0.32, 1] as const;

export default function GridPage(): React.JSX.Element {
  const { player, dispatch } = usePlayer();

  function handleActivate(_nodeId: string, sphereType: SphereType, cost: { spheres: number; coins: number }): void {
    dispatch({ type: "SPEND_FOR_ACTIVATION", payload: { sphereType, spheres: cost.spheres, coins: cost.coins } });
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="h-[500px] rounded-xl border border-[rgba(100,170,255,0.15)] overflow-hidden"
      >
        <GraphCanvas
          nodes={NODES}
          edges={EDGES}
          center={CENTER}
          spheres={player.spheres}
          coins={player.coins}
          onActivate={handleActivate}
        />
      </motion.div>
    </div>
  );
}
