"use client";

import { PlayerProvider } from "@/features/player/context";
import { GridDesignProvider } from "@/features/grid-design/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GridDesignProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </GridDesignProvider>
  );
}
