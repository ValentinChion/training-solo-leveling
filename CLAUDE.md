# ORV Fitness Tracker

## Theme
Omniscient Reader's Viewpoint (ORV) progression system applied to fitness tracking.
See [docs/orv-lore.md](docs/orv-lore.md) for the full ORV lore and progression system reference.

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind v4, shadcn/ui
- Zod v4, react-hook-form
- motion/react v12 for animations — import from `motion/react`, NOT `framer-motion`
- React Context + useReducer for state management (no extra deps), structured for future DB integration

## Design Decisions
- **FFX theme** — rich luminous blues, blue primary accent (NOT violet). See [docs/design-system.md](docs/design-system.md) and `.claude/skills/ffx-design/SKILL.md` for the full design reference. Note: the ffx-design skill describes a *dark* midnight-blue background — **our actual implementation uses a lighter lavender atmosphere instead** (see below).
- **Page background / atmosphere** — The page background is a **soft lavender-blue diagonal gradient** (`#9aa4c8 → #8089b8 → #7078b0 → #636ea4`, 150°). This is set as a CSS `background` shorthand directly on `:root` (NOT as `--background`, and NOT via `@apply bg-background` on body — that line is commented out intentionally). **Never replace this with a dark background.** The lavender creates the signature "world atmosphere" — a warm mid-tone blue-violet sky that the whole UI floats in.
- **Panel style: frosted glass** — All surfaces use a frosted glass treatment: `bg-white/[0.12] backdrop-blur-[16px] border border-white/20`, hovering to `bg-white/[0.17] border-white/30`. This creates a soft, airy feel — panels look like frosted panes floating in the lavender atmosphere. Do NOT use dark navy gradients (`rgba(20,40,100,...)`) for panels.
- **Subtle inner panels** (e.g. instruction boxes, list items): lighter frosted — `rgba(255,255,255,0.09)` bg, `rgba(255,255,255,0.15)` border.
- **Dark-on-dark exception** — Code/output blocks stay semi-dark: `rgba(0,0,0,0.25)` bg, `rgba(255,255,255,0.10)` border. They're terminal-style and need high contrast for text.
- **Sidebar** — fully transparent/dissolved into the lavender background. Nav items float as recessive text; only the active item gets a radial corona highlight. No panel, no border, no box.
- **Header** — transparent, no background fill. Blends with the lavender sky; only the bottom border (`border-white/[0.07]`) marks its boundary.
- **Text on frosted glass** — use white-based colors: `rgba(255,255,255,0.85)` for labels, `rgba(255,255,255,0.55)` for secondary text, `rgba(255,255,255,0.38)` for muted. Avoid low-opacity blue text (`rgba(100,170,255,0.35)`) — it lacks contrast on the lightened frosted panel.
- **shadcn Card** (`components/ui/shadcn/card.tsx`) — already applies the frosted glass base. Use `<Card>` directly; the style comes from the component's default className.
- Full ORV system: stats, skills, stigmas, scenarios, constellations, stories, coins
- **Sphere Grid / Dokkaebi's Bag** — graph-based canvas with pan/zoom (div + CSS transform, non-passive wheel), SVG edges. State model: `currentNode` (position), `visitedNodes` (attained), `activatedEdges` (traversed paths), `activatedNodes` (filled spheres). **Moving ≠ activating** — spheres only fill when explicitly spending resources.
- Two-tier decay: idle stats drain coins first (3-day grace); stat loss only when coins depleted
- Fitness mapping: STR=weights, AGI=running/HIIT, CON=endurance, STA=recovery & energy training

## Structure

Feature-based: `src/features/<name>/` is the home for all domain logic.

| File | Role |
|------|------|
| `types.ts` | Domain types **and** domain constants (e.g. `SPHERE_META`, `STAT_META`) — never a separate `constants.ts` |
| `utils.ts` | Pure business-logic functions |
| `context.tsx` | Reducer + actions union + context + `use*` hook — only for stateful features |
| `mock.ts` | Seed / mock data |

**Component layering:**
- `components/ui/shadcn/` — shadcn primitives; `components/ui/magicui/` — magicui animations
- `components/features/` — app-shell components (header, sidebar)
- `components/<feature>/` — feature-specific UI

**Import rules:** Cross-feature references use relative paths (`../spheres/utils`). Component/app code uses `@/features/<name>`. `lib/orv/` holds shared constants still being migrated — prefer `features/` for new code.

**Providers:** `providers/<name>.tsx` wrappers are thin — they just render the feature's `<NameProvider>`.

## Coding Conventions
- **No manual memoization** — never use `useMemo`, `useCallback`, or `React.memo`. The React Compiler handles this automatically.
- **Explicit return types** on all functions and event handlers
- **Single source of truth for colors** — use `SPHERE_META[type].color`, never a parallel color map
- **Module-level style helpers** — extract repeated inline style objects to pure functions (e.g. `glowStyle()`) or `const` objects rather than inlining in JSX
- **Type predicates at filter boundaries** — use `(n): n is T & { field: V }` to narrow types once so `!` non-null assertions are never needed downstream
- **Shared easing constant** — `const EASE = [0.23, 1, 0.32, 1] as const` at module level, never inlined repeatedly

## Business Logic

### Sphere Grid (Dokkaebi's Bag)
- **Graph topology**: each non-hub node has **at most 2 edges** (linear chains). Dead-end nodes have 1. The hub/start is the only node allowed more connections (one per arm). No branching within an arm.
- **Arms**: 4 linear arms radiating from the hub, one per stat type (power=STR, speed=AGI, defense=CON, energy=STA). Each arm is ~4 nodes long.
- **AP movement cost**: clicking any node finds the shortest path (BFS) and sums per-hop costs:
  - New node (never visited): **1 AP**
  - nth revisit-move overall: **ceil(n/3) AP** — so revisits 1–3 cost 1 AP each, 4–6 cost 2 each, etc.
- **AP earning**: 2 AP per `LOG_WORKOUT` dispatch.
- **Moving ≠ activating**: reaching a node (spending AP) only marks it visited. Filling a sphere requires a separate explicit action spending spheres + coins.

## Layout Rules
- **Shell layout must use nested flex containers**: a top-level `flex-col` for the header + body, then an inner `flex-row` for sidebar + main content. Never put header, sidebar, and main content in a single flex container that switches direction at breakpoints — the header must always span full width at the top.
