# ORV Fitness Tracker

## Theme
Omniscient Reader's Viewpoint (ORV) progression system applied to fitness tracking.
See [docs/orv-lore.md](docs/orv-lore.md) for the full ORV lore and progression system reference.

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind v4, shadcn/ui
- Zod v4, react-hook-form
- React Context + useReducer for state management (no extra deps), structured for future DB integration

## Design Decisions
- **FFX theme** — rich luminous blues (NOT gloomy near-black), blue primary accent (NOT violet). See [docs/design-system.md](docs/design-system.md) and `.claude/skills/ffx-design/SKILL.md` for the full design reference
- Full ORV system: stats, skills, stigmas, scenarios, constellations, stories, coins
- **Sphere Grid progression** (FFX Sphere Grid + ORV coins) — Dokkaebi's Bag IS the grid, no separate shop
- Two-tier decay: idle stats drain coins first (3-day grace); stat loss only when coins depleted
- Fitness mapping: STR=weights, AGI=running/HIIT, CON=endurance, MAG=yoga/recovery

## Layout Rules
- **Shell layout must use nested flex containers**: a top-level `flex-col` for the header + body, then an inner `flex-row` for sidebar + main content. Never put header, sidebar, and main content in a single flex container that switches direction at breakpoints — the header must always span full width at the top.
