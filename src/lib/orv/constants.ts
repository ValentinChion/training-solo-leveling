// ORV Fitness Tracker — Domain Constants

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
// Stat Types
// ---------------------------------------------------------------------------

export const STAT_TYPES = ["str", "agi", "con", "mag"] as const;

export type StatType = (typeof STAT_TYPES)[number];

export const STAT_META: Record<
  StatType,
  { label: string; description: string; color: string; iconName: string }
> = {
  str: { label: "Strength",      description: "Weights & resistance training", color: "#ef4444", iconName: "Swords"   },
  agi: { label: "Agility",       description: "Running & HIIT",                color: "#22c55e", iconName: "Zap"      },
  con: { label: "Constitution",  description: "Endurance activities",           color: "#f59e0b", iconName: "Shield"   },
  mag: { label: "Magic Power",   description: "Yoga & recovery",               color: "#a855f7", iconName: "Sparkles" },
};

// ---------------------------------------------------------------------------
// Sphere Types
// ---------------------------------------------------------------------------

export const SPHERE_TYPES = ["power", "speed", "mana", "ability", "key"] as const;

export type SphereType = (typeof SPHERE_TYPES)[number];

export const SPHERE_META: Record<
  SphereType,
  { label: string; description: string; color: string; iconName: string; activatesStats: StatType[] }
> = {
  power:   { label: "Power Sphere",   description: "Activates STR and CON stat nodes",         color: "#ef4444", iconName: "Circle", activatesStats: ["str", "con"] },
  speed:   { label: "Speed Sphere",   description: "Activates AGI stat nodes",                  color: "#22c55e", iconName: "Circle", activatesStats: ["agi"]        },
  mana:    { label: "Mana Sphere",    description: "Activates MAG stat nodes",                  color: "#a855f7", iconName: "Circle", activatesStats: ["mag"]        },
  ability: { label: "Ability Sphere", description: "Activates skill and exercise unlock nodes", color: "#3b82f6", iconName: "Circle", activatesStats: ["str", "agi", "con", "mag"] },
  key:     { label: "Key Sphere",     description: "Unlocks milestone lock nodes",              color: "#f59e0b", iconName: "Key",    activatesStats: []             },
};

/** Which sphere type is used to activate nodes for each stat. */
export const STAT_SPHERE: Record<StatType, SphereType> = {
  str: "power",
  agi: "speed",
  con: "power",
  mag: "mana",
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

// ---------------------------------------------------------------------------
// Maintenance / Decay Constants
// ---------------------------------------------------------------------------

export const MAINTENANCE_GRACE_DAYS = 3;
export const MAINTENANCE_COIN_COST_PER_DAY = 3;
export const DECAY_RATE_DAYS = 7;
export const STAT_FLOOR = 1;
