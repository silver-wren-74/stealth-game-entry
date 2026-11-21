// input.js — keyboard controls: WASD and the arrow keys steer the
// nightjar, Shift creeps, Enter starts and advances past the overlays,
// R restarts the hall. The held keys live on game.keys, which game.js
// reads each step.

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ShiftLeft: 'shift', ShiftRight: 'shift',
};

export function wireInput(canvas, game) {
  window.addEventListener('keydown', (evt) => {
    const name = KEYMAP[evt.code];
    if (name) {
      game.keys[name] = true;
      evt.preventDefault();
      return;
    }
    if (evt.code === 'Enter' || evt.code === 'Space') {
      if (game.phase !== 'play') game.advance();
      evt.preventDefault();
    } else if (evt.code === 'KeyR') {
      if (game.phase === 'play' || game.phase === 'caught') {
        game.loadLevel(game.levelIndex);
        game.phase = 'play';
      }
    }
  });
  window.addEventListener('keyup', (evt) => {
    const name = KEYMAP[evt.code];
    if (name) {
      game.keys[name] = false;
      evt.preventDefault();
    }
  });
  canvas.addEventListener('pointerdown', () => {
    if (game.phase !== 'play') game.advance();
  });
}
