// ORV Fitness Tracker — Domain Constants

import { StatType } from "@/features/player/types";

// ---------------------------------------------------------------------------
// Grades
// ---------------------------------------------------------------------------

export const GRADES = [
  "general",
  "rare",
  "hero",
  "legend",
  "quasi-myth",
  "myth",
] as const;

export type Grade = (typeof GRADES)[number];

export const GRADE_ORDER: Record<Grade, number> = {
  general: 0,
  rare: 1,
  hero: 2,
  legend: 3,
  "quasi-myth": 4,
  myth: 5,
};

export const GRADE_META: Record<Grade, { label: string; color: string }> = {
  general:      { label: "General",    color: "#9ca3af" },
  rare:         { label: "Rare",       color: "#3b82f6" },
  hero:         { label: "Hero",       color: "#22c55e" },
  legend:       { label: "Legend",     color: "#f59e0b" },
  "quasi-myth": { label: "Quasi-myth", color: "#f97316" },
  myth:         { label: "Myth",       color: "#ef4444" },
};

// ---------------------------------------------------------------------------
// Sphere Types
// ---------------------------------------------------------------------------

export const SPHERE_TYPES = ["power", "speed", "defense", "energy"] as const;

export type SphereType = (typeof SPHERE_TYPES)[number];

export const SPHERE_META: Record<
  SphereType,
  { label: string; description: string; color: string; iconName: string; activatesStats: StatType[] }
> = {
  power:   { label: "Power Sphere",   description: "Activates STR stat nodes",   color: "#ef4444", iconName: "BicepsFlexed", activatesStats: ["str"] },
  speed:   { label: "Speed Sphere",   description: "Activates AGI stat nodes",   color: "#22c55e", iconName: "Wind",        activatesStats: ["agi"] },
  defense: { label: "Defense Sphere", description: "Activates CON stat nodes",   color: "#3b82f6", iconName: "ShieldHalf",  activatesStats: ["con"] },
  energy:  { label: "Energy Sphere",  description: "Activates STA stat nodes",   color: "#f97316", iconName: "Zap",         activatesStats: ["sta"] },
};

/** Which sphere type is used to activate nodes for each stat. */
export const STAT_SPHERE: Record<StatType, SphereType> = {
  str: "power",
  agi: "speed",
  con: "defense",
  sta: "energy",
};

// ---------------------------------------------------------------------------
// Constellation & Scenario Constants
// ---------------------------------------------------------------------------

export const CONSTELLATION_GRADES = ["historical", "narrative", "myth"] as const;
export type ConstellationGrade = (typeof CONSTELLATION_GRADES)[number];

export const SCENARIO_TYPES = ["main", "sub"] as const;
export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export const LEGENDARY_STORIES_TO_ASCEND = 5;

// ---------------------------------------------------------------------------
// Node Activation Cost
// ---------------------------------------------------------------------------

/**
 * Coin cost doubles every 10 levels:
 *   levels 1–9  → 10 coins
 *   levels 10–19 → 20 coins
 *   levels 20–29 → 40 coins …
 */
export function nodeActivationCost(level: number): { spheres: number; coins: number } {
  return {
    spheres: 1,
    coins: 10 * Math.pow(2, Math.floor(level / 10)),
  };
}
