# Flappy Kiro — UI Mockups

## Canvas dimensions: 480 × 640 px
## Font: Press Start 2P (all UI text)
## Colour palette:
  - Background:  #0d0d1a (deep navy)
  - Green:       #3ddc84 (pipes, borders, highlights)
  - Accent:      #f0e68c (score, title gold)
  - Purple:      #a78bfa (ghost glow, pause)
  - Red:         #e74c3c (game over)
  - White:       #e8e8e8 (body text, prompts)
  - Overlay:     rgba(10,10,26, 0.88) (screen card backgrounds)

---

## 1. Main Menu

```
┌─────────────────────────────────────────────┐  ← canvas top (y=0)
│  ·  ·     ·        ·   ·       ·    ·   ·  │  } stars (animated twinkle)
│     ·           ·          ·       ·        │  }
│  ·        ·          ·  ·      ·       ·    │  }
│                                             │
│                                             │
│         ╔═══════════════════════╗           │
│         ║                       ║           │  ← overlay card
│         ║   F L A P P Y         ║           │  } #f0e68c  2.4rem
│         ║   K I R O             ║           │  } #3ddc84  2.4rem
│         ║                       ║           │
│         ║  guide the ghost      ║           │  } #e8e8e8  0.48rem  opacity 0.65
│         ║  through the pipes    ║           │  }
│         ║                       ║           │
│         ║  ┌─────────────────┐  ║           │
│         ║  │   BEST:   0042  │  ║           │  ← best-score banner
│         ║  └─────────────────┘  ║           │  } border: #3ddc84 35%
│         ║                       ║           │  } value:  #3ddc84  1.2rem
│         ║  PRESS SPACE OR TAP   ║           │  ← blink prompt  0.42rem
│         ║  TO START             ║           │
│         ║                       ║           │
│         ╚═══════════════════════╝           │  ← card border: #3ddc84
│                                             │    glow: rgba(61,220,132,0.3)
│  ~~~ ghosty floats here (animated) ~~~      │  ← ghost idle-bob animation
│                                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← ground (y=580, h=60)
│  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓   │    scrolling tile strip
└─────────────────────────────────────────────┘  ← canvas bottom (y=640)
```

### Element Specs

| Element | Position | Size | Colour | Font size |
|---|---|---|---|---|
| Title "FLAPPY" | card top, centred | — | `#f0e68c` | 2.4rem |
| Title "KIRO" | below "FLAPPY" | — | `#3ddc84` | 2.4rem |
| Subtitle | below title | — | `#e8e8e8` op 0.65 | 0.48rem |
| Best-score banner | centred in card | 200×36 px | border `#3ddc84` 35% | — |
| Best value | inside banner | — | `#3ddc84` | 1.2rem |
| Start prompt | bottom of card | — | `#e8e8e8` blink | 0.42rem |
| Overlay card | canvas centre | 300×min px | `rgba(10,10,26,0.88)` | — |
| Card border | — | 2 px | `#3ddc84` | — |

---

## 2. In-Game HUD

```
┌─────────────────────────────────────────────┐  ← y=0
│                                             │
│                   0 0 4                     │  ← score (y=56, centred)
│                                             │    #f0e68c  28px  shadow below
│                       +1                   │  ← score pop (floats up, fades)
│                                             │    #f0e68c  14px  opacity decays
│  ·   ·        ·          ·    ·        ·    │  } stars
│                                             │
│          ████                               │  ← top pipe
│          ████                               │
│          ████   ← cap →                     │
│         ██████                              │    cap width: PIPE_WIDTH + 10
│                                             │
│                                             │  ← gap (140 px)
│   👻                                        │  ← ghosty (x=100, tilted by vy)
│                  ──────────                 │
│                 ██████████                  │  ← bottom pipe cap
│                  ████████                   │
│                  ████████                   │
│                                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────┘
```

### HUD Element Specs

| Element | Position | Colour | Notes |
|---|---|---|---|
| Score counter | x=240 (centred), y=56 | `#f0e68c` 28px | Drop shadow 2px below; flashes white on point scored |
| Score pop "+1" | ghost.x+30, ghost.y−20 | `#f0e68c` 14px | Floats up 1.2 px/frame, fades over 40 frames |
| Pause hint | — | — | No persistent UI element; P/ESC key only |

### Tilt Reference

| `vy` (px/frame) | Visual tilt |
|---|---|
| −8.5 (peak jump) | −30° (nose up) |
| 0 (apex) | 0° (level) |
| +12 (terminal) | +70° (nose down) |

---

## 3. Pause Screen

```
┌─────────────────────────────────────────────┐
│  ·  ·     ·        ·   ·       ·    ·   ·  │
│  (game frozen — pipes, ghost, ground still) │
│                                             │
│                   0 0 4                     │  ← score still visible
│                                             │
│         ╔═══════════════════════╗           │
│         ║                       ║           │
│         ║       P A U S E D     ║           │  } #a78bfa  1.8rem
│         ║                       ║           │  } shadow: #4b2ea0
│         ║  PRESS P OR ESC TO    ║           │  } #e8e8e8  0.42rem op 0.6
│         ║  RESUME               ║           │
│         ║                       ║           │
│         ╚═══════════════════════╝           │
│                                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────┘
```

### Element Specs

| Element | Colour | Font size | Notes |
|---|---|---|---|
| "PAUSED" | `#a78bfa` | 1.8rem | Shadow 3px `#4b2ea0` |
| Resume hint | `#e8e8e8` op 0.6 | 0.42rem | Static, no blink |
| Score | `#f0e68c` | 28px | Remains visible above overlay |
| Background | game frame frozen | — | No animation while paused |

---

## 4. Game Over Screen

```
┌─────────────────────────────────────────────┐
│  ·  ·     ·        ·   ·       ·    ·   ·  │
│                                             │
│         ✦ ✧ ✦  particle burst ✦ ✧ ✦        │  ← coloured burst (fades out)
│                                             │
│         ╔═══════════════════════╗           │
│         ║                       ║           │
│         ║     G A M E           ║           │  } #e74c3c  1.7rem
│         ║     O V E R           ║           │  } shadow: #7b1e1e
│         ║                       ║           │
│         ║   SCORE      BEST     ║           │  } label: #e8e8e8  0.42rem op 0.55
│         ║                       ║           │
│         ║    0042      0089     ║           │  } score: #f0e68c  1.9rem
│         ║                       ║           │  } best:  #3ddc84  1.9rem
│         ║  PRESS SPACE OR TAP   ║           │  ← blink prompt
│         ║  TO RETRY             ║           │
│         ║                       ║           │
│         ╚═══════════════════════╝           │
│                                             │
│   👻 (ghost falls, hits ground, stops)      │  ← death animation plays
│                                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────┘
```

### Element Specs

| Element | Position | Colour | Font size | Notes |
|---|---|---|---|---|
| "GAME OVER" | card top, centred | `#e74c3c` | 1.7rem | Shadow 3px `#7b1e1e`; line-height 1.4 |
| Score label "SCORE" | left column | `#e8e8e8` op 0.55 | 0.42rem | — |
| Score value | left column | `#f0e68c` | 1.9rem | Current run score |
| Best label "BEST" | right column | `#e8e8e8` op 0.55 | 0.42rem | — |
| Best value | right column | `#3ddc84` | 1.9rem | All-time best from localStorage |
| Retry prompt | card bottom | `#e8e8e8` blink | 0.42rem | Blink 1.1s step-end |
| Particle burst | ghost death pos | multi-colour | — | 16 particles, fades ~40 frames |
| Screen shake | entire canvas | — | — | Magnitude 9px, decay 0.82/frame |
| Card appears | — | — | — | Delayed 750 ms after death |

---

## 5. Layout Grid Summary

```
y=0   ┬──────────────────────── canvas top
      │
y=56  ├──────────────────────── score display baseline
      │
y=~80 ├──────────────────────── pipe spawn top margin
      │
      │   G A M E   A R E A
      │   (480 × 520 px usable)
      │
y=~560├──────────────────────── pipe spawn bottom margin
      │
y=580 ├──────────────────────── ground top  (H − GROUND_H)
      │   ground strip (60 px)
y=640 ┴──────────────────────── canvas bottom
```

---

## Interaction Map

| State | Input | Action |
|---|---|---|
| Main Menu | Space / Tap | Start game |
| Playing | Space / Tap | Flap |
| Playing | P / Escape | Pause |
| Paused | P / Escape | Resume |
| Paused | Space / Tap | No action (ignored) |
| Game Over | Space / Tap | Restart |
| Game Over | (auto, 750 ms delay) | Show game over card |
