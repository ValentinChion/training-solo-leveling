"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/shadcn/card";
import { usePlayer } from "@/features/player/context";
import { STAT_META } from "@/features/player/types";
import type { PlanRequest } from "@/app/api/plan/route";

const EASE = [0.23, 1, 0.32, 1] as const;

const GOALS = [
  { id: "Build Strength", label: "Build Strength", stat: "str" as const },
  { id: "Improve Speed & Cardio", label: "Speed & Cardio", stat: "agi" as const },
  { id: "Build Endurance", label: "Build Endurance", stat: "con" as const },
  { id: "Recovery & Mobility", label: "Recovery & Mobility", stat: "sta" as const },
  { id: "Balanced Training", label: "Balanced", stat: null },
] as const;

const DAYS = [2, 3, 4, 5, 6] as const;
const DURATIONS = [30, 45, 60, 90] as const;

const EQUIPMENT_OPTIONS = [
  { id: "Full Gym", label: "Full Gym" },
  { id: "Home + Weights", label: "Home + Weights" },
  { id: "Bodyweight Only", label: "Bodyweight Only" },
] as const;

interface PillProps {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}

function Pill({ active, color, onClick, children }: PillProps): React.ReactElement {
  const activeStyle: React.CSSProperties = color
    ? { backgroundColor: `${color}22`, borderColor: `${color}80`, color }
    : {
        backgroundColor: "rgba(91,140,255,0.15)",
        borderColor: "rgba(91,140,255,0.6)",
        color: "#5b8cff",
      };

  const idleStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "rgba(232,234,246,0.45)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border px-3 py-1.5 font-body text-xs font-medium transition-all hover:border-white/20 hover:text-foreground/70"
      style={active ? activeStyle : idleStyle}
    >
      {children}
    </button>
  );
}

function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <p className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PlanRenderer({ text }: { text: string }): React.ReactElement {
  const lines = text.split("\n");

  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <p
              key={i}
              className="mt-5 first:mt-0 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary"
            >
              {line.slice(3)}
            </p>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <p
              key={i}
              className="mt-3 first:mt-0 font-display text-[0.65rem] font-semibold uppercase tracking-wider text-foreground/60"
            >
              {line.slice(4)}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="mt-[3px] shrink-0 text-[0.6rem] text-primary/50">▸</span>
              <span className="font-body text-sm text-foreground/80">{line.slice(2)}</span>
            </div>
          );
        }
        if (line.trim() === "" || line.trim() === "---") {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="font-body text-sm text-foreground/70">
            {line}
          </p>
        );
      })}
    </div>
  );
}

type Status = "idle" | "streaming" | "done" | "error";

export default function PlanPage(): React.ReactElement {
  const { player } = usePlayer();

  const [goal, setGoal] = useState<string>("Balanced Training");
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [equipment, setEquipment] = useState<string>("Full Gym");
  const [activities, setActivities] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [plan, setPlan] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleGenerate(): Promise<void> {
    setStatus("streaming");
    setPlan("");

    const body: PlanRequest = {
      goal,
      daysPerWeek,
      sessionDuration,
      equipment,
      activities,
      notes,
      stats: player.stats,
    };

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        setStatus("error");
        setPlan("The Star Stream is unreachable. Check that ANTHROPIC_API_KEY is set.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setPlan((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setPlan("Connection to the Star Stream failed. Please try again.");
    }
  }

  function handleReset(): void {
    setPlan("");
    setStatus("idle");
  }

  const isStreaming = status === "streaming";
  const hasResult = plan.length > 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Form panel ─────────────────────────────────────────────────────── */}
      <motion.div
        className="w-full lg:max-w-xs lg:shrink-0"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Card>
          <CardHeader>
            <p className="section-header text-[0.6rem]">Dokkaebi's Guidance</p>
            <CardTitle className="font-display text-base font-bold tracking-wide text-foreground">
              Plan a Training Week
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Current stats summary */}
            <div className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
              {(["str", "agi", "con", "sta"] as const).map((key) => {
                const { label, color } = STAT_META[key];
                return (
                  <div key={key} className="flex flex-1 flex-col items-center gap-0.5">
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
                      {player.stats[key]}
                    </span>
                    <span className="font-body text-[0.55rem] uppercase tracking-wider text-foreground/35">
                      {label.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Goal */}
            <FormSection label="Goal">
              {GOALS.map(({ id, label, stat }) => (
                <Pill
                  key={id}
                  active={goal === id}
                  color={stat ? STAT_META[stat].color : undefined}
                  onClick={() => setGoal(id)}
                >
                  {label}
                </Pill>
              ))}
            </FormSection>

            {/* Days per week */}
            <FormSection label="Days per week">
              {DAYS.map((d) => (
                <Pill key={d} active={daysPerWeek === d} onClick={() => setDaysPerWeek(d)}>
                  {d}
                </Pill>
              ))}
            </FormSection>

            {/* Session duration */}
            <FormSection label="Session length">
              {DURATIONS.map((d) => (
                <Pill key={d} active={sessionDuration === d} onClick={() => setSessionDuration(d)}>
                  {d} min
                </Pill>
              ))}
            </FormSection>

            {/* Equipment */}
            <FormSection label="Equipment">
              {EQUIPMENT_OPTIONS.map(({ id, label }) => (
                <Pill key={id} active={equipment === id} onClick={() => setEquipment(id)}>
                  {label}
                </Pill>
              ))}
            </FormSection>

            {/* Activities */}
            <div className="space-y-2">
              <p className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
                Activities & Sports (optional)
              </p>
              <input
                type="text"
                placeholder="Jogging, football, basketball…"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:border-primary/50 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <p className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
                Notes (optional)
              </p>
              <textarea
                rows={2}
                placeholder="Injuries, preferences, focus areas…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:border-primary/50 focus:outline-none"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isStreaming}
              className="w-full gap-2 font-display text-xs font-bold uppercase tracking-[0.1em]"
              style={{
                background: isStreaming
                  ? "rgba(91,140,255,0.15)"
                  : "linear-gradient(135deg, #3a6adf 0%, #5b8cff 100%)",
                boxShadow: isStreaming ? "none" : "0 0 20px rgba(91,140,255,0.35)",
              }}
            >
              <Sparkles className="size-3.5" />
              {isStreaming ? "Receiving transmission…" : "Generate Plan"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* ── Response panel ──────────────────────────────────────────────────── */}
      <motion.div
        className="min-h-64 flex-1 lg:sticky lg:top-20"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
      >
        <Card className="min-h-64">
          <AnimatePresence mode="wait">
            {/* Idle placeholder */}
            {!hasResult && status === "idle" && (
              <motion.div
                key="idle"
                className="flex flex-col items-center justify-center gap-3 py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="flex size-12 items-center justify-center rounded-full border border-primary/20"
                  style={{ boxShadow: "0 0 24px rgba(91,140,255,0.12)" }}
                >
                  <Sparkles className="size-5 text-primary/50" />
                </div>
                <p className="font-body text-sm text-foreground/30">
                  Configure your parameters and request a transmission.
                </p>
              </motion.div>
            )}

            {/* Streamed plan */}
            {hasResult && (
              <motion.div
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <p className="section-header text-[0.6rem]">Transmission Received</p>
                  {status === "done" && (
                    <CardAction>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 font-body text-[0.7rem] text-foreground/30 transition-colors hover:text-foreground/60"
                      >
                        <RotateCcw className="size-3" />
                        Reset
                      </button>
                    </CardAction>
                  )}
                </CardHeader>

                <CardContent className="space-y-1">
                  <PlanRenderer text={plan} />
                  {isStreaming && (
                    <span
                      className="inline-block h-3.5 w-0.5 animate-pulse bg-primary/70"
                      style={{ verticalAlign: "middle" }}
                    />
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
