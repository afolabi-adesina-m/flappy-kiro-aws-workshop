# Flappy Kiro — Requirements

## Overview
A retro-styled, browser-based endless scroller game where the player guides a ghost character through a series of pipes. Inspired by the classic Flappy Bird mechanic. All tunable constants are separated into `config.js` so parameters can be adjusted without touching game logic.

---

## Functional Requirements

### Gameplay
- FR-01: The player controls a ghost character subject to continuous gravity.
- FR-02: The player makes the ghost flap upward by pressing Space, Arrow Up, or tapping/clicking the canvas.
- FR-03: Pipe pairs spawn at random gap heights at regular intervals and scroll from right to left.
- FR-04: Each pipe pair has a vertical gap the ghost must pass through.
- FR-05: The game ends when the ghost collides with a pipe, the ground, or the ceiling.
- FR-06: The player scores one point for each pipe pair successfully passed.
- FR-07: Pipe scroll speed increases progressively with each point scored, up to a configurable maximum.
- FR-08: The pipe gap narrows progressively with score, down to a configurable minimum.
- FR-09: Pipe spawn interval decreases progressively with score, down to a configurable minimum.

### Physics System
- FR-10: Ghost falls under a configurable gravity constant each frame.
- FR-11: Flapping applies a configurable upward velocity (jump force) instantly.
- FR-12: Downward velocity is capped at a configurable terminal velocity.
- FR-13: Velocity carries momentum across frames via a configurable damping factor.
- FR-14: The ghost's rendered vertical position is smoothly interpolated toward its physics position each frame (configurable lerp factor).

### Clouds
- FR-15: Three parallax cloud layers scroll at different speeds to create a depth/perspective effect.
- FR-16: Each layer has independently configurable speed, opacity, and scale.
- FR-17: Clouds respawn off the right edge after leaving the left edge to create an infinite scroll.

### Game State Management
- FR-18: **Main Menu** — shown on load; displays the all-time best score and a prompt to start.
- FR-19: **Playing** — active gameplay with real-time score displayed on canvas.
- FR-20: **Paused** — pressing P or Escape during play freezes all updates and shows a pause overlay; pressing again resumes.
- FR-21: **Game Over** — shown after ghost dies; displays current score and best score side by side with a restart prompt.
- FR-22: The player can restart from the game over screen without refreshing the page.

### Scoring & Persistence
- FR-23: Current score is displayed on canvas during play and while paused.
- FR-24: A floating `+1` visual indicator appears at the ghost's position each time a point is scored.
- FR-25: The score flashes briefly on the canvas when a point is scored.
- FR-26: Best score is saved to and loaded from `localStorage` using a configurable key.
- FR-27: Best score is shown on the main menu and on the game over screen.

### Audio & Visual Feedback
- FR-28: A flap sound effect plays each time the ghost jumps (`jump.wav`).
- FR-29: A game over sound effect plays when the ghost dies (`game_over.wav`).
- FR-30: The screen shakes on collision; magnitude and decay rate are configurable.
- FR-31: A burst of coloured particles explodes from the ghost's position on death.
- FR-32: Ghost renders with a trailing wisp effect while flying (configurable trail count).
- FR-33: Ghost uses the `ghosty.png` sprite when loaded; falls back to a procedural canvas ghost if the image is unavailable.
- FR-34: Ghost blinks periodically during idle and gameplay states.
- FR-35: Ghost tilts forward/backward based on vertical velocity during play.
- FR-36: Ghost shows X eyes on death.

---

## Non-Functional Requirements

### Configuration
- NFR-01: All tunable constants (physics values, pipe dimensions, cloud layers, audio volumes, timing, etc.) must be defined in a single `config.js` file and referenced by name in `game.js`.
- NFR-02: No magic numbers may appear in `game.js`; all values must come from `CONFIG`.

### Platform
- NFR-03: The game must run entirely in a modern web browser with no backend, bundler, or build step.
- NFR-04: Only one remote resource is loaded: the Press Start 2P font via Google Fonts.

### Performance
- NFR-05: The game loop must target 60 fps using `requestAnimationFrame`.
- NFR-06: Frame delta is capped at `CONFIG.FRAME_CAP_MS` to prevent physics explosions after tab switching.

### Visual Style
- NFR-07: Retro pixel aesthetic with a dark colour palette (deep navy/black sky, green pipes, yellow score).
- NFR-08: Press Start 2P font used for all UI text.
- NFR-09: Canvas size is 480 × 640 px with a green glowing border.
- NFR-10: UI is responsive and scales down for viewports smaller than 500 px wide or 680 px tall.

### Accessibility
- NFR-11: Playable via keyboard (Space / Arrow Up to flap, P / Escape to pause) and touch/mouse (tap or click).

---

## Assets

| File | Location | Purpose |
|---|---|---|
| `ghosty.png` | `assets/` | Ghost sprite image |
| `jump.wav` | `assets/` | Flap / jump sound effect |
| `game_over.wav` | `assets/` | Death / game over sound effect |
| Press Start 2P | Google Fonts CDN | Retro pixel font |

---

## File Structure

```
assets/flappy-kiro/
├── index.html        — Shell, canvas, UI screens (menu, pause, game over)
├── style.css         — Retro dark theme, screen cards, animations
├── config.js         — All tunable constants (load order: before game.js)
├── game.js           — Game loop, physics, rendering, input, audio
└── requirements.md   — This document
```

---

## Out of Scope
- No server-side logic or API calls
- No multiplayer
- No mobile app packaging
- Background music (infrastructure ready via `CONFIG.VOLUME_MUSIC`; no music file provided yet)
