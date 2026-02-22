"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

import type { StatType } from "./constants";
import type { Exercise, PlayerProfile, Skill, Story, SphereInventory } from "./types";
import { calculateSpheresEarned, calculateCoinsEarned } from "./sphere-calculator";
import { applyMaintenance } from "./maintenance";
import { MOCK_PLAYER } from "./mock-data";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type PlayerAction =
  | { type: "LOG_WORKOUT";      payload: { exercises: Exercise[]; scenarioId?: string; notes?: string } }
  | { type: "ACTIVATE_NODE";    payload: { statType: StatType; nodeIndex: number } }
  | { type: "COMPLETE_SCENARIO";payload: { scenarioId: string } }
  | { type: "EARN_STORY";       payload: Story }
  | { type: "ADD_SKILL";        payload: Skill }
  | { type: "APPLY_MAINTENANCE";payload: { now: Date } };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addSpheres(a: SphereInventory, b: SphereInventory): SphereInventory {
  return {
    power:   a.power   + b.power,
    speed:   a.speed   + b.speed,
    mana:    a.mana    + b.mana,
    ability: a.ability + b.ability,
    key:     a.key     + b.key,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function playerReducer(state: PlayerProfile, action: PlayerAction): PlayerProfile {
  switch (action.type) {
    case "LOG_WORKOUT": {
      const { exercises, scenarioId, notes } = action.payload;
      const spheresEarned = calculateSpheresEarned(exercises);
      const coinsEarned = calculateCoinsEarned(exercises);
      const now = new Date().toISOString();

      const trainedStats = new Set<StatType>(exercises.map((e) => e.statType));
      const newLastTrainedAt = { ...state.maintenanceState.lastTrainedAt };
      const newCoinDrainActive = { ...state.maintenanceState.coinDrainActive };
      for (const st of trainedStats) {
        newLastTrainedAt[st] = now;
        newCoinDrainActive[st] = false;
      }

      return {
        ...state,
        coins: state.coins + coinsEarned,
        spheres: addSpheres(state.spheres, spheresEarned),
        workoutLog: [...state.workoutLog, { id: generateId(), date: now.split("T")[0], exercises, scenarioId, coinsEarned, spheresEarned, notes }],
        maintenanceState: { lastTrainedAt: newLastTrainedAt, coinDrainActive: newCoinDrainActive },
      };
    }

    case "ACTIVATE_NODE": {
      const { statType, nodeIndex } = action.payload;
      const grid = state.grids[statType];
      const node = grid.nodes[nodeIndex];
      if (!node || node.activated) return state;

      const { sphereType, sphereCount, coins: coinCost } = node.cost;
      if (state.spheres[sphereType] < sphereCount || state.coins < coinCost) return state;

      const newSpheres = { ...state.spheres, [sphereType]: state.spheres[sphereType] - sphereCount };
      const newNodes = grid.nodes.map((n, i) => (i === nodeIndex ? { ...n, activated: true } : n));
      const newStats = node.nodeType === "stat"
        ? { ...state.stats, [statType]: state.stats[statType] + 1 }
        : state.stats;

      return {
        ...state,
        stats: newStats,
        coins: state.coins - coinCost,
        spheres: newSpheres,
        grids: { ...state.grids, [statType]: { ...grid, nodes: newNodes, currentPosition: nodeIndex + 1 } },
      };
    }

    case "COMPLETE_SCENARIO": {
      const { scenarioId } = action.payload;
      const idx = state.scenarios.findIndex((s) => s.id === scenarioId);
      if (idx === -1) return state;
      const scenario = state.scenarios[idx];
      if (scenario.status === "completed") return state;

      const newSpheres = { ...state.spheres };
      if (scenario.keySphereReward) newSpheres.key += scenario.keySphereReward;

      const newStories = scenario.storyReward
        ? [...state.stories, { id: generateId(), title: scenario.storyReward.title, grade: scenario.storyReward.grade, earnedAt: new Date().toISOString(), description: `Earned by completing "${scenario.title}".` }]
        : state.stories;

      return {
        ...state,
        coins: state.coins + scenario.coinReward,
        spheres: newSpheres,
        scenarios: state.scenarios.map((s, i) => (i === idx ? { ...s, status: "completed" } : s)),
        stories: newStories,
      };
    }

    case "EARN_STORY":
      return { ...state, stories: [...state.stories, action.payload] };

    case "ADD_SKILL":
      return { ...state, skills: [...state.skills, action.payload] };

    case "APPLY_MAINTENANCE": {
      const result = applyMaintenance(state.stats, state.coins, state.maintenanceState, action.payload.now);
      return { ...state, ...result };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PlayerContextValue {
  player: PlayerProfile;
  dispatch: React.Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, dispatch] = useReducer(playerReducer, MOCK_PLAYER);
  return <PlayerContext value={{ player, dispatch }}>{children}</PlayerContext>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a <PlayerProvider>");
  return ctx;
}
