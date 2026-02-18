/**
 * Génère les 9 puzzles de la collection practice et écrit le résultat en JSON.
 * usage: node generate-practice.js
 */

import { generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';
import { writeFileSync } from 'fs';

const configs = [
  // Facile
  { id: 'easy_1',   label: 'Facile',   name: 'Niveau 1', difficulty: 'easy', gridSize: 8,  minSmallZones: 2, smallZoneSize: 4, maxTotalAttempts: 200000 },
  { id: 'easy_2',   label: 'Facile',   name: 'Niveau 2', difficulty: 'easy', gridSize: 8,  minSmallZones: 3, smallZoneSize: 4, maxTotalAttempts: 200000 },
  { id: 'easy_3',   label: 'Facile',   name: 'Niveau 3', difficulty: 'easy', gridSize: 8,  minSmallZones: 2, smallZoneSize: 5, maxTotalAttempts: 200000 },
  // Moyen
  { id: 'medium_1', label: 'Moyen',    name: 'Niveau 1', difficulty: 'easy', gridSize: 10, minSmallZones: 5, smallZoneSize: 4, maxTotalAttempts: 200000 },
  { id: 'medium_2', label: 'Moyen',    name: 'Niveau 2', difficulty: 'easy', gridSize: 9,  minSmallZones: 3, smallZoneSize: 5, maxTotalAttempts: 200000 },
  { id: 'medium_3', label: 'Moyen',    name: 'Niveau 3', difficulty: 'easy', gridSize: 9,  minSmallZones: 5, smallZoneSize: 4, maxTotalAttempts: 200000 },
  // Difficile
  { id: 'hard_1',   label: 'Difficile', name: 'Niveau 1', difficulty: 'easy', gridSize: 9,  minSmallZones: 4, smallZoneSize: 4, maxTotalAttempts: 200000 },
  { id: 'hard_2',   label: 'Difficile', name: 'Niveau 2', difficulty: 'easy', gridSize: 10, minSmallZones: 4, smallZoneSize: 5, maxTotalAttempts: 200000 },
  { id: 'hard_3',   label: 'Difficile', name: 'Niveau 3', difficulty: 'easy', gridSize: 10, minSmallZones: 4, smallZoneSize: 4, maxTotalAttempts: 200000 },
];

const results = [];

for (const cfg of configs) {
  const seed = `practice_${cfg.id}`;
  console.log(`Generating ${cfg.id} (${cfg.gridSize}×${cfg.gridSize}, minSmallZones=${cfg.minSmallZones}, smallZoneSize=${cfg.smallZoneSize}) seed=${seed} ...`);

  const puzzle = generatePuzzleHeartsFirst(seed, {
    difficulty: cfg.difficulty,
    gridSize: cfg.gridSize,
    minSmallZones: cfg.minSmallZones,
    smallZoneSize: cfg.smallZoneSize,
    checkUniqueness: true,
    maxTotalAttempts: cfg.maxTotalAttempts || 500,
  });

  if (!puzzle) {
    console.error(`  ❌ FAILED`);
    process.exit(1);
  }

  console.log(`  ✅ OK — ${puzzle.metadata.totalAttempts} attempts, ${puzzle.metadata.generationTime}ms`);

  results.push({
    id: cfg.id,
    label: cfg.label,
    name: cfg.name,
    difficulty: cfg.difficulty,
    gridSize: cfg.gridSize,
    zones: puzzle.zones,
    solution: puzzle.solution,
    metadata: puzzle.metadata,
  });
}

// Write to file
const outPath = './practice-puzzles.json';
writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\n✅ Wrote ${results.length} puzzles to ${outPath}`);
