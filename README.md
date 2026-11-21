[![make.fun bounty](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/silver-wren-74/stealth-game-entry/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/silver-wren-74/stealth-game-entry/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

# Nightjar

An original top-down stealth game for the make.fun bounty
[best-stealth-game-20261121-1759](https://make.fun/bounty/best-stealth-game-20261121-1759).

A nightjar has slipped into the Moonlight Museum after closing, and the
only way out is the open window across each hall. Night watchmen patrol
with lanterns: their light is drawn from the same ray casts that decide
what they can see, so if a cone touches you, you are being watched —
the SEEN meter in the header fills, a `?` turns to a `!`, and a full
meter means caught. Display cases, shelves and statues block the light;
pools of shadow halve a watchman's suspicion; creeping with Shift held
is slower but harder to notice. Fireflies are optional daring.

Three halls, each harder than the last:

- **East Gallery** — two patrols among the display cases.
- **Long Library** — shelf rows, three patrols, narrow gaps.
- **Vault Hall** — a guard circling the vault, a rotating sentry under
  the window, and nowhere much to hide.

## Play it

The game is plain static files under `game/` — no build step, no
network. Serve the folder any way you like, or use the bundled server:

```sh
node serve.ts
# open http://localhost:8080
```

Move with WASD or the arrow keys, hold Shift to creep, R restarts a
hall, Enter starts and advances.

## Hand it in

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with
the kit's library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page and its styles.
- `game/src/levels.js` — the three halls as data: walls, shadow pools,
  patrols, fireflies, the window.
- `game/src/guards.js` — patrol movement and the lantern-cone geometry:
  ray casts, line-of-sight, the cone polygon.
- `game/src/game.js` — the bird, movement and collision, detection,
  fireflies, getting caught.
- `game/src/render.js` — the halls from above, the cones, the SEEN meter.
- `game/src/input.js` — keyboard controls.
- `game/src/shots.js` — the staged states the screenshots were taken in.
- `game/src/audio.js` — WebAudio sounds, no audio files.
- `game/src/rng.js` — a seeded generator for the halls' dressing.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

MIT licensed — see `LICENSE`.
