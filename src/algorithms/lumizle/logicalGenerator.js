/**
 * Lumizle - Générateur de puzzles à solution logiquement déductible (v4)
 *
 * Pipeline :
 *   1. Génère une solution complète valide (réutilise generateSolution).
 *   2. Vérifie que cette solution, avec TOUTES ses cellules comme indices, est
 *      logiquement "résoluble" par trivialité (rien à déduire). C'est le point
 *      de départ.
 *   3. Minimisation d'indices : on essaie de retirer les cellules une par une
 *      (ordre aléatoire). Après chaque retrait, on teste si le puzzle reste
 *      logiquement résoluble (via logicalSolve). Si oui → retrait validé.
 *      Si non → on remet la cellule.
 *   4. On vérifie l'unicité de la solution (countSolutions === 1) et on
 *      mesure la difficulté finale (maxLevel, techniques).
 *   5. Le puzzle est accepté si maxLevel correspond à la cible.
 *
 * Contrat : un puzzle généré ici est TOUJOURS résoluble sans deviner
 *           (sauf depth-1 hypothetical en tier 'expert').
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  NAMED_PATTERNS,
  checkAllRules,
} from './rules.js';
import { generateSolution, generateSolutionBT } from './generator.js';
import { evaluateClueQuality } from './clueQuality.js';
import { countSolutions } from './solver.js';
import { logicalSolve, scoreDifficulty } from './logicalSolver.js';
import { SeededRandom } from '../../utils/seededRandom.js';

const rulesModule = { NAMED_PATTERNS };

/**
 * Teste si un initialGrid est logiquement résoluble avec les règles données.
 *
 * @param {number[][]} grid
 * @param {number} size
 * @param {Array} rules
 * @param {Object} options
 *   - allowHypothesis: si true, autorise depth-1 hypothesis (tier expert)
 * @returns {Object|null} résultat de logicalSolve si résolu, sinon null
 */
function tryLogicalSolve(grid, size, rules, options = {}) {
  const res = logicalSolve(grid, size, rules, {
    _rulesModule: rulesModule,
    allowHypothesis: options.allowHypothesis ?? false,
    maxHypothesisRounds: 2,
  });
  return res.solved ? res : null;
}

/**
 * Minimise les indices en retirant itérativement des cellules tant que le
 * puzzle reste logiquement résoluble.
 *
 * @param {number[][]} solution      - Grille complète
 * @param {number}     size
 * @param {Array}      rules
 * @param {SeededRandom} rng
 * @param {Object}     options
 *   - maxLevel: niveau de technique maximum autorisé (rejette retrait si dépasse)
 *   - targetClueRatio: cible approximative d'indices (arrêt anticipé si atteint)
 *   - allowHypothesis: autoriser depth-1 pour difficulty expert
 *   - clueQuality: contraintes de qualité des indices initiaux
 *   - timeoutMs: budget temps
 * @returns {{ initialGrid, removedCells, finalResult }}
 */
export function minimizeCluesLogically(solution, size, rules, rng, options = {}) {
  const {
    maxLevel = 5,
    targetClueRatio = null,
    allowHypothesis = false,
    clueQuality = {},
    timeoutMs = 60000,
  } = options;

  const grid = solution.map(row => [...row]);
  const t0 = Date.now();

  const total = size * size;
  let clueCount = total;
  let lastResult = null;

  let quality = evaluateClueQuality(grid, solution, size, rules, clueQuality);

  // Ouvrir les régions sombres complètes en premier, tant que leurs frontières
  // claires sont encore fixes. Sinon le retrait d'une case sombre peut devenir
  // non-déductible après avoir déjà retiré les indices de frontière.
  const priorityKeys = new Set();
  const priorityCells = [];
  if (quality.options.darkRegionTarget) {
    for (const stat of rng.shuffle(quality.regionStats)) {
      if (stat.size <= 1) continue;
      const cell = rng.choice(stat.cells);
      const key = `${cell[0]},${cell[1]}`;
      priorityKeys.add(key);
      priorityCells.push(cell);
    }
  }

  const restCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!priorityKeys.has(`${r},${c}`)) restCells.push([r, c]);
    }
  }
  const allCells = [...priorityCells, ...rng.shuffle(restCells)];

  for (const [r, c] of allCells) {
    if (Date.now() - t0 > timeoutMs) break;
    if (targetClueRatio !== null && quality.isValid && clueCount / total <= targetClueRatio) break;

    const saved = grid[r][c];
    grid[r][c] = CELL_UNKNOWN;

    const nextQuality = evaluateClueQuality(grid, solution, size, rules, clueQuality);
    if (quality.isValid && !nextQuality.isValid) {
      grid[r][c] = saved;
      continue;
    }

    const res = tryLogicalSolve(grid, size, rules, { allowHypothesis });
    if (res && res.maxLevel <= maxLevel) {
      // Retrait accepté
      lastResult = res;
      clueCount--;
      quality = nextQuality;
    } else {
      // Retrait refusé : remettre
      grid[r][c] = saved;
    }
  }

  // Si aucun retrait n'a été fait, le puzzle trivial (tout est indice) est "résolu"
  if (!lastResult) {
    lastResult = logicalSolve(grid, size, rules, {
      _rulesModule: rulesModule,
      allowHypothesis,
    });
  }

  return {
    initialGrid: grid,
    clueCount,
    finalResult: lastResult,
    clueQuality: quality,
    elapsedMs: Date.now() - t0,
  };
}

/**
 * Génère un puzzle Lumizle résoluble logiquement, avec difficulté mesurée.
 *
 * @param {string|number} seed
 * @param {Object} config
 *   - size: number
 *   - rules: Array
 *   - minLightRatio, maxLightRatio
 *   - targetMaxLevel: technique max visée (1..6)
 *   - allowHypothesis: autoriser depth-1
 *   - targetClueRatio: stop minimization at this ratio
 *   - maxGenerationAttempts: combien de solutions essayer avant abandon
 *   - timeoutMs: budget global
 * @returns {Object|null}
 */
export function generateLogicalPuzzle(seed, config = {}) {
  const {
    size = 8,
    rules = [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }],
    minLightRatio = 0.40,
    maxLightRatio = 0.60,
    targetMaxLevel = 5,
    minTargetLevel = 2,
    allowHypothesis = false,
    targetClueRatio = null,
    clueQuality = {},
    maxGenerationAttempts = 10,
    timeoutMs = 90000,
  } = config;

  const rng = new SeededRandom(`${seed}_lumizle_logical`);
  const t0 = Date.now();

  let best = null;

  for (let attempt = 0; attempt < maxGenerationAttempts; attempt++) {
    const remainingGlobal = timeoutMs - (Date.now() - t0);
    if (remainingGlobal <= 1000) break;

    // Budget par attempt : moitié pour la génération de solution, moitié pour minimization
    // Ne jamais consommer plus de 1/2 du budget restant pour une seule phase
    const genBudget = Math.min(20000, Math.floor(remainingGlobal / 3));

    // Phase 1 : générer une solution complète.
    // Préférer RSG (varie mieux les solutions) ; tomber sur BT si RSG échoue.
    let solution = generateSolution(rng, size, rules, minLightRatio, maxLightRatio, size >= 9 ? 5000 : 1000, genBudget);
    if (!solution && (Date.now() - t0) < timeoutMs - 2000) {
      const remaining2 = timeoutMs - (Date.now() - t0);
      solution = generateSolutionBT(rng, size, rules, minLightRatio, maxLightRatio, 200, Math.min(15000, remaining2 / 2));
    }
    if (!solution) continue;

    const remainingForMin = timeoutMs - (Date.now() - t0);
    if (remainingForMin <= 2000) break;

    // Phase 2 : minimiser les indices
    const minimized = minimizeCluesLogically(solution, size, rules, rng, {
      maxLevel: targetMaxLevel,
      allowHypothesis,
      targetClueRatio,
      clueQuality,
      timeoutMs: Math.max(2000, remainingForMin),
    });

    const { initialGrid, clueCount, finalResult, clueQuality: clueQualityMetrics } = minimized;
    if (!finalResult.solved) continue;
    if (!clueQualityMetrics.isValid) continue;

    // Vérifier unicité (skip si pas d'hypothèse — implicitement unique)
    const usedHypothesis = finalResult.maxLevel >= 6;
    if (usedHypothesis) {
      const solCount = countSolutions(initialGrid, size, rules, 2);
      if (solCount !== 1) continue;
    }

    const candidate = { initialGrid, solution, clueCount, finalResult, clueQuality: clueQualityMetrics };

    // Score : on préfère un puzzle qui :
    //   - atteint au moins minTargetLevel
    //   - a le moins de clues possible
    const meetsMinLevel = finalResult.maxLevel >= minTargetLevel;
    const candidateScore = (meetsMinLevel ? 1000 : 0) - clueCount;
    const bestScore = best ? ((best.finalResult.maxLevel >= minTargetLevel ? 1000 : 0) - best.clueCount) : -Infinity;

    if (candidateScore > bestScore) {
      best = candidate;
    }

    // Si on atteint la cible et qu'on a un nombre raisonnable d'indices, on peut s'arrêter
    if (meetsMinLevel && clueCount / (size * size) <= 0.40) {
      break;
    }
  }

  if (best) {
    const lightCount = best.solution.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
    return {
      initialGrid: best.initialGrid,
      solution: best.solution,
      rules,
      metadata: {
        seed: String(seed),
        gridSize: size,
        clueCount: best.clueCount,
        lightCount,
        darkCount: size * size - lightCount,
        totalCells: size * size,
        generationTime: Date.now() - t0,
        isUnique: true,
        difficulty: {
          maxLevel: best.finalResult.maxLevel,
          techniques: [...best.finalResult.techniquesUsed],
          deductionSteps: best.finalResult.deductionSteps,
          score: scoreDifficulty(best.finalResult),
        },
        clueQuality: {
          fixedDarkClues: best.clueQuality.fixedDarkClues,
          openDarkRegions: best.clueQuality.openDarkRegions,
          completeDarkRegions: best.clueQuality.completeDarkRegions,
          allUnknownsAsLightValid: best.clueQuality.allUnknownsAsLightValid,
          allUnknownsAsDarkValid: best.clueQuality.allUnknownsAsDarkValid,
          requireAllLightInvalid: best.clueQuality.requireAllLightInvalid,
          requireAllDarkInvalid: best.clueQuality.requireAllDarkInvalid,
        },
        meetsMinLevel: best.finalResult.maxLevel >= minTargetLevel,
      },
    };
  }

  return null;
}
