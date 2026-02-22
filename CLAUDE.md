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
- **FFX theme** — rich luminous blues (NOT gloomy near-black), blue primary accent (NOT violet). See [docs/design-system.md](docs/design-system.md) and `.claude/skills/ffx-design/SKILL.md` for the full design reference
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
- **Explicit return types** on all functions and event handlers
- **Single source of truth for colors** — use `SPHERE_META[type].color`, never a parallel color map
- **Module-level style helpers** — extract repeated inline style objects to pure functions (e.g. `glowStyle()`) or `const` objects rather than inlining in JSX
- **Type predicates at filter boundaries** — use `(n): n is T & { field: V }` to narrow types once so `!` non-null assertions are never needed downstream
- **Shared easing constant** — `const EASE = [0.23, 1, 0.32, 1] as const` at module level, never inlined repeatedly

## Layout Rules
- **Shell layout must use nested flex containers**: a top-level `flex-col` for the header + body, then an inner `flex-row` for sidebar + main content. Never put header, sidebar, and main content in a single flex container that switches direction at breakpoints — the header must always span full width at the top.
