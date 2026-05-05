/**
 * Lumizle - Solveur logique à techniques nommées
 *
 * Contrairement au solveur backtracking (`solver.js`), ce solveur résout les
 * puzzles uniquement par déduction logique. Il applique des "techniques"
 * (Naked Single, Region Size, Connectivity, etc.) par ordre croissant de
 * difficulté et n'avance que lorsqu'une cellule peut être strictement déduite
 * (pas de devinette).
 *
 * Sortie :
 *   {
 *     solved:           boolean,           // grille entièrement résolue par logique pure
 *     consistent:       boolean,           // aucune contradiction détectée
 *     grid:             number[N][N],      // état final (peut contenir des UNKNOWN si pas solved)
 *     techniquesUsed:   Set<string>,       // techniques qui ont contribué au moins une déduction
 *     maxLevel:         number,            // niveau de la technique la plus difficile utilisée
 *     deductionSteps:   number,            // nb de cellules déduites
 *     stepLog:          [{technique, r, c, val, level}]   // optionnel pour hint/explication
 *   }
 *
 * Niveaux de difficulté (utilisés pour mesurer la difficulté d'un puzzle) :
 *   1 : Naked Single, Symmetry Propagation
 *   2 : 2x2 Forcing, No-3 Forcing, Row/Col Counting
 *   3 : Region Size Cap, Region Size Floor
 *   4 : Pattern Avoidance, Stripe Constraint, Border-Region forcing
 *   5 : Connectivity Bottleneck, Reachability
 *   6 : Hypothetical (Trial depth-1)
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
  checkAllPartialRules,
} from './rules.js';

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const DIAG_DIRS = [[1, 1], [1, -1]];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

function buildRuleMap(rules) {
  const map = new Map();
  for (const r of rules) map.set(r.id, r.params || {});
  return map;
}

function hasRule(ruleMap, id) {
  return ruleMap.has(id);
}

function getRuleParams(ruleMap, id) {
  return ruleMap.get(id) || {};
}

function inBounds(size, r, c) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

function getComponents(grid, size, cellValues) {
  const visited = new Array(size * size).fill(false);
  const components = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (visited[r * size + c]) continue;
      if (!cellValues.includes(grid[r][c])) continue;
      const comp = [];
      const queue = [[r, c]];
      visited[r * size + c] = true;
      while (queue.length) {
        const [cr, cc] = queue.shift();
        comp.push([cr, cc]);
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          if (!inBounds(size, nr, nc)) continue;
          if (visited[nr * size + nc]) continue;
          if (!cellValues.includes(grid[nr][nc])) continue;
          visited[nr * size + nc] = true;
          queue.push([nr, nc]);
        }
      }
      components.push(comp);
    }
  }
  return components;
}

/** Vérifie si la valeur `val` à (r,c) est localement compatible avec les contraintes O(1). */
function isLocallyValid(grid, size, r, c, val, ruleMap) {
  // NO_2X2_*
  if (val === CELL_DARK && hasRule(ruleMap, 'NO_2X2_DARK')) {
    if (creates2x2(grid, size, r, c, CELL_DARK)) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'NO_2X2_LIGHT')) {
    if (creates2x2(grid, size, r, c, CELL_LIGHT)) return false;
  }
  // NO_3_IN_A_ROW_*
  if (val === CELL_DARK && hasRule(ruleMap, 'NO_3_IN_A_ROW_DARK')) {
    if (creates3InRow(grid, size, r, c, CELL_DARK)) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'NO_3_IN_A_ROW_LIGHT')) {
    if (creates3InRow(grid, size, r, c, CELL_LIGHT)) return false;
  }
  // NO_3_DIAGONAL_*
  if (val === CELL_DARK && hasRule(ruleMap, 'NO_3_DIAGONAL_DARK')) {
    if (creates3Diagonal(grid, size, r, c, CELL_DARK)) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'NO_3_DIAGONAL_LIGHT')) {
    if (creates3Diagonal(grid, size, r, c, CELL_LIGHT)) return false;
  }
  // SYMMETRY_180
  if (hasRule(ruleMap, 'SYMMETRY_180')) {
    const sr = size - 1 - r, sc = size - 1 - c;
    if (sr !== r || sc !== c) {
      const sym = grid[sr][sc];
      if (sym !== CELL_UNKNOWN && sym !== val) return false;
    }
  }
  // ROW_EXACT_*
  if (val === CELL_DARK && hasRule(ruleMap, 'ROW_EXACT_DARK')) {
    const n = getRuleParams(ruleMap, 'ROW_EXACT_DARK').n ?? 1;
    if (countInRow(grid, r, CELL_DARK) >= n) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'ROW_EXACT_LIGHT')) {
    const n = getRuleParams(ruleMap, 'ROW_EXACT_LIGHT').n ?? 1;
    if (countInRow(grid, r, CELL_LIGHT) >= n) return false;
  }
  // COL_EXACT_*
  if (val === CELL_DARK && hasRule(ruleMap, 'COL_EXACT_DARK')) {
    const n = getRuleParams(ruleMap, 'COL_EXACT_DARK').n ?? 1;
    if (countInCol(grid, size, c, CELL_DARK) >= n) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'COL_EXACT_LIGHT')) {
    const n = getRuleParams(ruleMap, 'COL_EXACT_LIGHT').n ?? 1;
    if (countInCol(grid, size, c, CELL_LIGHT) >= n) return false;
  }
  // DARK_AREA_EXACT / LIGHT_AREA_EXACT
  if (val === CELL_DARK && hasRule(ruleMap, 'DARK_AREA_EXACT')) {
    const n = getRuleParams(ruleMap, 'DARK_AREA_EXACT').n ?? 0;
    if (countAll(grid, size, CELL_DARK) >= n) return false;
  }
  if (val === CELL_LIGHT && hasRule(ruleMap, 'LIGHT_AREA_EXACT')) {
    const n = getRuleParams(ruleMap, 'LIGHT_AREA_EXACT').n ?? 0;
    if (countAll(grid, size, CELL_LIGHT) >= n) return false;
  }
  // DARK_MAX_DEGREE
  if (val === CELL_DARK && hasRule(ruleMap, 'DARK_MAX_DEGREE')) {
    if (createsDarkBranch(grid, size, r, c)) return false;
  }
  return true;
}

function countInRow(grid, r, val) {
  let n = 0;
  for (let c = 0; c < grid[r].length; c++) if (grid[r][c] === val) n++;
  return n;
}
function countInCol(grid, size, c, val) {
  let n = 0;
  for (let r = 0; r < size; r++) if (grid[r][c] === val) n++;
  return n;
}
function countAll(grid, size, val) {
  let n = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c] === val) n++;
  return n;
}
function countOrthogonalNeighbors(grid, size, r, c, val) {
  let n = 0;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(size, nr, nc) && grid[nr][nc] === val) n++;
  }
  return n;
}

function countUnknownOrthogonalNeighbors(grid, size, r, c) {
  let n = 0;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_UNKNOWN) n++;
  }
  return n;
}

function isBorderCell(size, r, c) {
  return r === 0 || c === 0 || r === size - 1 || c === size - 1;
}

function creates2x2(grid, size, r, c, val) {
  const get = (pr, pc) => {
    if (!inBounds(size, pr, pc)) return -1;
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

function creates3InRow(grid, size, r, c, val) {
  const get = (pr, pc) => {
    if (!inBounds(size, pr, pc)) return -1;
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

function creates3Diagonal(grid, size, r, c, val) {
  const get = (pr, pc) => {
    if (!inBounds(size, pr, pc)) return -1;
    return (pr === r && pc === c) ? val : grid[pr][pc];
  };
  for (const [dr, dc] of DIAG_DIRS) {
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

function createsDarkBranch(grid, size, r, c) {
  const get = (pr, pc) => {
    if (!inBounds(size, pr, pc)) return -1;
    return (pr === r && pc === c) ? CELL_DARK : grid[pr][pc];
  };
  const cells = [[r, c]];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_DARK) cells.push([nr, nc]);
  }
  for (const [cr, cc] of cells) {
    let darkNeighbors = 0;
    for (const [dr, dc] of DIRS) {
      if (get(cr + dr, cc + dc) === CELL_DARK) darkNeighbors++;
    }
    if (darkNeighbors > 2) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Techniques de déduction
//
// Chaque technique reçoit (state) et retourne une liste de déductions :
//   [{ r, c, val, technique, level }]
// state est mutable mais les techniques ne modifient PAS la grille — c'est le
// moteur principal qui applique les déductions et invalide les caches.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TECH 1 — Naked Single
 * Si une cellule UNKNOWN n'a qu'une valeur localement valide → déduction.
 */
function techNakedSingle(state) {
  const { grid, size, ruleMap } = state;
  const out = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== CELL_UNKNOWN) continue;
      const okDark = isLocallyValid(grid, size, r, c, CELL_DARK, ruleMap);
      const okLight = isLocallyValid(grid, size, r, c, CELL_LIGHT, ruleMap);
      if (okDark && !okLight) out.push({ r, c, val: CELL_DARK, technique: 'NakedSingle', level: 1 });
      else if (!okDark && okLight) out.push({ r, c, val: CELL_LIGHT, technique: 'NakedSingle', level: 1 });
      else if (!okDark && !okLight) {
        // Contradiction : aucune valeur possible
        state.contradiction = true;
        return [];
      }
    }
  }
  return out;
}

/**
 * TECH — Symmetry Propagation
 * Si SYMMETRY_180 actif et que (sr,sc) est connue → (r,c) doit avoir la même valeur.
 * (En pratique déjà couvert par NakedSingle via isLocallyValid mais on le garde
 * pour pouvoir nommer la technique et faire de meilleurs hints.)
 */
function techSymmetry(state) {
  const { grid, size, ruleMap } = state;
  if (!hasRule(ruleMap, 'SYMMETRY_180')) return [];
  const out = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== CELL_UNKNOWN) continue;
      const sr = size - 1 - r, sc = size - 1 - c;
      if (sr === r && sc === c) continue;
      if (grid[sr][sc] !== CELL_UNKNOWN) {
        out.push({ r, c, val: grid[sr][sc], technique: 'SymmetryPropagation', level: 1 });
      }
    }
  }
  return out;
}

/**
 * TECH 2 — Row/Col Counting
 * Si ROW_EXACT_DARK = n et la ligne contient déjà n DARK → toutes les UNKNOWN restantes sont LIGHT.
 * Et si dark + unknown == n → toutes les UNKNOWN sont DARK.
 */
function techRowColCounting(state) {
  const { grid, size, ruleMap } = state;
  const out = [];

  const lineRules = [
    ['ROW_EXACT_DARK', CELL_DARK, 'row'],
    ['ROW_EXACT_LIGHT', CELL_LIGHT, 'row'],
    ['COL_EXACT_DARK', CELL_DARK, 'col'],
    ['COL_EXACT_LIGHT', CELL_LIGHT, 'col'],
  ];

  for (const [ruleId, color, axis] of lineRules) {
    if (!hasRule(ruleMap, ruleId)) continue;
    const n = getRuleParams(ruleMap, ruleId).n ?? 1;
    const otherColor = color === CELL_DARK ? CELL_LIGHT : CELL_DARK;

    for (let i = 0; i < size; i++) {
      const cells = [];
      for (let j = 0; j < size; j++) {
        const r = axis === 'row' ? i : j;
        const c = axis === 'row' ? j : i;
        cells.push([r, c, grid[r][c]]);
      }
      const colored = cells.filter(([, , v]) => v === color).length;
      const unknowns = cells.filter(([, , v]) => v === CELL_UNKNOWN);
      if (colored === n && unknowns.length > 0) {
        for (const [r, c] of unknowns) {
          out.push({ r, c, val: otherColor, technique: 'LineCount', level: 2 });
        }
      } else if (colored + unknowns.length === n && unknowns.length > 0) {
        for (const [r, c] of unknowns) {
          out.push({ r, c, val: color, technique: 'LineCount', level: 2 });
        }
      } else if (colored > n) {
        state.contradiction = true;
        return [];
      }
    }
  }
  return out;
}

/**
 * TECH 2 — Area Counting (DARK_AREA_EXACT, LIGHT_AREA_EXACT)
 */
function techAreaCounting(state) {
  const { grid, size, ruleMap } = state;
  const out = [];
  const areaRules = [
    ['DARK_AREA_EXACT', CELL_DARK],
    ['LIGHT_AREA_EXACT', CELL_LIGHT],
  ];
  for (const [ruleId, color] of areaRules) {
    if (!hasRule(ruleMap, ruleId)) continue;
    const n = getRuleParams(ruleMap, ruleId).n ?? 0;
    const other = color === CELL_DARK ? CELL_LIGHT : CELL_DARK;
    const colored = countAll(grid, size, color);
    const unknowns = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === CELL_UNKNOWN) unknowns.push([r, c]);
    if (colored === n && unknowns.length > 0) {
      for (const [r, c] of unknowns) out.push({ r, c, val: other, technique: 'AreaCount', level: 2 });
    } else if (colored + unknowns.length === n && unknowns.length > 0) {
      for (const [r, c] of unknowns) out.push({ r, c, val: color, technique: 'AreaCount', level: 2 });
    } else if (colored > n) {
      state.contradiction = true;
      return [];
    }
  }
  return out;
}

/**
 * TECH 2 — Dark Neighborhood
 * Déductions locales pour les règles "sombres en groupe" :
 * - NO_ISOLATED_DARK : une sombre sans voisin sombre et avec un seul voisin UNKNOWN force ce voisin en DARK.
 * - DARK_MAX_DEGREE : une sombre avec déjà deux voisins sombres force ses autres voisins UNKNOWN en LIGHT.
 */
function techDarkNeighborhood(state) {
  const { grid, size, ruleMap } = state;
  const out = [];

  if (hasRule(ruleMap, 'NO_ISOLATED_DARK')) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== CELL_DARK) continue;
        if (countOrthogonalNeighbors(grid, size, r, c, CELL_DARK) > 0) continue;
        const unknowns = [];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_UNKNOWN) unknowns.push([nr, nc]);
        }
        if (unknowns.length === 0) { state.contradiction = true; return []; }
        if (unknowns.length === 1) {
          out.push({ r: unknowns[0][0], c: unknowns[0][1], val: CELL_DARK, technique: 'DarkNeighbor', level: 2 });
        }
      }
    }
  }

  if (hasRule(ruleMap, 'DARK_MAX_DEGREE')) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== CELL_DARK) continue;
        const darkNeighbors = countOrthogonalNeighbors(grid, size, r, c, CELL_DARK);
        if (darkNeighbors > 2) { state.contradiction = true; return []; }
        if (darkNeighbors !== 2) continue;
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_UNKNOWN) {
            out.push({ r: nr, c: nc, val: CELL_LIGHT, technique: 'DarkMaxDegree', level: 2 });
          }
        }
      }
    }
  }

  return out;
}

/**
 * TECH 3 — Region Size Cap (DARK_REGION_SIZE / LIGHT_REGION_SIZE)
 *
 * - Si une région DARK de taille = n est complète, toutes ses cellules UNKNOWN
 *   adjacentes deviennent LIGHT (frontière forcée).
 * - Si une région DARK de taille < n n'a aucune cellule UNKNOWN adjacente,
 *   contradiction.
 * - Si une région DARK de taille = n - 1 et possède une seule cellule UNKNOWN
 *   adjacente, cette cellule devient DARK.
 */
function techRegionSize(state) {
  const { grid, size, ruleMap } = state;
  const out = [];
  const regionRules = [
    ['DARK_REGION_SIZE', CELL_DARK],
    ['LIGHT_REGION_SIZE', CELL_LIGHT],
  ];
  for (const [ruleId, color] of regionRules) {
    if (!hasRule(ruleMap, ruleId)) continue;
    const n = getRuleParams(ruleMap, ruleId).n ?? 1;
    const other = color === CELL_DARK ? CELL_LIGHT : CELL_DARK;
    const components = getComponents(grid, size, [color]);
    for (const comp of components) {
      if (comp.length > n) { state.contradiction = true; return []; }

      // Cellules UNKNOWN frontalières de cette région
      const frontier = new Set();
      for (const [r, c] of comp) {
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_UNKNOWN) {
            frontier.add(`${nr},${nc}`);
          }
        }
      }

      if (comp.length === n) {
        // Région complète → frontière = autre couleur
        for (const key of frontier) {
          const [r, c] = key.split(',').map(Number);
          out.push({ r, c, val: other, technique: 'RegionSizeCap', level: 3 });
        }
      } else if (comp.length < n) {
        if (frontier.size === 0) { state.contradiction = true; return []; }
        const need = n - comp.length;
        if (frontier.size === need) {
          // Tous les voisins UNKNOWN doivent devenir `color` pour atteindre n
          for (const key of frontier) {
            const [r, c] = key.split(',').map(Number);
            out.push({ r, c, val: color, technique: 'RegionSizeFloor', level: 3 });
          }
        }
      }
    }
  }
  return out;
}

/**
 * TECH 4 — No-Pattern (NO_PATTERN_DARK / NO_PATTERN_LIGHT)
 *
 * Pour chaque placement de pattern qui est presque complet (toutes les cellules
 * sauf une sont déjà de la couleur, la dernière est UNKNOWN), cette cellule
 * doit prendre l'autre couleur.
 *
 * Implémenté en réutilisant NAMED_PATTERNS via la règle existante.
 */
function techNoPattern(state) {
  const { grid, size, ruleMap } = state;
  const out = [];

  const patternRules = [
    ['NO_PATTERN_DARK', CELL_DARK],
    ['NO_PATTERN_LIGHT', CELL_LIGHT],
  ];

  // Lazy import pour éviter les cycles
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NAMED_PATTERNS } = state.modules;

  for (const [ruleId, color] of patternRules) {
    if (!hasRule(ruleMap, ruleId)) continue;
    const params = getRuleParams(ruleMap, ruleId);
    const variants = NAMED_PATTERNS[params.patternName] ?? NAMED_PATTERNS.L_TROMINO;
    const other = color === CELL_DARK ? CELL_LIGHT : CELL_DARK;

    for (const pattern of variants) {
      const maxR = Math.max(...pattern.map(([r]) => r));
      const maxC = Math.max(...pattern.map(([, c]) => c));
      for (let dr = 0; dr + maxR < size; dr++) {
        for (let dc = 0; dc + maxC < size; dc++) {
          let coloredCount = 0;
          let unknownCell = null;
          let badCount = 0;
          for (const [pr, pc] of pattern) {
            const v = grid[dr + pr][dc + pc];
            if (v === color) coloredCount++;
            else if (v === CELL_UNKNOWN) unknownCell = [dr + pr, dc + pc];
            else badCount++;
          }
          if (badCount > 0) continue;
          if (coloredCount === pattern.length) {
            state.contradiction = true; return [];
          }
          if (coloredCount === pattern.length - 1 && unknownCell) {
            out.push({
              r: unknownCell[0], c: unknownCell[1], val: other,
              technique: 'PatternAvoidance', level: 4,
            });
          }
        }
      }
    }
  }
  return out;
}

/**
 * TECH 4 — Stripe Constraint (NURIBOU_STRIPES)
 *
 * Une région DARK doit être en ligne (1×N ou N×1).
 * Si placer DARK à (r,c) brise la rectitude d'une région voisine → cette cellule doit être LIGHT.
 * (Capturé partiellement par NakedSingle via isLocallyValid, mais on le réécrit ici pour
 *  pouvoir le nommer comme technique distincte au niveau du logging.)
 */
function techStripe(state) {
  const { grid, size, ruleMap } = state;
  if (!hasRule(ruleMap, 'NURIBOU_STRIPES')) return [];
  const out = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== CELL_UNKNOWN) continue;
      // Test: si on plaçait DARK ici, créerait-on un L ?
      const darkNbrRows = new Set(), darkNbrCols = new Set();
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_DARK) {
          darkNbrRows.add(nr);
          darkNbrCols.add(nc);
        }
      }
      if (darkNbrRows.size > 0 && darkNbrCols.size > 0) {
        const allRows = new Set([r, ...darkNbrRows]);
        const allCols = new Set([c, ...darkNbrCols]);
        if (allRows.size > 1 && allCols.size > 1) {
          out.push({ r, c, val: CELL_LIGHT, technique: 'StripeConstraint', level: 4 });
        }
      }
    }
  }
  return out;
}

/**
 * TECH 4 — Dark Region Count
 * Si le nombre de composantes atteignables (DARK + UNKNOWN) est exactement n,
 * chaque composante sans DARK doit contenir au moins une future région sombre.
 * Quand une telle composante n'a qu'une cellule UNKNOWN, elle devient DARK.
 */
function techDarkRegionCount(state) {
  const { grid, size, ruleMap } = state;
  if (!hasRule(ruleMap, 'DARK_REGION_COUNT_EXACT')) return [];
  const n = getRuleParams(ruleMap, 'DARK_REGION_COUNT_EXACT').n ?? 1;
  const out = [];
  const reachable = getComponents(grid, size, [CELL_DARK, CELL_UNKNOWN]);
  const darkReachableComps = reachable.filter(comp => comp.some(([r, c]) => grid[r][c] === CELL_DARK));
  const unknownOnlyComps = reachable.filter(comp => !comp.some(([r, c]) => grid[r][c] === CELL_DARK));
  const unknowns = [];
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === CELL_UNKNOWN) unknowns.push([r, c]);
      if (grid[r][c] === CELL_DARK) darkCount++;
    }
  }

  if (darkReachableComps.length > n || darkCount + unknowns.length < n) {
    state.contradiction = true;
    return [];
  }

  if (darkReachableComps.length === n) {
    for (const comp of unknownOnlyComps) {
      for (const [r, c] of comp) {
        if (grid[r][c] === CELL_UNKNOWN) out.push({ r, c, val: CELL_LIGHT, technique: 'DarkRegionCount', level: 4 });
      }
    }
  }

  return out;
}

/**
 * TECH 4 — Dark Region Border
 * Une région sombre qui ne touche pas encore le bord doit garder un chemin
 * possible vers celui-ci. Si une région n'a qu'une cellule frontière UNKNOWN
 * dans ce sous-graphe, elle est forcée sombre.
 */
function techDarkBorder(state) {
  const { grid, size, ruleMap } = state;
  if (!hasRule(ruleMap, 'DARK_REGIONS_TOUCH_BORDER')) return [];
  const out = [];
  const reachable = getComponents(grid, size, [CELL_DARK, CELL_UNKNOWN]);

  for (const comp of reachable) {
    const darks = comp.filter(([r, c]) => grid[r][c] === CELL_DARK);
    if (darks.length === 0) continue;
    if (comp.some(([r, c]) => isBorderCell(size, r, c))) continue;
    state.contradiction = true;
    return [];
  }

  for (const comp of getComponents(grid, size, [CELL_DARK])) {
    if (comp.some(([r, c]) => isBorderCell(size, r, c))) continue;
    const frontier = new Set();
    for (const [r, c] of comp) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(size, nr, nc) && grid[nr][nc] === CELL_UNKNOWN) frontier.add(`${nr},${nc}`);
      }
    }
    if (frontier.size === 0) { state.contradiction = true; return []; }
    if (frontier.size === 1) {
      const [key] = frontier;
      const [r, c] = key.split(',').map(Number);
      out.push({ r, c, val: CELL_DARK, technique: 'DarkBorder', level: 4 });
    }
  }

  return out;
}

/**
 * TECH 5 — Reachability (CONNECT_LIGHT / CONNECT_DARK)
 *
 * Pour CONNECT_LIGHT : toutes les cellules LIGHT doivent former un seul groupe
 * connecté (en passant par d'autres LIGHT). Une cellule UNKNOWN qui ne peut
 * atteindre aucune cellule LIGHT existante (via un chemin LIGHT+UNKNOWN) ne
 * peut pas elle-même devenir LIGHT — sauf si AUCUNE LIGHT n'existe encore.
 *
 * Plus subtil : si toutes les LIGHT existantes sont dans une seule "île" et
 * qu'une cellule UNKNOWN est isolée par des DARK → elle doit être DARK.
 */
function techReachability(state) {
  const { grid, size, ruleMap } = state;
  const out = [];

  const connRules = [
    ['CONNECT_LIGHT', CELL_LIGHT],
    ['CONNECT_DARK', CELL_DARK],
  ];

  for (const [ruleId, color] of connRules) {
    if (!hasRule(ruleMap, ruleId)) continue;
    const other = color === CELL_DARK ? CELL_LIGHT : CELL_DARK;

    // Composants color-only existants
    const colorComps = getComponents(grid, size, [color]);
    if (colorComps.length === 0) continue;

    // Composants atteignables (color + unknown)
    const reachableComps = getComponents(grid, size, [color, CELL_UNKNOWN]);

    // Trouver les composants atteignables qui contiennent au moins une cellule color
    const validComps = reachableComps.filter(comp =>
      comp.some(([r, c]) => grid[r][c] === color)
    );

    // S'il existe au moins un composant atteignable contenant TOUTES les cellules color
    // → toutes les autres cellules UNKNOWN dans des composants sans color doivent être `other`
    const totalColored = colorComps.reduce((s, c) => s + c.length, 0);

    // Si plusieurs composants atteignables contiennent des color → contradiction (déjà splitté)
    if (validComps.length > 1) {
      state.contradiction = true;
      return [];
    }

    if (validComps.length === 1) {
      const validSet = new Set(validComps[0].map(([r, c]) => `${r},${c}`));
      const containedColored = validComps[0].filter(([r, c]) => grid[r][c] === color).length;
      if (containedColored < totalColored) {
        // Les cellules color ne sont pas toutes dans un seul composant atteignable
        state.contradiction = true;
        return [];
      }

      // Toute cellule UNKNOWN hors de ce composant doit être `other`
      for (const comp of reachableComps) {
        for (const [r, c] of comp) {
          if (grid[r][c] === CELL_UNKNOWN && !validSet.has(`${r},${c}`)) {
            out.push({ r, c, val: other, technique: 'Reachability', level: 5 });
          }
        }
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TECH 5 — Articulation Point Forcing (CONNECT_LIGHT / CONNECT_DARK)
 *
 * Si le retrait d'une cellule UNKNOWN du sous-graphe (color ∪ unknown) empêche
 * une cellule color d'être reliée aux autres → cette UNKNOWN doit être color.
 */
function techArticulation(state) {
  const { grid, size, ruleMap } = state;
  const out = [];

  const connRules = [
    ['CONNECT_LIGHT', CELL_LIGHT],
    ['CONNECT_DARK', CELL_DARK],
  ];

  for (const [ruleId, color] of connRules) {
    if (!hasRule(ruleMap, ruleId)) continue;

    const colorCells = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === color) colorCells.push([r, c]);

    if (colorCells.length < 2) continue;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== CELL_UNKNOWN) continue;

        // BFS depuis colorCells[0] dans (color ∪ unknown) en évitant (r,c)
        const seen = new Uint8Array(size * size);
        const stack = [colorCells[0]];
        seen[colorCells[0][0] * size + colorCells[0][1]] = 1;
        let foundColor = 1;
        while (stack.length) {
          const [cr, cc] = stack.pop();
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr, nc = cc + dc;
            if (!inBounds(size, nr, nc)) continue;
            if (nr === r && nc === c) continue;
            const idx = nr * size + nc;
            if (seen[idx]) continue;
            const v = grid[nr][nc];
            if (v !== color && v !== CELL_UNKNOWN) continue;
            seen[idx] = 1;
            if (v === color) foundColor++;
            stack.push([nr, nc]);
          }
        }

        if (foundColor < colorCells.length) {
          out.push({ r, c, val: color, technique: 'ArticulationPoint', level: 5 });
        }
      }
    }
  }
  return out;
}

/**
 * TECH 5 — Bounded Hypothesis (frontier cells only)
 *
 * Pour chaque UNKNOWN adjacente à au moins une cellule connue, tester DARK et
 * LIGHT et propager via solveWithoutHypothesis (sans hypothèse récursive).
 * Si l'une mène à une contradiction → l'autre forcée.
 */
function techBoundedHypothesis(state) {
  if (state.insideHypothesis) return []; // évite récursion infinie
  const { grid, size, rules, modules } = state;
  const out = [];
  const opts = { _rulesModule: modules, allowHypothesis: false, recordSteps: false, insideHypothesis: true };

  const frontiers = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== CELL_UNKNOWN) continue;
      let hasKnownNb = false;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(size, nr, nc) && grid[nr][nc] !== CELL_UNKNOWN) {
          hasKnownNb = true;
          break;
        }
      }
      if (hasKnownNb) frontiers.push([r, c]);
    }
  }

  for (const [r, c] of frontiers) {
    if (grid[r][c] !== CELL_UNKNOWN) continue;

    grid[r][c] = CELL_DARK;
    const resD = solveWithoutHypothesis(grid, size, rules, opts);
    grid[r][c] = CELL_UNKNOWN;

    grid[r][c] = CELL_LIGHT;
    const resL = solveWithoutHypothesis(grid, size, rules, opts);
    grid[r][c] = CELL_UNKNOWN;

    if (!resD.consistent && !resL.consistent) {
      state.contradiction = true;
      return [];
    }
    if (!resD.consistent) {
      out.push({ r, c, val: CELL_LIGHT, technique: 'BoundedHypothesis', level: 5 });
      return out; // s'arrêter dès la première déduction pour relancer le pipeline
    }
    if (!resL.consistent) {
      out.push({ r, c, val: CELL_DARK, technique: 'BoundedHypothesis', level: 5 });
      return out;
    }
  }

  return out;
}

const TECHNIQUES = [
  techNakedSingle,         // 1
  techSymmetry,            // 1
  techRowColCounting,      // 2
  techAreaCounting,        // 2
  techDarkNeighborhood,    // 2
  techRegionSize,          // 3
  techStripe,              // 4
  techNoPattern,           // 4
  techDarkRegionCount,     // 4
  techDarkBorder,          // 4
  techReachability,        // 5
  techArticulation,        // 5
  techBoundedHypothesis,   // 5  (toujours niveau 5, mais plus coûteux : appelé en dernier)
];

/**
 * Applique une déduction et retourne true si la grille a changé.
 * Vérifie aussi qu'on n'écrase pas une valeur conflictuelle.
 */
function applyDeduction(state, deduction) {
  const { r, c, val } = deduction;
  if (state.grid[r][c] === val) return false;
  if (state.grid[r][c] !== CELL_UNKNOWN) {
    state.contradiction = true;
    return false;
  }
  state.grid[r][c] = val;
  state.deductionSteps++;
  state.techniquesUsed.add(deduction.technique);
  if (deduction.level > state.maxLevel) state.maxLevel = deduction.level;
  if (state.stepLog) state.stepLog.push(deduction);
  return true;
}

/**
 * Détermine si la grille est entièrement remplie.
 */
function isComplete(grid, size) {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === CELL_UNKNOWN) return false;
  return true;
}

/**
 * Solveur logique principal (sans hypothèse).
 * Boucle : applique les techniques jusqu'à n'avoir plus de déduction.
 */
function solveWithoutHypothesis(initialGrid, size, rules, options = {}) {
  // Lazy import circulaire
  const rulesModule = options._rulesModule;
  const state = {
    grid: cloneGrid(initialGrid),
    size,
    ruleMap: buildRuleMap(rules),
    rules,
    techniquesUsed: new Set(),
    maxLevel: 0,
    deductionSteps: 0,
    contradiction: false,
    stepLog: options.recordSteps ? [] : null,
    modules: { NAMED_PATTERNS: rulesModule?.NAMED_PATTERNS },
    insideHypothesis: !!options.insideHypothesis,
  };

  let progress = true;
  while (progress && !state.contradiction) {
    progress = false;
    for (const tech of TECHNIQUES) {
      const deductions = tech(state);
      if (state.contradiction) break;
      for (const d of deductions) {
        if (applyDeduction(state, d)) progress = true;
        if (state.contradiction) break;
      }
      if (progress) break; // recommencer depuis la technique de plus bas niveau
    }
  }

  // Vérifier la cohérence finale via les checkPartial existants
  if (!state.contradiction) {
    if (!checkAllPartialRules(state.grid, size, rules)) {
      state.contradiction = true;
    }
  }

  const solved = !state.contradiction && isComplete(state.grid, size)
    && checkAllRules(state.grid, size, rules);

  return {
    solved,
    consistent: !state.contradiction,
    grid: state.grid,
    techniquesUsed: state.techniquesUsed,
    maxLevel: state.maxLevel,
    deductionSteps: state.deductionSteps,
    stepLog: state.stepLog,
  };
}

/**
 * TECH 6 — Hypothetical (Trial depth-1)
 * Pour chaque cellule UNKNOWN, essaie DARK puis LIGHT et propage logiquement
 * sans hypothèse. Si l'une des deux mène à une contradiction → l'autre est forcée.
 *
 * C'est coûteux mais permet de résoudre des puzzles avancés.
 */
function tryHypothetical(initialGrid, size, rules, options = {}) {
  const out = [];
  const grid = cloneGrid(initialGrid);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== CELL_UNKNOWN) continue;

      let darkOk = true, lightOk = true;

      // Essai DARK
      grid[r][c] = CELL_DARK;
      const resD = solveWithoutHypothesis(grid, size, rules, options);
      if (!resD.consistent) darkOk = false;
      grid[r][c] = CELL_UNKNOWN;

      // Essai LIGHT
      grid[r][c] = CELL_LIGHT;
      const resL = solveWithoutHypothesis(grid, size, rules, options);
      if (!resL.consistent) lightOk = false;
      grid[r][c] = CELL_UNKNOWN;

      if (!darkOk && !lightOk) return { contradiction: true, deductions: [] };
      if (!darkOk) out.push({ r, c, val: CELL_LIGHT, technique: 'Hypothetical', level: 6 });
      else if (!lightOk) out.push({ r, c, val: CELL_DARK, technique: 'Hypothetical', level: 6 });
    }
  }
  return { contradiction: false, deductions: out };
}

/**
 * Solveur logique complet (avec hypothèse depth-1 si demandé).
 *
 * @param {number[][]} initialGrid
 * @param {number} size
 * @param {Array} rules
 * @param {Object} options
 *   - allowHypothesis: boolean (default true)  : utiliser le niveau 6
 *   - maxHypothesisRounds: number (default 3)  : limite d'itérations hypothesis
 *   - recordSteps: boolean (default false)     : log détaillé des déductions
 *   - _rulesModule: { NAMED_PATTERNS }         : injecté pour éviter les cycles
 * @returns {Object} résultat (voir entête fichier)
 */
export function logicalSolve(initialGrid, size, rules, options = {}) {
  const opts = {
    allowHypothesis: true,
    maxHypothesisRounds: 3,
    recordSteps: false,
    ...options,
  };

  // Boucle externe : on alterne déduction pure + hypothèse
  let current = cloneGrid(initialGrid);
  const allTechniques = new Set();
  let maxLevel = 0;
  let totalSteps = 0;
  const stepLog = opts.recordSteps ? [] : null;

  for (let round = 0; round < opts.maxHypothesisRounds + 1; round++) {
    const result = solveWithoutHypothesis(current, size, rules, opts);
    for (const t of result.techniquesUsed) allTechniques.add(t);
    if (result.maxLevel > maxLevel) maxLevel = result.maxLevel;
    totalSteps += result.deductionSteps;
    if (stepLog && result.stepLog) stepLog.push(...result.stepLog);
    current = result.grid;

    if (!result.consistent) {
      return {
        solved: false,
        consistent: false,
        grid: current,
        techniquesUsed: allTechniques,
        maxLevel,
        deductionSteps: totalSteps,
        stepLog,
      };
    }
    if (result.solved) {
      return {
        solved: true,
        consistent: true,
        grid: current,
        techniquesUsed: allTechniques,
        maxLevel,
        deductionSteps: totalSteps,
        stepLog,
      };
    }

    if (!opts.allowHypothesis) break;

    // Tentative hypothèse
    const hyp = tryHypothetical(current, size, rules, opts);
    if (hyp.contradiction) {
      return {
        solved: false,
        consistent: false,
        grid: current,
        techniquesUsed: allTechniques,
        maxLevel,
        deductionSteps: totalSteps,
        stepLog,
      };
    }
    if (hyp.deductions.length === 0) break; // aucune progression possible
    for (const d of hyp.deductions) {
      if (current[d.r][d.c] === CELL_UNKNOWN) {
        current[d.r][d.c] = d.val;
        totalSteps++;
        allTechniques.add(d.technique);
        if (d.level > maxLevel) maxLevel = d.level;
        if (stepLog) stepLog.push(d);
      }
    }
  }

  return {
    solved: isComplete(current, size) && checkAllRules(current, size, rules),
    consistent: true,
    grid: current,
    techniquesUsed: allTechniques,
    maxLevel,
    deductionSteps: totalSteps,
    stepLog,
  };
}

/**
 * Helper : retourne true si le puzzle est résoluble par logique pure.
 */
export function isLogicallySolvable(initialGrid, size, rules, options = {}) {
  const res = logicalSolve(initialGrid, size, rules, options);
  return res.solved;
}

/**
 * Helper : score de difficulté à partir d'un résultat de logicalSolve.
 *   - level 1-2 : ~5
 *   - level 3   : ~15
 *   - level 4   : ~30
 *   - level 5   : ~50
 *   - level 6   : ~80
 *   + bonus pour le nombre de techniques distinctes utilisées et le nombre de déductions.
 */
export function scoreDifficulty(result) {
  if (!result.solved) return null;
  const base = { 1: 5, 2: 8, 3: 15, 4: 30, 5: 50, 6: 80 }[result.maxLevel] || 0;
  const techBonus = (result.techniquesUsed.size - 1) * 3;
  const stepBonus = Math.log2(result.deductionSteps + 1);
  return Math.round(base + techBonus + stepBonus);
}
