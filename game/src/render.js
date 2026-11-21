// render.js — draws Nightjar: the museum floor from above, the pools of
// shadow, the cases and shelves, the lantern cones (the same polygons
// guards.js casts for sight), the watchmen, the nightjar, and the header
// with its SEEN meter. Everything is drawn in field coordinates, shifted
// down by the header's height.

import { LEVELS, FIELD_W, FIELD_H } from './levels.js';
import { makeRng } from './rng.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 92;

const dressing = new Map();

/** Per-level decoration drawn once from the level's seed: rug, book colours. */
function dress(level) {
  if (dressing.has(level.name)) return dressing.get(level.name);
  const rng = makeRng(level.seed);
  const d = {
    rug: { x: 340 + rng.range(0, 60), y: 210 + rng.range(0, 40), w: 560, h: 280 },
    books: level.walls.map(() => {
      const cols = [];
      const palette = ['#a5453c', '#3c6ea5', '#c9a227', '#4e7d4a', '#7a4a7e', '#b08968'];
      for (let i = 0; i < 40; i++) cols.push(palette[rng.int(0, palette.length - 1)]);
      return cols;
    }),
    gems: level.walls.map(() => rng.pick ? rng.range(0, 1) : 0),
  };
  dressing.set(level.name, d);
  return d;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawFloor(ctx, game) {
  const lv = game.level;
  ctx.fillStyle = '#1a2735';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  // Floorboards: faint vertical seams.
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD_H);
    ctx.stroke();
  }
  // The great rug in the middle of the hall.
  const rug = dress(lv).rug;
  ctx.fillStyle = '#4a2438';
  ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.strokeRect(rug.x + 8, rug.y + 8, rug.w - 16, rug.h - 16);
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rug.x + 18, rug.y + 18, rug.w - 36, rug.h - 36);
  // Shadow pools.
  for (const s of lv.shadows) {
    roundRect(ctx, s.x, s.y, s.w, s.h, 14);
    ctx.fillStyle = 'rgba(2, 6, 14, 0.5)';
    ctx.fill();
  }
}

function drawExit(ctx, lv, now) {
  const e = lv.exit;
  const glow = 0.75 + 0.25 * Math.sin(now / 600);
  const grad = ctx.createLinearGradient(0, e.y, 0, e.y + e.h + 90);
  grad.addColorStop(0, `rgba(190, 220, 255, ${0.5 * glow})`);
  grad.addColorStop(1, 'rgba(190, 220, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(e.x, e.y + e.h);
  ctx.lineTo(e.x + e.w, e.y + e.h);
  ctx.lineTo(e.x + e.w + 26, e.y + e.h + 90);
  ctx.lineTo(e.x - 26, e.y + e.h + 90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#cfe6ff';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = '#0d1522';
  ctx.lineWidth = 5;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.beginPath();
  ctx.moveTo(e.x + e.w / 2, e.y);
  ctx.lineTo(e.x + e.w / 2, e.y + e.h);
  ctx.moveTo(e.x, e.y + e.h / 2);
  ctx.lineTo(e.x + e.w, e.y + e.h / 2);
  ctx.stroke();
  // The moon outside the window.
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(e.x + e.w * 0.72, e.y + e.h * 0.36, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawWall(ctx, w, di, lv) {
  if (w.kind === 'case') {
    ctx.fillStyle = '#6b4a2a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = 'rgba(191, 227, 234, 0.85)';
    ctx.fillRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16);
    // The treasure inside: a little vase or gem on a stand.
    ctx.fillStyle = '#37414d';
    ctx.fillRect(w.x + w.w / 2 - 14, w.y + w.h - 20, 28, 6);
    ctx.fillStyle = ['#c0392b', '#2471a3', '#b7950b'][di % 3];
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2 - 2, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (w.kind === 'shelf') {
    ctx.fillStyle = '#54381f';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    const cols = dress(lv).books[di];
    const bw = w.w / cols.length;
    cols.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(w.x + i * bw + 1, w.y + 6, bw - 2, w.h - 12);
    });
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(w.x, w.y + w.h / 2 - 2, w.w, 4);
  } else if (w.kind === 'statue') {
    ctx.fillStyle = '#77808f';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#aeb8c6';
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2 - 4, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w.x + w.w / 2 - 12, w.y + w.h / 2 + 4, 24, 10);
  } else if (w.kind === 'vault') {
    ctx.fillStyle = '#2c3542';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    ctx.strokeRect(w.x + 6, w.y + 6, w.w - 12, w.h - 12);
    ctx.fillStyle = '#1d242f';
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGuard(ctx, g, now) {
  // Body: a watchman in a dark uniform with a peaked cap.
  ctx.fillStyle = '#232c3d';
  ctx.beginPath();
  ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#31405a';
  ctx.beginPath();
  ctx.arc(g.x, g.y, 8.5, 0, Math.PI * 2);
  ctx.fill();
  const fx = Math.cos(g.angle);
  const fy = Math.sin(g.angle);
  ctx.fillStyle = '#141a26';
  ctx.beginPath();
  ctx.arc(g.x + fx * 7, g.y + fy * 7, 6, 0, Math.PI * 2);
  ctx.fill();
  // The lantern in his hand.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(g.x + fx * 17, g.y + fy * 17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 217, 77, 0.3)';
  ctx.beginPath();
  ctx.arc(g.x + fx * 17, g.y + fy * 17, 9, 0, Math.PI * 2);
  ctx.fill();
  // Suspicion bubble.
  if (g.see > 0.12) {
    const s = 0.6 + g.see * 0.6;
    ctx.fillStyle = g.see > 0.55 ? '#e03131' : '#ffb52e';
    ctx.beginPath();
    ctx.arc(g.x + 16, g.y - 20, 9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(15 * s)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.see > 0.55 ? '!' : '?', g.x + 16, g.y - 19);
  }
}

function drawPlayer(ctx, p, shadowed) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  // Tail feathers.
  ctx.strokeStyle = '#5d4f3e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const off of [-0.35, 0, 0.35]) {
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-19, off * 12);
    ctx.stroke();
  }
  // Body and folded wing.
  ctx.fillStyle = shadowed ? '#6b5d4b' : '#7d6c56';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d4f3e';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 8.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head, eye and beak.
  ctx.fillStyle = '#8a7960';
  ctx.beginPath();
  ctx.arc(10, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10131a';
  ctx.beginPath();
  ctx.arc(12, -2.4, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath();
  ctx.moveTo(15.5, -1.5);
  ctx.lineTo(21, 0.5);
  ctx.lineTo(15.5, 2.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#0d1522';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#ffd94d';
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('NIGHTJAR', 24, 34);
  ctx.fillStyle = '#cfe3f5';
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText(`Level ${game.levelIndex + 1} of ${LEVELS.length} — ${game.level.name}`, 24, 68);
  ctx.fillText(`Fireflies ${game.totalFireflies}`, 420, 34);
  const t = Math.floor(game.elapsed);
  ctx.fillText(`Time ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, 420, 68);
  ctx.fillText(`Spotted ${game.spotted}×`, 640, 34);

  // The SEEN meter: how close the nearest watchman is to catching sight.
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SEEN', 1010, 34);
  ctx.fillStyle = '#1e2c44';
  ctx.fillRect(1030, 20, 226, 26);
  const see = game.maxSee;
  ctx.fillStyle = see > 0.66 ? '#e03131' : see > 0.33 ? '#ffb52e' : '#39c26d';
  ctx.fillRect(1033, 23, 220 * see, 20);
  ctx.fillStyle = '#8fa8c4';
  ctx.font = '500 16px system-ui, sans-serif';
  ctx.fillText('WASD / arrows · Shift creep · stay in shadow', 1256, 68);

  if (game.flash && game.phase === 'play') {
    ctx.font = '600 19px system-ui, sans-serif';
    const w = ctx.measureText(game.flash).width + 36;
    ctx.fillStyle = 'rgba(10, 16, 26, 0.82)';
    roundRect(ctx, (VIEW_W - w) / 2, HUD_H + FIELD_H - 46, w, 34, 17);
    ctx.fill();
    ctx.fillStyle = '#e8f1fa';
    ctx.textAlign = 'center';
    ctx.fillText(game.flash, VIEW_W / 2, HUD_H + FIELD_H - 28);
  }
}

function overlay(ctx, title, lines, colour) {
  ctx.fillStyle = 'rgba(8, 12, 20, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = colour;
  ctx.font = '800 62px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW_W / 2, 268);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 24px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 344 + i * 38));
}

export function draw(ctx, game, now) {
  ctx.fillStyle = '#0d1522';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(0, HUD_H);
  drawFloor(ctx, game);
  drawExit(ctx, game.level, now);
  // Lantern cones first, so bodies and cases sit on top of the light.
  for (const g of game.guards) {
    const pts = g.conePolygon(game.level.walls, { w: FIELD_W, h: FIELD_H });
    const warm = g.see > 0.55;
    ctx.fillStyle = warm
      ? `rgba(255, 110, 64, ${0.22 + g.see * 0.16})`
      : `rgba(255, 205, 84, ${0.15 + g.see * 0.13})`;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  game.level.walls.forEach((w, i) => drawWall(ctx, w, i, game.level));
  for (const f of game.fireflies) {
    if (f.taken) continue;
    const bob = Math.sin(now / 320 + f.x) * 3;
    ctx.fillStyle = 'rgba(255, 232, 115, 0.22)';
    ctx.beginPath();
    ctx.arc(f.x, f.y + bob, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe873';
    ctx.beginPath();
    ctx.arc(f.x, f.y + bob, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const g of game.guards) drawGuard(ctx, g, now);
  if (game.phase !== 'title') drawPlayer(ctx, game.player, game.inShadow(game.player.x, game.player.y));
  ctx.restore();
  drawHud(ctx, game);

  if (game.phase === 'title') {
    overlay(ctx, 'NIGHTJAR', [
      'A nightjar is loose in the Moonlight Museum, and the window is open.',
      'Cross each hall unseen: lantern light is danger, shadow is safety.',
      'Move with WASD or the arrow keys; hold Shift to creep.',
      'Gather fireflies if you dare — then slip out of the window.',
      'Press Enter to begin.',
    ], '#ffd94d');
  } else if (game.phase === 'caught') {
    overlay(ctx, 'SPOTTED!', [
      'A lantern swings round — and there you are.',
      'Press Enter to creep back in.',
    ], '#e03131');
  } else if (game.phase === 'won') {
    overlay(ctx, 'OUT THE WINDOW!', [
      `${game.level.name} crossed without a sound.`,
      `Fireflies so far: ${game.totalFireflies}.`,
      'Press Enter for the next hall.',
    ], '#39c26d');
  } else if (game.phase === 'clear') {
    overlay(ctx, 'DAWN', [
      'Every hall crossed, and the museum none the wiser.',
      `Fireflies: ${game.totalFireflies}. Spotted: ${game.spotted}×.`,
      'Press Enter to fly again.',
    ], '#39c26d');
  }
}
