"use client";

import { Exercise, Skill, Story } from "@/lib/orv/types";
import { createContext, useContext, useReducer, type ReactNode } from "react";
import { PlayerProfile, StatType } from "./types";
import { SphereType } from "@/lib/orv/constants";
import { addSpheres, calculateApEarned, calculateCoinsEarned, calculateSpheresEarned } from "../spheres/utils";
import { generateId } from "./utils";
import { applyMaintenance } from "../maintenance/utils";
import { MOCK_PLAYER } from "./mock";



export type PlayerAction =
  | { type: "LOG_WORKOUT";           payload: { exercises: Exercise[]; scenarioId?: string; notes?: string } }
  | { type: "ACTIVATE_NODE";         payload: { statType: StatType; nodeIndex: number } }
  | { type: "SPEND_FOR_ACTIVATION";  payload: { sphereType: SphereType; spheres: number; coins: number } }
  | { type: "SPEND_AP";              payload: { amount: number } }
  | { type: "COMPLETE_SCENARIO";     payload: { scenarioId: string } }
  | { type: "EARN_STORY";            payload: Story }
  | { type: "ADD_SKILL";             payload: Skill }
  | { type: "APPLY_MAINTENANCE";     payload: { now: Date } };


export function playerReducer(state: PlayerProfile, action: PlayerAction): PlayerProfile {
  switch (action.type) {
    case "LOG_WORKOUT": {
      const { exercises, scenarioId, notes } = action.payload;
      const spheresEarned = calculateSpheresEarned(exercises);
      const coinsEarned = calculateCoinsEarned(exercises);
      const apEarned = calculateApEarned(exercises);
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
        ap: state.ap + apEarned,
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

    case "SPEND_FOR_ACTIVATION": {
      const { sphereType, spheres: sphereCost, coins: coinCost } = action.payload;
      if (state.spheres[sphereType] < sphereCost || state.coins < coinCost) return state;
      return {
        ...state,
        coins: state.coins - coinCost,
        spheres: { ...state.spheres, [sphereType]: state.spheres[sphereType] - sphereCost },
      };
    }

    case "SPEND_AP": {
      const { amount } = action.payload;
      if (state.ap < amount) return state;
      return { ...state, ap: state.ap - amount };
    }

    case "APPLY_MAINTENANCE": {
      const result = applyMaintenance(state.stats, state.coins, state.maintenanceState, action.payload.now);
      return { ...state, ...result };
    }

    default:
      return state;
  }
}


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
