"use client";

import { GridDesignProvider } from "@/features/admin/design-grid-sphere/context";
import { PlayerProvider } from "@/features/player/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GridDesignProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </GridDesignProvider>
  );
}
