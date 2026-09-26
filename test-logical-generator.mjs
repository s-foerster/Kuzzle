/**
 * Essai du générateur logique avec différentes configurations pour trouver
 * un bon équilibre clues / difficulté.
 */
import { generateLogicalPuzzle } from './src/algorithms/lumizle/logicalGenerator.js';
import { NAMED_PATTERNS, CELL_DARK, CELL_LIGHT } from './src/algorithms/lumizle/rules.js';

function printGrid(grid) {
  for (const row of grid) {
    console.log(row.map(v => v === CELL_DARK ? '■' : v === CELL_LIGHT ? '·' : '?').join(' '));
  }
}

function test(label, seed, config) {
  console.log(`\n━━━ ${label} ━━━`);
  const t0 = Date.now();
  const p = generateLogicalPuzzle(seed, config);
  const dt = Date.now() - t0;
  if (!p) { console.log(`FAIL (${dt}ms)`); return; }
  console.log(`Size: ${config.size}  Rules: ${config.rules.map(r => r.id + (r.params ? `(n=${r.params.n})` : '')).join(', ')}`);
  console.log(`Clues: ${p.metadata.clueCount}/${p.metadata.totalCells}  (${(p.metadata.clueCount/p.metadata.totalCells*100).toFixed(0)}%)`);
  console.log(`Difficulty: level ${p.metadata.difficulty.maxLevel}  score ${p.metadata.difficulty.score}`);
  console.log(`Techniques: ${p.metadata.difficulty.techniques.join(', ')}`);
  console.log(`Steps: ${p.metadata.difficulty.deductionSteps}  GenTime: ${dt}ms`);
  printGrid(p.initialGrid);
}

// 6x6 facile
test('Easy 6x6 level 2', 'e1', {
  size: 6,
  rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }],
  targetMaxLevel: 2, minTargetLevel: 1,
  maxGenerationAttempts: 3, timeoutMs: 20000,
});

test('Easy 6x6 region', 'e2', {
  size: 6,
  rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }],
  targetMaxLevel: 3, minTargetLevel: 2,
  maxGenerationAttempts: 3, timeoutMs: 15000,
});

// 8x8 medium
test('Medium 8x8 level 4', 'm1', {
  size: 8,
  rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }],
  targetMaxLevel: 4, minTargetLevel: 3,
  maxGenerationAttempts: 3, timeoutMs: 45000,
});

// 8x8 reachability
test('Medium 8x8 level 5 (reach)', 'm2', {
  size: 8,
  rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }],
  targetMaxLevel: 5, minTargetLevel: 3,
  maxGenerationAttempts: 3, timeoutMs: 45000,
});

// 10x10 hard (RSG-compatible rules only)
test('Hard 10x10 reach', 'h1', {
  size: 10,
  rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }],
  targetMaxLevel: 5, minTargetLevel: 3,
  maxGenerationAttempts: 2, timeoutMs: 60000,
});
