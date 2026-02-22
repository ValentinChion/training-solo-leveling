"use client";

import { BicepsFlexed, Wind, ShieldHalf, Zap, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { SphereType } from "@/lib/orv/constants";

export type SphereSize = "xs" | "sm" | "md" | "lg";

interface SphereIconProps {
  type: SphereType;
  size?: SphereSize;
  /** Show a xN count label next to the sphere */
  count?: number;
  /** Render the hollow/unfilled shell -- animates to filled when toggled off */
  empty?: boolean;
  className?: string;
}

const SPHERE_CONFIG: Record<
  SphereType,
  { light: string; base: string; dark: string; glow: string; Icon: LucideIcon }
> = {
  power:   { light: "#fca5a5", base: "#ef4444", dark: "#7f1d1d", glow: "rgba(239,68,68,0.6)",  Icon: BicepsFlexed },
  speed:   { light: "#86efac", base: "#22c55e", dark: "#14532d", glow: "rgba(34,197,94,0.6)",   Icon: Wind         },
  defense: { light: "#93c5fd", base: "#3b82f6", dark: "#1e3a8a", glow: "rgba(59,130,246,0.6)",  Icon: ShieldHalf   },
  energy:  { light: "#fed7aa", base: "#f97316", dark: "#7c2d12", glow: "rgba(249,115,22,0.6)",  Icon: Zap          },
};

const SIZE_PX: Record<SphereSize, number> = { xs: 18, sm: 26, md: 38, lg: 54 };

const FILL_EASE = [0.23, 1, 0.32, 1] as const;

export function SphereIcon({
  type,
  size = "sm",
  count,
  empty = false,
  className = "",
}: SphereIconProps): React.JSX.Element {
  const { light, base, dark, glow, Icon } = SPHERE_CONFIG[type];
  const px = SIZE_PX[size];
  const iconSize = Math.max(Math.round(px * 0.48), 10);

  const sphere = (
    <div
      aria-label={`${type} sphere${empty ? " (empty)" : ""}`}
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: [
          // Outer dark rim
          `0 0 0 1.5px rgba(0,0,0,0.6)`,
          // Inner-rim highlight
          `0 0 0 2.5px rgba(255,255,255,0.1)`,
          // Drop shadow
          `0 2px 6px rgba(0,0,0,0.55)`,
          // Color glow halo -- dims when empty
          empty
            ? `0 0 ${Math.round(px * 0.22)}px rgba(100,170,255,0.12)`
            : `0 0 ${Math.round(px * 0.55)}px ${glow}`,
          // Inner bottom shadow (depth)
          `inset 0 -${Math.round(px * 0.1)}px ${Math.round(px * 0.22)}px rgba(0,0,0,0.4)`,
          // Inner top rim light
          `inset 0 ${Math.round(px * 0.04)}px ${Math.round(px * 0.09)}px rgba(255,255,255,0.45)`,
        ].join(", "),
      }}
    >
      {/* Layer 1: Dark glass shell */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 48% 44%, rgba(15,22,55,0.96) 0%, rgba(8,12,32,0.98) 60%, rgba(3,5,18,1) 100%)`,
        }}
      />

      {/* Layer 2: Colored fill -- rises from bottom */}
      <motion.div
        initial={false}
        animate={{ scaleY: empty ? 0 : 1 }}
        transition={{ duration: 0.9, ease: FILL_EASE }}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "bottom",
          background: `radial-gradient(ellipse at 48% 44%, ${light} 0%, ${base} 42%, ${dark} 100%)`,
        }}
      />

      {/* Layer 3: Glass highlights */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: [
            `radial-gradient(ellipse at 32% 22%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 14%, transparent 42%)`,
            `radial-gradient(ellipse at 20% 13%, rgba(255,255,255,0.28) 0%, transparent 30%)`,
            `radial-gradient(ellipse at 64% 80%, rgba(255,255,255,0.13) 0%, transparent 26%)`,
          ].join(", "),
        }}
      />

      {/* Layer 4: Lucide icon */}
      <Icon
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -44%)",
          width: iconSize,
          height: iconSize,
          color: empty ? "rgba(100,170,255,0.22)" : "rgba(255,255,255,0.72)",
          filter: empty ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.65))",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );

  if (count !== undefined) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {sphere}
        <span
          className="font-mono tabular-nums font-semibold"
          style={{
            fontSize: Math.round(px * 0.34) + 1,
            color: empty ? "rgba(100,170,255,0.25)" : base,
          }}
        >
          ×{count}
        </span>
      </div>
    );
  }

  return <span className={`inline-flex ${className}`}>{sphere}</span>;
}
