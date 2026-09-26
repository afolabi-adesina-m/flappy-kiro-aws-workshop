# Flappy Kiro — Requirements

## Overview
A retro-styled, browser-based endless scroller game where the player guides a ghost character through a series of pipes. Inspired by the classic Flappy Bird mechanic.

---

## Functional Requirements

### Gameplay
- FR-01: The player controls a ghost character that falls due to gravity continuously.
- FR-02: The player can make the ghost jump/flap by pressing Space, Arrow Up, or tapping the screen.
- FR-03: Pipes spawn at random heights at regular intervals and scroll from right to left.
- FR-04: Each pipe pair has a gap the ghost must pass through.
- FR-05: The game ends when the ghost collides with a pipe, the ground, or the ceiling.
- FR-06: The player scores one point for each pipe pair successfully passed.

### Screens
- FR-07: A start screen is shown on load with the game title and a prompt to begin.
- FR-08: A game over screen is shown after the ghost dies, displaying the current score and the all-time best score.
- FR-09: The player can restart the game from the game over screen without refreshing the page.

### Scoring
- FR-10: The current score is displayed on screen during gameplay.
- FR-11: The best score is persisted across sessions using `localStorage`.

---

## Non-Functional Requirements

### Platform
- NFR-01: The game must run entirely in a modern web browser with no backend or build step required.
- NFR-02: No external runtime dependencies — only a Google Fonts stylesheet is loaded remotely.

### Performance
- NFR-03: The game loop must run at 60 fps using `requestAnimationFrame`.
- NFR-04: Frame delta is capped at 50 ms to prevent large physics jumps after tab switching.

### Visual Style
- NFR-05: The game must use a retro pixel aesthetic with a dark colour palette.
- NFR-06: The retro font "Press Start 2P" (Google Fonts) must be used for all UI text.
- NFR-07: The game canvas must be 480 × 640 px with a green glowing border.

### Accessibility
- NFR-08: The game must be playable via keyboard (Space / Arrow Up) and touch/mouse (tap/click).

---

## Assets

| Asset | Source | Notes |
|---|---|---|
| `ghosty.png` | Provided in `/assets/` | Ghost sprite (available for future enhancement) |
| `jump.wav` | Provided in `/assets/` | Jump sound (available for future enhancement) |
| `game_over.wav` | Provided in `/assets/` | Game over sound (available for future enhancement) |
| Press Start 2P | Google Fonts | Loaded via `<link>` in `index.html` |

---

## File Structure

```
assets/flappy-kiro/
├── index.html       — Game shell, canvas, and UI overlay screens
├── style.css        — Retro dark theme, layout, animations
├── game.js          — Full game logic, rendering, physics, input
└── requirements.md  — This document
```

---

## Out of Scope
- No server-side logic or API calls
- No multiplayer
- No mobile app packaging
- Sound integration (assets provided but not wired up — future enhancement)
