"use client";

import { PlayerProvider } from "@/v1/lib/orv/hooks";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
