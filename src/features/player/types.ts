import {
  Constellation,
  Scenario,
  Skill,
  SphereInventory,
  StatBlock,
  Stigma,
  Story,
  WorkoutEntry,
} from "@/lib/orv/types";
import { Attribute } from "next-themes";
import { MaintenanceState } from "../maintenance/types";
import { StatGrid } from "../sphere-grid/types";

export const STAT_TYPES = ["str", "agi", "con", "sta"] as const;

export type StatType = (typeof STAT_TYPES)[number];

export const STAT_META: Record<
  StatType,
  { label: string; description: string; color: string; iconName: string }
> = {
  str: {
    label: "Strength",
    description: "Weights & resistance training",
    color: "#ef4444",
    iconName: "BicepsFlexed",
  },
  agi: {
    label: "Agility",
    description: "Running & HIIT",
    color: "#22c55e",
    iconName: "Wind",
  },
  con: {
    label: "Constitution",
    description: "Endurance activities",
    color: "#3b82f6",
    iconName: "ShieldHalf",
  },
  sta: {
    label: "Stamina",
    description: "Recovery & energy training",
    color: "#f97316",
    iconName: "Zap",
  },
};

export interface PlayerProfile {
  name: string;
  title?: string;
  stats: StatBlock;
  coins: number;
  ap: number;
  spheres: SphereInventory;
  grids: Record<StatType, StatGrid>;
  attributes: Attribute[];
  skills: Skill[];
  stigmas: Stigma[];
  stories: Story[];
  scenarios: Scenario[];
  constellations: Constellation[];
  workoutLog: WorkoutEntry[];
  maintenanceState: MaintenanceState;
}
