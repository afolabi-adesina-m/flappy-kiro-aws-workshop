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
  //
  // TUNING NOTES (v2 — feel fix):
  //   Original values were too heavy (gravity 0.45 = 1.8x Flappy Bird).
  //   Reduced gravity and terminal velocity give the player more air time
  //   and reaction time. Interpolation reduced to eliminate input lag feel.
  //
  GRAVITY:           0.28,   // px/frame² — was 0.45; lighter = more floaty, more reaction time
  JUMP_FORCE:       -7.2,    // px/frame  — was -8.5; gentler arc matches lighter gravity
  TERMINAL_VEL:      9,      // px/frame  — was 12; slower fall = more time to react
  MOMENTUM:          0.98,   // horizontal velocity retention (unused directly but documented)
  INTERPOLATION:     0.25,   // lerp factor — was 0.18; faster snap = less input lag feel

  /* ── Ghost ───────────────────────────────────────────────────── */
  GHOST_X:           100,    // fixed horizontal position
  GHOST_SIZE:         40,    // rendered size in px
  GHOST_COLLISION_PAD: 10,   // was 7; larger forgiveness = fairer hitbox feel

  /* ── Pipes ───────────────────────────────────────────────────── */
  PIPE_WIDTH:         64,
  PIPE_GAP:          165,    // was 160; slightly wider opening at start
  PIPE_GAP_MIN:      125,    // was 120; minimum gap at high score
  PIPE_SPEED_INIT:    2.4,   // was 2.8; slower start = easier to get into rhythm
  PIPE_SPEED_MAX:     6.0,   // was 6.5; cap unchanged roughly
  PIPE_SPEED_INC:     0.07,  // was 0.08; slightly gentler speed ramp
  PIPE_INTERVAL:     1800,   // was 1600ms; more breathing room between pipes at start
  PIPE_INTERVAL_MIN:  950,   // was 900ms
  PIPE_MARGIN_TOP:    90,    // was 80; more margin keeps gaps away from score display
  PIPE_MARGIN_BOT:    90,    // was 80

  /* ── Ground ──────────────────────────────────────────────────── */
  GROUND_H:           60,
  GROUND_TILE:        30,

  /* ── Clouds (parallax layers, back → front) ──────────────────── */
  CLOUD_LAYERS: [
    { speed: 0.25, alpha: 0.12, scale: 0.6,  count: 3 },  // far
    { speed: 0.55, alpha: 0.22, scale: 0.85, count: 3 },  // mid
    { speed: 1.0,  alpha: 0.38, scale: 1.1,  count: 2 },  // near
  ],

  /* ── Stars ───────────────────────────────────────────────────── */
  STAR_COUNT: 80,

  /* ── Screen shake ────────────────────────────────────────────── */
  SHAKE_MAGNITUDE:  9,
  SHAKE_DECAY:      0.82,    // multiplied each frame until settled

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
  FRAME_CAP_MS:      50,     // max delta to prevent physics explosions on tab switch
  GAMEOVER_DELAY_MS: 750,    // ms before game-over screen appears
};