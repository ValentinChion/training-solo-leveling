"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPHERE_META, nodeActivationCost, type SphereType } from "@/lib/orv/constants";
import { SphereIcon } from "@/components/orv/sphere-icon";

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  type?: SphereType;
  activated?: boolean;
  isStart?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
}

// New-node moves cost 1 AP. Revisit-move n costs ceil(n/3) AP.
function revisitApCost(revisitCount: number): number {
  return Math.ceil(revisitCount / 3);
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  center?: { x: number; y: number };
  spheres?: Partial<Record<SphereType, number>>;
  coins?: number;
  ap?: number;
  onActivate?: (nodeId: string, sphereType: SphereType, cost: { spheres: number; coins: number }) => void;
  onMove?: (apCost: number) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const HUB_COLOR = "#93c5fd";
const EASE = [0.23, 1, 0.32, 1] as const;

function colorFor(type: SphereType | undefined): string {
  return type ? SPHERE_META[type].color : HUB_COLOR;
}

const HUB_DOT: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "radial-gradient(circle at 38% 35%, rgba(160,200,255,0.5) 0%, rgba(30,60,130,0.85) 100%)",
  border: "1px solid rgba(120,180,255,0.5)",
  boxShadow: "0 0 6px rgba(91,140,255,0.35), 0 0 0 1px rgba(0,0,0,0.4)",
};

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

function glowStyle(color: string, inset: number, blur: number, spread: number, alpha: string): React.CSSProperties {
  return {
    position: "absolute",
    inset,
    borderRadius: "50%",
    boxShadow: `0 0 ${blur}px ${spread}px ${color}${alpha}`,
    pointerEvents: "none",
  };
}

export function GraphCanvas({
  nodes,
  edges,
  center = { x: 0, y: 0 },
  spheres,
  coins,
  ap,
  onActivate,
  onMove,
}: GraphCanvasProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const [t, setT] = useState(transformRef.current);
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });

  const startId = useMemo(
    () => nodes.find(n => n.isStart)?.id ?? nodes[0]?.id ?? "",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [currentNode, setCurrentNode] = useState<string>(startId);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(
    () => new Set([startId].filter(Boolean)),
  );
  const [activatedEdges, setActivatedEdges] = useState<Set<string>>(new Set());
  const [activatedNodes, setActivatedNodes] = useState<Set<string>>(
    () => new Set(nodes.filter(n => n.activated).map(n => n.id)),
  );
  const [hoveredActivationNode, setHoveredActivationNode] = useState<string | null>(null);
  // Total revisit-moves made this session. Cost of the next revisit = ceil((revisitCount+1)/3).
  const [revisitCount, setRevisitCount] = useState(0);

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map(n => [n.id, n])),
    [nodes],
  );

  const reachableIds = useMemo(() => {
    const set = new Set<string>();
    for (const e of edges) {
      if (e.from === currentNode) set.add(e.to);
      if (e.to === currentNode) set.add(e.from);
    }
    return set;
  }, [currentNode, edges]);

  const activatableNodes = useMemo(() => {
    const candidates = new Set([currentNode, ...reachableIds]);
    return [...candidates]
      .map(id => nodeMap[id])
      .filter((n): n is GraphNode & { type: SphereType } => !!n?.type && !activatedNodes.has(n.id));
  }, [currentNode, reachableIds, nodeMap, activatedNodes]);

  // BFS: returns shortest path [from, …, to], or null if unreachable.
  function findPath(from: string, to: string): string[] | null {
    if (from === to) return null;
    const queue: string[][] = [[from]];
    const seen = new Set<string>([from]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const cur = path[path.length - 1];
      for (const e of edges) {
        const nb = e.from === cur ? e.to : e.to === cur ? e.from : null;
        if (!nb || seen.has(nb)) continue;
        const next = [...path, nb];
        if (nb === to) return next;
        seen.add(nb);
        queue.push(next);
      }
    }
    return null;
  }

  // Total AP cost to walk a path, simulating revisitCount accumulation step-by-step.
  function pathApCost(path: string[]): number {
    let total = 0;
    let rc = revisitCount;
    const future = new Set(visitedNodes);
    for (let i = 1; i < path.length; i++) {
      const id = path[i];
      if (!future.has(id)) {
        total += 1;
        future.add(id);
      } else {
        rc++;
        total += revisitApCost(rc);
      }
    }
    return total;
  }

  function canAffordMove(nodeId: string): boolean {
    const path = findPath(currentNode, nodeId);
    if (!path) return false;
    return (ap ?? Infinity) >= pathApCost(path);
  }

  function move(nodeId: string): void {
    const path = findPath(currentNode, nodeId);
    if (!path) return;
    const cost = pathApCost(path);
    if ((ap ?? Infinity) < cost) return;

    const newVisited = new Set(visitedNodes);
    const newEdges = new Set(activatedEdges);
    let rc = revisitCount;
    let prev = path[0];

    for (let i = 1; i < path.length; i++) {
      const id = path[i];
      newEdges.add(edgeKey(prev, id));
      if (!newVisited.has(id)) {
        newVisited.add(id);
      } else {
        rc++;
      }
      prev = id;
    }

    setCurrentNode(path[path.length - 1]);
    setVisitedNodes(newVisited);
    setActivatedEdges(newEdges);
    setRevisitCount(rc);
    if (cost > 0) onMove?.(cost);
  }

  function activate(node: GraphNode & { type: SphereType }): void {
    const cost = nodeActivationCost(activatedNodes.size);
    const canAfford = (spheres?.[node.type] ?? 0) >= cost.spheres && (coins ?? 0) >= cost.coins;
    if (!canAfford) return;
    setActivatedNodes(prev => new Set([...prev, node.id]));
    onActivate?.(node.id, node.type, cost);
  }

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const next = { x: width / 2 - center.x, y: height / 2 - center.y, scale: 1 };
    transformRef.current = next;
    setT(next);
  }, [center.x, center.y]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cur = transformRef.current;
      const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cur.scale * factor));
      const ratio = scale / cur.scale;
      const next = { x: mx + (cur.x - mx) * ratio, y: my + (cur.y - my) * ratio, scale };
      transformRef.current = next;
      setT(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = {
      mx: e.clientX, my: e.clientY,
      tx: transformRef.current.x, ty: transformRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    if (!isPanning.current) return;
    const x = panStart.current.tx + (e.clientX - panStart.current.mx);
    const y = panStart.current.ty + (e.clientY - panStart.current.my);
    const next = { ...transformRef.current, x, y };
    transformRef.current = next;
    setT(next);
  }

  function onPointerUp(): void { isPanning.current = false; }

  return (
    <div
      ref={outerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        style={{
          position: "absolute",
          transformOrigin: "0 0",
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          willChange: "transform",
        }}
      >
        <svg
          style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }}
          width={0}
          height={0}
        >
          <defs>
            <filter id="edge-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="edge-glow-active" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {[...activatedEdges].map(key => {
              const [aId, bId] = key.split("|");
              const a = nodeMap[aId];
              const b = nodeMap[bId];
              if (!a || !b) return null;
              return (
                <linearGradient
                  key={key}
                  id={`grad_${key.replace("|", "_")}`}
                  gradientUnits="userSpaceOnUse"
                  x1={a.x} y1={a.y}
                  x2={b.x} y2={b.y}
                >
                  <stop offset="0%" stopColor={colorFor(a.type)} />
                  <stop offset="100%" stopColor={colorFor(b.type)} />
                </linearGradient>
              );
            })}
          </defs>

          {edges.map(({ from, to }) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            if (!a || !b) return null;
            const key = edgeKey(from, to);
            const active = activatedEdges.has(key);
            return (
              <line
                key={`${from}→${to}`}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke={active ? `url(#grad_${key.replace("|", "_")})` : "rgba(100,170,255,0.35)"}
                strokeWidth={active ? 3 : 1.5}
                filter={active ? "url(#edge-glow-active)" : "url(#edge-glow)"}
              />
            );
          })}
        </svg>

        {nodes.map(node => {
          const isCurrent = node.id === currentNode;
          const isReachable = reachableIds.has(node.id);
          const isVisited = visitedNodes.has(node.id);
          const isActivated = activatedNodes.has(node.id);
          const isTargeted = hoveredActivationNode === node.id;
          const moveable = !isCurrent && canAffordMove(node.id);
          const opacity = isCurrent || isReachable || isVisited ? 1 : 0.35;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                style={{
                  display: "inline-flex",
                  opacity: isReachable && !moveable ? 0.4 : opacity,
                  transition: "opacity 0.3s ease",
                  cursor: moveable ? "pointer" : isReachable ? "not-allowed" : "default",
                }}
                animate={{ scale: isTargeted ? 1.22 : 1 }}
                transition={{ duration: 0.2, ease: EASE }}
                onPointerDown={moveable ? e => { e.stopPropagation(); move(node.id); } : undefined}
              >
                {isCurrent && (
                  <motion.div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: -8,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(255,255,255,0.65)",
                      pointerEvents: "none",
                    }}
                    animate={{ scale: [1, 1.85], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                <AnimatePresence>
                  {isTargeted && node.type && (
                    <motion.div
                      key="target-ring"
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: -11,
                        borderRadius: "50%",
                        border: `1.5px solid ${SPHERE_META[node.type].color}`,
                        boxShadow: `0 0 18px 4px ${SPHERE_META[node.type].color}55`,
                        pointerEvents: "none",
                      }}
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: [0.9, 0.5, 0.9], scale: [1, 1.12, 1] }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                  )}
                </AnimatePresence>

                {isVisited && !isCurrent && node.type && !isActivated && (
                  <div aria-hidden style={glowStyle(SPHERE_META[node.type].color, -4, 14, 5, "4d")} />
                )}

                {isActivated && node.type && (
                  <div aria-hidden style={glowStyle(SPHERE_META[node.type].color, -6, 20, 8, "66")} />
                )}

                {node.type ? (
                  <SphereIcon type={node.type} size="sm" empty={!isActivated} />
                ) : (
                  <div style={HUB_DOT} />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* AP counter HUD — top right */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 10,
          backdropFilter: "blur(16px)",
          padding: "7px 12px",
          pointerEvents: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <polygon
            points="7,1 13,5 13,9 7,13 1,9 1,5"
            fill="rgba(91,140,255,0.18)"
            stroke={ap === 0 ? "rgba(100,170,255,0.25)" : "rgba(91,140,255,0.9)"}
            strokeWidth="1.2"
          />
          <polygon
            points="7,3.5 11,6 11,8.5 7,11 3,8.5 3,6"
            fill={ap === 0 ? "rgba(100,170,255,0.08)" : "rgba(91,140,255,0.45)"}
          />
        </svg>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "monospace",
          color: ap === 0 ? "rgba(232,234,246,0.3)" : "rgba(140,190,255,0.95)",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}>
          {ap ?? 0}
        </span>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(100,170,255,0.5)",
          lineHeight: 1,
        }}>
          AP
        </span>
        {revisitCount > 0 && (
          <span style={{
            fontSize: 9,
            fontFamily: "monospace",
            color: "rgba(100,170,255,0.45)",
            lineHeight: 1,
            marginLeft: 2,
          }}>
            next ×{revisitApCost(revisitCount + 1)}
          </span>
        )}
      </div>

      <AnimatePresence>
        {activatableNodes.length > 0 && (
          <motion.div
            key="activation-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 10,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              backdropFilter: "blur(16px)",
              padding: "12px 14px",
              minWidth: 252,
              cursor: "default",
            }}
            onPointerDown={e => e.stopPropagation()}
          >
            <div style={{
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}>
              Activate Nearby Spheres
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {activatableNodes.map(node => {
                const cost = nodeActivationCost(activatedNodes.size);
                const hasSpheres = (spheres?.[node.type] ?? 0) >= cost.spheres;
                const hasCoins = (coins ?? 0) >= cost.coins;
                const canAfford = hasSpheres && hasCoins;
                const color = SPHERE_META[node.type].color;
                const isHere = node.id === currentNode;
                const isRowHovered = hoveredActivationNode === node.id;

                return (
                  <div
                    key={node.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 6px",
                      borderRadius: 7,
                      background: isRowHovered
                        ? `${color}18`
                        : isHere ? "rgba(100,170,255,0.07)" : "transparent",
                      borderLeft: isRowHovered
                        ? `2px solid ${color}88`
                        : "2px solid transparent",
                      transition: "background 0.15s, border-color 0.15s",
                      cursor: "default",
                    }}
                    onMouseEnter={() => setHoveredActivationNode(node.id)}
                    onMouseLeave={() => setHoveredActivationNode(null)}
                  >
                    <SphereIcon type={node.type} size="xs" empty />

                    <span style={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 500,
                      color: canAfford ? "#e8eaf6" : "rgba(232,234,246,0.35)",
                    }}>
                      {SPHERE_META[node.type].label}
                      {isHere && (
                        <span style={{ marginLeft: 5, fontSize: 9, color: "rgba(100,170,255,0.55)" }}>
                          ·here
                        </span>
                      )}
                    </span>

                    <span style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: hasSpheres ? "rgba(140,190,255,0.8)" : "#ef4444",
                    }}>
                      ×{cost.spheres}
                    </span>

                    <span style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: hasCoins ? "#fbbf24" : "#ef4444",
                    }}>
                      +{cost.coins}₵
                    </span>

                    <button
                      disabled={!canAfford}
                      onClick={() => activate(node)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: canAfford
                          ? `1px solid ${color}55`
                          : "1px solid rgba(100,170,255,0.12)",
                        background: canAfford ? `${color}18` : "transparent",
                        color: canAfford ? color : "rgba(232,234,246,0.2)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: canAfford ? "pointer" : "not-allowed",
                        transition: "border-color 0.15s, background 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      Activate
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
