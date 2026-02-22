import type { PlayerProfile } from "@/lib/orv/types";
import { MOCK_PLAYER } from "@/lib/orv/mock-data";

// TODO: replace with real DB fetch
export async function getPlayer(): Promise<PlayerProfile> {
  return MOCK_PLAYER;
}
