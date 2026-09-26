# Flappy Kiro — Technical Design Document

## 1. Overview

Flappy Kiro is a single-file, zero-dependency browser game built on the HTML5 Canvas API. There is no bundler, framework, or build step — the browser loads three JavaScript/JSON files and renders everything through a 2D canvas context at 60 fps.

---

## 2. Architecture

### 2.1 File Responsibilities

```
index.html    — DOM shell, UI overlay screens, script load order
style.css     — Layout, screen cards, animations (no game logic)
config.js     — Single CONFIG object; all tunable constants
game.js       — Everything else: state, physics, rendering, input, audio
```

`config.js` must be loaded before `game.js`. No other load-order dependency exists.

### 2.2 High-Level Component Map

```
+-------------------------------------------------------------+
|                         game.js                             |
|                                                             |
|  +----------+   +----------+   +----------+   +--------+  |
|  |  State   |   | Physics  |   | Renderer |   | Input  |  |
|  | Machine  |-->|  Engine  |-->| Pipeline |   |Handler |  |
|  +----------+   +----------+   +----------+   +---+----+  |
|       ^                                            |       |
|       +--------------------------------------------+       |
|                                                             |
|  +----------+   +----------+   +----------+               |
|  |  Audio   |   |Particles |   |  Score / |               |
|  | Manager  |   | System   |   | Storage  |               |
|  +----------+   +----------+   +----------+               |
+-------------------------------------------------------------+
         |                              |
    config.js                     localStorage
    (constants)                   (best score)
```

---

## 3. Game Loop

The main loop uses `requestAnimationFrame` for 60 fps rendering. Each tick follows a strict update then draw order.

```
requestAnimationFrame(loop)
|
+- Compute dt = min(now - lastTime, CONFIG.FRAME_CAP_MS)
|
+- UPDATE
|   +- [PLAYING]  updateGhost()
|   |             updatePipes(timestamp)
|   |             updateClouds()
|   |             checkCollision() -> killGhost() if true
|   +- [IDLE]     bob ghost vertically via sin wave
|   |             updateClouds()
|   +- [DEAD]     apply reduced gravity, clamp to ground
|   +- [ALL]      updateParticles()
|
+- DRAW
    +- ctx.save() + applyShake()
    +- drawBackground()   -- sky gradient
    +- drawStars()        -- 80 twinkling points
    +- drawClouds()       -- 3 parallax layers
    +- pipes.forEach(drawPipe)
    +- drawGround()       -- scrolling tile strip
    +- drawGhost()        -- sprite or canvas fallback
    +- drawScore()        -- if PLAYING / DEAD / PAUSED
    +- drawScorePops()    -- floating +1 indicators
    +- drawParticles()    -- burst + trail effects
    +- ctx.restore()
```

dt is computed but currently used only for the frame cap. Physics values in config.js are expressed as per-frame deltas. See game-config.json for the time-based (px/s) equivalent values if a future refactor moves to dt-based integration.

---

## 4. State Machine

```
         [IDLE]
            |
     Space / Tap
            |
            v
        [PLAYING] <------------ Space / Tap (restart)
            |   ^                       |
         P / Esc |                      |
            |   |                   killGhost()
            v   |                       |
        [PAUSED] |                      v
         P / Esc-+                   [DEAD]
```

| State   | Updates              | Renders                  | Input accepted               |
|---------|----------------------|--------------------------|------------------------------|
| IDLE    | Ghost bob, clouds    | All layers, no score     | Space/Tap -> PLAYING         |
| PLAYING | All systems          | All layers + score       | Space/Tap = flap, P/Esc = pause |
| PAUSED  | Nothing              | All layers + score + overlay | P/Esc -> PLAYING         |
| DEAD    | Ghost fall, particles| All layers + score       | Space/Tap -> PLAYING (restart)|

State is stored in a single `let state` integer compared against the STATE constant object { IDLE:0, PLAYING:1, PAUSED:2, DEAD:3 }.

---

## 5. Physics Engine

All physics operates on a ghost object with two vertical values:

```js
ghost = {
  x:       CONFIG.GHOST_X,   // fixed -- never changes during play
  y:       ...,              // physics position (updated every frame)
  vy:      0,                // vertical velocity
  renderY: ...,              // interpolated position used for drawing
}
```

### 5.1 Per-Frame Update (updateGhost)

```
1. vy += GRAVITY                               // accelerate downward
2. vy  = min(vy, TERMINAL_VEL)                 // clamp to terminal velocity
3. y  += vy                                    // integrate position
4. renderY += (y - renderY) x INTERPOLATION    // smooth lerp
```

### 5.2 Flap

```
vy = JUMP_FORCE   // instant velocity override (negative = upward)
```

### 5.3 Visual Tilt

```
tiltDeg = clamp(vy x 3, -30, 70)
tiltRad = tiltDeg x pi/180
ctx.rotate(tiltRad)
```

The ghost nose tips up at peak jump (-30 deg) and dives steeply at terminal velocity (+70 deg).

---

## 6. Pipe System

### 6.1 Data Model

Each pipe pair is a plain object:

```js
{
  x:      number,   // left edge (moves left each frame)
  topH:   number,   // height of top pipe (from y=0)
  botY:   number,   // top of bottom pipe = topH + gap
  botH:   number,   // height of bottom pipe (to ground)
  scored: boolean,  // true once ghost passes it
}
```

### 6.2 Spawn Logic

Gap centre Y is randomised within safe margins:

```
usableH = H - GROUND_H
halfGap = currentGap() / 2
minCY   = PIPE_MARGIN_TOP + halfGap
maxCY   = usableH - PIPE_MARGIN_BOT - halfGap
centreY = minCY + random() x (maxCY - minCY)
```

### 6.3 Progressive Difficulty

On each point scored:

```
pipeSpeed    = min(pipeSpeed + PIPE_SPEED_INC, PIPE_SPEED_MAX)
pipeInterval = max(pipeInterval - 10, PIPE_INTERVAL_MIN)
gap          = max(PIPE_GAP - score x 1.2, PIPE_GAP_MIN)
```

Speed increases, spawn interval decreases, and gap narrows — all independently bounded.

---

## 7. Collision Detection

AABB (axis-aligned bounding box) using the ghost's render position with a configurable forgiveness pad:

```
gx1 = ghost.x       - GHOST_SIZE/2 + GHOST_COLLISION_PAD
gx2 = ghost.x       + GHOST_SIZE/2 - GHOST_COLLISION_PAD
gy1 = ghost.renderY - GHOST_SIZE/2 + GHOST_COLLISION_PAD
gy2 = ghost.renderY + GHOST_SIZE/2 - GHOST_COLLISION_PAD

Boundary check:
  if gy2 >= H - GROUND_H  -> collision (ground)
  if gy1 <= 0             -> collision (ceiling)

Per-pipe check:
  for each pipe:
    if gx2 > px1 AND gx1 < px2:
      if gy1 < pipe.topH OR gy2 > pipe.botY -> collision
```

Collision uses renderY (interpolated) not y (physics) — the player sees what they expect to collide with.

---

## 8. Parallax Cloud System

Three independent layers scroll at different speeds to simulate depth:

| Layer | Speed (px/frame) | Alpha | Scale | Count |
|-------|-----------------|-------|-------|-------|
| Far   | 0.25            | 0.12  | 0.6x  | 3     |
| Mid   | 0.55            | 0.22  | 0.85x | 3     |
| Near  | 1.0             | 0.38  | 1.1x  | 2     |

Each cloud is a base ellipse with 2-4 random puff arcs across the top, drawn with globalAlpha for semi-transparency. When a cloud exits left, it respawns off the right edge with new random dimensions.

Clouds only scroll in PLAYING state — they freeze on IDLE, PAUSED, and DEAD.

---

## 9. Rendering Pipeline (Draw Order)

Draw order determines visual layering. Back to front:

```
1. Sky gradient        (fillRect -- covers entire canvas)
2. Stars               (80 arcs, varying alpha)
3. Clouds              (3 layers, back to front)
4. Pipes               (gradient-filled rects + caps)
5. Ground              (gradient fill + scrolling tile strip)
6. Ghost               (sprite image or canvas fallback)
7. Score               (canvas text, centred top)
8. Score pops          (floating +1 text, alpha decay)
9. Particles           (burst arcs, alpha decay)
```

Screen shake is applied as a ctx.translate(dx, dy) inside a ctx.save/restore wrapping the entire draw pass.

### 9.1 Ghost Rendering — Sprite vs Fallback

```js
if (ghostImgLoaded) {
  ctx.drawImage(ghostImg, -hs, -hs, size, size)   // sprite
} else {
  drawCanvasGhost(...)                              // procedural fallback
}
```

The sprite (ghosty.png) is loaded asynchronously. The canvas fallback renders immediately from frame 1 with no loading delay.

---

## 10. Audio System

Sound effects use the HTML5 Audio API with node cloning for polyphony:

```js
// Each playSound call creates a fresh clone so rapid
// flapping does not cut off the previous flap sound.
function playSound(key) {
  const clone = sounds[key].cloneNode();
  clone.play().catch(() => {});   // silently handles autoplay policy
}
```

| Key       | File               | Trigger               |
|-----------|--------------------|-----------------------|
| jump      | ../jump.wav        | flap()                |
| gameover  | ../game_over.wav   | killGhost()           |
| score     | ../score.wav       | Pipe passed (pending) |

Volumes are controlled via CONFIG.VOLUME_SFX and CONFIG.VOLUME_MUSIC.

---

## 11. Particle System

Two particle emitters share the same pool (particles[]):

| Emitter | Trigger           | Count   | Behaviour                          |
|---------|-------------------|---------|------------------------------------|
| Burst   | Ghost death       | 16      | Radial explosion, gravity, fade out|
| Trail   | Per frame PLAYING | 3 wisps | Drawn in drawGhost, not in pool    |

Each burst particle carries: {x, y, vx, vy, life, decay, r, color}. Updated each frame:

```
x    += vx
y    += vy
vy   += 0.12   (gravity)
life -= decay
```

Particles with life <= 0 are filtered out after each update pass.

---

## 12. Score & Persistence

```
score      -- int, reset to 0 on startGame()
bestScore  -- int, loaded from localStorage on boot
scoreFlash -- countdown int, set to SCORE_FLASH_FRAMES on point scored
scorePops  -- array of {x, y, life} floating +1 indicators
```

Best score is written to localStorage only when the current score exceeds it, inside killGhost().

---

## 13. Input Handling

| Event               | Keys / Actions  | Effect         |
|---------------------|-----------------|----------------|
| keydown             | Space, Arrow Up | flap()         |
| keydown             | P, Escape       | togglePause()  |
| pointerdown (canvas)| tap / click     | flap()         |

flap() is the central input dispatcher — it routes to startGame(), restartGame(), or the physics jump based on current state.

---

## 14. Known Limitations & Future Work

| Item                        | Notes                                                                                      |
|-----------------------------|--------------------------------------------------------------------------------------------|
| Frame-rate dependent physics| Physics uses per-frame deltas. On >60Hz displays the game runs faster. Fix: multiply all physics by dt/(1000/60). game-config.json has time-based values ready. |
| No spritesheet animation    | ghosty.png renders as a static image. Idle/flap/death frames from ghosty-sprites.md not yet implemented. |
| score.wav missing           | Score sound is registered but the file does not exist — playSound('score') silently no-ops.|
| Cloud puff shimmer          | drawCloudShape calls Math.random() each frame causing puffs to shimmer. Fix: store puff offsets on the cloud object at spawn time. |
| No background music         | CONFIG.VOLUME_MUSIC is defined but no music file or playback logic is wired up.           |
