// ORV Fitness Tracker — Mock / Seed Data

import { Scenario, Skill, Story, WorkoutEntry } from "@/lib/orv/types";
import { StatGrid } from "../sphere-grid/types";
import { buildStatGrid } from "../sphere-grid/utils";
import type {
  PlayerProfile,
  StatType,
} from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function buildActivatedGrid(
  statType: StatType,
  activatedCount: number,
): StatGrid {
  const grid = buildStatGrid(statType);
  for (let i = 0; i < activatedCount && i < grid.nodes.length; i++) {
    grid.nodes[i].activated = true;
  }
  grid.currentPosition = activatedCount;
  return grid;
}

const MOCK_SKILLS: Skill[] = [
  {
    id: "skill-bench-press",
    name: "Bench Press Mastery",
    level: 3,
    grade: "rare",
    description: "Enhanced bench press form and power output.",
    exerciseTag: "bench-press",
  },
  {
    id: "skill-sprint",
    name: "Wind Sprint",
    level: 2,
    grade: "general",
    description: "Increased explosive sprint speed.",
    exerciseTag: "sprint",
  },
];

const MOCK_STORIES: Story[] = [
  {
    id: "story-first-workout",
    title: "The Reader Who Moved",
    grade: "general",
    earnedAt: daysAgo(14),
    description: "Completed your very first workout scenario.",
  },
];

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: "scenario-main-1",
    number: 1,
    type: "main",
    title: "Main Scenario #1 — Awakening",
    description: "Complete 3 strength exercises in a single workout.",
    status: "completed",
    coinReward: 50,
    keySphereReward: 1,
    storyReward: { title: "The Reader Who Moved", grade: "general" },
    workouts: [
      {
        statType: "str",
        exerciseName: "Bench Press",
        targetSets: 3,
        targetReps: 10,
      },
      { statType: "str", exerciseName: "Squat", targetSets: 3, targetReps: 10 },
      {
        statType: "str",
        exerciseName: "Deadlift",
        targetSets: 3,
        targetReps: 8,
      },
    ],
  },
  {
    id: "scenario-main-2",
    number: 2,
    type: "main",
    title: "Main Scenario #2 — The Stream Begins",
    description: "Log workouts covering all 4 stat types within a week.",
    status: "available",
    coinReward: 80,
    keySphereReward: 1,
    storyReward: { title: "Four Paths Converge", grade: "rare" },
    workouts: [
      { statType: "str", exerciseName: "Any strength exercise", targetSets: 1 },
      { statType: "agi", exerciseName: "Any agility exercise", targetSets: 1 },
      {
        statType: "con",
        exerciseName: "Any endurance exercise",
        targetSets: 1,
      },
      { statType: "sta", exerciseName: "Any recovery exercise", targetSets: 1 },
    ],
  },
  {
    id: "scenario-main-3",
    number: 3,
    type: "main",
    title: "Main Scenario #3 — Demon King Selection",
    description: "Reach level 10 in any single stat.",
    status: "available",
    coinReward: 120,
    keySphereReward: 2,
    workouts: [],
  },
  {
    id: "scenario-sub-1",
    number: 1,
    type: "sub",
    title: "Sub Scenario — Morning Runner",
    description: "Log a 5km run.",
    status: "available",
    coinReward: 30,
    workouts: [{ statType: "agi", exerciseName: "Running", targetSets: 1 }],
  },
  {
    id: "scenario-sub-2",
    number: 2,
    type: "sub",
    title: "Sub Scenario — Iron Will",
    description: "Complete a 60-minute endurance session.",
    status: "available",
    coinReward: 30,
    keySphereReward: 1,
    workouts: [
      {
        statType: "con",
        exerciseName: "Endurance Training",
        targetDuration: 60,
      },
    ],
  },
];

const MOCK_WORKOUTS: WorkoutEntry[] = [
  {
    id: "w1",
    date: dateStr(1),
    exercises: [
      {
        name: "Bench Press",
        statType: "str",
        sets: [
          { reps: 10, weight: 60 },
          { reps: 8, weight: 65 },
          { reps: 6, weight: 70 },
        ],
      },
      {
        name: "Squat",
        statType: "str",
        sets: [
          { reps: 10, weight: 80 },
          { reps: 8, weight: 85 },
        ],
      },
    ],
    coinsEarned: 42,
    spheresEarned: { power: 2, speed: 0, defense: 0, energy: 0 },
  },
  {
    id: "w2",
    date: dateStr(3),
    exercises: [
      { name: "Running", statType: "agi", sets: [{ distance: 5 }] },
      {
        name: "Sprint Intervals",
        statType: "agi",
        sets: [{ distance: 2 }, { distance: 2 }],
      },
    ],
    coinsEarned: 90,
    spheresEarned: { power: 0, speed: 2, defense: 0, energy: 0 },
  },
  {
    id: "w3",
    date: dateStr(5),
    exercises: [
      { name: "Yoga Flow", statType: "sta", sets: [{ duration: 30 }] },
      { name: "Meditation", statType: "sta", sets: [{ duration: 15 }] },
    ],
    coinsEarned: 90,
    spheresEarned: { power: 0, speed: 0, defense: 0, energy: 2 },
  },
  {
    id: "w4",
    date: dateStr(7),
    exercises: [
      { name: "Long Walk", statType: "con", sets: [{ distance: 8 }] },
    ],
    coinsEarned: 80,
    spheresEarned: { power: 0, speed: 0, defense: 1, energy: 0 },
  },
  {
    id: "w5",
    date: dateStr(2),
    exercises: [
      {
        name: "Deadlift",
        statType: "str",
        sets: [
          { reps: 5, weight: 100 },
          { reps: 5, weight: 100 },
        ],
      },
      { name: "Pull-ups", statType: "str", sets: [{ reps: 8 }, { reps: 6 }] },
      { name: "Stretching", statType: "sta", sets: [{ duration: 20 }] },
    ],
    coinsEarned: 54,
    spheresEarned: { power: 2, speed: 0, defense: 0, energy: 1 },
  },
];

export const MOCK_PLAYER: PlayerProfile = {
  name: "Kim Dokja",
  title: "Reader",
  stats: { str: 7, agi: 6, con: 8, sta: 5 },
  coins: 100,
  ap: 6,
  spheres: { power: 3, speed: 2, defense: 1, energy: 0 },
  grids: {
    str: buildActivatedGrid("str", 7),
    agi: buildActivatedGrid("agi", 6),
    con: buildActivatedGrid("con", 8),
    sta: buildActivatedGrid("sta", 5),
  },
  attributes: [],
  skills: MOCK_SKILLS,
  stigmas: [],
  stories: MOCK_STORIES,
  scenarios: MOCK_SCENARIOS,
  constellations: [],
  workoutLog: MOCK_WORKOUTS,
  maintenanceState: {
    lastTrainedAt: {
      str: daysAgo(1),
      agi: daysAgo(3),
      con: daysAgo(5),
      sta: daysAgo(2),
    },
    coinDrainActive: { str: false, agi: false, con: true, sta: false },
  },
};
