"use client";

import { PlayerProvider } from "@/lib/orv/hooks";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
