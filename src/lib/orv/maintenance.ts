// ORV Fitness Tracker — Maintenance & Decay

import {
  MAINTENANCE_GRACE_DAYS,
  MAINTENANCE_COIN_COST_PER_DAY,
  DECAY_RATE_DAYS,
  STAT_FLOOR,
  STAT_TYPES,
} from "./constants";
import type { StatBlock, MaintenanceState } from "./types";

interface MaintenanceResult {
  stats: StatBlock;
  coins: number;
  maintenanceState: MaintenanceState;
}

export function applyMaintenance(
  stats: StatBlock,
  coins: number,
  maintenanceState: MaintenanceState,
  now: Date,
): MaintenanceResult {
  const newStats = { ...stats };
  let newCoins = coins;
  const newLastTrainedAt = { ...maintenanceState.lastTrainedAt };
  const newCoinDrainActive = { ...maintenanceState.coinDrainActive };

  for (const stat of STAT_TYPES) {
    const lastTrained = new Date(maintenanceState.lastTrainedAt[stat]);
    const daysSince = (now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince <= MAINTENANCE_GRACE_DAYS) {
      // Within grace — reset drain if it was active
      newCoinDrainActive[stat] = false;
      continue;
    }

    // Past grace — activate coin drain
    newCoinDrainActive[stat] = true;

    const drainDays = Math.floor(daysSince - MAINTENANCE_GRACE_DAYS);
    const totalDrain = drainDays * MAINTENANCE_COIN_COST_PER_DAY;

    if (newCoins >= totalDrain) {
      newCoins -= totalDrain;
    } else {
      // Coins depleted — apply stat decay
      newCoins = 0;
      const decayTicks = Math.floor(drainDays / DECAY_RATE_DAYS);
      newStats[stat] = Math.max(STAT_FLOOR, newStats[stat] - decayTicks);
    }
  }

  return {
    stats: newStats,
    coins: newCoins,
    maintenanceState: {
      lastTrainedAt: newLastTrainedAt,
      coinDrainActive: newCoinDrainActive,
    },
  };
}
