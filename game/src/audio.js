// audio.js — soft WebAudio sounds made from oscillators, no audio files.
// The context wakes on the first key press or click; screenshot mode is
// silent because nothing here is called there.

let ctx = null;

function ac() {
  if (ctx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type, gain, slideTo) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  const t0 = a.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A firefly gathered: two high, quiet notes. */
export function playPickup() {
  tone(1568, 0, 0.1, 'sine', 0.08);
  tone(2093, 0.06, 0.16, 'sine', 0.08);
}

/** A guard's suspicion rising past halfway: a low warning. */
export function playWarn() {
  tone(220, 0, 0.18, 'triangle', 0.12, 196);
}

/** Caught: a falling sting. */
export function playCaught() {
  tone(392, 0, 0.3, 'sawtooth', 0.1, 98);
}

/** The window reached: a small bright run. */
export function playEscape() {
  tone(784, 0, 0.12, 'triangle', 0.1);
  tone(988, 0.09, 0.12, 'triangle', 0.1);
  tone(1318, 0.18, 0.24, 'triangle', 0.11);
}
