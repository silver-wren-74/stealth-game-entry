// game.js — the state of Nightjar: the bird, the watchmen, the fireflies
// and the detection that ends a run. Movement is free (not tiled), walls
// stop the bird and block lantern light alike, and standing in a pool of
// shadow — or creeping with Shift held — slows a guard's suspicion.

import { LEVELS, FIELD_W, FIELD_H } from './levels.js';
import { Guard } from './guards.js';

export const PLAYER_R = 13;
const WALK_SPEED = 150;
const CREEP_SPEED = 82;

function circleRectHit(cx, cy, r, w) {
  const nx = Math.max(w.x, Math.min(cx, w.x + w.w));
  const ny = Math.max(w.y, Math.min(cy, w.y + w.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export class Game {
  constructor() {
    this.phase = 'title'; // title | play | caught | won | clear
    this.levelIndex = 0;
    this.keys = {};
    this.events = []; // 'pickup' | 'warn' | 'caught' | 'escape', for audio
    this.totalFireflies = 0;
    this.spotted = 0;
    this.elapsed = 0;
    this.phaseT = 0;
    this.flash = '';
    this.loadLevel(0);
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  loadLevel(index) {
    this.levelIndex = index;
    const lv = this.level;
    this.player = { x: lv.start.x, y: lv.start.y, angle: -Math.PI / 2, moving: false };
    this.guards = lv.guards.map((g, i) => new Guard(g, i * 1.37 + index));
    this.fireflies = lv.fireflies.map((f) => ({ ...f, taken: false }));
    this.maxSee = 0;
  }

  startGame() {
    this.totalFireflies = 0;
    this.spotted = 0;
    this.elapsed = 0;
    this.loadLevel(0);
    this.phase = 'play';
    this.flash = 'Slip to the open window. Stay out of the lantern light.';
  }

  inShadow(x, y) {
    return this.level.shadows.some((s) => x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h);
  }

  /** Step the whole simulation; used by the frame loop and by shots.js. */
  update(dt) {
    if (this.phase === 'caught' || this.phase === 'won') {
      this.phaseT += dt;
      return;
    }
    if (this.phase !== 'play') return;
    this.elapsed += dt;
    const p = this.player;
    const creep = this.keys['shift'];
    const speed = creep ? CREEP_SPEED : WALK_SPEED;
    let mx = 0;
    let my = 0;
    if (this.keys['left']) mx -= 1;
    if (this.keys['right']) mx += 1;
    if (this.keys['up']) my -= 1;
    if (this.keys['down']) my += 1;
    p.moving = mx !== 0 || my !== 0;
    if (p.moving) {
      const len = Math.hypot(mx, my);
      const vx = (mx / len) * speed * dt;
      const vy = (my / len) * speed * dt;
      p.angle = Math.atan2(my, mx);
      // Move one axis at a time so the bird slides along the cases.
      if (!this.hitsWall(p.x + vx, p.y)) p.x += vx;
      if (!this.hitsWall(p.x, p.y + vy)) p.y += vy;
      p.x = Math.max(PLAYER_R, Math.min(FIELD_W - PLAYER_R, p.x));
      p.y = Math.max(PLAYER_R, Math.min(FIELD_H - PLAYER_R, p.y));
    }

    for (const g of this.guards) g.update(dt);

    // Fireflies.
    for (const f of this.fireflies) {
      if (!f.taken && Math.hypot(f.x - p.x, f.y - p.y) < 26) {
        f.taken = true;
        this.totalFireflies += 1;
        this.events.push('pickup');
        this.flash = 'A firefly joins you.';
      }
    }

    // Detection.
    const shadowed = this.inShadow(p.x, p.y);
    this.maxSee = 0;
    for (const g of this.guards) {
      const dist = Math.hypot(g.x - p.x, g.y - p.y);
      if (dist < 24) {
        this.caught();
        return;
      }
      if (g.canSee(p.x, p.y, this.level.walls)) {
        let rate = 1.3 - 0.7 * Math.min(1, dist / 198);
        if (shadowed) rate *= 0.45;
        if (creep) rate *= 0.6;
        else if (p.moving) rate *= 1.12;
        g.see = Math.min(1, g.see + rate * dt);
        if (g.see > 0.5 && !g.warned) {
          g.warned = true;
          this.events.push('warn');
        }
        if (g.see >= 1) {
          this.caught();
          return;
        }
      } else {
        g.see = Math.max(0, g.see - 0.65 * dt);
        if (g.see < 0.3) g.warned = false;
      }
      this.maxSee = Math.max(this.maxSee, g.see);
    }

    // The open window.
    const e = this.level.exit;
    if (p.x > e.x && p.x < e.x + e.w && p.y > e.y && p.y < e.y + e.h) {
      this.events.push('escape');
      this.phase = this.levelIndex === LEVELS.length - 1 ? 'clear' : 'won';
      this.phaseT = 0;
      this.flash = '';
    }
  }

  hitsWall(x, y) {
    return this.level.walls.some((w) => circleRectHit(x, y, PLAYER_R, w));
  }

  caught() {
    this.spotted += 1;
    this.events.push('caught');
    this.phase = 'caught';
    this.phaseT = 0;
    this.flash = 'Spotted! The watchman shoos you back to the door.';
  }

  /** Advance past a caught/won pause or a title screen. */
  advance() {
    if (this.phase === 'title') this.startGame();
    else if (this.phase === 'caught') {
      this.loadLevel(this.levelIndex);
      this.phase = 'play';
      this.flash = 'Back at the door. Mind the lanterns.';
    } else if (this.phase === 'won') {
      this.loadLevel(this.levelIndex + 1);
      this.phase = 'play';
      this.flash = `${this.level.name}. The window is open somewhere.`;
    } else if (this.phase === 'clear') this.startGame();
  }

  /** Run the simulation with no input, for staged screenshots. */
  fastForward(seconds) {
    const steps = Math.floor(seconds * 30);
    for (let i = 0; i < steps; i++) {
      for (const g of this.guards) g.update(1 / 30);
    }
  }
}
