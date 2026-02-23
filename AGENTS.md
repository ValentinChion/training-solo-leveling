# Agent Guidelines for ORV Fitness Tracker

This file provides coding guidelines and commands for agents working on this codebase.

## Commands

### Development
```bash
pnpm dev       # Start Next.js dev server
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

### Testing
No test framework is currently set up. When adding tests:
```bash
pnpm test              # Run all tests
pnpm test -- <file>    # Run single test file
pnpm test -- --watch  # Watch mode
```
Add test scripts to `package.json` using Vitest. Place tests alongside source files with `.test.ts` or `.test.tsx`.
---

## Code Style Guidelines

### Project Structure
- **Feature-based**: All domain logic lives in `src/features/<name>/`
- **Feature files**:
  - `types.ts` — Domain types AND constants (e.g., `SPHERE_META`, `STAT_META`)
  - `utils.ts` — Pure business logic functions
  - `context.tsx` — Reducer + actions + context + `use*` hooks (stateful features only)
  - `mock.ts` — Seed/mock data
- **Component layering**:
  - `components/ui/shadcn/` — shadcn primitives
  - `components/ui/magicui/` — MagicUI animations
  - `components/features/` — App shell components (header, sidebar)
  - `components/<feature>/` — Feature-specific UI

### Imports
- Cross-feature references: relative paths (`../spheres/utils`)
- Component/app code: `@/features/<name>` aliases
- Shared constants: `lib/orv/` (migration in progress)
- **Never import from `framer-motion`** — use `motion/react` instead

### TypeScript Conventions
- **Explicit return types** on all functions and event handlers
- **Type predicates at filter boundaries**: use `(n): n is T & { field: V }` to narrow types once; avoid `!` non-null assertions downstream
- **Single source of truth for colors**: use `SPHERE_META[type].color` or `STAT_META[statType].color`, never parallel color maps

### React/State Management
- **No manual memoization**: Never use `useMemo`, `useCallback`, or `React.memo` — the React Compiler handles this
- Use Context + useReducer for stateful features
- State model: `currentNode`, `visitedNodes`, `activatedEdges`, `activatedNodes`
- **Moving ≠ activating**: Reaching a node (spending AP) only marks it visited; filling a sphere requires explicit resource spend

### Styling & Animation
- **Shared easing constant**: `const EASE = [0.23, 1, 0.32, 1] as const` at module level, never inlined
- **Module-level style helpers**: Extract repeated inline style objects to pure functions or `const` objects
- Use Tailwind v4 utility classes + CSS custom properties from design-system
- **FFX Theme**: Rich luminous blues, blue primary accent (NOT violet). See `docs/design-system.md`
- Glow colors via design tokens: `--primary-glow`, `--stat-str`, `--sphere-power`, etc.

### Layout Rules
- Shell layout uses **nested flex containers**:
  - Top-level: `flex-col` for header + body
  - Inner: `flex-row` for sidebar + main content
- Never put header, sidebar, and main in a single flex container that switches direction

### Naming Conventions
- Files: kebab-case (`sphere-icon.tsx`, `player-context.tsx`)
- Types/Interfaces: PascalCase (`PlayerProfile`, `StatType`)
- Constants: SCREAMING_Snake_Case for config values (`STAT_TYPES`)
- React components: PascalCase
- Custom hooks: camelCase with `use` prefix (`usePlayer`, `useMobile`)

### Error Handling
- Throw descriptive errors in context hooks: `throw new Error("usePlayer must be used within a <PlayerProvider>")`
- Validate inputs in reducers; return unchanged state on invalid action
- Use Zod for form validation with react-hook-form

### Business Logic (Sphere Grid / Dokkaebi's Bag)
- Graph topology: each non-hub node has at most 2 edges (linear chains)
- 4 arms radiating from hub: power (STR), speed (AGI), defense (CON), energy (STA)
- AP movement cost: 1 AP for first visit, `ceil(n/3)` for nth revisit-move
- AP earning: 2 AP per `LOG_WORKOUT` dispatch

### Fitness Mapping
- STR = weights/resistance, AGI = running/HIIT, CON = endurance activities, STA = recovery & energy

---

## Technical Stack, Database & API Conventions

### Technical Stack
- **Framework**: Next.js 16 with React 19 and React Compiler
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Animations**: motion/react v12 (NOT framer-motion)
- **State**: React Context + useReducer
- **Forms**: react-hook-form + Zod validation
- **Database**: Prisma with SQLite (development)
- **UI Components**: shadcn primitives + MagicUI
- **Icons**: lucide-react

### API Routes
- API routes: `src/app/api/<feature>/route.ts`
- Use standard Next.js route handlers with typed request/response
- Validate incoming data with Zod schemas, return proper HTTP status codes
- Keep business logic in `features/` modules, not in route handlers

### Database (Prisma)
- Schema file: `prisma/schema.prisma`
- Models: singular naming (`Player`, not `Players`)
- Use `Int` for IDs with `@default(autoincrement())`, add `@updatedAt` to all models
- Run migrations with `npx prisma migrate dev`, generate client with `npx prisma generate`

---

## Component Patterns

### Functional Components
```tsx
export function ComponentName({ prop1, prop2 }: ComponentNameProps): ReactElement {
  return <div className="...">{/* JSX */}</div>;
}
```

### Context Providers
```tsx
const NameContext = createContext<NameContextValue | null>(null);

export function NameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <NameContext value={{ state, dispatch }}>{children}</NameContext>;
}

export function useName(): NameContextValue {
  const ctx = useContext(NameContext);
  if (!ctx) throw new Error("useName must be used within a <NameProvider>");
  return ctx;
}
```

### Reducer Actions
```tsx
export type Action = { type: "ACTION_NAME"; payload: PayloadType } | { type: "OTHER_ACTION" };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ACTION_NAME": return { ...state, /* updates */ };
    default: return state;
  }
}
```

---

## Color, Typography & Animation

### Color System
Use design tokens from `docs/design-system.md`: `--background`, `--foreground`, `--surface`, `--panel`, `--primary`, `--primary-glow`, `--secondary`. Stats: `--stat-str` (red), `--stat-agi` (green), `--stat-con` (amber), `--stat-mag` (purple). Spheres: `--sphere-power`, `--sphere-speed`, `--sphere-mana`, `--sphere-ability`, `--sphere-key`. Access via `STAT_META[statType].color` or `SPHERE_META[sphereType].color`.

### Typography
- Display/Headers: Cinzel (serif, regal)
- Body: Rajdhani (clean sans-serif, tech-fantasy)
- Mono: Geist Mono (tabular numbers for stats/coins)

Use CSS classes: `.font-display`, `.font-body`, `.font-mono`

### Animation Guidelines
- Use shared easing: `const EASE = [0.23, 1, 0.32, 1] as const`
- Node activation: scale 1.2x + flash glow + settle
- Sphere earned: float-up particle + fade
- Grade badge (Myth): continuous subtle pulse
