/* ============================================================================
 * AUDIO — chiptune synthesised at runtime with the Web Audio API.
 * There are no audio files in this project.
 *
 * Nothing ever autoplays: the AudioContext is not even created until the user
 * turns sound on, which also satisfies browser autoplay policy.
 *
 * TO ADD A SOUND: add an entry to SFX and call sfx('yourName').
 * ========================================================================= */

type Wave = OscillatorType;

interface Note {
  f: number;
  /** seconds */
  d: number;
  wave?: Wave;
  /** 0..1 */
  gain?: number;
  /** delay before this note, seconds */
  at?: number;
  /** slide to this frequency */
  to?: number;
}

const SFX: Record<string, Note[]> = {
  step: [{ f: 110, d: 0.05, wave: 'square', gain: 0.05, to: 80 }],
  blip: [{ f: 620, d: 0.035, wave: 'square', gain: 0.05 }],
  select: [
    { f: 520, d: 0.06, wave: 'square', gain: 0.09 },
    { f: 780, d: 0.08, wave: 'square', gain: 0.09, at: 0.05 },
  ],
  back: [{ f: 300, d: 0.09, wave: 'triangle', gain: 0.08, to: 180 }],
  door: [
    { f: 240, d: 0.09, wave: 'triangle', gain: 0.1 },
    { f: 380, d: 0.12, wave: 'triangle', gain: 0.09, at: 0.07 },
  ],
  levelUp: [
    { f: 523, d: 0.09, wave: 'square', gain: 0.1 },
    { f: 659, d: 0.09, wave: 'square', gain: 0.1, at: 0.09 },
    { f: 784, d: 0.09, wave: 'square', gain: 0.1, at: 0.18 },
    { f: 1046, d: 0.22, wave: 'square', gain: 0.12, at: 0.27 },
  ],
  achievement: [
    { f: 880, d: 0.07, wave: 'square', gain: 0.1 },
    { f: 1174, d: 0.07, wave: 'square', gain: 0.1, at: 0.07 },
    { f: 1567, d: 0.18, wave: 'square', gain: 0.11, at: 0.14 },
  ],
  hit: [
    { f: 180, d: 0.13, wave: 'sawtooth', gain: 0.13, to: 60 },
    { f: 900, d: 0.05, wave: 'square', gain: 0.08 },
  ],
  hurt: [{ f: 140, d: 0.2, wave: 'sawtooth', gain: 0.12, to: 40 }],
  victory: [
    { f: 523, d: 0.12, wave: 'square', gain: 0.11 },
    { f: 659, d: 0.12, wave: 'square', gain: 0.11, at: 0.12 },
    { f: 784, d: 0.12, wave: 'square', gain: 0.11, at: 0.24 },
    { f: 1046, d: 0.12, wave: 'square', gain: 0.12, at: 0.36 },
    { f: 784, d: 0.12, wave: 'square', gain: 0.1, at: 0.5 },
    { f: 1046, d: 0.45, wave: 'square', gain: 0.13, at: 0.62 },
  ],
  coffee: [{ f: 90, d: 0.3, wave: 'sawtooth', gain: 0.06, to: 130 }],
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = true;
let lastStep = 0;

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  if (!v && !ctx) init();
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.5, ctx.currentTime, 0.02);
}

function init() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
}

export function sfx(name: keyof typeof SFX | string) {
  if (muted) return;
  if (!ctx) init();
  if (!ctx || !master) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const notes = SFX[name];
  if (!notes) return;

  const now = ctx.currentTime;
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = n.wave ?? 'square';
    const start = now + (n.at ?? 0);
    osc.frequency.setValueAtTime(n.f, start);
    if (n.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, n.to), start + n.d);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(n.gain ?? 0.08, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + n.d + 0.02);
  }
}

/** Footsteps are rate-limited so walking does not become a machine gun. */
export function footstep(now: number) {
  if (now - lastStep < 170) return;
  lastStep = now;
  sfx('step');
}
