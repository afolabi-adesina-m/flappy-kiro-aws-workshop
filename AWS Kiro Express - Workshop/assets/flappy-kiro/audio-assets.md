# Flappy Kiro — Audio Asset Specifications

## Overview
All sound effects are short, punchy, and retro-styled to match the pixel aesthetic. Files are stored in the `assets/` directory and loaded at game startup via the HTML5 Web Audio API. Each sound can be cloned and replayed without interrupting itself, allowing rapid repeated triggering (e.g. fast flapping).

---

## Sound Effects

### 1. Flap — `jump.wav`

| Property | Value |
|---|---|
| Trigger | Spacebar press / tap while playing |
| Duration | 0.1 s |
| Character | Short upward whoosh — air displacement as the ghost pushes down |
| Tone | Starts at ~600 Hz, sweeps up to ~900 Hz |
| Envelope | Instant attack (0 ms), fast decay (80 ms), no sustain, no release |
| Volume | `CONFIG.VOLUME_SFX` (default 0.55) |
| Retro style | 8-bit white noise burst layered under the pitch sweep |
| Feel | Snappy and immediate — must not feel delayed or laggy |

**Synthesis notes:**
```
Oscillator:  sawtooth wave, frequency sweep 600 Hz → 900 Hz over 80 ms
Noise layer: white noise, gain 0.15, duration 60 ms
Master gain: 0.55 → 0 over 100 ms (linear ramp)
```

**Alternatives / fallback:**
- If `jump.wav` fails to load, the game continues silently (no crash)
- Can be synthesised at runtime using the Web Audio API as a fallback (see code reference below)

---

### 2. Score — `score.wav`

| Property | Value |
|---|---|
| Trigger | Ghost passes through a pipe gap (point awarded) |
| Duration | 0.2 s |
| Character | Pleasant upward chime — celebratory without being intrusive |
| Tone | Two-note arpeggio: C5 (523 Hz) → E5 (659 Hz) |
| Envelope | Fast attack (5 ms), medium decay (150 ms), no sustain, short release (50 ms) |
| Volume | `CONFIG.VOLUME_SFX` (default 0.55) |
| Retro style | Sine wave with slight vibrato; short reverb tail (50 ms) |
| Feel | Rewarding and light — reinforces the scoring moment without overpowering |

**Synthesis notes:**
```
Oscillator 1: sine wave, 523 Hz (C5), duration 0–100 ms
Oscillator 2: sine wave, 659 Hz (E5), duration 100–200 ms
Vibrato:      LFO at 6 Hz, depth ±4 Hz applied to both oscillators
Master gain:  0.55 → 0 over 200 ms (exponential ramp)
```

**Alternatives / fallback:**
- File not yet provided — game falls back to synthesised version or silence
- Add `score.wav` to `assets/` and register in `game.js` to activate

---

### 3. Collision — `game_over.wav`

| Property | Value |
|---|---|
| Trigger | Ghost hits a pipe, the ground, or the ceiling |
| Duration | 0.3 s |
| Character | Soft thud with a ghostly descending tone — impact followed by a fading moan |
| Tone | Low thud at ~120 Hz, then descending sweep 400 Hz → 80 Hz |
| Envelope | Instant attack (0 ms), slow decay (250 ms), no sustain, short release (50 ms) |
| Volume | `CONFIG.VOLUME_SFX` (default 0.55) |
| Retro style | Low-pass filtered noise burst for the thud; sawtooth sweep for the descending moan |
| Feel | Soft enough not to startle, clear enough to confirm the hit — humorous, not harsh |

**Synthesis notes:**
```
Layer 1 (thud):  band-pass noise, centre 120 Hz, Q 2.0, gain 0.7, duration 80 ms
Layer 2 (moan):  sawtooth wave, frequency sweep 400 Hz → 80 Hz over 250 ms
Master gain:     0.55 → 0 over 300 ms (linear ramp)
```

**Alternatives / fallback:**
- `game_over.wav` is provided in `assets/`; loaded and played on death via `playSound('gameover')`

---

## Background Music — `music.wav` *(future)*

| Property | Value |
|---|---|
| Status | Not yet implemented |
| Planned character | Looping chiptune melody, upbeat, 120 BPM |
| Volume | `CONFIG.VOLUME_MUSIC` (default 0.20) |
| Loop | Seamless loop point at end of 8-bar phrase |
| Notes | Infrastructure ready in `config.js` (`VOLUME_MUSIC`); add file and wire up in `game.js` |

---

## Loading & Playback Pattern

```js
// Load (called once at startup)
function loadSound(key, src) {
  const a = new Audio(src);
  a.volume = CONFIG.VOLUME_SFX;
  sounds[key] = a;
}

// Play (clones the audio node so rapid repeats don't cut each other off)
function playSound(key) {
  if (!sounds[key]) return;
  const clone = sounds[key].cloneNode();
  clone.volume = CONFIG.VOLUME_SFX;
  clone.play().catch(() => {});  // silently ignore autoplay policy blocks
}
```

**Registered sounds:**

| Key | File | Trigger |
|---|---|---|
| `jump` | `../jump.wav` | Flap input |
| `gameover` | `../game_over.wav` | Collision / death |
| `score` | `../score.wav` | Point awarded *(file pending)* |
| `music` | `../music.wav` | Game start loop *(future)* |

---

## Web Audio API Fallback (Flap)

If sound files are unavailable, the flap sound can be synthesised at runtime:

```js
function synthFlap() {
  const ctx  = new (window.AudioContext || window.webkitAudioContext)();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}
```

---

## File Structure

```
assets/
├── jump.wav           — Flap sound effect (provided)
├── game_over.wav      — Collision sound effect (provided)
├── score.wav          — Score chime (pending)
└── music.wav          — Background music loop (future)

assets/flappy-kiro/
└── audio-assets.md    — This document
```

---

## General Guidelines

- All files must be **mono or stereo WAV**, 44.1 kHz, 16-bit PCM
- Keep file sizes small — target under **50 KB** per effect, under **500 KB** for music
- All sounds should feel **retro/chiptune** — avoid realistic or cinematic audio
- Test playback on both desktop (Chrome, Firefox) and mobile (iOS Safari requires user gesture before audio plays — the first tap/flap triggers the AudioContext unlock automatically via the `clone.play()` call)
