"use client";

import { PlayerProvider } from "@/features/player/context";


export function Providers({ children }: { children: React.ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
