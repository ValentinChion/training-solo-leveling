"use client";

import { BicepsFlexed, Wind, ShieldHalf, Zap } from "lucide-react";
import { motion } from "motion/react";

import { SidebarTrigger } from "@/components/ui/shadcn/sidebar";
import { Separator } from "@/components/ui/shadcn/separator";
import { NumberTicker } from "@/components/ui/magicui/number-ticker";
import { PlayerProfile, StatType } from "@/features/player/types";
import { usePlayer } from "@/features/player/context";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STAT_CONFIG = {
  str: { label: "STR", icon: BicepsFlexed, color: "#ef4444" },
  agi: { label: "AGI", icon: Wind,       color: "#22c55e" },
  con: { label: "CON", icon: ShieldHalf, color: "#3b82f6" },
  sta: { label: "STA", icon: Zap,        color: "#f97316" },
} satisfies Record<StatType, { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }>;

const STAT_KEYS: StatType[] = ["str", "agi", "con", "sta"];

const XP_PER_LEVEL = 10;
const ease = [0.23, 1, 0.32, 1] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveLevel(player: PlayerProfile) {
  const totalXP = STAT_KEYS.reduce(
    (sum, key) => sum + player.grids[key].currentPosition,
    0,
  );
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXP % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpPerLevel: XP_PER_LEVEL };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppHeader() {
  const { player } = usePlayer();
  const { level, xpIntoLevel, xpPerLevel } = deriveLevel(player);
  const xpPct = (xpIntoLevel / xpPerLevel) * 100;

  return (
    <header data-slot="app-header" className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b px-4">
      {/* Sidebar toggle */}
      <SidebarTrigger className="shrink-0 text-foreground/40 hover:text-foreground/80 transition-colors" />

      <Separator orientation="vertical" className="h-5 shrink-0 bg-white/10" />

      {/* Player name + title */}
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="flex shrink-0 flex-col justify-center"
      >
        <span className="font-display text-sm font-semibold leading-none tracking-wide text-foreground">
          {player.name}
        </span>
        {player.title && (
          <span className="section-header mt-1 text-[0.55rem]">
            {player.title}
          </span>
        )}
      </motion.div>

      {/* XP bar — grows to fill center space */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-1 items-center gap-2.5 px-6"
      >
        {/* Level */}
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="section-header text-[0.55rem]">LV</span>
          <span className="font-mono text-sm font-bold tabular-nums text-primary">
            <NumberTicker value={level} />
          </span>
        </div>

        {/* Track */}
        <div className="relative h-[5px] min-w-0 flex-1 max-w-44 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #3a6adf 0%, #7ca8ff 100%)",
              boxShadow: "0 0 10px rgba(91,140,255,0.55)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
          />
        </div>

        {/* XP numbers */}
        <span className="shrink-0 font-mono text-[0.7rem] tabular-nums text-foreground/40">
          {xpIntoLevel}
          <span className="text-foreground/25">/{xpPerLevel}</span>
        </span>
      </motion.div>

      {/* Stats */}
      <div className="flex shrink-0 items-center gap-4">
        {STAT_KEYS.map((key, i) => {
          const { label, icon: Icon, color } = STAT_CONFIG[key as keyof typeof STAT_CONFIG];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease }}
              className="flex items-center gap-1"
              title={label}
            >
              <Icon
                className="size-3 shrink-0"
                style={{
                  color,
                  filter: `drop-shadow(0 0 4px ${color}99)`,
                }}
              />
              <span
                className="font-mono text-xs font-bold tabular-nums"
                style={{ color }}
              >
                <NumberTicker value={player.stats[key]} />
              </span>
            </motion.div>
          );
        })}
      </div>
    </header>
  );
}
