// levels.js — the three halls of the Moonlight Museum as data: the walls
// and display cases that block sight and movement, the pools of shadow
// where a small bird is harder to see, each watchman's patrol, the
// fireflies worth gathering, where the nightjar starts and the open
// window it must reach. Coordinates are in the field (1280 by 708),
// drawn under the header bar.

export const FIELD_W = 1280;
export const FIELD_H = 708;

export const LEVELS = [
  {
    name: 'East Gallery',
    seed: 4101,
    start: { x: 70, y: 636 },
    exit: { x: 1188, y: 10, w: 82, h: 52 },
    walls: [
      { x: 240, y: 150, w: 150, h: 64, kind: 'case' },
      { x: 560, y: 150, w: 150, h: 64, kind: 'case' },
      { x: 880, y: 150, w: 150, h: 64, kind: 'case' },
      { x: 240, y: 430, w: 150, h: 64, kind: 'case' },
      { x: 560, y: 430, w: 150, h: 64, kind: 'case' },
      { x: 880, y: 430, w: 150, h: 64, kind: 'case' },
      { x: 620, y: 300, w: 40, h: 40, kind: 'statue' },
    ],
    shadows: [
      { x: 0, y: 552, w: 190, h: 156 },
      { x: 1096, y: 0, w: 184, h: 128 },
    ],
    guards: [
      { path: [[120, 322], [1160, 322]], speed: 66, pause: 1.1 },
      { path: [[420, 92], [420, 606]], speed: 57, pause: 1.4 },
    ],
    fireflies: [
      { x: 315, y: 108 },
      { x: 640, y: 356 },
      { x: 952, y: 566 },
    ],
  },
  {
    name: 'Long Library',
    seed: 4202,
    start: { x: 70, y: 636 },
    exit: { x: 1188, y: 10, w: 82, h: 52 },
    walls: [
      { x: 100, y: 120, w: 420, h: 44, kind: 'shelf' },
      { x: 620, y: 120, w: 420, h: 44, kind: 'shelf' },
      { x: 220, y: 300, w: 420, h: 44, kind: 'shelf' },
      { x: 740, y: 300, w: 420, h: 44, kind: 'shelf' },
      { x: 100, y: 480, w: 420, h: 44, kind: 'shelf' },
      { x: 620, y: 480, w: 420, h: 44, kind: 'shelf' },
    ],
    shadows: [
      { x: 0, y: 0, w: 150, h: 92 },
      { x: 548, y: 566, w: 190, h: 142 },
      { x: 1130, y: 350, w: 150, h: 120 },
    ],
    guards: [
      { path: [[80, 222], [1200, 222]], speed: 70, pause: 0.9 },
      { path: [[1200, 402], [80, 402]], speed: 77, pause: 0.9 },
      { path: [[1120, 84], [1120, 624]], speed: 60, pause: 1.2 },
    ],
    fireflies: [
      { x: 570, y: 142 },
      { x: 56, y: 392 },
      { x: 690, y: 322 },
      { x: 1180, y: 648 },
    ],
  },
  {
    name: 'Vault Hall',
    seed: 4303,
    start: { x: 60, y: 556 },
    exit: { x: 600, y: 10, w: 82, h: 52 },
    walls: [
      { x: 520, y: 262, w: 240, h: 184, kind: 'vault' },
      { x: 140, y: 140, w: 150, h: 64, kind: 'case' },
      { x: 990, y: 140, w: 150, h: 64, kind: 'case' },
      { x: 140, y: 500, w: 150, h: 64, kind: 'case' },
      { x: 990, y: 500, w: 150, h: 64, kind: 'case' },
      { x: 340, y: 330, w: 40, h: 40, kind: 'statue' },
      { x: 900, y: 330, w: 40, h: 40, kind: 'statue' },
    ],
    shadows: [
      { x: 0, y: 296, w: 132, h: 124 },
      { x: 1148, y: 296, w: 132, h: 124 },
      { x: 556, y: 592, w: 168, h: 116 },
    ],
    guards: [
      { path: [[420, 216], [862, 216], [862, 492], [420, 492]], speed: 72, pause: 0.7 },
      { path: [[120, 92], [1160, 92]], speed: 80, pause: 0.8 },
      { path: [[1160, 624], [120, 624]], speed: 84, pause: 0.8 },
      { path: [[640, 128]], speed: 0, pause: 0, rotate: true },
    ],
    fireflies: [
      { x: 215, y: 108 },
      { x: 1065, y: 108 },
      { x: 640, y: 540 },
      { x: 215, y: 616 },
      { x: 1065, y: 616 },
    ],
  },
];
