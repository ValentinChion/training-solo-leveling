import { StatType } from "../player/types";

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

export const STAT_SPHERE: Record<StatType, SphereType> = {
  str: "power",
  agi: "speed",
  con: "defense",
  sta: "energy",
};


export type SphereInventory = Record<SphereType, number>;
