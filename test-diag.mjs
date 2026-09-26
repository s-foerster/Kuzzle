/**
 * Diagnostic du générateur logique : affiche le temps de chaque étape.
 */
import { generateSolution } from './src/algorithms/lumizle/generator.js';
import { minimizeCluesLogically } from './src/algorithms/lumizle/logicalGenerator.js';
import { logicalSolve } from './src/algorithms/lumizle/logicalSolver.js';
import { countSolutions } from './src/algorithms/lumizle/solver.js';
import { SeededRandom, } from './src/utils/seededRandom.js';
import { NAMED_PATTERNS, CELL_DARK, CELL_LIGHT } from './src/algorithms/lumizle/rules.js';

const rulesModule = { NAMED_PATTERNS };

const size = 6;
const rules = [
  { id: 'CONNECT_LIGHT' },
  { id: 'NO_2X2_DARK' },
];

const rng = new SeededRandom('diag_1');

console.log('Generating solution...');
let t = Date.now();
const solution = generateSolution(rng, size, rules, 0.40, 0.60);
console.log(`  → ${Date.now() - t}ms`);

console.log('Solving full grid logically (should be instant)...');
t = Date.now();
const r = logicalSolve(solution, size, rules, { _rulesModule: rulesModule, allowHypothesis: false });
console.log(`  → ${Date.now() - t}ms, solved=${r.solved}`);

console.log('Testing single clue removal + logicalSolve...');
t = Date.now();
const g = solution.map(r => [...r]);
g[0][0] = 0;
const r2 = logicalSolve(g, size, rules, { _rulesModule: rulesModule, allowHypothesis: false });
console.log(`  → ${Date.now() - t}ms, solved=${r2.solved}, maxLevel=${r2.maxLevel}`);

console.log('Minimizing clues (max 30s)...');
t = Date.now();
const min = minimizeCluesLogically(solution, size, rules, rng, {
  maxLevel: 3,
  allowHypothesis: false,
  timeoutMs: 30000,
});
console.log(`  → ${Date.now() - t}ms, clues=${min.clueCount}/${size*size}`);

console.log('countSolutions...');
t = Date.now();
const n = countSolutions(min.initialGrid, size, rules, 2);
console.log(`  → ${Date.now() - t}ms, count=${n}`);
