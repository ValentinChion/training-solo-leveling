// ORV Fitness Tracker — Domain Types

import { StatType } from "@/features/player/types";
import type { Grade, SphereType } from "./constants";

export type StatBlock = Record<StatType, number>;
export type SphereInventory = Record<SphereType, number>;



// ---------------------------------------------------------------------------
// Progression Entities
// ---------------------------------------------------------------------------

export interface Attribute {
  id: string;
  name: string;
  grade: Grade;
  description: string;
  usageCount: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  grade: Grade;
  description: string;
  exerciseTag?: string;
}

export interface Stigma {
  id: string;
  name: string;
  grade: Grade;
  description: string;
  constellationId: string;
}

export interface Story {
  id: string;
  title: string;
  grade: Grade;
  earnedAt: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export interface ScenarioWorkout {
  statType: StatType;
  exerciseName: string;
  targetSets?: number;
  targetReps?: number;
  targetDuration?: number;
}

export interface Scenario {
  id: string;
  number: number;
  type: "main" | "sub";
  title: string;
  description: string;
  status: "available" | "active" | "completed";
  coinReward: number;
  keySphereReward?: number;
  storyReward?: { title: string; grade: Grade };
  workouts: ScenarioWorkout[];
}

// ---------------------------------------------------------------------------
// Constellations
// ---------------------------------------------------------------------------

export interface Constellation {
  id: string;
  name: string;
  grade: string;
  description: string;
  archetype: string;
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

export interface ExerciseSet {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

export interface Exercise {
  name: string;
  statType: StatType;
  sets: ExerciseSet[];
}

export interface WorkoutEntry {
  id: string;
  date: string;
  exercises: Exercise[];
  scenarioId?: string;
  coinsEarned: number;
  spheresEarned: SphereInventory;
  notes?: string;
}
