/**
 * Script de génération des puzzles Lumizle pré-calculés (practice levels).
 *
 * Usage : node generate-lumizle.js
 * Sortie : src/data/lumizle-puzzles.json
 */

import { generateLumizlePuzzle } from './src/algorithms/lumizle/puzzleFactory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Puzzles à générer : id → { seed, difficulty }
const PUZZLES_TO_GENERATE = [
  { id: 'easy_1',   seed: 'lumizle_easy_1',   difficulty: 'easy'   },
  { id: 'easy_2',   seed: 'lumizle_easy_2',   difficulty: 'easy'   },
  { id: 'easy_3',   seed: 'lumizle_easy_3',   difficulty: 'easy'   },
  { id: 'medium_1', seed: 'lumizle_medium_1', difficulty: 'medium' },
  { id: 'medium_2', seed: 'lumizle_medium_2', difficulty: 'medium' },
  { id: 'medium_3', seed: 'lumizle_medium_3', difficulty: 'medium' },
  { id: 'hard_1',   seed: 'lumizle_hard_1',   difficulty: 'hard'   },
  { id: 'hard_2',   seed: 'lumizle_hard_2',   difficulty: 'hard'   },
  { id: 'hard_3',   seed: 'lumizle_hard_3',   difficulty: 'hard'   },
];

console.log('Génération des puzzles Lumizle...\n');

const results = {};
let ok = 0, fail = 0;

for (const { id, seed, difficulty } of PUZZLES_TO_GENERATE) {
  process.stdout.write(`  ${id.padEnd(12)} (${difficulty}) ... `);
  try {
    const t0 = Date.now();
    const puzzle = generateLumizlePuzzle(seed, difficulty);
    const elapsed = Date.now() - t0;

    if (!puzzle.metadata.isUnique) {
      console.log(`⚠ NON-UNIQUE (ignoré)`);
      fail++;
      continue;
    }

    results[id] = {
      id,
      difficulty,
      puzzle: {
        initialGrid: puzzle.initialGrid,
        solution:    puzzle.solution,
        rules:       puzzle.rules,
        metadata:    puzzle.metadata,
      },
      generatedAt: new Date().toISOString(),
    };

    const size = puzzle.metadata.gridSize;
    console.log(
      `✓  ${size}×${size}  clues=${puzzle.metadata.clueCount}/${size*size}  ${elapsed}ms`
    );
    ok++;
  } catch (err) {
    console.log(`✗ ERREUR: ${err.message}`);
    fail++;
  }
}

console.log(`\nRésultat : ${ok} puzzles générés, ${fail} échecs`);

if (ok === 0) {
  console.error('Aucun puzzle généré, arrêt.');
  process.exit(1);
}

const outPath = path.join(__dirname, 'src', 'data', 'lumizle-puzzles.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\nFichier écrit : ${outPath}`);
