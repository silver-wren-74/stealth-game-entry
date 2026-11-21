// main.js — bootstrap: sizes the canvas, wires the keys, runs the frame
// loop and plays the sounds the game reports. In screenshot mode
// (?shot=…) the staged state is drawn and the simulation is held still.

import { Game } from './game.js';
import { draw, VIEW_W, VIEW_H } from './render.js';
import { wireInput } from './input.js';
import { applyShot } from './shots.js';
import { playCaught, playEscape, playPickup, playWarn } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

const game = new Game();
wireInput(canvas, game);

const params = new URLSearchParams(window.location.search);
const frozen = applyShot(game, params);

const status = document.getElementById('status');
const SOUNDS = { pickup: playPickup, warn: playWarn, caught: playCaught, escape: playEscape };
let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen) {
    game.update(dt);
    for (const e of game.events) if (SOUNDS[e]) SOUNDS[e]();
    game.events.length = 0;
    status.textContent = game.phase === 'play'
      ? `${game.level.name}: suspicion ${Math.round(game.maxSee * 100)} percent, ${game.fireflies.filter((f) => !f.taken).length} fireflies left in this hall.`
      : game.flash;
  }
  draw(ctx, game, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
