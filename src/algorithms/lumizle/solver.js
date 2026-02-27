/**
 * Lumizle - Solveur par backtracking optimisé (v2)
 *
 * Améliorations par rapport à v1 :
 *   1. MRV (Minimum Remaining Values) : on choisit en priorité la cellule
 *      dont le domaine est le plus réduit après propagation locale.
 *   2. Propagation locale O(1) : avant d'essayer une valeur, on vérifie les
 *      contraintes locales (NO_2X2, NO_3_IN_A_ROW) sans BFS, ce qui prune
 *      l'arbre de recherche très tôt.
 *   3. Les règles globales (CONNECT_*) ne sont vérifiées qu'en feuille (grille
 *      complète), mais les contraintes partielles font également du pruning.
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
  checkAllPartialRules,
} from './rules.js';

// ─────────────────────────────────────────────────────────────────────────────
// Contraintes locales O(1) — identiques à celles du générateur
// ─────────────────────────────────────────────────────────────────────────────

function creates2x2(grid, size, r, c, val, ruleIds) {
  const ruleId = val === CELL_DARK ? 'NO_2X2_DARK' : 'NO_2X2_LIGHT';
  if (!ruleIds.has(ruleId)) return false;
  const get = (pr, pc) => {
    if (pr < 0 || pr >= size || pc < 0 || pc >= size) return -1;
    return (pr === r && pc === c) ? val : grid[pr][pc];
  };
  const squares = [
    [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]],
    [[r, c - 1], [r, c], [r + 1, c - 1], [r + 1, c]],
    [[r - 1, c], [r - 1, c + 1], [r, c], [r, c + 1]],
    [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]],
  ];
  for (const sq of squares) {
    if (sq.every(([pr, pc]) => get(pr, pc) === val)) return true;
  }
  return false;
}

function creates3InRow(grid, size, r, c, val, ruleIds) {
  const ruleId = val === CELL_DARK ? 'NO_3_IN_A_ROW_DARK' : 'NO_3_IN_A_ROW_LIGHT';
  if (!ruleIds.has(ruleId)) return false;
  const get = (pr, pc) => {
    if (pr < 0 || pr >= size || pc < 0 || pc >= size) return -1;
    return (pr === r && pc === c) ? val : grid[pr][pc];
  };
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    for (let start = -2; start <= 0; start++) {
      const pts = [
        [r + start * dr, c + start * dc],
        [r + (start + 1) * dr, c + (start + 1) * dc],
        [r + (start + 2) * dr, c + (start + 2) * dc],
      ];
      if (pts.every(([pr, pc]) => get(pr, pc) === val)) return true;
    }
  }
  return false;
}

/** Retourne les valeurs localement autorisées pour (r,c). */
function localDomain(grid, size, r, c, ruleIds) {
  return [CELL_DARK, CELL_LIGHT].filter(val => {
    if (creates2x2(grid, size, r, c, val, ruleIds)) return false;
    if (creates3InRow(grid, size, r, c, val, ruleIds)) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Solveur principal avec MRV
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compte le nombre de solutions d'un puzzle (jusqu'à maxSolutions).
 * Utilise MRV + propagation locale pour pruner l'espace de recherche.
 *
 * @param {number[][]} initialGrid - Grille avec clues fixes
 * @param {number}     size
 * @param {Array}      rules       - [{id, params?}]
 * @param {number}     maxSolutions - S'arrêter après N solutions (défaut 2)
 * @returns {number}   Nombre de solutions trouvées (≤ maxSolutions)
 */
export function countSolutions(initialGrid, size, rules, maxSolutions = 2) {
  const ruleIds = new Set(rules.map(r => r.id));

  // Collecter les cellules inconnues
  const unknownCells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (initialGrid[r][c] === CELL_UNKNOWN) unknownCells.push([r, c]);

  if (unknownCells.length === 0) {
    return checkAllRules(initialGrid, size, rules) ? 1 : 0;
  }

  const work = initialGrid.map(row => [...row]);
  let count = 0;

  // Tableau des cellules non encore assignées (indices dans unknownCells)
  function backtrack(remaining) {
    if (remaining.length === 0) {
      if (checkAllRules(work, size, rules)) {
        count++;
        return count >= maxSolutions;
      }
      return false;
    }

    // ── MRV : choisir la cellule avec le moins de valeurs permises ──
    let bestIdx = 0;
    let bestDomain = null;
    const checkN = Math.min(remaining.length, 8);
    for (let i = 0; i < checkN; i++) {
      const [r, c] = remaining[i];
      const domain = localDomain(work, size, r, c, ruleIds);
      if (bestDomain === null || domain.length < bestDomain.length) {
        bestIdx = i;
        bestDomain = domain;
        if (bestDomain.length === 0) break;
      }
    }

    const [r, c] = remaining[bestIdx];
    const nextRemaining = remaining.filter((_, i) => i !== bestIdx);
    const domain = bestDomain ?? localDomain(work, size, r, c, ruleIds);

    if (domain.length === 0) return false; // dead end

    for (const val of domain) {
      work[r][c] = val;
      if (checkAllPartialRules(work, size, rules)) {
        if (backtrack(nextRemaining)) return true;
      }
    }

    work[r][c] = CELL_UNKNOWN;
    return false;
  }

  backtrack(unknownCells);
  return count;
}

/**
 * Trouve et retourne UNE solution valide, ou null si aucune n'existe.
 */
export function findSolution(initialGrid, size, rules) {
  const ruleIds = new Set(rules.map(r => r.id));
  const unknownCells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (initialGrid[r][c] === CELL_UNKNOWN) unknownCells.push([r, c]);

  if (unknownCells.length === 0) {
    return checkAllRules(initialGrid, size, rules)
      ? initialGrid.map(row => [...row])
      : null;
  }

  const work = initialGrid.map(row => [...row]);
  let found = null;

  function backtrack(remaining) {
    if (remaining.length === 0) {
      if (checkAllRules(work, size, rules)) {
        found = work.map(row => [...row]);
        return true;
      }
      return false;
    }

    let bestIdx = 0;
    let bestDomain = null;
    const checkN = Math.min(remaining.length, 8);
    for (let i = 0; i < checkN; i++) {
      const [r, c] = remaining[i];
      const domain = localDomain(work, size, r, c, ruleIds);
      if (bestDomain === null || domain.length < bestDomain.length) {
        bestIdx = i;
        bestDomain = domain;
        if (bestDomain.length === 0) break;
      }
    }

    const [r, c] = remaining[bestIdx];
    const nextRemaining = remaining.filter((_, i) => i !== bestIdx);
    const domain = bestDomain ?? localDomain(work, size, r, c, ruleIds);

    if (domain.length === 0) return false;

    for (const val of domain) {
      work[r][c] = val;
      if (checkAllPartialRules(work, size, rules) && backtrack(nextRemaining)) return true;
    }

    work[r][c] = CELL_UNKNOWN;
    return false;
  }

  backtrack(unknownCells);
  return found;
}
