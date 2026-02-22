import { MOCK_PLAYER } from "@/features/player/mock";
import { PlayerProfile } from "./types";

// TODO: replace with real DB fetch
export async function getPlayer(): Promise<PlayerProfile> {
  return MOCK_PLAYER;
}
