/**
 * Test du solveur logique sur des puzzles simples construits manuellement.
 */

import { logicalSolve, scoreDifficulty } from './src/algorithms/lumizle/logicalSolver.js';
import { NAMED_PATTERNS, CELL_UNKNOWN, CELL_DARK, CELL_LIGHT } from './src/algorithms/lumizle/rules.js';

const rulesModule = { NAMED_PATTERNS };

function printGrid(grid) {
  for (const row of grid) {
    console.log(row.map(v => v === CELL_DARK ? '■' : v === CELL_LIGHT ? '·' : '?').join(' '));
  }
}

// Test 1 : puzzle trivial avec row count
console.log('━━━ Test 1 : 3x3 ROW_EXACT_DARK=1, colonnes déjà remplies ━━━');
const p1 = [
  [CELL_DARK,    CELL_UNKNOWN, CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_DARK,    CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_DARK   ],
];
printGrid(p1);
const r1 = logicalSolve(p1, 3, [{ id: 'ROW_EXACT_DARK', params: { n: 1 } }, { id: 'COL_EXACT_DARK', params: { n: 1 } }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r1.solved, 'Techniques:', [...r1.techniquesUsed]);
printGrid(r1.grid);

// Test 2 : NO_2X2_DARK forcing
console.log('\n━━━ Test 2 : 3x3 NO_2X2_DARK, trois coins DARK forcent le 4e LIGHT ━━━');
const p2 = [
  [CELL_DARK,    CELL_DARK,    CELL_UNKNOWN],
  [CELL_DARK,    CELL_UNKNOWN, CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_UNKNOWN],
];
printGrid(p2);
const r2 = logicalSolve(p2, 3, [{ id: 'NO_2X2_DARK' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r2.solved, 'Consistent:', r2.consistent, 'Techniques:', [...r2.techniquesUsed]);
printGrid(r2.grid);

// Test 3 : DARK_REGION_SIZE n=2, une cellule DARK isolée
console.log('\n━━━ Test 3 : DARK_REGION_SIZE n=2, seule voisine UNKNOWN forcée DARK ━━━');
const p3 = [
  [CELL_DARK,    CELL_UNKNOWN, CELL_LIGHT  ],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT  ],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT  ],
];
printGrid(p3);
const r3 = logicalSolve(p3, 3, [{ id: 'DARK_REGION_SIZE', params: { n: 2 } }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r3.solved, 'Techniques:', [...r3.techniquesUsed]);
printGrid(r3.grid);

// Test 4 : Reachability
console.log('\n━━━ Test 4 : CONNECT_LIGHT, deux îles light séparées ━━━');
const p4 = [
  [CELL_LIGHT,   CELL_DARK,    CELL_DARK   ],
  [CELL_DARK,    CELL_DARK,    CELL_DARK   ],
  [CELL_DARK,    CELL_DARK,    CELL_LIGHT  ],
];
printGrid(p4);
const r4 = logicalSolve(p4, 3, [{ id: 'CONNECT_LIGHT' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r4.solved, 'Consistent:', r4.consistent, '(should be false)', 'Techniques:', [...r4.techniquesUsed]);

// Test 5 : Reachability forcing
console.log('\n━━━ Test 5 : CONNECT_LIGHT, reachability force UNKNOWN isolée en DARK ━━━');
const p5 = [
  [CELL_LIGHT,   CELL_LIGHT,   CELL_DARK   ],
  [CELL_DARK,    CELL_DARK,    CELL_DARK   ],
  [CELL_DARK,    CELL_UNKNOWN, CELL_UNKNOWN],
];
printGrid(p5);
const r5 = logicalSolve(p5, 3, [{ id: 'CONNECT_LIGHT' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r5.solved, 'Techniques:', [...r5.techniquesUsed]);
printGrid(r5.grid);

// Test 6 : technique SYMMETRY
console.log('\n━━━ Test 6 : SYMMETRY_180 propage ━━━');
const p6 = [
  [CELL_DARK,    CELL_UNKNOWN, CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_UNKNOWN],
];
printGrid(p6);
const r6 = logicalSolve(p6, 3, [{ id: 'SYMMETRY_180' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r6.solved, 'Techniques:', [...r6.techniquesUsed]);
printGrid(r6.grid);

// Test 7 : diagonale sombre
console.log('\n━━━ Test 7 : NO_3_DIAGONAL_DARK force la 3e cellule claire ━━━');
const p7 = [
  [CELL_DARK,    CELL_UNKNOWN, CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_DARK,    CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_UNKNOWN],
];
printGrid(p7);
const r7 = logicalSolve(p7, 3, [{ id: 'NO_3_DIAGONAL_DARK' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r7.solved, 'Techniques:', [...r7.techniquesUsed], '(2,2 should be LIGHT)');
printGrid(r7.grid);

// Test 8 : sombre isolée
console.log('\n━━━ Test 8 : NO_ISOLATED_DARK force le seul voisin possible ━━━');
const p8 = [
  [CELL_DARK,    CELL_UNKNOWN, CELL_LIGHT],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT],
];
printGrid(p8);
const r8 = logicalSolve(p8, 3, [{ id: 'NO_ISOLATED_DARK' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r8.solved, 'Techniques:', [...r8.techniquesUsed], '(0,1 should be DARK)');
printGrid(r8.grid);

// Test 9 : chemin sombre sans branche
console.log('\n━━━ Test 9 : DARK_MAX_DEGREE force les branches restantes en clair ━━━');
const p9 = [
  [CELL_UNKNOWN, CELL_DARK,    CELL_UNKNOWN],
  [CELL_DARK,    CELL_DARK,    CELL_UNKNOWN],
  [CELL_UNKNOWN, CELL_UNKNOWN, CELL_UNKNOWN],
];
printGrid(p9);
const r9 = logicalSolve(p9, 3, [{ id: 'DARK_MAX_DEGREE' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r9.solved, 'Techniques:', [...r9.techniquesUsed], '(1,2 and 2,1 should be LIGHT)');
printGrid(r9.grid);

// Test 10 : nombre exact de régions sombres
console.log('\n━━━ Test 10 : DARK_REGION_COUNT_EXACT bloque les nouvelles régions ━━━');
const p10 = [
  [CELL_DARK,    CELL_LIGHT,   CELL_UNKNOWN],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT],
  [CELL_UNKNOWN, CELL_LIGHT,   CELL_DARK],
];
printGrid(p10);
const r10 = logicalSolve(p10, 3, [{ id: 'DARK_REGION_COUNT_EXACT', params: { n: 2 } }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r10.solved, 'Techniques:', [...r10.techniquesUsed], '(isolated unknowns should be LIGHT)');
printGrid(r10.grid);

// Test 11 : région sombre vers le bord
console.log('\n━━━ Test 11 : DARK_REGIONS_TOUCH_BORDER force le seul chemin vers le bord ━━━');
const p11 = [
  [CELL_LIGHT,   CELL_UNKNOWN, CELL_LIGHT],
  [CELL_LIGHT,   CELL_DARK,    CELL_LIGHT],
  [CELL_LIGHT,   CELL_LIGHT,   CELL_LIGHT],
];
printGrid(p11);
const r11 = logicalSolve(p11, 3, [{ id: 'DARK_REGIONS_TOUCH_BORDER' }], { _rulesModule: rulesModule, allowHypothesis: false });
console.log('Solved:', r11.solved, 'Techniques:', [...r11.techniquesUsed], '(0,1 should be DARK)');
printGrid(r11.grid);
