// ORV Fitness Tracker — Sphere & Coin Calculator

import { Exercise } from "@/lib/orv/types";
import { SphereInventory, STAT_SPHERE } from "./types";

const COINS_PER_SET = 5;
const COINS_PER_EXERCISE = 3;

export function calculateSpheresEarned(exercises: Exercise[]): SphereInventory {
  const earned: SphereInventory = { power: 0, speed: 0, defense: 0, energy: 0 };

  for (const exercise of exercises) {
    const sphereType = STAT_SPHERE[exercise.statType];
    earned[sphereType] += 1;
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

export function addSpheres(a: SphereInventory, b: SphereInventory): SphereInventory {
  return {
    power:   a.power   + b.power,
    speed:   a.speed   + b.speed,
    defense: a.defense + b.defense,
    energy:  a.energy  + b.energy,
  };
}
