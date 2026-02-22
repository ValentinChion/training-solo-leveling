// ORV Fitness Tracker — Domain Types

import type { Grade, StatType, SphereType } from "./constants";

export type StatBlock = Record<StatType, number>;
export type SphereInventory = Record<SphereType, number>;

// ---------------------------------------------------------------------------
// Sphere Grid
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

export interface MaintenanceState {
  lastTrainedAt: Record<StatType, string>;
  coinDrainActive: Record<StatType, boolean>;
}

// ---------------------------------------------------------------------------
// Player Profile
// ---------------------------------------------------------------------------

export interface PlayerProfile {
  name: string;
  title?: string;
  stats: StatBlock;
  coins: number;
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
