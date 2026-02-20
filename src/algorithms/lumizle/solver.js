/**
 * Lumizle - Solveur par backtracking
 *
 * Compte le nombre de solutions d'un puzzle partiel en assignant
 * les cellules inconnues et en vérifiant toutes les règles actives.
 * S'arrête dès que `maxSolutions` solutions sont trouvées (2 par défaut,
 * ce qui suffit pour détecter le manque d'unicité).
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
  checkAllPartialRules,
} from './rules.js';

/**
 * Compte les solutions d'un puzzle.
 *
 * @param {number[][]} initialGrid - Grille avec clues fixes (0=inconnu, 1=sombre, 2=clair)
 * @param {number}     size        - Dimension de la grille
 * @param {Array}      rules       - Règles actives [{id, params?}]
 * @param {number}     maxSolutions - S'arrêter après N solutions trouvées
 * @returns {number}  Nombre de solutions (jusqu'à maxSolutions)
 */
export function countSolutions(initialGrid, size, rules, maxSolutions = 2) {
  // Collecter les cellules inconnues
  const unknownCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (initialGrid[r][c] === CELL_UNKNOWN) unknownCells.push([r, c]);
    }
  }

  // Grille sans inconnues : vérification directe
  if (unknownCells.length === 0) {
    return checkAllRules(initialGrid, size, rules) ? 1 : 0;
  }

  // Copie de travail modifiée en place pendant le backtracking
  const work = initialGrid.map(row => [...row]);
  let count = 0;

  function backtrack(idx) {
    if (idx === unknownCells.length) {
      if (checkAllRules(work, size, rules)) {
        count++;
        return count >= maxSolutions; // true = arrêter la recherche
      }
      return false;
    }

    const [r, c] = unknownCells[idx];

    for (const val of [CELL_DARK, CELL_LIGHT]) {
      work[r][c] = val;
      if (checkAllPartialRules(work, size, rules)) {
        if (backtrack(idx + 1)) return true; // propagation du stop
      }
    }

    work[r][c] = CELL_UNKNOWN; // restauration
    return false;
  }

  backtrack(0);
  return count;
}

/**
 * Trouve et retourne UNE solution valide, ou null si aucune n'existe.
 *
 * @param {number[][]} initialGrid
 * @param {number}     size
 * @param {Array}      rules
 * @returns {number[][]|null}
 */
export function findSolution(initialGrid, size, rules) {
  const unknownCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (initialGrid[r][c] === CELL_UNKNOWN) unknownCells.push([r, c]);
    }
  }

  if (unknownCells.length === 0) {
    return checkAllRules(initialGrid, size, rules)
      ? initialGrid.map(row => [...row])
      : null;
  }

  const work = initialGrid.map(row => [...row]);
  let found = false;

  function backtrack(idx) {
    if (idx === unknownCells.length) {
      if (checkAllRules(work, size, rules)) {
        found = true;
        return true;
      }
      return false;
    }

    const [r, c] = unknownCells[idx];
    for (const val of [CELL_DARK, CELL_LIGHT]) {
      work[r][c] = val;
      if (checkAllPartialRules(work, size, rules) && backtrack(idx + 1)) return true;
    }

    work[r][c] = CELL_UNKNOWN;
    return false;
  }

  backtrack(0);
  return found ? work : null;
}
