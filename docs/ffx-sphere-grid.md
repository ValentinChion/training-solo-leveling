# FFX Sphere Grid — Reference for ORV Fitness Tracker

This document explains the Final Fantasy X Sphere Grid system and how it's adapted for our fitness tracker's progression system (the **Dokkaebi's Bag**).

## FFX Sphere Grid — Original System

### Core Loop
1. Characters earn **AP** from battles
2. AP accumulates into **Sphere Levels** (S.Lv)
3. Spend S.Lv to **move** along the grid (1 S.Lv = 1 node forward, or up to 4 backward on traversed paths)
4. Spend **Spheres** to **activate** nodes you're standing on or adjacent to

### Sphere Types

| Category | Sphere | Purpose |
|----------|--------|---------|
| **Red (stat)** | Power Sphere | Activates STR, DEF, HP nodes |
| | Mana Sphere | Activates Magic Power, Magic Resistance, MP nodes |
| | Speed Sphere | Activates AGI, Accuracy, Evasion nodes |
| | Ability Sphere | Activates Skill, Special, Magic ability nodes |
| | Fortune Sphere | Activates Luck nodes (rarest) |
| **Key** | Key Sphere Lv.1–4 | Unlocks locked gate nodes of matching level |
| **Purple** | HP/Strength/etc. Sphere | Replaces empty nodes with enhanced stat nodes (+4, +300 HP) |
| **Yellow** | Friend/Return Sphere | Activates ability nodes already activated by other characters |
| **Light Blue** | Teleport/Warp Sphere | Teleport to previously activated or unvisited nodes |
| **Clear** | Clear Sphere | Removes a stat node bonus (allows replacement) |

### Node Types
- **Stat nodes** — Grant permanent stat increases (+1 to +4)
- **Ability nodes** — Teach skills, spells, or special abilities
- **Lock nodes** — Block progression until a Key Sphere of matching level is used
- **Empty nodes** — Can be filled with Purple Spheres for custom bonuses

### Grid Structure
- Roughly circular grid of interconnected node clusters
- Each node connected by up to 7 paths (cardinal + intercardinal directions)
- Two variants: **Standard** (role-specific starting areas) and **Expert** (neutral start, free pathing)
- Character paths merge at certain points, allowing cross-class progression

---

## Our Adaptation — Dokkaebi's Bag

### Simplifications
- **Linear paths per stat** instead of a full circular grid (4 separate paths: STR, AGI, CON, MAG)
- **No movement cost** — you progress node by node sequentially; no need for S.Lv to move
- **Sphere + Coin dual currency** — every node activation costs matching spheres AND coins
- **Fewer sphere types** — 5 total (power, speed, mana, ability, key)

### Sphere Mapping

| Sphere | Earned From | Activates |
|--------|-------------|-----------|
| **Power Sphere** | STR workouts (weights, resistance) | STR / CON stat nodes |
| **Speed Sphere** | AGI workouts (running, HIIT) | AGI stat nodes |
| **Mana Sphere** | MAG workouts (yoga, recovery) | MAG stat nodes |
| **Ability Sphere** | Any workout (bonus, lower rate) | Skill/exercise unlock nodes |
| **Key Sphere** | Completing scenarios | Lock nodes (milestones at level 10, 20, 30…) |

### Node Path Structure (per stat)
Each stat has a linear path of nodes. Pattern repeats every 10 levels:
- **Levels 1–4, 6–9**: Stat nodes (+1 to that stat) — cost: 1 matching sphere + coins
- **Levels 5, 15, 25…**: Skill nodes (unlock exercises) — cost: 1 Ability Sphere + coins
- **Levels 10, 20, 30…**: Lock nodes (milestones) — cost: 1 Key Sphere + coins

### Coin Cost Scaling
Node activation coin cost formula: `baseCost * 2^(floor(level / 10))`
- Levels 1–9: base cost
- Levels 10–19: 2× base cost
- Levels 20–29: 4× base cost
- And so on...

### Stat Maintenance (Decay System)
Instead of stats decaying directly:
1. **3-day grace period** — No cost for short breaks
2. **Coin drain** — After grace period, 3 coins/day per idle stat
3. **Stat decay (last resort)** — Only if coins reach 0: -1 level/week, floor at 1
4. **Training resets the timer** for that stat

### Key Differences from FFX
| FFX | Our Version |
|-----|-------------|
| AP from battles → Sphere Levels for movement | Workouts → Spheres directly (no movement phase) |
| Full circular interconnected grid | Linear path per stat |
| Multiple characters share one grid | Single player, 4 separate stat paths |
| Key Spheres from rare drops | Key Spheres from completing scenarios |
| No coin cost for node activation | Dual cost: spheres + coins (ORV economy) |
| Stats only increase | Stats can decay if player stops training and runs out of coins |

## Sources
- [Sphere Grid — Final Fantasy Wiki](https://finalfantasy.fandom.com/wiki/Sphere_Grid)
- [FFX Sphere Grid Guide — EIP Gaming](https://eip.gg/ffx-x2/guides/sphere-grid/)
- [Sphere Grid Explained — GameFAQs](https://gamefaqs.gamespot.com/boards/643146-final-fantasy-x-x-2-hd-remaster/72298224)
- [Sphere Grid Internals — GameInternals](https://gameinternals.com/straightening-out-final-fantasy-xs-sphere-grid)
