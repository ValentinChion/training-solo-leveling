---
name: ffx-design
description: FFX (Final Fantasy X) design system reference. Use this skill when implementing or modifying UI components, theme colors, panels, glows, or any visual design work in this project. Ensures all design stays faithful to the FFX aesthetic.
---

# FFX Design System — Visual Reference

This skill ensures all UI work in the ORV Fitness Tracker stays faithful to the Final Fantasy X aesthetic. Reference this when creating or modifying components, colors, panels, or visual effects.

---

## 1. The FFX Aesthetic — Core Identity

FFX's UI is defined by **rich, luminous blues** — NOT gloomy near-black. The menus feel like looking through enchanted water or stained glass. Key traits:

- **Vibrant deep blue** backgrounds (NOT near-black, NOT desaturated)
- **Blue-to-indigo gradients** on panels — the signature FFX menu look
- **Soft cyan/light-blue borders** with subtle glow — crystalline, clean edges
- **White text** with excellent contrast on the rich blue surfaces
- **Warm accent colors** pop against the cool blue foundation
- **Gentle luminosity** — everything has a faint inner glow, like bioluminescence

### The Feel
Think: **underwater temple**, **Macalania Woods**, **Zanarkand at night** — magical, serene, luminous. NOT outer-space void. NOT dark dungeon. The darkness should feel alive and rich, not dead and flat.

---

## 2. Color Palette

### Base Colors (FFX Menu System)

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `#0b1026` | Deep midnight blue — dark but clearly BLUE, not black |
| `--foreground` | `#e8eaf6` | Soft white with blue tint — feels integrated, not harsh |
| `--card` | `#111d42` | Elevated surfaces — richer blue than background |
| `--popover` | `#111d42` | Same as card |
| `--muted` | `#162050` | Secondary surfaces, input backgrounds |
| `--muted-foreground` | `#8ba0cc` | Subdued blue-gray text — readable but clearly secondary |
| `--border` | `rgba(100, 170, 255, 0.2)` | Soft blue border — visible but not harsh |
| `--input` | `#162050` | Input field backgrounds |

### Panel Gradients (The Signature FFX Look)

The FFX menu panel is the most recognizable element. It's a **top-to-bottom gradient** from medium-dark blue to deeper blue, with a soft luminous border.

```
.orv-panel {
  background: linear-gradient(
    180deg,
    rgba(20, 40, 100, 0.85) 0%,    /* Rich medium-dark blue at top */
    rgba(10, 18, 55, 0.95) 100%     /* Deep indigo at bottom */
  );
  border: 1px solid rgba(100, 170, 255, 0.25);
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
}
```

**Key**: The top of the gradient is noticeably LIGHTER and BLUER than the bottom. This creates depth and the characteristic FFX "window" look. The border should be a soft glowing cyan-blue, not invisible.

### Elevated Panels
```
.orv-panel-elevated {
  background: linear-gradient(
    180deg,
    rgba(25, 48, 110, 0.9) 0%,     /* Brighter blue, more saturated */
    rgba(12, 22, 60, 0.97) 100%
  );
  border: 1px solid rgba(100, 170, 255, 0.3);
}
```

### Interactive Panels
```
.orv-panel-interactive:hover {
  border-color: rgba(130, 190, 255, 0.6);    /* Bright cyan-blue on hover */
  box-shadow: 0 0 15px rgba(80, 140, 255, 0.25);  /* Blue glow, not violet */
}
```

### Accent Colors (ORV Identity on FFX Foundation)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#5b8cff` | Primary blue — bright, FFX-faithful, used for CTAs and active states |
| `--primary-foreground` | `#ffffff` | White text on primary |
| `--primary-glow` | `rgba(91, 140, 255, 0.4)` | Glow around primary elements |
| `--secondary` | `#7ca8ff` | Lighter blue — hover states, secondary actions |
| `--secondary-foreground` | `#ffffff` | White text on secondary |
| `--ring` | `#5b8cff` | Focus ring color |

### Stat Colors (Character-Colored Paths)

These stay the same — they're already FFX-accurate:
| Stat | Value | Inspiration |
|------|-------|-------------|
| `--stat-str` | `#ef4444` | Red — Auron's path |
| `--stat-agi` | `#22c55e` | Green — Rikku's path |
| `--stat-con` | `#f59e0b` | Amber — Wakka's path |
| `--stat-mag` | `#a855f7` | Purple — Lulu's path |

### Grade Colors

Same as before — Lost Ark-inspired progression tiers.

### Functional Colors

| Token | Value |
|-------|-------|
| `--coin` | `#fbbf24` |
| `--success` | `#22c55e` |
| `--warning` | `#f59e0b` |
| `--danger` | `#ef4444` |
| `--info` | `#5b8cff` |

---

## 3. Panel Design Rules

1. **Always use gradients** — flat solid colors look wrong. The gradient from lighter-blue to deeper-blue IS the FFX identity.
2. **Borders must be visible** — soft cyan-blue, never invisible. They define the "window pane" effect.
3. **Background blur** — use `backdrop-filter: blur(8px)` for panels over content to create depth.
4. **Corner radius** — `0.75rem` (12px) for panels. Rounded but not pill-shaped.
5. **Panel nesting** — inner panels should use `orv-panel-elevated` (slightly brighter) to create visual hierarchy.

---

## 4. Glow System

Glows should feel like **bioluminescence** or **magical energy**, not neon signs.

| Element | Glow Color | Intensity |
|---------|-----------|-----------|
| Primary UI elements | `rgba(91, 140, 255, 0.3)` | Subtle, ambient |
| Active/selected items | `rgba(91, 140, 255, 0.5)` | Noticeable |
| Stat-themed elements | Stat color at 30% opacity | Matches stat identity |
| Hover states | Brighten border + add `box-shadow` | Responsive, immediate |
| High-tier items (Legend+) | Grade color with pulse animation | Draws attention |

### Glow Intensity by Grade
- General: no glow
- Rare: `0 0 8px` at 20% — barely there
- Hero: `0 0 12px` at 30% — noticeable
- Legend: `0 0 18px` at 40% — prominent
- Quasi-myth: `0 0 24px` at 50% + slow pulse
- Myth: `0 0 30px` at 60% + continuous pulse

---

## 5. Typography

- **Primary text**: `--foreground` (#e8eaf6) — soft white with blue undertone
- **Secondary text**: `--muted-foreground` (#8ba0cc) — clearly readable but subdued
- **Values/numbers**: Use `tabular-nums` for alignment
- **Grade names**: Use grade color for text
- **Headings**: Bold, white, slightly larger — clear hierarchy

---

## 6. Component Patterns

### Navigation (Sidebar + Header)
- Use `orv-panel` for both header and sidebar
- Active nav item: `bg-primary/15 text-primary` (blue highlight, not violet)
- Inactive: `text-muted-foreground` with hover brightening

### Cards / Stat Cards
- Use `orv-panel-elevated` as base
- Stat-themed cards: left border or top accent in stat color
- Values in stat color with matching subtle glow

### Buttons
- Primary: `bg-primary text-white` with blue glow on hover
- Secondary: `bg-muted text-foreground` with border brightening on hover
- Destructive: `bg-danger text-white`

### Dialogs / Modals
- Use `orv-panel-elevated` styling
- Backdrop: `rgba(5, 8, 20, 0.7)` with blur
- Centered, with border glow

---

## 7. What to AVOID

- **Near-black backgrounds** (`#0a0e1a` and darker) — too gloomy, kills the FFX feel
- **Violet/purple as primary** — FFX uses BLUE. Violet is for MAG stat only
- **Invisible borders** — FFX panels have clear, luminous edges
- **Flat solid panel backgrounds** — always use gradients
- **Harsh white text** — use the soft blue-white (#e8eaf6)
- **Desaturated colors** — FFX is rich and vibrant in its blues
- **Outer-space void aesthetic** — the darkness should feel like deep water, not empty space

---

## 8. Quick Reference: Current → FFX Correct

| Element | Wrong (gloomy) | Right (FFX) |
|---------|----------------|-------------|
| Background | `#0a0e1a` (near-black) | `#0b1026` (midnight blue) |
| Card/surface | `#111827` (dark gray) | `#111d42` (rich blue) |
| Muted surface | `#1a2035` (gray-blue) | `#162050` (blue) |
| Primary accent | `#7c5cfc` (violet) | `#5b8cff` (bright blue) |
| Secondary | `#a78bfa` (light violet) | `#7ca8ff` (light blue) |
| Panel gradient top | `rgba(15, 25, 60)` (dark) | `rgba(20, 40, 100)` (rich blue) |
| Panel gradient bottom | `rgba(8, 12, 35)` (near-black) | `rgba(10, 18, 55)` (deep indigo) |
| Border | `rgba(100, 140, 255, 0.15)` (barely visible) | `rgba(100, 170, 255, 0.25)` (soft glow) |
| Primary glow | `rgba(124, 92, 252, 0.4)` (violet) | `rgba(91, 140, 255, 0.4)` (blue) |
| Muted text | `#8892b0` (gray) | `#8ba0cc` (blue-gray) |
| Info color | `#3b82f6` | `#5b8cff` |
