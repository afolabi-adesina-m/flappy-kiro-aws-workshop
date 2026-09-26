/* ═══════════════════════════════════════════════════════════════
   FLAPPY KIRO  –  game.js
   ═══════════════════════════════════════════════════════════════ */

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

const W = canvas.width;   // 480
const H = canvas.height;  // 640

/* ── DOM refs ──────────────────────────────────────────────────── */
const startScreen   = document.getElementById('start-screen');
const gameOverScreen= document.getElementById('game-over-screen');
const finalScoreEl  = document.getElementById('final-score');
const bestScoreEl   = document.getElementById('best-score');

/* ── Game state ────────────────────────────────────────────────── */
const STATE = { IDLE: 0, PLAYING: 1, DEAD: 2 };
let state = STATE.IDLE;

/* ── Constants ─────────────────────────────────────────────────── */
const GRAVITY      = 0.45;
const JUMP_FORCE   = -8.5;
const PIPE_WIDTH   = 64;
const PIPE_GAP     = 160;
const PIPE_SPEED   = 2.8;
const PIPE_INTERVAL= 1600; // ms between pipes
const GROUND_H     = 60;
const GHOST_X      = 100;
const GHOST_SIZE   = 40;

/* ── Score ─────────────────────────────────────────────────────── */
let score     = 0;
let bestScore = parseInt(localStorage.getItem('flappyKiroBest') || '0');

/* ── Ghost ─────────────────────────────────────────────────────── */
const ghost = {
  x: GHOST_X,
  y: H / 2,
  vy: 0,
  angle: 0,   // visual tilt
  wobble: 0,  // float wobble on idle/dead
};

function resetGhost() {
  ghost.x  = GHOST_X;
  ghost.y  = H / 2;
  ghost.vy = 0;
  ghost.angle = 0;
  ghost.wobble = 0;
}

/* ── Pipes ─────────────────────────────────────────────────────── */
let pipes = [];
let lastPipeTime = 0;

function spawnPipe(timestamp) {
  const minTop = 80;
  const maxTop = H - GROUND_H - PIPE_GAP - 80;
  const topH   = minTop + Math.random() * (maxTop - minTop);
  pipes.push({
    x:     W + PIPE_WIDTH,
    topH:  topH,
    botY:  topH + PIPE_GAP,
    botH:  H - GROUND_H - topH - PIPE_GAP,
    scored: false,
  });
  lastPipeTime = timestamp;
}

/* ── Stars (background) ────────────────────────────────────────── */
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * W,
  y: Math.random() * (H - GROUND_H),
  r: Math.random() * 1.5 + 0.3,
  twinkle: Math.random() * Math.PI * 2,
  speed: Math.random() * 0.3 + 0.05,
}));

/* ── Ground tiles ──────────────────────────────────────────────── */
let groundOffset = 0;
const TILE = 30;

/* ── Particles ─────────────────────────────────────────────────── */
let particles = [];

function spawnParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.04 + 0.025,
      r: Math.random() * 5 + 2,
      color: ['#e8e8e8', '#3ddc84', '#f0e68c', '#a78bfa'][Math.floor(Math.random() * 4)],
    });
  }
}

/* ── Score flash ───────────────────────────────────────────────── */
let scoreFlash = 0;

/* ── Input ─────────────────────────────────────────────────────── */
function flap() {
  if (state === STATE.DEAD) return;
  if (state === STATE.IDLE) {
    startGame();
    return;
  }
  ghost.vy = JUMP_FORCE;
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (state === STATE.DEAD) { restartGame(); return; }
    flap();
  }
});

canvas.addEventListener('pointerdown', () => {
  if (state === STATE.DEAD) { restartGame(); return; }
  flap();
});

/* ── Game flow ─────────────────────────────────────────────────── */
function startGame() {
  state = STATE.PLAYING;
  score = 0;
  pipes = [];
  particles = [];
  lastPipeTime = 0;
  resetGhost();
  ghost.vy = JUMP_FORCE * 0.7; // gentle launch
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
}

function killGhost() {
  state = STATE.DEAD;
  spawnParticles(ghost.x, ghost.y);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('flappyKiroBest', bestScore);
  }
  finalScoreEl.textContent = score;
  bestScoreEl.textContent  = bestScore;
  setTimeout(() => gameOverScreen.classList.remove('hidden'), 700);
}

function restartGame() {
  gameOverScreen.classList.add('hidden');
  startGame();
}

/* ══════════════════════════════════════════════════════════════════
   DRAWING HELPERS
   ══════════════════════════════════════════════════════════════════ */

/* Sky gradient */
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
  grad.addColorStop(0,    '#0d0d1a');
  grad.addColorStop(0.55, '#1a1a3e');
  grad.addColorStop(1,    '#0d1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H - GROUND_H);
}

/* Stars */
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

/* Ground */
function drawGround(dt) {
  if (state === STATE.PLAYING) groundOffset = (groundOffset + PIPE_SPEED) % TILE;

  // Dirt fill
  const gGrad = ctx.createLinearGradient(0, H - GROUND_H, 0, H);
  gGrad.addColorStop(0, '#3ddc84');
  gGrad.addColorStop(0.12, '#2bbd6e');
  gGrad.addColorStop(0.13, '#1a5c35');
  gGrad.addColorStop(1,    '#0d2e1a');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

  // Pixel-tile top stripe
  ctx.fillStyle = '#3ddc84';
  for (let x = -groundOffset; x < W; x += TILE) {
    ctx.fillRect(x, H - GROUND_H, TILE - 2, 8);
  }
}

/* Pipe cap dimensions */
const CAP_W = PIPE_WIDTH + 10;
const CAP_H = 18;

function drawPipe(pipe) {
  // ── Top pipe body ──
  const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
  topGrad.addColorStop(0,   '#27ae60');
  topGrad.addColorStop(0.3, '#2ecc71');
  topGrad.addColorStop(0.7, '#2ecc71');
  topGrad.addColorStop(1,   '#1a8c45');
  ctx.fillStyle = topGrad;
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topH);

  // Highlight stripe on top body
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(pipe.x + 8, 0, 10, pipe.topH);

  // Top pipe cap
  const capX = pipe.x - (CAP_W - PIPE_WIDTH) / 2;
  const capGrad = ctx.createLinearGradient(capX, 0, capX + CAP_W, 0);
  capGrad.addColorStop(0,   '#27ae60');
  capGrad.addColorStop(0.3, '#3ddc84');
  capGrad.addColorStop(0.7, '#3ddc84');
  capGrad.addColorStop(1,   '#1a8c45');
  ctx.fillStyle = capGrad;
  ctx.fillRect(capX, pipe.topH - CAP_H, CAP_W, CAP_H);

  // Cap highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(capX + 6, pipe.topH - CAP_H + 3, 12, CAP_H - 6);

  // ── Bottom pipe body ──
  const botGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
  botGrad.addColorStop(0,   '#27ae60');
  botGrad.addColorStop(0.3, '#2ecc71');
  botGrad.addColorStop(0.7, '#2ecc71');
  botGrad.addColorStop(1,   '#1a8c45');
  ctx.fillStyle = botGrad;
  ctx.fillRect(pipe.x, pipe.botY, PIPE_WIDTH, pipe.botH);

  // Highlight stripe on bottom body
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(pipe.x + 8, pipe.botY, 10, pipe.botH);

  // Bottom pipe cap
  ctx.fillStyle = capGrad;
  ctx.fillRect(capX, pipe.botY, CAP_W, CAP_H);

  // Cap highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(capX + 6, pipe.botY + 3, 12, CAP_H - 6);
}

/* Ghost character */
function drawGhost(t) {
  ctx.save();
  ctx.translate(ghost.x, ghost.y);

  // Tilt based on velocity (playing), or gentle float (idle/dead)
  let tilt = 0;
  if (state === STATE.PLAYING) {
    tilt = Math.min(Math.max(ghost.vy * 3, -30), 70) * (Math.PI / 180);
  } else {
    tilt = Math.sin(t * 0.002) * 0.12;
  }
  ctx.rotate(tilt);

  const s = GHOST_SIZE;
  const hs = s / 2;

  // Glow
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, s);
  glow.addColorStop(0, 'rgba(167,139,250,0.35)');
  glow.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-s, -s, s * 2, s * 2);

  // Body (rounded top, wavy bottom)
  ctx.beginPath();
  ctx.moveTo(-hs, s * 0.25);
  ctx.arc(0, -s * 0.1, hs, Math.PI, 0);  // rounded top
  // wavy bottom skirt
  ctx.lineTo(hs, s * 0.25);
  const waveAmp = 6;
  const waveSpd = state === STATE.PLAYING ? t * 0.008 : t * 0.003;
  ctx.bezierCurveTo( hs * 0.7, s * 0.25 + waveAmp * Math.sin(waveSpd),
                     hs * 0.3, s * 0.55,
                     0,        s * 0.45);
  ctx.bezierCurveTo(-hs * 0.3, s * 0.55,
                    -hs * 0.7, s * 0.25 + waveAmp * Math.sin(waveSpd + 1.5),
                    -hs,       s * 0.25);
  ctx.closePath();

  // Body fill
  const bodyGrad = ctx.createRadialGradient(-hs * 0.3, -hs * 0.4, 2, 0, 0, s);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.5, '#dcd0ff');
  bodyGrad.addColorStop(1,   '#a78bfa');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Body outline
  ctx.strokeStyle = '#7c5cbf';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  const eyeY   = -s * 0.05;
  const eyeSize = s * 0.13;
  const blink  = (Math.floor(t / 3000) % 8 === 0 && (t % 3000) < 120) ? 0.15 : 1;

  // Left eye white
  ctx.beginPath();
  ctx.ellipse(-hs * 0.38, eyeY, eyeSize, eyeSize * blink, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  // Left pupil
  ctx.beginPath();
  ctx.arc(-hs * 0.38 + 2, eyeY, eyeSize * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Right eye white
  ctx.beginPath();
  ctx.ellipse(hs * 0.38, eyeY, eyeSize, eyeSize * blink, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  // Right pupil
  ctx.beginPath();
  ctx.arc(hs * 0.38 + 2, eyeY, eyeSize * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Smile (only when alive & playing ok)
  if (state !== STATE.DEAD) {
    ctx.beginPath();
    ctx.arc(0, eyeY + eyeSize * 1.5, eyeSize * 0.8, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#5b3f9e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // X eyes when dead
    const ex = [-hs * 0.38, hs * 0.38];
    ex.forEach(ex => {
      ctx.beginPath();
      ctx.moveTo(ex - eyeSize, eyeY - eyeSize);
      ctx.lineTo(ex + eyeSize, eyeY + eyeSize);
      ctx.moveTo(ex + eyeSize, eyeY - eyeSize);
      ctx.lineTo(ex - eyeSize, eyeY + eyeSize);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }

  // Small trailing wisps
  if (state === STATE.PLAYING) {
    for (let i = 1; i <= 3; i++) {
      const wx = -hs - i * 12;
      const wy = Math.sin(t * 0.006 + i) * 4;
      const wr = (4 - i) * 2.5;
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${0.25 - i * 0.06})`;
      ctx.fill();
    }
  }

  ctx.restore();
}

/* Score display */
function drawScore() {
  const flash = scoreFlash > 0;
  ctx.save();
  ctx.font = '900 28px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  // shadow
  ctx.fillStyle = flash ? '#f0e68c' : 'rgba(0,0,0,0.5)';
  ctx.fillText(score, W / 2 + 2, 58);
  // text
  ctx.fillStyle = flash ? '#fff' : '#f0e68c';
  ctx.fillText(score, W / 2, 56);
  ctx.restore();
  if (flash) scoreFlash--;
}

/* Particles */
function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/* Idle ghost float */
function drawIdleLabel(t) {
  ctx.save();
  ctx.font = '600 8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(167,139,250,0.7)';
  const bounce = Math.sin(t * 0.003) * 3;
  ctx.fillText('', W / 2, H / 2 + 60 + bounce);
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════════
   COLLISION
   ══════════════════════════════════════════════════════════════════ */
function checkCollision() {
  const pad = 6; // forgiveness pixels
  const gx1 = ghost.x - GHOST_SIZE / 2 + pad;
  const gx2 = ghost.x + GHOST_SIZE / 2 - pad;
  const gy1 = ghost.y - GHOST_SIZE / 2 + pad;
  const gy2 = ghost.y + GHOST_SIZE / 2 - pad;

  // Ground / ceiling
  if (gy2 >= H - GROUND_H || gy1 <= 0) return true;

  for (const p of pipes) {
    const capOff = (CAP_W - PIPE_WIDTH) / 2;
    const px1 = p.x - capOff + pad;
    const px2 = p.x + PIPE_WIDTH + capOff - pad;

    if (gx2 > px1 && gx1 < px2) {
      if (gy1 < p.topH || gy2 > p.botY) return true;
    }
  }
  return false;
}

/* ══════════════════════════════════════════════════════════════════
   MAIN LOOP
   ══════════════════════════════════════════════════════════════════ */
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 50); // cap at 50ms
  lastTime = timestamp;

  /* ── Update ── */
  if (state === STATE.PLAYING) {
    // Physics
    ghost.vy += GRAVITY;
    ghost.y  += ghost.vy;

    // Pipes
    if (timestamp - lastPipeTime > PIPE_INTERVAL || lastPipeTime === 0) {
      spawnPipe(timestamp);
    }

    pipes.forEach(p => { p.x -= PIPE_SPEED; });
    pipes = pipes.filter(p => p.x + PIPE_WIDTH + 20 > 0);

    // Scoring
    pipes.forEach(p => {
      if (!p.scored && p.x + PIPE_WIDTH < ghost.x) {
        p.scored = true;
        score++;
        scoreFlash = 8;
      }
    });

    // Collision
    if (checkCollision()) killGhost();
  }

  if (state === STATE.IDLE) {
    ghost.y = H / 2 + Math.sin(timestamp * 0.002) * 18;
  }

  if (state === STATE.DEAD) {
    ghost.vy += GRAVITY * 0.7;
    ghost.y  += ghost.vy;
    ghost.y   = Math.min(ghost.y, H - GROUND_H - GHOST_SIZE / 2);
  }

  // Particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life -= p.decay;
  });
  particles = particles.filter(p => p.life > 0);

  /* ── Draw ── */
  drawBackground();
  drawStars(timestamp);
  pipes.forEach(drawPipe);
  drawGround(dt);
  drawGhost(timestamp);
  if (state === STATE.PLAYING || state === STATE.DEAD) drawScore();
  drawParticles();

  requestAnimationFrame(loop);
}

/* ── Boot ── */
resetGhost();
requestAnimationFrame(loop);
