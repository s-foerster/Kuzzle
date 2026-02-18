/**
 * Régénère les niveaux 1, 3 et 5 avec la seed du 17/02/2026
 * puis met à jour practice-puzzles.json
 */

import { generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';
import { readFileSync, writeFileSync } from 'fs';

const SEED = 'sdqdsqdqsgfdg';

const toRegenerate = [
  { id: 'easy_1',   label: 'Facile',   name: 'Niveau 1', difficulty: 'easy', gridSize: 8,  minSmallZones: 2, smallZoneSize: 4, maxTotalAttempts: 200000 },
  { id: 'easy_3',   label: 'Facile',   name: 'Niveau 3', difficulty: 'easy', gridSize: 8,  minSmallZones: 2, smallZoneSize: 5, maxTotalAttempts: 200000 },
  { id: 'medium_2', label: 'Moyen',    name: 'Niveau 2', difficulty: 'easy', gridSize: 9,  minSmallZones: 3, smallZoneSize: 5, maxTotalAttempts: 200000 },
];

const existing = JSON.parse(readFileSync('./practice-puzzles.json', 'utf8'));

for (const cfg of toRegenerate) {
  const seed = `${SEED}_${cfg.id}`;
  console.log(`Generating ${cfg.id} with seed=${seed} ...`);

  const puzzle = generatePuzzleHeartsFirst(seed, {
    difficulty: cfg.difficulty,
    gridSize: cfg.gridSize,
    minSmallZones: cfg.minSmallZones,
    smallZoneSize: cfg.smallZoneSize,
    checkUniqueness: true,
    maxTotalAttempts: cfg.maxTotalAttempts,
  });

  if (!puzzle) {
    console.error(`  ❌ FAILED for ${cfg.id}`);
    process.exit(1);
  }

  console.log(`  ✅ OK — ${puzzle.metadata.totalAttempts} attempts, ${puzzle.metadata.generationTime}ms`);

  const idx = existing.findIndex(p => p.id === cfg.id);
  existing[idx] = {
    id: cfg.id,
    label: cfg.label,
    name: cfg.name,
    difficulty: cfg.difficulty,
    gridSize: cfg.gridSize,
    zones: puzzle.zones,
    solution: puzzle.solution,
    metadata: puzzle.metadata,
  };
}

writeFileSync('./practice-puzzles.json', JSON.stringify(existing, null, 2), 'utf8');
console.log('\n✅ practice-puzzles.json mis à jour (niveaux 1, 3, 5)');
