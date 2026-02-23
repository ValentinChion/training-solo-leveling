"use client";

import { createContext, useContext, useState } from "react";
import type { GridDesign } from "./types";

const STORAGE_KEY = "sstk_grid_design";

function loadFromStorage(): GridDesign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GridDesign) : null;
  } catch {
    return null;
  }
}

interface GridDesignCtx {
  design: GridDesign | null;
  saveDesign: (d: GridDesign) => void;
  clearDesign: () => void;
}

const Ctx = createContext<GridDesignCtx | null>(null);

export function GridDesignProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [design, setDesign] = useState<GridDesign | null>(() => loadFromStorage());

  function saveDesign(d: GridDesign): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    setDesign(d);
  }

  function clearDesign(): void {
    localStorage.removeItem(STORAGE_KEY);
    setDesign(null);
  }

  return <Ctx.Provider value={{ design, saveDesign, clearDesign }}>{children}</Ctx.Provider>;
}

export function useGridDesign(): GridDesignCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGridDesign must be used within GridDesignProvider");
  return ctx;
}
