import { StatType } from "../player/types";

export interface MaintenanceState {
  lastTrainedAt: Record<StatType, string>;
  coinDrainActive: Record<StatType, boolean>;
}


export const MAINTENANCE_GRACE_DAYS = 3;
export const MAINTENANCE_COIN_COST_PER_DAY = 3;
export const DECAY_RATE_DAYS = 7;
export const STAT_FLOOR = 1;
