import type { PlayerProfile } from "@/v1/lib/orv/types";
import { MOCK_PLAYER } from "@/v1/lib/orv/mock-data";

// TODO: replace with real DB fetch
export async function getPlayer(): Promise<PlayerProfile> {
  return MOCK_PLAYER;
}
