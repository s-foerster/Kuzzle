/**
 * Test du solveur logique : on essaie de résoudre quelques puzzles connus
 * et on affiche les techniques utilisées + le score de difficulté.
 */

import { generateLumizlePuzzle } from './src/algorithms/lumizle/puzzleFactory.js';
import { logicalSolve, scoreDifficulty } from './src/algorithms/lumizle/logicalSolver.js';
import { NAMED_PATTERNS, CELL_UNKNOWN, CELL_DARK, CELL_LIGHT } from './src/algorithms/lumizle/rules.js';

const rulesModule = { NAMED_PATTERNS };

function printGrid(grid) {
  for (const row of grid) {
    console.log(row.map(v => v === CELL_DARK ? '■' : v === CELL_LIGHT ? '·' : '?').join(' '));
  }
}

function testPuzzle(label, difficulty, seed) {
  console.log(`\n━━━ ${label} (seed=${seed}) ━━━`);
  const puzzle = generateLumizlePuzzle(seed, difficulty);
  console.log(`Size: ${puzzle.metadata.gridSize}x${puzzle.metadata.gridSize}`);
  console.log(`Clues: ${puzzle.metadata.clueCount}/${puzzle.metadata.totalCells}`);
  console.log(`Rules: ${puzzle.rules.map(r => r.id).join(', ')}`);
  console.log('Initial:');
  printGrid(puzzle.initialGrid);

  const t0 = Date.now();
  const res = logicalSolve(puzzle.initialGrid, puzzle.metadata.gridSize, puzzle.rules, {
    _rulesModule: rulesModule,
    allowHypothesis: false,
    recordSteps: false,
  });
  const dt = Date.now() - t0;

  console.log(`\nLogical solve: ${res.solved ? 'SOLVED' : 'NOT SOLVED'}  (${dt}ms)`);
  console.log(`Consistent: ${res.consistent}`);
  console.log(`Max level: ${res.maxLevel}`);
  console.log(`Techniques: ${[...res.techniquesUsed].join(', ')}`);
  console.log(`Deduction steps: ${res.deductionSteps}`);
  if (res.solved) console.log(`Difficulty score: ${scoreDifficulty(res)}`);

  if (!res.solved) {
    console.log('Final grid:');
    printGrid(res.grid);
  }
}

testPuzzle('Easy', 'easy', 'test_easy_1');
testPuzzle('Easy', 'easy', 'test_easy_2');
testPuzzle('Medium', 'medium', 'test_medium_1');
testPuzzle('Medium', 'medium', 'test_medium_2');
testPuzzle('Hard', 'hard', 'test_hard_1');
testPuzzle('Hard', 'hard', 'test_hard_2');
