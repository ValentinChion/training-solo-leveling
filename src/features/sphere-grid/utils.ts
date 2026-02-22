import { StatType } from "../player/types";
import { STAT_SPHERE } from "../spheres/types";
import { nodeActivationCost } from "@/lib/orv/constants";
import { GridNode, StatGrid } from "./types";


const GRID_LENGTH = 50; // nodes per stat path
const LOCK_INTERVAL = 10; // lock node every N levels

export function buildStatGrid(statType: StatType): StatGrid {
  const sphereType = STAT_SPHERE[statType];
  const nodes: GridNode[] = [];

  for (let i = 0; i < GRID_LENGTH; i++) {
    const level = i + 1;
    const isLock = level % LOCK_INTERVAL === 0;
    const { spheres, coins } = nodeActivationCost(level);

    nodes.push({
      id: `${statType}-node-${level}`,
      statType,
      nodeType: isLock ? "lock" : "stat",
      level,
      activated: false,
      cost: {
        sphereType,
        // Lock nodes cost 2 spheres instead of 1 — milestone checkpoint
        sphereCount: isLock ? 2 : spheres,
        coins,
      },
    });
  }

  return { statType, nodes, currentPosition: 0 };
}
