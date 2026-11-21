// shots.js — staged states for the screenshots in shots.json. Each one is
// a real state of the simulation: the patrols are run forward with the
// game's own update, the bird is placed where a player could stand, and a
// guard's suspicion is set to a value it reaches in play. The gallery shot
// shows level 1; the library shot shows level 2 with a guard half-suspicious.

export function applyShot(game, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  if (shot === 'title') {
    game.phase = 'title';
    game.fastForward(6);
    return true;
  }
  if (shot === 'gallery') {
    game.startGame();
    game.fastForward(9);
    // The bird waits behind the statue while a patrol crosses the hall.
    game.player.x = 586;
    game.player.y = 322;
    game.player.angle = 0.4;
    game.flash = 'Stay out of the lantern light.';
    return true;
  }
  if (shot === 'library') {
    game.startGame();
    game.loadLevel(1);
    game.phase = 'play';
    game.fastForward(13);
    // Caught in the edge of the right-hand patrol's lantern beam.
    game.player.x = 1080;
    game.player.y = 362;
    game.player.angle = -0.4;
    const g = game.guards[2];
    g.see = 0.62;
    game.maxSee = 0.62;
    game.totalFireflies = 2;
    game.flash = 'He has half-seen something… freeze, or slip into shadow.';
    return true;
  }
  if (shot === 'win') {
    game.startGame();
    game.fastForward(4);
    game.phase = 'won';
    game.totalFireflies = 3;
    game.flash = '';
    return true;
  }
  return false;
}
