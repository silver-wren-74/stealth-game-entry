// guards.js — the night watchmen: how one patrols its waypoints, and the
// geometry of its lantern light. A guard sees the nightjar when it is
// inside the lantern's cone and no wall or case stands between them; the
// cone the player sees is drawn from the same ray casts, so what is lit
// is exactly what is watched.

export const CONE_RANGE = 198;
export const CONE_HALF = 0.44; // radians, half the cone's spread

function angNorm(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function angLerp(a, b, t) {
  return a + angNorm(b - a) * t;
}

/** Where two segments cross, as the parameter along the first, or null. */
function segHit(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return null;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
}

/** True when the straight line from a to b crosses any wall rectangle. */
export function lineBlocked(ax, ay, bx, by, walls) {
  for (const w of walls) {
    const x2 = w.x + w.w;
    const y2 = w.y + w.h;
    if (segHit(ax, ay, bx, by, w.x, w.y, x2, w.y) !== null) return true;
    if (segHit(ax, ay, bx, by, x2, w.y, x2, y2) !== null) return true;
    if (segHit(ax, ay, bx, by, x2, y2, w.x, y2) !== null) return true;
    if (segHit(ax, ay, bx, by, w.x, y2, w.x, w.y) !== null) return true;
    // A point inside the rectangle counts as blocked too.
    if (bx > w.x && bx < x2 && by > w.y && by < y2) return true;
  }
  return false;
}

/** How far a ray travels before it meets a wall edge or the field bounds. */
function rayReach(x, y, angle, walls, bounds) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const ex = x + dx * CONE_RANGE;
  const ey = y + dy * CONE_RANGE;
  let best = 1;
  const edges = [];
  for (const w of walls) {
    edges.push([w.x, w.y, w.x + w.w, w.y], [w.x + w.w, w.y, w.x + w.w, w.y + w.h],
      [w.x + w.w, w.y + w.h, w.x, w.y + w.h], [w.x, w.y + w.h, w.x, w.y]);
  }
  edges.push([0, 0, bounds.w, 0], [bounds.w, 0, bounds.w, bounds.h],
    [bounds.w, bounds.h, 0, bounds.h], [0, bounds.h, 0, 0]);
  for (const e of edges) {
    const t = segHit(x, y, ex, ey, e[0], e[1], e[2], e[3]);
    if (t !== null && t < best) best = t;
  }
  return CONE_RANGE * best;
}

export class Guard {
  constructor(spec, phase = 0) {
    this.spec = spec;
    this.x = spec.path[0][0];
    this.y = spec.path[0][1];
    this.next = spec.path.length > 1 ? 1 : 0;
    this.pauseLeft = 0;
    this.scanT = phase;
    const [tx, ty] = spec.path[this.next];
    this.angle = Math.atan2(ty - this.y, tx - this.x);
    if (spec.rotate) this.angle = Math.PI / 2;
    this.see = 0; // 0 unseen .. 1 caught sight of the bird
    this.warned = false;
  }

  update(dt) {
    this.scanT += dt;
    if (this.spec.rotate) {
      // A sentry who stands and sweeps the room with his lantern.
      this.angle = Math.PI / 2 + Math.sin(this.scanT * 0.55) * 1.15;
      return;
    }
    if (this.pauseLeft > 0) {
      this.pauseLeft -= dt;
      // While paused a guard looks about: a slow sway around his heading.
      this.angle += Math.sin(this.scanT * 1.7) * 0.0035;
      return;
    }
    const [tx, ty] = this.spec.path[this.next];
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.spec.speed * dt;
    if (dist <= step) {
      this.x = tx;
      this.y = ty;
      this.next = (this.next + 1) % this.spec.path.length;
      this.pauseLeft = this.spec.pause;
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.angle = angLerp(this.angle, Math.atan2(dy, dx), Math.min(1, dt * 7));
    }
  }

  /** Can this guard see the point (px, py) right now? */
  canSee(px, py, walls) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > CONE_RANGE) return false;
    if (dist > 26) {
      const diff = Math.abs(angNorm(Math.atan2(dy, dx) - this.angle));
      if (diff > CONE_HALF) return false;
    }
    return !lineBlocked(this.x, this.y, px, py, walls);
  }

  /** The lit polygon of the lantern cone, for render.js. */
  conePolygon(walls, bounds) {
    const rays = 26;
    const pts = [[this.x, this.y]];
    for (let i = 0; i <= rays; i++) {
      const a = this.angle - CONE_HALF + (2 * CONE_HALF * i) / rays;
      const r = rayReach(this.x, this.y, a, walls, bounds);
      pts.push([this.x + Math.cos(a) * r, this.y + Math.sin(a) * r]);
    }
    return pts;
  }
}
