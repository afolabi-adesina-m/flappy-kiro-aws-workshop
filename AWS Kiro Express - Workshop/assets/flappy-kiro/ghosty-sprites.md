# Ghosty — Sprite Specifications

## Overview
Ghosty is the player-controlled ghost character in Flappy Kiro. All animation frames are packed into a single horizontal spritesheet (`ghosty.png`). The game engine clips the correct frame at runtime using canvas `drawImage` with source offsets.

---

## Sprite Sheet Layout

| Property | Value |
|---|---|
| Frame size | 32 × 32 px |
| Total frames | 9 |
| Sheet dimensions | 288 × 32 px (9 frames × 32 px wide) |
| Colour depth | RGBA (32-bit, transparency supported) |
| Format | PNG |
| Scale in-game | Rendered at 40 × 40 px (upscaled 1.25×, pixelated) |

### Frame Map

```
 0        32       64       96      128      160      192      224      256      288
 |        |        |        |        |        |        |        |        |        |
 [ F0 ]  [ F1 ]  [ F2 ]  [ F3 ]  [ F4 ]  [ F5 ]  [ F6 ]  [ F7 ]  [ F8 ]
  idle    idle    idle    flap    flap    flap   death   death   death
  (1)     (2)     (3)     (1)     (2)     (3)    (1)     (2)     (3)
```

---

## Animation States

### 1. Idle  —  frames 0–2
Plays when the game is on the main menu or the ghost is in a resting float.

| Frame | Source X | Description |
|---|---|---|
| 0 | 0 | Neutral — body centred, skirt hanging straight |
| 1 | 32 | Slight upward float — body rises 1 px, skirt expands |
| 2 | 64 | Slight downward float — body drops 1 px, skirt contracts |

- **Frame rate:** 6 fps (loop 0 → 1 → 2 → 1 → 0)
- **Loop:** ping-pong
- **Effect:** gentle bobbing to indicate the character is alive and waiting

---

### 2. Flap  —  frames 3–5
Plays immediately on spacebar/tap input; transitions back to idle after completion.

| Frame | Source X | Description |
|---|---|---|
| 3 | 96 | Wind-up — body squashes slightly, skirt flares outward |
| 4 | 128 | Peak flap — body stretches upward, eyes widen, skirt tucks in |
| 5 | 160 | Recovery — body returns to neutral, skirt trails behind |

- **Frame rate:** 18 fps (plays once, does not loop)
- **Loop:** one-shot → return to idle frame 0
- **Effect:** snappy, responsive feel; squash-and-stretch sells the jump

---

### 3. Death  —  frames 6–8
Plays on collision; freezes on frame 8 while the ghost falls.

| Frame | Source X | Description |
|---|---|---|
| 6 | 192 | Impact — body squashes wide, X eyes appear, stars around head |
| 7 | 224 | Tumble — body rotates ~15°, skirt dishevelled |
| 8 | 256 | Final — body fully limp, X eyes, skirt drooping |

- **Frame rate:** 12 fps (plays once, holds on frame 8)
- **Loop:** one-shot → freeze on last frame
- **Effect:** comedic death sell; X eyes confirm the hit clearly

---

## Hitbox

| Property | Value |
|---|---|
| Shape | Circle |
| Radius | 12 px (at native 32 × 32 px size) |
| Centre offset | (16, 14) — slightly above centre to favour the face/body |
| Scaled radius | 15 px (when rendered at 40 × 40 px in-game) |
| Forgiveness padding | 7 px subtracted from radius during collision checks |
| Effective collision radius | 8 px (15 − 7) |

The forgiveness padding keeps the feel fair — tight collisions that clip only a pixel or two are ignored, matching player expectations from the genre.

```
  32 px
  ┌──────────────────────────────┐
  │                              │  ← 0 px
  │         ╭────────╮           │
  │       ╭─┤  face  ├─╮         │  ← ~8 px  (hitbox top)
  │      │  ╰────────╯  │        │
  │      │   ○      ○   │        │  ← ~14 px (eye row / hitbox centre Y)
  │      │      ∪       │        │
  │       ╰──╮      ╭──╯         │  ← ~22 px (hitbox bottom)
  │          ╰──────╯            │  ← 28 px  (skirt tips, outside hitbox)
  │                              │
  └──────────────────────────────┘  ← 32 px
        ↑            ↑
       4 px         28 px
    (hitbox left)  (hitbox right)
```

---

## Visual Style Notes

- **Palette:** white/pale lavender body (`#ffffff` → `#dcd0ff`), purple outline (`#7c5cbf`), dark navy eyes (`#1a1a2e`), white pupils
- **Glow:** soft radial purple aura (`rgba(167,139,250, 0.35)`) rendered behind the sprite each frame
- **Skirt:** wavy bottom edge animated via bezier curves; wave frequency increases during flap frames
- **Trail wisps:** 3 small fading circles trailing behind the ghost during flight, rendered separately in `game.js` (not part of the spritesheet)
- **Blink:** eyes close (scaleY → 0.15) for 120 ms every ~3 seconds; handled in `game.js` overlay, not in spritesheet

---

## Rendering Code Reference

```js
// Clip correct frame from spritesheet
const FRAME_W = 32;
const frameX  = currentFrame * FRAME_W;   // e.g. frame 3 → x = 96

ctx.drawImage(
  ghostImg,          // spritesheet image
  frameX, 0,         // source x, y
  FRAME_W, FRAME_W,  // source width, height (32×32)
  -20, -20,          // dest x, y (centred on ghost position)
  40, 40             // dest width, height (scaled to 40×40)
);
```

---

## File Structure

```
assets/
└── ghosty.png          — 288×32 px horizontal spritesheet (9 frames)

assets/flappy-kiro/
└── ghosty-sprites.md   — This document
```
