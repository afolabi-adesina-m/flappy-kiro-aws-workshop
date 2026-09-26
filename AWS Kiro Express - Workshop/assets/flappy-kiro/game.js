/* ═══════════════════════════════════════════════════════════════
   FLAPPY KIRO — game.js
   All magic numbers live in config.js. This file is pure logic.
   ═══════════════════════════════════════════════════════════════ */

/* ── Canvas setup ──────────────────────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W      = CONFIG.WIDTH;
const H      = CONFIG.HEIGHT;

/* ── DOM refs ──────────────────────────────────────────────────── */
const startScreen    = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen    = document.getElementById('pause-screen');
const finalScoreEl   = document.getElementById('final-score');
const bestScoreEl    = document.getElementById('best-score');
const menuBestEl     = document.getElementById('menu-best');

/* ── Game states ───────────────────────────────────────────────── */
const STATE = { IDLE: 0, PLAYING: 1, PAUSED: 2, DEAD: 3 };
let state = STATE.IDLE;

/* ── Persistent score ──────────────────────────────────────────── */
let score     = 0;
let bestScore = parseInt(localStorage.getItem(CONFIG.LOCALSTORAGE_KEY) || '0');

/* ══════════════════════════════════════════════════════════════════
   AUDIO
   ══════════════════════════════════════════════════════════════════ */
const sounds = {};

function loadSound(key, src) {
  const a = new Audio(src);
  a.volume = CONFIG.VOLUME_SFX;
  sounds[key] = a;
}

function playSound(key) {
  if (!sounds[key]) return;
  const clone = sounds[key].cloneNode();
  clone.volume = CONFIG.VOLUME_SFX;
  clone.play().catch(() => {});
}

loadSound('jump',     '../jump.wav');
loadSound('gameover', '../game_over.wav');

/* ══════════════════════════════════════════════════════════════════
   GHOST
   ══════════════════════════════════════════════════════════════════ */
const ghost = {
  x:       CONFIG.GHOST_X,
  y:       H / 2,
  vy:      0,
  renderY: H / 2,   // interpolated render position
};

// Sprite image
const ghostImg = new Image();
ghostImg.src = '../ghosty.png';
let ghostImgLoaded = false;
ghostImg.onload = () => { ghostImgLoaded = true; };

function resetGhost() {
  ghost.x       = CONFIG.GHOST_X;
  ghost.y       = H / 2;
  ghost.vy      = 0;
  ghost.renderY = H / 2;
}

function updateGhost() {
  // Apply gravity
  ghost.vy += CONFIG.GRAVITY;

  // Clamp to terminal velocity
  if (ghost.vy > CONFIG.TERMINAL_VEL) ghost.vy = CONFIG.TERMINAL_VEL;

  // Momentum conservation (horizontal is fixed, but vy retains momentum)
  ghost.y += ghost.vy;

  // Smooth interpolation for render position
  ghost.renderY += (ghost.y - ghost.renderY) * CONFIG.INTERPOLATION;
}

/* ══════════════════════════════════════════════════════════════════
   PIPES
   ══════════════════════════════════════════════════════════════════ */
let pipes        = [];
let pipeSpeed    = CONFIG.PIPE_SPEED_INIT;
let pipeInterval = CONFIG.PIPE_INTERVAL;
let lastPipeTime = 0;

function spawnPipe(timestamp) {
  const usableH  = H - CONFIG.GROUND_H;
  const halfGap  = currentGap() / 2;
  const minCY    = CONFIG.PIPE_MARGIN_TOP + halfGap;
  const maxCY    = usableH - CONFIG.PIPE_MARGIN_BOT - halfGap;
  const centreY  = minCY + Math.random() * (maxCY - minCY);
  const gap      = currentGap();

  pipes.push({
    x:      W + CONFIG.PIPE_WIDTH,
    topH:   centreY - gap / 2,
    botY:   centreY + gap / 2,
    botH:   usableH - (centreY + gap / 2),
    scored: false,
  });
  lastPipeTime = timestamp;
}

function currentGap() {
  // Gap shrinks as score increases, down to minimum
  const reduced = CONFIG.PIPE_GAP - score * 1.2;
  return Math.max(reduced, CONFIG.PIPE_GAP_MIN);
}

function updatePipes(timestamp) {
  // Spawn new pipe
  if (timestamp - lastPipeTime > pipeInterval || lastPipeTime === 0) {
    spawnPipe(timestamp);
  }

  // Move pipes
  pipes.forEach(p => { p.x -= pipeSpeed; });

  // Remove off-screen pipes
  pipes = pipes.filter(p => p.x + CONFIG.PIPE_WIDTH + 20 > 0);

  // Score & progressive speed
  pipes.forEach(p => {
    if (!p.scored && p.x + CONFIG.PIPE_WIDTH < ghost.x) {
      p.scored = true;
      score++;
      scoreFlash = CONFIG.SCORE_FLASH_FRAMES;
      spawnScorePop();  // floating +1 indicator (FR-24)
      playSound('score');

      // Increase difficulty
      pipeSpeed    = Math.min(CONFIG.PIPE_SPEED_MAX,
                              pipeSpeed + CONFIG.PIPE_SPEED_INC);
      pipeInterval = Math.max(CONFIG.PIPE_INTERVAL_MIN,
                              pipeInterval - 10);
    }
  });
}

/* ══════════════════════════════════════════════════════════════════
   CLOUDS  (parallax layers)
   ══════════════════════════════════════════════════════════════════ */
const cloudLayers = CONFIG.CLOUD_LAYERS.map((layer, li) => {
  const clouds = [];
  for (let i = 0; i < layer.count; i++) {
    clouds.push(makeCloud(layer, li, true));
  }
  return { ...layer, clouds };
});

function makeCloud(layer, layerIdx, randomX = false) {
  const w = (80 + Math.random() * 80) * layer.scale;
  const h = (30 + Math.random() * 30) * layer.scale;
  const puffCount = Math.floor(2 + Math.random() * 3);
  // Store puff offsets at creation time to prevent shimmer on draw (Task 19)
  const puffs = Array.from({ length: puffCount }, (_, i) => ({
    ox: (w / (puffCount + 1)) * (i + 1),
    r:  (h / 2 * 0.7) + Math.random() * h / 2 * 0.3,
  }));
  return {
    x:  randomX ? Math.random() * W : W + w,
    y:  20 + Math.random() * (H - CONFIG.GROUND_H - 120),
    w, h, puffs,
  };
}

function updateClouds() {
  // Only scroll when playing
  if (state !== STATE.PLAYING) return;
  cloudLayers.forEach((layer, li) => {
    layer.clouds.forEach(c => {
      c.x -= layer.speed;
      if (c.x + c.w < 0) {
        Object.assign(c, makeCloud(layer, li, false));
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   STARS
   ══════════════════════════════════════════════════════════════════ */
const stars = Array.from({ length: CONFIG.STAR_COUNT }, () => ({
  x:       Math.random() * W,
  y:       Math.random() * (H - CONFIG.GROUND_H),
  r:       Math.random() * 1.5 + 0.3,
  twinkle: Math.random() * Math.PI * 2,
  speed:   Math.random() * 0.3 + 0.05,
}));

/* ══════════════════════════════════════════════════════════════════
   PARTICLES
   ══════════════════════════════════════════════════════════════════ */
let particles = [];

function spawnBurst(x, y) {
  for (let i = 0; i < CONFIG.BURST_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = Math.random() * 4.5 + 1;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * spd,
      vy:    Math.sin(angle) * spd,
      life:  1,
      decay: Math.random() * 0.04 + 0.022,
      r:     Math.random() * 5 + 2,
      color: ['#e8e8e8','#3ddc84','#f0e68c','#a78bfa','#ff6b6b'][
               Math.floor(Math.random() * 5)],
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.12;
    p.life -= p.decay;
  });
  particles = particles.filter(p => p.life > 0);
}

/* ══════════════════════════════════════════════════════════════════
   SCREEN SHAKE
   ══════════════════════════════════════════════════════════════════ */
let shakeMag = 0;

function triggerShake() { shakeMag = CONFIG.SHAKE_MAGNITUDE; }

function applyShake() {
  if (shakeMag < 0.5) { shakeMag = 0; return; }
  const dx = (Math.random() * 2 - 1) * shakeMag;
  const dy = (Math.random() * 2 - 1) * shakeMag;
  ctx.translate(dx, dy);
  shakeMag *= CONFIG.SHAKE_DECAY;
}

/* ══════════════════════════════════════════════════════════════════
   COLLISION
   ══════════════════════════════════════════════════════════════════ */
function checkCollision() {
  const pad = CONFIG.GHOST_COLLISION_PAD;
  const hs  = CONFIG.GHOST_SIZE / 2;
  const gx1 = ghost.x  - hs + pad;
  const gx2 = ghost.x  + hs - pad;
  const gy1 = ghost.renderY - hs + pad;
  const gy2 = ghost.renderY + hs - pad;

  // Ground / ceiling
  if (gy2 >= H - CONFIG.GROUND_H || gy1 <= 0) return true;

  const capOff = (CONFIG.PIPE_WIDTH + 10 - CONFIG.PIPE_WIDTH) / 2;
  for (const p of pipes) {
    const px1 = p.x - capOff + pad;
    const px2 = p.x + CONFIG.PIPE_WIDTH + capOff - pad;
    if (gx2 > px1 && gx1 < px2) {
      if (gy1 < p.topH || gy2 > p.botY) return true;
    }
  }
  return false;
}

/* ══════════════════════════════════════════════════════════════════
   SCORE FLASH  &  VISUAL SCORE POPUP
   ══════════════════════════════════════════════════════════════════ */
let scoreFlash   = 0;
const scorePops  = [];   // floating +1 indicators

function spawnScorePop() {
  scorePops.push({ x: ghost.x + 30, y: ghost.renderY - 20, life: 1 });
}

/* ══════════════════════════════════════════════════════════════════
   GROUND SCROLL
   ══════════════════════════════════════════════════════════════════ */
let groundOffset = 0;

/* ══════════════════════════════════════════════════════════════════
   GAME FLOW
   ══════════════════════════════════════════════════════════════════ */
function startGame() {
  state        = STATE.PLAYING;
  score        = 0;
  pipes        = [];
  particles    = [];
  scorePops.length = 0;
  pipeSpeed    = CONFIG.PIPE_SPEED_INIT;
  pipeInterval = CONFIG.PIPE_INTERVAL;
  lastPipeTime = 0;
  shakeMag     = 0;
  resetGhost();
  ghost.vy      = CONFIG.JUMP_FORCE * 0.7;
  ghost.renderY = ghost.y;   // snap on game start launch
  ghost.renderY = ghost.y;   // snap on launch
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
}

function killGhost() {
  state = STATE.DEAD;
  triggerShake();
  spawnBurst(ghost.x, ghost.renderY);
  playSound('gameover');
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(CONFIG.LOCALSTORAGE_KEY, bestScore);
  }
  finalScoreEl.textContent = score;
  bestScoreEl.textContent  = bestScore;
  setTimeout(() => gameOverScreen.classList.remove('hidden'),
             CONFIG.GAMEOVER_DELAY_MS);
}

function togglePause() {
  if (state === STATE.PLAYING) {
    state = STATE.PAUSED;
    pauseScreen.classList.remove('hidden');
  } else if (state === STATE.PAUSED) {
    state = STATE.PLAYING;
    pauseScreen.classList.add('hidden');
  }
}

function restartGame() {
  gameOverScreen.classList.add('hidden');
  startGame();
}

/* ══════════════════════════════════════════════════════════════════
   INPUT
   ══════════════════════════════════════════════════════════════════ */
function flap() {
  if (state === STATE.DEAD)   { restartGame(); return; }
  if (state === STATE.IDLE)   { startGame();   return; }
  if (state === STATE.PAUSED) return;
  ghost.vy      = CONFIG.JUMP_FORCE;
  ghost.renderY = ghost.y;   // snap render pos on flap — eliminates perceived input lag
  playSound('jump');
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    flap();
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    e.preventDefault();
    if (state === STATE.PLAYING || state === STATE.PAUSED) togglePause();
  }
});

canvas.addEventListener('pointerdown', () => flap());

/* ══════════════════════════════════════════════════════════════════
   DRAW HELPERS
   ══════════════════════════════════════════════════════════════════ */

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H - CONFIG.GROUND_H);
  grad.addColorStop(0,    '#0d0d1a');
  grad.addColorStop(0.55, '#1a1a3e');
  grad.addColorStop(1,    '#0d1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H - CONFIG.GROUND_H);
}

function drawStars(t) {
  stars.forEach(s => {
    s.twinkle += s.speed * 0.04;
    const alpha = 0.5 + 0.5 * Math.sin(s.twinkle);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,232,232,${alpha})`;
    ctx.fill();
  });
}

/* Draw a single puffy cloud shape */
function drawCloudShape(c, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = '#c8d8ff';
  // Base ellipse
  ctx.beginPath();
  ctx.ellipse(c.x + c.w/2, c.y + c.h/2, c.w/2, c.h/2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Draw stored puffs (no Math.random() here — positions fixed at spawn)
  c.puffs.forEach(p => {
    ctx.beginPath();
    ctx.arc(c.x + p.ox, c.y + c.h * 0.5, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawClouds() {
  cloudLayers.forEach(layer => {
    layer.clouds.forEach(c => {
      drawCloudShape(c, layer.alpha);
    });
  });
}

const PIPE_CAP_W = CONFIG.PIPE_WIDTH + 10;
const PIPE_CAP_H = 18;

function drawPipe(pipe) {
  const capX = pipe.x - (PIPE_CAP_W - CONFIG.PIPE_WIDTH) / 2;

  // ── Top body ──
  let g = ctx.createLinearGradient(pipe.x, 0, pipe.x + CONFIG.PIPE_WIDTH, 0);
  g.addColorStop(0,   '#27ae60');
  g.addColorStop(0.3, '#2ecc71');
  g.addColorStop(0.7, '#2ecc71');
  g.addColorStop(1,   '#1a8c45');
  ctx.fillStyle = g;
  ctx.fillRect(pipe.x, 0, CONFIG.PIPE_WIDTH, pipe.topH);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(pipe.x + 8, 0, 10, pipe.topH);

  // Top cap
  let cg = ctx.createLinearGradient(capX, 0, capX + PIPE_CAP_W, 0);
  cg.addColorStop(0,   '#27ae60');
  cg.addColorStop(0.3, '#3ddc84');
  cg.addColorStop(0.7, '#3ddc84');
  cg.addColorStop(1,   '#1a8c45');
  ctx.fillStyle = cg;
  ctx.fillRect(capX, pipe.topH - PIPE_CAP_H, PIPE_CAP_W, PIPE_CAP_H);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(capX + 6, pipe.topH - PIPE_CAP_H + 3, 12, PIPE_CAP_H - 6);

  // ── Bottom body ──
  ctx.fillStyle = g;
  ctx.fillRect(pipe.x, pipe.botY, CONFIG.PIPE_WIDTH, pipe.botH);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(pipe.x + 8, pipe.botY, 10, pipe.botH);

  // Bottom cap
  ctx.fillStyle = cg;
  ctx.fillRect(capX, pipe.botY, PIPE_CAP_W, PIPE_CAP_H);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(capX + 6, pipe.botY + 3, 12, PIPE_CAP_H - 6);
}

function drawGround() {
  if (state === STATE.PLAYING) {
    groundOffset = (groundOffset + pipeSpeed) % CONFIG.GROUND_TILE;
  }
  const gGrad = ctx.createLinearGradient(0, H - CONFIG.GROUND_H, 0, H);
  gGrad.addColorStop(0,    '#3ddc84');
  gGrad.addColorStop(0.12, '#2bbd6e');
  gGrad.addColorStop(0.13, '#1a5c35');
  gGrad.addColorStop(1,    '#0d2e1a');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, H - CONFIG.GROUND_H, W, CONFIG.GROUND_H);

  ctx.fillStyle = '#3ddc84';
  for (let x = -groundOffset; x < W; x += CONFIG.GROUND_TILE) {
    ctx.fillRect(x, H - CONFIG.GROUND_H, CONFIG.GROUND_TILE - 2, 8);
  }
}

function drawGhost(t) {
  ctx.save();
  ctx.translate(ghost.x, ghost.renderY);

  const tilt = state === STATE.PLAYING
    ? Math.min(Math.max(ghost.vy * 3, -30), 70) * (Math.PI / 180)
    : Math.sin(t * 0.002) * 0.12;
  ctx.rotate(tilt);

  const s  = CONFIG.GHOST_SIZE;
  const hs = s / 2;

  // ── Particle trails (wisps behind ghost) ──
  if (state === STATE.PLAYING) {
    for (let i = 1; i <= CONFIG.TRAIL_COUNT; i++) {
      const wx = -hs - i * 12;
      const wy = Math.sin(t * 0.006 + i) * 4;
      const wr = (CONFIG.TRAIL_COUNT + 1 - i) * 2.5;
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${0.28 - i * 0.07})`;
      ctx.fill();
    }
  }

  // ── Use sprite if loaded, else draw canvas ghost ──
  if (ghostImgLoaded) {
    ctx.drawImage(ghostImg, -hs, -hs, s, s);
  } else {
    drawCanvasGhost(s, hs, t);
  }

  ctx.restore();
}

function drawCanvasGhost(s, hs, t) {
  // Glow
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, s);
  glow.addColorStop(0, 'rgba(167,139,250,0.35)');
  glow.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-s, -s, s * 2, s * 2);

  // Body
  ctx.beginPath();
  ctx.moveTo(-hs, s * 0.25);
  ctx.arc(0, -s * 0.1, hs, Math.PI, 0);
  ctx.lineTo(hs, s * 0.25);
  const wa = 6;
  const ws = state === STATE.PLAYING ? t * 0.008 : t * 0.003;
  ctx.bezierCurveTo( hs * 0.7, s * 0.25 + wa * Math.sin(ws),
                     hs * 0.3, s * 0.55, 0, s * 0.45);
  ctx.bezierCurveTo(-hs * 0.3, s * 0.55,
                    -hs * 0.7, s * 0.25 + wa * Math.sin(ws + 1.5),
                    -hs, s * 0.25);
  ctx.closePath();

  const bg = ctx.createRadialGradient(-hs * 0.3, -hs * 0.4, 2, 0, 0, s);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.5, '#dcd0ff');
  bg.addColorStop(1,   '#a78bfa');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = '#7c5cbf';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Eyes
  const eyeY    = -s * 0.05;
  const eyeSize = s * 0.13;
  const blink   = (Math.floor(t / 3000) % 8 === 0 && (t % 3000) < 120) ? 0.15 : 1;

  [[-hs * 0.38, 2], [hs * 0.38, 2]].forEach(([ex, px]) => {
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeSize, eyeSize * blink, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e'; ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + px, eyeY, eyeSize * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  });

  if (state !== STATE.DEAD) {
    ctx.beginPath();
    ctx.arc(0, eyeY + eyeSize * 1.5, eyeSize * 0.8, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#5b3f9e';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  } else {
    [[-hs * 0.38], [hs * 0.38]].forEach(([ex]) => {
      ctx.beginPath();
      ctx.moveTo(ex - eyeSize, eyeY - eyeSize);
      ctx.lineTo(ex + eyeSize, eyeY + eyeSize);
      ctx.moveTo(ex + eyeSize, eyeY - eyeSize);
      ctx.lineTo(ex - eyeSize, eyeY + eyeSize);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth   = 2.5;
      ctx.stroke();
    });
  }
}

function drawScore() {
  const flash = scoreFlash > 0;
  ctx.save();
  ctx.font      = '28px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillText(score, W / 2 + 2, 58);
  ctx.fillStyle = flash ? '#ffffff' : '#f0e68c';
  ctx.fillText(score, W / 2, 56);
  ctx.restore();
  if (flash) scoreFlash--;
}

function drawScorePops(t) {
  scorePops.forEach((p, i) => {
    p.y    -= 1.2;
    p.life -= 0.025;
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.font        = '14px "Press Start 2P", monospace';
    ctx.textAlign   = 'center';
    ctx.fillStyle   = '#f0e68c';
    ctx.fillText('+1', p.x, p.y);
    ctx.restore();
  });
  // Remove dead pops
  for (let i = scorePops.length - 1; i >= 0; i--) {
    if (scorePops[i].life <= 0) scorePops.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fillStyle   = p.color;
    ctx.globalAlpha = p.life;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/* ══════════════════════════════════════════════════════════════════
   MAIN LOOP
   ══════════════════════════════════════════════════════════════════ */
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min(timestamp - lastTime, CONFIG.FRAME_CAP_MS);
  lastTime  = timestamp;

  /* ── UPDATE ── */
  if (state === STATE.PLAYING) {
    updateGhost();
    updatePipes(timestamp);
    updateClouds();
    if (checkCollision()) killGhost();
  }

  if (state === STATE.IDLE) {
    ghost.y       = H / 2 + Math.sin(timestamp * 0.002) * 18;
    ghost.renderY = ghost.y;
    updateClouds();
  }

  if (state === STATE.DEAD) {
    ghost.vy += CONFIG.GRAVITY * 0.65;
    if (ghost.vy > CONFIG.TERMINAL_VEL) ghost.vy = CONFIG.TERMINAL_VEL;
    ghost.y      += ghost.vy;
    ghost.renderY = ghost.y;
    ghost.y       = Math.min(ghost.y, H - CONFIG.GROUND_H - CONFIG.GHOST_SIZE / 2);
    ghost.renderY = ghost.y;
  }

  updateParticles();

  /* ── DRAW ── */
  ctx.save();
  applyShake();

  drawBackground();
  drawStars(timestamp);
  drawClouds();
  pipes.forEach(drawPipe);
  drawGround();
  drawGhost(timestamp);

  if (state === STATE.PLAYING || state === STATE.DEAD || state === STATE.PAUSED) {
    drawScore();
    drawScorePops(timestamp);
  }

  drawParticles();

  ctx.restore();

  requestAnimationFrame(loop);
}

/* ── Boot ── */
menuBestEl.textContent = bestScore;
resetGhost();
requestAnimationFrame(loop);