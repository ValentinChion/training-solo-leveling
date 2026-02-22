import { StatType } from "../player/types";
import { SphereType } from "../spheres/types";

export type GridNodeType = "stat" | "skill" | "lock";

export interface GridNode {
  id: string;
  statType: StatType;
  nodeType: GridNodeType;
  level: number;
  activated: boolean;
  cost: {
    sphereType: SphereType;
    sphereCount: number;
    coins: number;
  };
}
export interface StatGrid {
  statType: StatType;
  nodes: GridNode[];
  currentPosition: number;
}
