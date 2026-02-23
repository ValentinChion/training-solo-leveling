"use client";

import { useState, useEffect, useRef } from "react";
import { HyperText } from "@/components/ui/magicui/hyper-text";
import type { GraphNode, GraphEdge } from "@/features/sphere-grid/components/GraphCanvas";
import type {
  NodeId,
  GNode,
  GStructure,
  GStructureKind,
  ActiveEdge,
} from "@/features/admin/design-grid-sphere/types";
import {
  RADII,
  NODE_R,
  SPHERE_TYPES,
  COLORS,
  MAX_STRUCTURES,
  HUB_X,
  HUB_Y,
} from "@/features/admin/design-grid-sphere/types";
import { useGridDesign } from "@/features/admin/design-grid-sphere/context";
import {
  buildNodes,
  structCenter,
  svgSize,
  intraCandidates,
  outerRing,
  ekey,
  structOf,
} from "@/features/admin/design-grid-sphere/utils";

// ── Module-level style helpers ───────────────────────────────────────────────

const PANEL_BORDER = "1px solid rgba(255,255,255,0.15)";
const PANEL_BG = "rgba(255,255,255,0.09)";
const MUTED_COLOR = "rgba(255,255,255,0.38)";
const LABEL_COLOR = "rgba(255,255,255,0.85)";
const TEXT_COLOR = "rgba(255,255,255,0.55)";

function modeButtonStyle(active: boolean, accent: string): React.CSSProperties {
  return {
    background: active ? `${accent}30` : "rgba(255,255,255,0.12)",
    border: `1px solid ${active ? accent : "rgba(255,255,255,0.22)"}`,
    color: active ? "#fff" : "rgba(255,255,255,0.88)",
    cursor: "pointer",
  };
}

const MENU_STYLE: React.CSSProperties = {
  position: "absolute",
  transform: "translate(-50%, -130%)",
  zIndex: 20,
  display: "flex",
  gap: 5,
  padding: "6px 8px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.28)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  backdropFilter: "blur(20px)",
};

const MENU_ARROW_STYLE: React.CSSProperties = {
  position: "absolute",
  bottom: -5,
  left: "50%",
  transform: "translateX(-50%)",
  width: 8,
  height: 8,
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.28)",
  borderTop: "none",
  borderLeft: "none",
  rotate: "45deg",
};

const NO_EVENTS_STYLE: React.CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
};

const NO_POINTER_STYLE: React.CSSProperties = { pointerEvents: "none" };

const REMOVE_BUTTON_STYLE: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(100,170,255,0.3)",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
};

const RESET_BUTTON_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.22)",
  color: "rgba(255,255,255,0.88)",
  cursor: "pointer",
};

const OUTPUT_PRE_STYLE: React.CSSProperties = {
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.65)",
  maxHeight: 280,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

function sphereButtonStyle(active: boolean, color: string): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: "50%",
    cursor: "pointer",
    border: active
      ? `2px solid ${color}`
      : "1.5px solid rgba(100,170,255,0.15)",
    background: active ? `${color}30` : "rgba(100,170,255,0.05)",
    color,
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: active ? `0 0 8px ${color}55` : "none",
  };
}

const CLEAR_BUTTON_BASE: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  cursor: "pointer",
  marginLeft: 2,
  color: "rgba(100,170,255,0.45)",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function clearButtonStyle(isNull: boolean): React.CSSProperties {
  return {
    ...CLEAR_BUTTON_BASE,
    border: isNull
      ? "1.5px solid rgba(100,170,255,0.5)"
      : "1.5px solid rgba(100,170,255,0.12)",
    background: isNull ? "rgba(100,170,255,0.12)" : "transparent",
  };
}

function feedbackButtonStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.12)",
    border: `1px solid ${active ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.22)"}`,
    color: active ? "#4ade80" : "rgba(255,255,255,0.88)",
    cursor: "pointer",
  };
}

function saveButtonStyle(saved: boolean): React.CSSProperties {
  return {
    background: saved ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.18)",
    border: `1px solid ${saved ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.30)"}`,
    color: saved ? "#4ade80" : "#fff",
    cursor: "pointer",
  };
}

// ── Initial state ────────────────────────────────────────────────────────────

const SLOT_LABELS = ["Hub", "N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

const INIT_STRUCT: GStructure = { id: "S1", slot: 0, kind: "large", ...structCenter(0) };

// ── Component ────────────────────────────────────────────────────────────────

export default function DesignerPage(): React.JSX.Element {
  const { design, saveDesign, clearDesign } = useGridDesign();
  const snap = design?.designer;

  const [structures, setStructures] = useState<GStructure[]>(() => snap?.structures ?? [INIT_STRUCT]);
  const [nodes, setNodes] = useState<GNode[]>(() => snap?.nodes ?? buildNodes(INIT_STRUCT));
  const [edges, setEdges] = useState<ActiveEdge[]>(() => snap?.edges ?? []);
  const [placeKind, setPlaceKind] = useState<GStructureKind>("large");
  const [bridgeMode, setBridgeMode] = useState(false);
  const [bridgePending, setBridgePending] = useState<NodeId | null>(null);
  const [menu, setMenu] = useState<{ nodeId: NodeId; x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(snap?.nextId ?? 2);

  const nodeMap: Record<string, GNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const activeSet: Set<string> = new Set(edges.map((e) => ekey(e.from, e.to)));
  const { W, H } = svgSize(structures.length);

  const degree: Record<NodeId, number> = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (const { from, to } of edges) {
    if (from in degree) degree[from]++;
    if (to in degree) degree[to]++;
  }

  const allIntra: [NodeId, NodeId][] = structures.flatMap((s) => intraCandidates(s));

  useEffect(() => {
    function onDown(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setBridgePending(null);
        setBridgeMode(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  function addStructureAt(slot: number): void {
    const s: GStructure = {
      id: `S${nextId.current++}`,
      slot,
      kind: placeKind,
      ...structCenter(slot),
    };
    setStructures((prev) => [...prev, s]);
    setNodes((prev) => [...prev, ...buildNodes(s)]);
  }

  function addSingleAt(cx: number, cy: number): void {
    const s: GStructure = { id: `S${nextId.current++}`, slot: -1, kind: "single", cx, cy };
    setStructures((prev) => [...prev, s]);
    setNodes((prev) => [...prev, ...buildNodes(s)]);
  }

  function removeStructure(id: string): void {
    if (structures.length <= 1) return;
    setStructures((prev) => prev.filter((s) => s.id !== id));
    setNodes((prev) => prev.filter((n) => n.structId !== id));
    setEdges((prev) =>
      prev.filter((e) => structOf(e.from) !== id && structOf(e.to) !== id),
    );
  }

  function setType(id: NodeId, type: GNode["type"]): void {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, type } : n)));
    setMenu(null);
  }

  function toggleIntra(a: NodeId, b: NodeId): void {
    const na = nodeMap[a];
    const nb = nodeMap[b];
    if (!na || !nb || na.type === null || nb.type === null) return;

    const k = ekey(a, b);
    if (activeSet.has(k)) {
      setEdges((prev) => prev.filter((e) => ekey(e.from, e.to) !== k));
    } else if ((degree[a] ?? 0) < 2 && (degree[b] ?? 0) < 2) {
      setEdges((prev) => [...prev, { from: a, to: b, kind: "intra" }]);
    }
  }

  function isBridgePoint(node: GNode): boolean {
    const struct = structures.find((s) => s.id === node.structId);
    return !!struct && node.ring === outerRing(struct.kind) && node.type !== null;
  }

  function handleBridgeClick(node: GNode): void {
    if (!isBridgePoint(node)) return;
    if (!bridgePending) {
      setBridgePending(node.id);
      return;
    }
    if (bridgePending === node.id) {
      setBridgePending(null);
      return;
    }
    if (structOf(bridgePending) === structOf(node.id)) {
      setBridgePending(node.id);
      return;
    }

    const k = ekey(bridgePending, node.id);
    if (activeSet.has(k)) {
      setEdges((prev) => prev.filter((e) => ekey(e.from, e.to) !== k));
    } else if ((degree[bridgePending] ?? 0) < 2 && (degree[node.id] ?? 0) < 2) {
      setEdges((prev) => [
        ...prev,
        { from: bridgePending, to: node.id, kind: "bridge" },
      ]);
    }
    setBridgePending(null);
  }

  function handleNodeClick(node: GNode, e: React.MouseEvent): void {
    e.stopPropagation();
    if (bridgeMode) {
      handleBridgeClick(node);
      return;
    }
    setMenu(
      menu?.nodeId === node.id
        ? null
        : { nodeId: node.id, x: node.x, y: node.y },
    );
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>): void {
    if (!bridgeMode && placeKind === "single") {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = Math.round((e.clientX - rect.left) * (W / rect.width));
      const cy = Math.round((e.clientY - rect.top) * (H / rect.height));
      addSingleAt(cx, cy);
      return;
    }
    setMenu(null);
    if (bridgeMode) setBridgePending(null);
  }

  function reset(): void {
    setStructures([INIT_STRUCT]);
    setNodes(buildNodes(INIT_STRUCT));
    setEdges([]);
    setBridgeMode(false);
    setBridgePending(null);
    setMenu(null);
    nextId.current = 2;
    clearDesign();
  }

  function saveToGrid(): void {
    const present = nodes.filter((n) => n.type !== null || n.baseId === "C");
    const ids = new Set(present.map((n) => n.id));
    const firstStructId = structures[0]?.id ?? "S1";
    const graphNodes: GraphNode[] = present.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      ...(n.type ? { type: n.type } : {}),
      ...(n.baseId === "C" && n.structId === firstStructId ? { isStart: true } : {}),
    }));
    const graphEdges: GraphEdge[] = edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e) => ({ from: e.from, to: e.to }));
    saveDesign({
      nodes: graphNodes,
      edges: graphEdges,
      center: { x: HUB_X, y: HUB_Y },
      designer: { structures, nodes, edges, nextId: nextId.current },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(code());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function code(): string {
    const present = nodes.filter((n) => n.type !== null || n.baseId === "C");
    const ids = new Set(present.map((n) => n.id));
    const nodesStr = present
      .map((n) => {
        const t = n.type ? `, type: "${n.type}"` : "";
        const s = n.baseId === "C" && n.structId === "S1" ? ", isStart: true" : "";
        return `  { id: "${n.id}", x: ${n.x}, y: ${n.y}${t}${s} },`;
      })
      .join("\n");
    const edgesStr = edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e) => `  { from: "${e.from}", to: "${e.to}" },`)
      .join("\n");
    return `const NODES: GraphNode[] = [\n${nodesStr}\n];\n\nconst EDGES: GraphEdge[] = [\n${edgesStr}\n];`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <HyperText
          className="font-display text-2xl font-bold tracking-[0.1em] uppercase text-foreground"
          startOnView={false}
        >
          GRID DESIGNER
        </HyperText>
        <p className="section-header mt-1.5">Circular sphere structure builder</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* SVG canvas */}
        <div
          className="flex-1 min-w-0 rounded-xl overflow-auto relative"
          style={{ border: PANEL_BORDER, height: 620 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            style={{
              display: "block",
              userSelect: "none",
              minWidth: W,
              cursor: !bridgeMode && placeKind === "single" ? "crosshair" : "default",
            }}
            onClick={handleSvgClick}
          >
            <rect x="0" y="0" width={W} height={H} fill="rgb(8,12,30)" />
            {/* Empty slot ghosts — only for large/small; single uses canvas click */}
            {!bridgeMode && placeKind !== "single" && Array.from({ length: 8 }, (_, i) => i + 1).map((slot) => {
              if (structures.some((s) => s.slot === slot)) return null;
              const { cx, cy } = structCenter(slot);
              const label = SLOT_LABELS[slot];
              const ghostR = placeKind === "small" ? RADII[1] : RADII[3];
              return (
                <g
                  key={`ghost-${slot}`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); addStructureAt(slot); }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={ghostR}
                    fill="none"
                    stroke="rgba(100,170,255,0.05)"
                    strokeWidth={1}
                    strokeDasharray="4 10"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={24}
                    fill="rgba(100,170,255,0.04)"
                    stroke="rgba(100,170,255,0.13)"
                    strokeWidth={1}
                    strokeDasharray="3 4"
                  />
                  <text
                    x={cx}
                    y={cy + 7}
                    textAnchor="middle"
                    fontSize={20}
                    fill="rgba(100,170,255,0.18)"
                    style={NO_EVENTS_STYLE}
                  >
                    +
                  </text>
                  <text
                    x={cx}
                    y={cy - ghostR - 6}
                    textAnchor="middle"
                    fontSize={9}
                    fill="rgba(100,170,255,0.2)"
                    style={NO_EVENTS_STYLE}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Ring guides per structure */}
            {structures.map((s) => (
              <g key={s.id}>
                {RADII.slice(1).map((r) => (
                  <circle
                    key={r}
                    cx={s.cx}
                    cy={s.cy}
                    r={r}
                    fill="none"
                    stroke="rgba(100,170,255,0.06)"
                    strokeWidth={1}
                    strokeDasharray="2 6"
                  />
                ))}
                <text
                  x={s.cx}
                  y={s.cy - RADII[3] - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fill="rgba(100,170,255,0.25)"
                  style={NO_EVENTS_STYLE}
                >
                  {s.id}
                </text>
              </g>
            ))}

            {/* Intra-structure candidate edges */}
            {allIntra.map(([a, b]) => {
              const na = nodeMap[a];
              const nb = nodeMap[b];
              if (!na || !nb) return null;
              const k = ekey(a, b);
              const active = activeSet.has(k);
              const bothOn = na.type !== null && nb.type !== null;
              const blocked =
                !active &&
                bothOn &&
                ((degree[a] ?? 0) >= 2 || (degree[b] ?? 0) >= 2);
              return (
                <g key={k}>
                  <line
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={
                      active
                        ? "rgba(91,140,255,0.85)"
                        : bothOn
                          ? "rgba(100,170,255,0.18)"
                          : "rgba(100,170,255,0.05)"
                    }
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={active ? undefined : "3 4"}
                  />
                  {bothOn && !bridgeMode && (
                    <line
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ cursor: blocked ? "not-allowed" : "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIntra(a, b);
                      }}
                    />
                  )}
                </g>
              );
            })}

            {/* Bridge edges */}
            {edges
              .filter((e) => e.kind === "bridge")
              .map((e) => {
                const na = nodeMap[e.from];
                const nb = nodeMap[e.to];
                if (!na || !nb) return null;
                const k = ekey(e.from, e.to);
                return (
                  <g key={k}>
                    <line
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      opacity={0.8}
                    />
                    {bridgeMode && (
                      <line
                        x1={na.x}
                        y1={na.y}
                        x2={nb.x}
                        y2={nb.y}
                        stroke="transparent"
                        strokeWidth={14}
                        style={{ cursor: "pointer" }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEdges((prev) =>
                            prev.filter((e3) => ekey(e3.from, e3.to) !== k),
                          );
                        }}
                      />
                    )}
                  </g>
                );
              })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isHub = node.baseId === "C";
              const r = isHub ? 8 : NODE_R;
              const color = node.type
                ? COLORS[node.type]
                : "rgba(100,170,255,0.28)";
              const deg = degree[node.id] ?? 0;
              const isBridgeable = bridgeMode && isBridgePoint(node);
              const isPending = node.id === bridgePending;
              return (
                <g
                  key={node.id}
                  style={{
                    cursor: bridgeMode
                      ? isBridgeable
                        ? "crosshair"
                        : "default"
                      : "pointer",
                  }}
                  onClick={(e) => handleNodeClick(node, e)}
                >
                  {isPending && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 7}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  )}
                  {isBridgeable && !isPending && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 5}
                      fill="none"
                      stroke="rgba(245,158,11,0.28)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={
                      node.type
                        ? `${color}20`
                        : "rgba(100,170,255,0.03)"
                    }
                    stroke={color}
                    strokeWidth={node.type ? 1.5 : 1}
                    strokeDasharray={
                      node.type || isHub ? undefined : "3 3"
                    }
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize={node.type ? 8 : 9}
                    fill={node.type ? color : "rgba(100,170,255,0.3)"}
                    style={NO_POINTER_STYLE}
                  >
                    {node.type ? node.type[0].toUpperCase() : "\u00B7"}
                  </text>
                  {deg > 0 && (
                    <text
                      x={node.x + r + 4}
                      y={node.y + 3}
                      fontSize={7}
                      fill="rgba(140,190,255,0.55)"
                      style={NO_POINTER_STYLE}
                    >
                      {deg}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating type picker */}
          {!bridgeMode &&
            menu &&
            (() => {
              const node = nodeMap[menu.nodeId];
              if (!node) return null;
              return (
                <div
                  ref={menuRef}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{
                    ...MENU_STYLE,
                    left: `${(menu.x / W) * 100}%`,
                    top: `${(menu.y / H) * 100}%`,
                  }}
                >
                  <div style={MENU_ARROW_STYLE} />
                  {SPHERE_TYPES.map((t) => {
                    const active = node.type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(menu.nodeId, active ? null : t)}
                        title={t}
                        style={sphereButtonStyle(active, COLORS[t])}
                      >
                        {t[0].toUpperCase()}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setType(menu.nodeId, null)}
                    title="Remove"
                    style={clearButtonStyle(node.type === null)}
                  >
                    x
                  </button>
                </div>
              );
            })()}
        </div>

        {/* Right panel */}
        <div className="w-60 shrink-0 flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setBridgeMode(false);
                setBridgePending(null);
              }}
              className="flex-1 text-[10px] py-2 rounded font-semibold tracking-wide uppercase"
              style={modeButtonStyle(!bridgeMode, "rgba(91,140,255,0.95)")}
            >
              Edit
            </button>
            <button
              onClick={() => {
                setBridgeMode(true);
                setMenu(null);
              }}
              className="flex-1 text-[10px] py-2 rounded font-semibold tracking-wide uppercase"
              style={modeButtonStyle(bridgeMode, "#f59e0b")}
            >
              Bridge
            </button>
          </div>

          {/* Place kind */}
          {!bridgeMode && (
            <div>
              <div className="section-header mb-2">Place</div>
              <div className="flex gap-1.5">
                {(["large", "small", "single"] as GStructureKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPlaceKind(k)}
                    className="flex-1 text-[9px] py-1.5 rounded font-semibold tracking-wide uppercase"
                    style={modeButtonStyle(placeKind === k, "rgba(91,140,255,0.95)")}
                  >
                    {k}
                  </button>
                ))}
              </div>
              {placeKind === "single" && (
                <p className="mt-1.5 text-[10px]" style={{ color: "rgba(100,170,255,0.35)" }}>
                  Click anywhere on the canvas
                </p>
              )}
              {placeKind !== "single" && structures.length < MAX_STRUCTURES && (
                <p className="mt-1.5 text-[10px]" style={{ color: "rgba(100,170,255,0.35)" }}>
                  Click a + on the canvas
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div
            className="rounded-lg p-3 text-[11px] leading-relaxed space-y-1.5"
            style={{ background: "rgba(255,255,255,0.09)", border: PANEL_BORDER }}
          >
            {!bridgeMode ? (
              <>
                <p style={{ color: TEXT_COLOR }}>
                  <span style={{ color: LABEL_COLOR }}>Click node</span> -- pick
                  type
                </p>
                <p style={{ color: TEXT_COLOR }}>
                  <span style={{ color: LABEL_COLOR }}>Click edge</span> -- toggle
                  connection
                </p>
                <p style={{ color: TEXT_COLOR }}>
                  Max <span style={{ color: LABEL_COLOR }}>2 connections</span> per
                  node
                </p>
              </>
            ) : (
              <>
                <p style={{ color: "#f59e0b", fontWeight: 600 }}>Bridge mode</p>
                <p style={{ color: TEXT_COLOR }}>
                  Click an <span style={{ color: "#f59e0b" }}>outer ring</span> node,
                  then one from a different structure.
                </p>
                <p style={{ color: TEXT_COLOR }}>Click a bridge to remove it.</p>
                <p style={{ color: MUTED_COLOR, fontSize: 10 }}>Esc to cancel</p>
              </>
            )}
          </div>

          {/* Structures list */}
          <div>
            <div className="section-header mb-2">Structures</div>
            <div className="flex flex-col gap-1.5">
              {structures.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: PANEL_BG,
                    border: "1px solid rgba(100,170,255,0.1)",
                  }}
                >
                  <span
                    className="font-mono text-[11px] flex-1"
                    style={{ color: "rgba(140,190,255,0.8)" }}
                  >
                    {s.id}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wide"
                    style={{ color: "rgba(100,170,255,0.3)" }}
                  >
                    {s.kind}
                  </span>
                  {structures.length > 1 && (
                    <button
                      onClick={() => removeStructure(s.id)}
                      style={REMOVE_BUTTON_STYLE}
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save to grid */}
          <button
            onClick={saveToGrid}
            className="w-full text-[10px] py-2 rounded font-semibold tracking-wide uppercase"
            style={saveButtonStyle(saved)}
          >
            {saved ? "Saved to Grid!" : "Save to Dokkaebi's Bag"}
          </button>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="flex-1 text-[10px] py-1.5 rounded font-semibold tracking-wide uppercase"
              style={feedbackButtonStyle(copied)}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={reset}
              className="flex-1 text-[10px] py-1.5 rounded font-semibold tracking-wide uppercase"
              style={RESET_BUTTON_STYLE}
            >
              Reset
            </button>
          </div>

          {/* Output */}
          <div>
            <div className="section-header mb-2">Output</div>
            <pre
              className="text-[8.5px] leading-relaxed rounded-lg p-2.5 overflow-auto"
              style={OUTPUT_PRE_STYLE}
            >
              {code()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
