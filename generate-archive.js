/**
 * Génère les puzzles des 7 derniers jours manquants dans puzzle-cache.json
 */
import { generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';
import { readFileSync, writeFileSync } from 'fs';

const cache = JSON.parse(readFileSync('./puzzle-cache.json', 'utf8'));

const today = new Date('2026-02-18');
const missing = [];
for (let i = 1; i <= 7; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const key = d.toISOString().slice(0, 10);
  if (!cache[key]) missing.push(key);
}

console.log('Dates manquantes:', missing.length ? missing : 'aucune');

for (const dateKey of missing) {
  const seed = dateKey.replace(/-/g, '');
  console.log(`Génération ${dateKey} (seed=${seed})...`);

  const puzzle = generatePuzzleHeartsFirst(seed, {
    gridSize: 10,
    minSmallZones: 5,
    smallZoneSize: 4,
    checkUniqueness: true,
    maxTotalAttempts: 1000000,
  });

  if (!puzzle) {
    console.error(`  ❌ FAILED pour ${dateKey}`);
    process.exit(1);
  }

  console.log(`  ✅ OK — ${puzzle.metadata.totalAttempts} tentatives, ${puzzle.metadata.generationTime}ms`);

  cache[dateKey] = {
    puzzle: { zones: puzzle.zones, solution: puzzle.solution },
    generatedAt: new Date().toISOString(),
    metadata: puzzle.metadata,
  };
}

if (missing.length > 0) {
  writeFileSync('./puzzle-cache.json', JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\n✅ puzzle-cache.json mis à jour (${missing.length} nouveaux puzzles)`);
} else {
  console.log('\n✅ puzzle-cache.json déjà complet');
}
