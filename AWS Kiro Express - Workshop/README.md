# Flappy Kiro

A retro browser-based endless scroller game built at the **AWS Kiro Express Workshop**.

Guide a ghost character through a series of pipes without hitting them. Press Space or tap to flap. Survive as long as you can — the pipes get faster and the gaps get smaller.

---

## Play the Game

Open `assets/flappy-kiro/index.html` in any modern browser. No install, no build step required.

| Control | Action |
|---------|--------|
| Space / Arrow Up | Flap |
| P / Escape | Pause / Resume |
| Tap / Click | Flap (mobile & mouse) |

---

## Project Structure

```
AWS Kiro Express - Workshop/
└── assets/
    ├── ghosty.png          Ghost sprite image
    ├── jump.wav            Flap sound effect
    ├── game_over.wav       Death sound effect
    └── flappy-kiro/
        ├── index.html      Game shell and UI screens
        ├── style.css       Retro dark theme
        ├── config.js       All tunable constants (physics, pipes, audio)
        ├── game.js         Game loop, physics, rendering, input, audio
        ├── requirements.md Functional and non-functional requirements
        ├── design.md       Technical architecture document
        ├── game-config.json Time-based physics parameters
        ├── ghosty-sprites.md Sprite and animation specifications
        ├── audio-assets.md Sound design specifications
        ├── ui-mockups.md   UI wireframes for all screens
        └── src/
            ├── Ghosty.js       Player character class
            ├── WallObstacle.js Pipe pair class
            └── GameEngine.js   Main engine class
```

---

## Features

- Ghost character with full physics — gravity, terminal velocity, momentum, smooth interpolation
- 3-layer parallax cloud background for depth
- Progressive difficulty — pipes speed up, gaps narrow, spawn interval decreases as score increases
- 4 game states — main menu, playing, paused, game over
- Screen shake and particle burst on death
- Floating +1 score indicators
- Ghost sprite with canvas fallback
- Sound effects for flap and game over
- Best score saved to localStorage
- Responsive — scales down on small viewports

---

## Configuration

All game constants live in `config.js`. No magic numbers in game logic.

Key physics values:

| Constant | Value | Description |
|----------|-------|-------------|
| `GRAVITY` | 0.28 px/frame² | Downward acceleration |
| `JUMP_FORCE` | -7.2 px/frame | Upward velocity on flap |
| `TERMINAL_VEL` | 9 px/frame | Max downward speed |
| `PIPE_SPEED_INIT` | 2.4 px/frame | Starting scroll speed |
| `PIPE_GAP` | 165 px | Starting gap size |

Tweak any value in `config.js` to adjust difficulty and feel.

---

## Spec Documents

This project was built following the Kiro spec workflow:

| Document | Purpose |
|----------|---------|
| `requirements.md` | 36 functional + 11 non-functional requirements |
| `design.md` | Technical architecture, state machine, physics design |
| `game-config.json` | Time-based physics parameters |
| `ghosty-sprites.md` | 32x32px spritesheet and animation spec |
| `audio-assets.md` | Sound design specifications |
| `ui-mockups.md` | ASCII wireframes for all 5 game screens |

---

## Built With

- HTML5 Canvas API
- Vanilla JavaScript (no frameworks, no bundler)
- CSS3
- Press Start 2P font (Google Fonts)
- AWS Kiro AI development environment

---

## Author

**Afolabi Adesina-M**
Sheridan College — PAIDA 2025-2026, Semester 3
AWS Kiro Express Workshop