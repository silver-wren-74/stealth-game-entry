// Nightjar — the hand-in program (Node 22, standard library only). The
// game itself is the static site under game/; this program copies game/
// and screenshots/ into the output directory and writes the dossier the
// judge reads, built by the kit's own library (vendor/makefun-game.ts,
// kept byte for byte as the kit ships it). MAKEFUN_OUTPUT_DIR stands in
// for /output outside the grader:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps are the gate's own (see the competition's RULES.txt): at most 4
// screenshots of 256 KiB, at most 993 files and 48 MiB under game/, paths
// of at most 1000 bytes, and the dossier's source text capped at 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
