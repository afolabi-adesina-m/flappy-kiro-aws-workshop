/* ═══════════════════════════════════════════════════════════════
   FLAPPY KIRO — config.js
   All tunable constants live here. Edit freely without touching
   game logic in game.js.
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── Canvas ──────────────────────────────────────────────────── */
  WIDTH:  480,
  HEIGHT: 640,

  /* ── Physics ─────────────────────────────────────────────────── */
  GRAVITY:           0.45,   // downward acceleration per frame
  JUMP_FORCE:       -8.5,    // upward velocity on flap
  TERMINAL_VEL:     12,      // maximum downward speed
  MOMENTUM:         0.98,    // horizontal velocity retention (1 = no drag)
  INTERPOLATION:    0.18,    // smooth lerp factor for visual position

  /* ── Ghost ───────────────────────────────────────────────────── */
  GHOST_X:          100,     // fixed horizontal position
  GHOST_SIZE:       40,      // radius used for render & collision
  GHOST_COLLISION_PAD: 7,    // pixels of forgiveness on hitbox

  /* ── Pipes ───────────────────────────────────────────────────── */
  PIPE_WIDTH:        64,
  PIPE_GAP:         160,     // vertical gap between top and bottom pipe
  PIPE_GAP_MIN:     120,     // minimum gap after speed scaling kicks in
  PIPE_SPEED_INIT:   2.8,    // starting scroll speed (px/frame)
  PIPE_SPEED_MAX:    6.5,    // speed ceiling
  PIPE_SPEED_INC:    0.08,   // added to speed every point scored
  PIPE_INTERVAL:   1600,     // ms between pipe spawns
  PIPE_INTERVAL_MIN: 900,    // minimum spawn interval
  PIPE_MARGIN_TOP:   80,     // min px from top for gap centre
  PIPE_MARGIN_BOT:   80,     // min px from bottom for gap centre

  /* ── Ground ──────────────────────────────────────────────────── */
  GROUND_H:          60,
  GROUND_TILE:       30,

  /* ── Clouds (parallax layers, back → front) ──────────────────── */
  CLOUD_LAYERS: [
    { speed: 0.25, alpha: 0.12, scale: 0.6, count: 3 },  // far
    { speed: 0.55, alpha: 0.22, scale: 0.85, count: 3 }, // mid
    { speed: 1.0,  alpha: 0.38, scale: 1.1,  count: 2 }, // near
  ],

  /* ── Stars ───────────────────────────────────────────────────── */
  STAR_COUNT: 80,

  /* ── Screen shake ────────────────────────────────────────────── */
  SHAKE_MAGNITUDE: 9,
  SHAKE_DECAY:     0.82,     // multiplied each frame until settled

  /* ── Particles ───────────────────────────────────────────────── */
  BURST_COUNT:      16,      // particles on death
  TRAIL_COUNT:       3,      // ghost trail wisps while flying

  /* ── Audio ───────────────────────────────────────────────────── */
  VOLUME_SFX:   0.55,
  VOLUME_MUSIC: 0.20,

  /* ── Scoring ─────────────────────────────────────────────────── */
  SCORE_FLASH_FRAMES: 10,
  LOCALSTORAGE_KEY: 'flappyKiroBest',

  /* ── Timing ──────────────────────────────────────────────────── */
  FRAME_CAP_MS: 50,          // max delta to prevent physics explosions
  GAMEOVER_DELAY_MS: 750,    // ms before game-over screen appears
};
