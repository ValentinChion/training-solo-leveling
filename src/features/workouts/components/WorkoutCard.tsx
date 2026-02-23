"use client";

import { BicepsFlexed, Wind, ShieldHalf, Zap } from "lucide-react";
import type { WorkoutEntry, Exercise, ExerciseSet } from "@/lib/orv/types";
import { STAT_META, type StatType } from "@/features/player/types";
import { SPHERE_META, SPHERE_TYPES } from "@/features/spheres/types";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/shadcn/card";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const AP_PER_WORKOUT = 2;

const STAT_ICONS: Record<
  StatType,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  str: BicepsFlexed,
  agi: Wind,
  con: ShieldHalf,
  sta: Zap,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dominantStat(exercises: Exercise[]): StatType {
  const counts: Record<StatType, number> = { str: 0, agi: 0, con: 0, sta: 0 };
  for (const ex of exercises) counts[ex.statType]++;
  return (Object.entries(counts) as [StatType, number][]).sort(
    ([, a], [, b]) => b - a,
  )[0][0];
}

function relativeDate(dateStr: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function summarizeSets(sets: ExerciseSet[]): string {
  const [first] = sets;
  if (first.weight !== undefined) {
    const weights = sets
      .filter((s): s is ExerciseSet & { weight: number } => s.weight !== undefined)
      .map((s) => s.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = min === max ? `${min}` : `${min}–${max}`;
    return `${sets.length} sets · ${range} kg`;
  }
  if (first.distance !== undefined) {
    const total = sets.reduce((t, s) => t + (s.distance ?? 0), 0);
    return `${total} km`;
  }
  if (first.duration !== undefined) {
    const total = sets.reduce((t, s) => t + (s.duration ?? 0), 0);
    return `${total} min`;
  }
  return `${sets.length} sets`;
}

function accentStyle(color: string): React.CSSProperties {
  return { backgroundColor: color, boxShadow: `0 0 8px ${color}80` };
}

function iconStyle(color: string): React.CSSProperties {
  return { color, filter: `drop-shadow(0 0 5px ${color}aa)` };
}

function statPillStyle(color: string): React.CSSProperties {
  return { color, backgroundColor: `${color}1a`, border: `1px solid ${color}33` };
}

function sphereDotStyle(color: string): React.CSSProperties {
  return { backgroundColor: color, boxShadow: `0 0 5px ${color}99` };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WorkoutCardProps {
  entry: WorkoutEntry;
}

export function WorkoutCard({ entry }: WorkoutCardProps): React.ReactElement {
  const dominant = dominantStat(entry.exercises);
  const { color, label } = STAT_META[dominant];
  const Icon = STAT_ICONS[dominant];
  const earnedSpheres = SPHERE_TYPES.filter((t) => entry.spheresEarned[t] > 0);

  return (
    <Card className="relative overflow-hidden">
      {/* Left accent strip */}
      <div className="absolute inset-y-0 left-0 w-0.5" style={accentStyle(color)} />

      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 shrink-0" style={iconStyle(color)} />
          <span
            className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color }}
          >
            {label} Session
          </span>
        </div>
        <CardAction>
          <div className="flex items-baseline gap-1.5 text-foreground/35">
            <span className="font-mono text-xs">{formatDate(entry.date)}</span>
            <span className="text-[0.65rem]">·</span>
            <span className="font-body text-[0.7rem]">{relativeDate(entry.date)}</span>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="space-y-1.5">
          {entry.exercises.map((ex, i) => {
            const meta = STAT_META[ex.statType];
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 font-body text-sm text-foreground/85">
                  {ex.name}
                </span>
                <span
                  className="shrink-0 rounded px-1.5 py-px font-body text-[0.6rem] font-semibold uppercase tracking-wider"
                  style={statPillStyle(meta.color)}
                >
                  {ex.statType}
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-foreground/40">
                  {summarizeSets(ex.sets)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="gap-3">
        {earnedSpheres.map((t) => (
          <div key={t} className="flex items-center gap-1">
            <div
              className="size-2.5 rounded-full"
              style={sphereDotStyle(SPHERE_META[t].color)}
            />
            <span
              className="font-mono text-xs tabular-nums"
              style={{ color: SPHERE_META[t].color }}
            >
              ×{entry.spheresEarned[t]}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[0.7rem] text-[#fbbf24]">◈</span>
            <span className="font-mono text-xs tabular-nums text-[#fbbf24]">
              +{entry.coinsEarned}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[0.7rem] text-primary">⟁</span>
            <span className="font-mono text-xs tabular-nums text-primary">
              +{AP_PER_WORKOUT} AP
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
