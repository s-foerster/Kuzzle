import { generateSolutionBT } from './src/algorithms/lumizle/generator.js';
import { minimizeCluesLogically } from './src/algorithms/lumizle/logicalGenerator.js';
import { logicalSolve } from './src/algorithms/lumizle/logicalSolver.js';
import { SeededRandom } from './src/utils/seededRandom.js';
import { NAMED_PATTERNS, CELL_DARK, CELL_LIGHT } from './src/algorithms/lumizle/rules.js';

const rulesModule = { NAMED_PATTERNS };

const size = 10;
const rules = [
  { id: 'CONNECT_LIGHT' },
  { id: 'CONNECT_DARK' },
  { id: 'NO_2X2_DARK' },
];

const rng = new SeededRandom('test_h_1');
console.log('Generating BT solution 10x10...');
const sol = generateSolutionBT(rng, size, rules, 0.40, 0.60, 200);
console.log(sol ? 'OK' : 'NULL');

if (sol) {
  console.log('Solution:');
  for (const row of sol) console.log(row.map(v => v === CELL_DARK ? '■' : '·').join(' '));

  console.log('\nMinimizing with maxLevel=5...');
  const t0 = Date.now();
  const m = minimizeCluesLogically(sol, size, rules, rng, {
    maxLevel: 5, allowHypothesis: false, timeoutMs: 30000,
  });
  console.log(`  → ${Date.now()-t0}ms, clues=${m.clueCount}/${size*size}, level=${m.finalResult.maxLevel}, techs=${[...m.finalResult.techniquesUsed].join(',')}`);
  console.log('Initial:');
  for (const row of m.initialGrid) console.log(row.map(v => v === CELL_DARK ? '■' : v === CELL_LIGHT ? '·' : '?').join(' '));
}
