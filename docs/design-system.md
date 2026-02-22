# ORV Fitness Tracker — Design System

This document defines the visual design language for the app. It draws from three game UI references:
- **FFX** (foundation) — dark cosmic panels, glowing sphere grid nodes, character-colored paths
- **Genshin Impact** (information hierarchy) — clean summary + expandable detail pattern, element-themed coloring
- **Lost Ark** (tier coding) — blue→green→gold tier progression, upgrade UX with material previews

---

## 1. Color Palette

### Base Colors (FFX-inspired dark cosmic theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0b1026` | App background — deep midnight blue (clearly blue, not black) |
| `--background-elevated` | `#111d42` | Cards, elevated surfaces — richer blue |
| `--panel` | `rgba(20, 40, 100, 0.85)` | Semi-transparent blue gradient panels (FFX menu style) |
| `--panel-border` | `rgba(100, 170, 255, 0.25)` | Soft glowing blue panel borders |
| `--foreground` | `#e8eaf6` | Primary text — soft white with blue tint |
| `--foreground-muted` | `#8ba0cc` | Secondary text — blue-gray, clearly readable |
| `--surface` | `#162050` | Input backgrounds, secondary surfaces |

### Accent Colors (FFX blue identity)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#5b8cff` | Primary blue — FFX-faithful, CTAs, active states |
| `--primary-glow` | `rgba(91, 140, 255, 0.4)` | Glow effects around primary elements |
| `--secondary` | `#7ca8ff` | Lighter blue — hover states, secondary actions |

### Stat Colors (character-colored paths, FFX-inspired)

| Stat | Hex | Inspiration |
|------|-----|-------------|
| `--stat-str` | `#ef4444` | Red — Auron's path color |
| `--stat-agi` | `#22c55e` | Green — Rikku's path color |
| `--stat-con` | `#f59e0b` | Amber — Wakka's path color |
| `--stat-mag` | `#a855f7` | Purple — Lulu's path color |

### Sphere Colors

| Sphere | Hex | Matches |
|--------|-----|---------|
| `--sphere-power` | `#ef4444` | Red — STR sphere |
| `--sphere-speed` | `#22c55e` | Green — AGI sphere |
| `--sphere-mana` | `#a855f7` | Purple — MAG sphere |
| `--sphere-ability` | `#3b82f6` | Blue — ability unlocks |
| `--sphere-key` | `#f59e0b` | Amber/gold — milestone unlocks |

### Tier/Grade Colors (Lost Ark-inspired progression)

| Grade | Hex | Visual |
|-------|-----|--------|
| General | `#9ca3af` | Gray — plain, no glow |
| Rare | `#3b82f6` | Blue — subtle glow |
| Hero | `#22c55e` | Green — moderate glow |
| Legend | `#f59e0b` | Gold — strong glow |
| Quasi-myth | `#f97316` | Orange — intense glow |
| Myth | `#ef4444` | Red — maximum glow + particle effect |

### Functional Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--coin` | `#fbbf24` | Coin displays — warm gold |
| `--success` | `#22c55e` | Success states |
| `--warning` | `#f59e0b` | Maintenance warnings |
| `--danger` | `#ef4444` | Decay alerts, destructive actions |
| `--info` | `#3b82f6` | Informational elements |

---

## 2. Typography

**Font stack:**
- **Display:** Cinzel (`--font-display`) — regal serif for titles, player names, section headers, grade badges. Letter-spacing `0.04-0.08em`, uppercase for labels.
- **Body:** Rajdhani (`--font-body`) — clean sans-serif with tech-fantasy character for all UI text.
- **Mono:** Geist Mono (`--font-mono`) — for tabular stat/coin values.

| Level | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Cinzel | `2rem` / `32px` | 700 | Page titles, player name |
| Heading | Cinzel | `1.25rem` / `20px` | 600 | Section headers (`.section-header`), card titles |
| Body | Rajdhani | `0.875rem` / `14px` | 400 | General content, descriptions |
| Caption | Rajdhani | `0.75rem` / `12px` | 400 | Labels, stat labels, timestamps |
| Stat Level | Cinzel | `1.25rem`+ | 700 | `.stat-level` class — glowing stat-colored numbers |
| Mono | Geist Mono | `0.875rem` / `14px` | 500 | Stat values, coin amounts, sphere counts (`tabular-nums`) |

**Key rules:**
- White text (`--foreground`) on dark backgrounds for all primary content
- Muted blue-gray (`--foreground-muted`) for secondary labels and descriptions
- Stat/coin values use tabular numerals for alignment
- Grade names use their tier color
- Section headers use `.section-header` class (Cinzel, uppercase, with trailing gradient rule)
- Title logo uses `.ffx-title` class (Cinzel with layered blue glow text-shadow)

---

## 3. Panel System (FFX Blue Gradient Panels)

The core container is the **FFX-style panel**: a semi-transparent dark blue box with subtle gradient and border.

```
Panel styles:
- Background: linear-gradient(180deg, rgba(20, 40, 100, 0.85) 0%, rgba(10, 18, 55, 0.95) 100%)
- Border: 1px solid rgba(100, 170, 255, 0.25)
- Border-radius: 12px
- Backdrop-filter: blur(8px)
```

### Panel Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard content panel — gradient blue, subtle border |
| **Elevated** | Cards, stat cards — slightly brighter, more visible border |
| **Interactive** | Clickable panels — hover brightens border to `--primary`, adds glow |
| **Stat-themed** | Stat cards — left border or top accent in stat color |
| **Alert** | Warnings — border uses `--warning` or `--danger` |

---

## 4. Glow System

Glowing elements are central to the FFX sphere grid aesthetic.

| Class | Effect | Usage |
|-------|--------|-------|
| `.glow-primary` | `box-shadow: 0 0 20px rgba(91, 140, 255, 0.4)` | Active UI elements, selected items |
| `.glow-stat-{type}` | `box-shadow: 0 0 15px {stat-color}40` | Stat cards, sphere nodes |
| `.glow-grade-{tier}` | Intensity scales with grade (none→subtle→strong→pulse) | Grade badges, story cards |
| `.glow-node` | `box-shadow: 0 0 10px` + node color | Sphere grid nodes |
| `.glow-pulse` | Animated pulse glow (CSS keyframes) | Next available node, alerts |

**Glow intensity by grade:**
- General: no glow
- Rare: `0 0 8px` at 20% opacity
- Hero: `0 0 12px` at 30% opacity
- Legend: `0 0 18px` at 40% opacity
- Quasi-myth: `0 0 24px` at 50% opacity + subtle pulse
- Myth: `0 0 30px` at 60% opacity + continuous pulse animation

---

## 5. Sphere Grid Nodes (Visual Spec)

The Dokkaebi's Bag (sphere grid) is the visual centerpiece.

### Node States

| State | Visual |
|-------|--------|
| **Activated** | Filled circle in stat color, glowing, connected path lit |
| **Available (next)** | Outlined circle with pulse glow, stat color border |
| **Locked** | Dark circle with lock icon, amber/gold border, "Lv.X" label |
| **Unreachable** | Dim gray circle, no glow, low opacity |

### Node Sizes

| Type | Size | Icon |
|------|------|------|
| Stat node | `36px` circle | `+1` text or stat icon |
| Skill node | `42px` circle | Ability/exercise icon |
| Lock node | `42px` circle | Lock icon + level badge |

### Path Lines

- Activated paths: 2px solid line in stat color, subtle glow
- Available path (next segment): 2px dashed line in stat color
- Future paths: 1px solid line, `--foreground-muted` at 30% opacity

### Grid Background

Dark cosmic space with subtle pattern — Yevon-inspired symbols replaced with faint ORV constellation patterns at very low opacity (`3-5%`). Creates depth without distraction.

---

## 6. Component Patterns

### Stat Card (Genshin-inspired summary + expandable)

```
┌─────────────────────────────┐  ← Panel with left border in stat color
│ [Icon] STR          Lv. 12  │  ← Stat icon + name + level
│ ████████████░░░░  12/20     │  ← Grid progress bar (nodes activated / next lock)
│ ⚠ Maintenance active        │  ← Warning if applicable (amber text)
│ [View Grid →]               │  ← Link to Dokkaebi's Bag for this stat
└─────────────────────────────┘
```

- Quick summary visible at a glance (level, progress)
- Expandable to show recent sphere activity, decay status
- Stat color used for icon, progress bar fill, left border accent

### Sphere Badge (compact display)

```
[●] x5    ← Colored circle + count
```

Inline component. Sphere type color for the circle, white count. Used in headers, workout reward summaries, grid views.

### Grade Badge (Lost Ark tier coding)

```
[ Legend ]  ← Text in grade color, subtle glow matching tier
```

Pill-shaped badge. Text color = grade color. Background = grade color at 10% opacity. Glow intensity scales with tier.

### Upgrade/Activation Dialog (Lost Ark honing UX)

```
┌─────────────────────────────────┐
│       Activate STR Node #13     │  ← Title
│                                 │
│  [●] Power Sphere    1 → 0     │  ← Sphere cost with before/after
│  [⚙] Coins          15 → 85   │  ← Coin cost with remaining
│                                 │
│  Result: STR 12 → 13           │  ← Outcome preview
│                                 │
│  [ Cancel ]      [ Activate ]  │  ← Actions
└─────────────────────────────────┘
```

Shows cost breakdown, resource delta, and result preview before committing. Clear and predictable.

### Workout Reward Summary (post-workout feedback)

```
┌─────────────────────────────────┐
│        Workout Complete!        │
│                                 │
│  Coins earned:     +12         │
│  Spheres earned:               │
│    [●] Power    x2             │
│    [●] Ability  x1             │
│                                 │
│  [ View Grid ]   [ Close ]     │
└─────────────────────────────────┘
```

Rewarding moment — shows exactly what was earned. Option to jump directly to the grid.

---

## 7. Navigation

### App Shell

- **Top bar**: Player name, coin display, sphere inventory summary (compact badges)
- **Bottom tab bar** (mobile): Dashboard | Workouts | Dokkaebi's Bag | Scenarios
- **Side nav** (desktop): Same routes, vertical list with icons
- Dark background consistent with cosmic theme

### Tab Navigation (within pages)

Used in Dokkaebi's Bag (STR/AGI/CON/MAG tabs) and Scenarios (Main/Sub tabs).

- Tabs styled as pill buttons
- Active tab: `--primary` background with glow
- Inactive tab: `--surface` background, muted text

---

## 8. Motion & Animation

| Element | Animation |
|---------|-----------|
| Node activation | Scale up 1.2x + flash glow in stat color, then settle |
| Sphere earned | Float-up particle effect + fade |
| Coin change | Count-up/down number animation |
| Grade badge (Myth) | Continuous subtle pulse glow |
| Panel hover | Border brightens, subtle glow appears |
| Page transitions | Fade in (150ms ease) |
| Stat decay warning | Slow amber pulse on stat card border |

Keep animations subtle and purposeful. No flashy transitions — the glow system provides the visual richness.

---

## 9. Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 640px` (mobile) | Single column, bottom tab bar, stacked stat cards (2×2 grid) |
| `640–1024px` (tablet) | Two column where applicable, bottom tab bar |
| `> 1024px` (desktop) | Side nav, multi-column layouts, grid path shown horizontally |

---

## 10. Design Principles

1. **Dark cosmic foundation** — FFX's deep-space aesthetic grounds everything. Dark panels, glowing accents, no bright white surfaces.
2. **Glow = status** — Glow intensity communicates tier/importance. The brighter something glows, the more significant it is.
3. **Color = identity** — Stats, spheres, and grades each have fixed color associations. Never mix them.
4. **Summary first, details on demand** — Genshin's pattern. Show the key number at a glance; let users drill in for more.
5. **Cost before commitment** — Lost Ark's pattern. Always preview what you'll spend and what you'll get before any action.
6. **The grid is the centerpiece** — The Dokkaebi's Bag sphere grid should feel rewarding to interact with. Satisfying glows, clear progress, tangible advancement.

---

## Sources

- [FFX Sphere Grid Wiki](https://finalfantasy.fandom.com/wiki/Sphere_Grid)
- [FFX Menu Wiki](https://finalfantasy.fandom.com/wiki/Menu_(Final_Fantasy_X))
- [FFX Game UI Database](https://gameuidatabase.com/gameData.php?id=474)
- [FF Window Colors](https://www.finalfantasyforums.net/threads/default-window-colors.30391/)
- [Genshin Impact Character Menu](https://genshin-impact.fandom.com/wiki/Character/Menu)
- [Genshin Impact UI Colors](https://colorswall.com/palette/143096)
- [Lost Ark Tripod System](https://www.thegamer.com/lost-ark-tripod-skill-upgrades-explained/)
- [Lost Ark Gear Honing](https://vulkk.com/2022/03/10/lost-ark-gear-honing-and-gear-transfer-guide-how-it-works/)
