/**
 * Lumizle - Générateur de puzzles
 *
 * Phase 1 : génère une solution complète valide (backtracking randomisé).
 * Phase 2 : minimise les indices en retirant les cellules tant que la
 *           solution reste unique (vérification via le solveur).
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
  checkAllPartialRules,
} from './rules.js';
import { countSolutions } from './solver.js';
import { SeededRandom } from '../../utils/seededRandom.js';

// ---------------------------------------------------------------------------
// Phase 1 : Génération de la solution complète
// ---------------------------------------------------------------------------

/**
 * Génère une grille complète et valide par backtracking randomisé.
 *
 * @param {SeededRandom} rng
 * @param {number}       size
 * @param {Array}        rules          - Règles actives [{id, params?}]
 * @param {number}       minLightRatio  - Proportion minimale de cellules claires (défaut 0.35)
 * @param {number}       maxLightRatio  - Proportion maximale de cellules claires (défaut 0.65)
 * @param {number}       maxAttempts    - Nombre max de tentatives globales
 * @returns {number[][]|null}
 */
export function generateSolution(
  rng,
  size,
  rules,
  minLightRatio = 0.35,
  maxLightRatio = 0.65,
  maxAttempts = 200,
) {
  const total = size * size;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(CELL_UNKNOWN));

    // Ordre aléatoire de remplissage des cellules
    const allCells = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        allCells.push([r, c]);
    const shuffled = rng.shuffle(allCells);

    let solved = false;

    function backtrack(idx) {
      if (idx === shuffled.length) {
        // Contrainte de ratio : pas trop déséquilibré
        const lightCount = grid.reduce(
          (s, row) => s + row.filter(v => v === CELL_LIGHT).length,
          0,
        );
        const ratio = lightCount / total;
        if (ratio < minLightRatio || ratio > maxLightRatio) return false;
        return checkAllRules(grid, size, rules);
      }

      const [r, c] = shuffled[idx];
      // Ordre aléatoire sombre/clair pour varier les solutions
      const vals = rng.random() < 0.5
        ? [CELL_DARK, CELL_LIGHT]
        : [CELL_LIGHT, CELL_DARK];

      for (const val of vals) {
        grid[r][c] = val;
        if (checkAllPartialRules(grid, size, rules) && backtrack(idx + 1)) {
          return true;
        }
      }

      grid[r][c] = CELL_UNKNOWN;
      return false;
    }

    if (backtrack(0)) {
      solved = true;
      return grid;
    }

    void solved; // suppress lint
  }

  return null; // Échec après maxAttempts tentatives
}

// ---------------------------------------------------------------------------
// Phase 2 : Minimisation des indices (clue removal)
// ---------------------------------------------------------------------------

/**
 * Part de la solution complète (toutes les cellules = indices) et retire
 * aléatoirement les indices tant que la solution reste unique.
 *
 * @param {number[][]} solution - Grille solution complète
 * @param {number}     size
 * @param {Array}      rules
 * @param {SeededRandom} rng   - Pour l'ordre de suppression
 * @returns {number[][]}        Grille avec le minimum d'indices
 */
export function minimizeClues(solution, size, rules, rng) {
  // Départ : tous les indices sont présents
  const grid = solution.map(row => [...row]);

  const allCells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      allCells.push([r, c]);

  const removalOrder = rng.shuffle(allCells);

  for (const [r, c] of removalOrder) {
    const saved = grid[r][c];
    grid[r][c] = CELL_UNKNOWN; // Tentative de suppression

    // Si la solution n'est plus unique, on remet l'indice
    if (countSolutions(grid, size, rules, 2) !== 1) {
      grid[r][c] = saved;
    }
    // Sinon on garde la cellule vide (suppression validée)
  }

  return grid;
}

// ---------------------------------------------------------------------------
// Pipeline complet
// ---------------------------------------------------------------------------

/**
 * Génère un puzzle Lumizle complet (initialGrid + solution).
 *
 * @param {string|number} seed
 * @param {object}        config
 *   @param {number}  config.size            - Taille de la grille (défaut 7)
 *   @param {Array}   config.rules           - Règles actives (défaut [CONNECT_LIGHT])
 *   @param {boolean} config.checkUniqueness - Vérification finale (défaut true)
 *   @param {number}  config.minLightRatio   - (défaut 0.35)
 *   @param {number}  config.maxLightRatio   - (défaut 0.65)
 * @returns {{ initialGrid, solution, rules, metadata }}
 */
export function generatePuzzle(seed, config = {}) {
  const {
    size            = 7,
    rules           = [{ id: 'CONNECT_LIGHT' }],
    checkUniqueness = true,
    minLightRatio   = 0.35,
    maxLightRatio   = 0.65,
  } = config;

  const rng = new SeededRandom(`${seed}_lumizle`);
  const t0  = Date.now();

  // ── Phase 1 : solution ──────────────────────────────────────────────────
  const solution = generateSolution(rng, size, rules, minLightRatio, maxLightRatio);
  if (!solution) {
    throw new Error(`Lumizle: impossible de générer une solution (size=${size})`);
  }
  const t1 = Date.now();

  // ── Phase 2 : minimisation ─────────────────────────────────────────────
  const initialGrid = minimizeClues(solution, size, rules, rng);
  const t2 = Date.now();

  // ── Méta-données ───────────────────────────────────────────────────────
  const clueCount  = initialGrid.reduce((s, row) => s + row.filter(v => v !== CELL_UNKNOWN).length, 0);
  const lightCount = solution.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
  const darkCount  = size * size - lightCount;

  let isUnique = true;
  if (checkUniqueness) {
    isUnique = countSolutions(initialGrid, size, rules, 2) === 1;
  }

  return {
    initialGrid,
    solution,
    rules,
    metadata: {
      seed:             String(seed),
      gridSize:         size,
      clueCount,
      lightCount,
      darkCount,
      totalCells:       size * size,
      solutionTime:     t1 - t0,
      minimizationTime: t2 - t1,
      generationTime:   t2 - t0,
      isUnique,
    },
  };
}
