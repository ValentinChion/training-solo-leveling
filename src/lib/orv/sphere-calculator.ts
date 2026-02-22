// ORV Fitness Tracker — Sphere & Coin Calculator

import type { StatType } from "./constants";
import type { Exercise, SphereInventory } from "./types";

const COINS_PER_SET = 5;
const COINS_PER_EXERCISE = 3;

/** Map each stat to the sphere it produces when trained. */
const STAT_TO_SPHERE: Record<StatType, keyof SphereInventory> = {
  str: "power",
  agi: "speed",
  con: "power",
  mag: "mana",
};

export function calculateSpheresEarned(exercises: Exercise[]): SphereInventory {
  const earned: SphereInventory = { power: 0, speed: 0, mana: 0, ability: 0, key: 0 };

  for (const exercise of exercises) {
    const sphereType = STAT_TO_SPHERE[exercise.statType];
    // 1 sphere per exercise performed
    earned[sphereType] += 1;
    // Bonus ability sphere for every 3 sets
    const totalSets = exercise.sets.length;
    earned.ability += Math.floor(totalSets / 3);
  }

  return earned;
}

export function calculateCoinsEarned(exercises: Exercise[]): number {
  let coins = 0;
  for (const exercise of exercises) {
    coins += COINS_PER_EXERCISE;
    coins += exercise.sets.length * COINS_PER_SET;
  }
  return coins;
}
