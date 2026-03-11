/**
 * Lumizle - Générateur de puzzles (v3 — RSG Bicolore)
 *
 * Phase 1 : Génère une solution complète valide par Randomized Spanning Growth.
 *   - Deux germes (un sombre, un clair) sont plantés aléatoirement.
 *   - Chaque région croît vers ses voisins non encore colorés, alternativement,
 *     selon un ratio cible (minLightRatio/maxLightRatio).
 *   - Les contraintes locales (NO_2X2, NO_3_IN_A_ROW) sont vérifiées en O(1)
 *     avant chaque placement.
 *   - Les règles de connexité (CONNECT_DARK, CONNECT_LIGHT) sont garanties
 *     par construction : une région ne peut croître qu'à partir de ses propres
 *     cellules, et les cellules "orphelines" sont gérées en fin de boucle.
 *
 * Phase 2 : Minimise les indices (identique à v1).
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
  checkAllPartialRules,
} from './rules.js';
import { SeededRandom } from '../../utils/seededRandom.js';

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// ─────────────────────────────────────────────────────────────────────────────
// Vérificateurs locaux O(1)
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

function buildRuleIds(rules) {
  const ruleIds = new Set(rules.map(r => r.id));
  for (const { id, params } of rules) {
    if (id === 'ROW_EXACT_DARK' && params?.n != null) ruleIds._rowExactDark = params.n;
    if (id === 'ROW_EXACT_LIGHT' && params?.n != null) ruleIds._rowExactLight = params.n;
    if (id === 'COL_EXACT_DARK' && params?.n != null) ruleIds._colExactDark = params.n;
    if (id === 'COL_EXACT_LIGHT' && params?.n != null) ruleIds._colExactLight = params.n;
  }
  return ruleIds;
}

function canPlace(grid, size, r, c, val, ruleIds) {
  if (grid[r][c] !== CELL_UNKNOWN) return false;
  if (creates2x2(grid, size, r, c, val, ruleIds)) return false;
  if (creates3InRow(grid, size, r, c, val, ruleIds)) return false;

  // SYMMETRY_180: la cellule symétrique doit être libre ou de même valeur
  if (ruleIds.has('SYMMETRY_180')) {
    const sr = size - 1 - r, sc = size - 1 - c;
    if ((sr !== r || sc !== c) && grid[sr][sc] !== CELL_UNKNOWN && grid[sr][sc] !== val) return false;
  }

  // ROW_EXACT_DARK / ROW_EXACT_LIGHT
  if (val === CELL_DARK && ruleIds.has('ROW_EXACT_DARK')) {
    const n = ruleIds._rowExactDark ?? 1;
    if (grid[r].filter(v => v === CELL_DARK).length >= n) return false;
  }
  if (val === CELL_LIGHT && ruleIds.has('ROW_EXACT_LIGHT')) {
    const n = ruleIds._rowExactLight ?? 1;
    if (grid[r].filter(v => v === CELL_LIGHT).length >= n) return false;
  }

  // COL_EXACT_DARK / COL_EXACT_LIGHT
  if (val === CELL_DARK && ruleIds.has('COL_EXACT_DARK')) {
    const n = ruleIds._colExactDark ?? 1;
    if (grid.reduce((s, row) => s + (row[c] === CELL_DARK ? 1 : 0), 0) >= n) return false;
  }
  if (val === CELL_LIGHT && ruleIds.has('COL_EXACT_LIGHT')) {
    const n = ruleIds._colExactLight ?? 1;
    if (grid.reduce((s, row) => s + (row[c] === CELL_LIGHT ? 1 : 0), 0) >= n) return false;
  }

  // NURIBOU_STRIPES
  if (val === CELL_DARK && ruleIds.has('NURIBOU_STRIPES')) {
    const darkNbrRows = new Set(), darkNbrCols = new Set();
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === CELL_DARK) {
        darkNbrRows.add(nr); darkNbrCols.add(nc);
      }
    }
    if (darkNbrRows.size > 0 && darkNbrCols.size > 0) {
      const allRows = new Set([r, ...darkNbrRows]);
      const allCols = new Set([c, ...darkNbrCols]);
      if (allRows.size > 1 && allCols.size > 1) return false;
    }
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Règles incompatibles avec RSG → nécessitent le générateur BT
// ─────────────────────────────────────────────────────────────────────────────

const BT_REQUIRED_RULES = new Set([
  'DARK_REGION_SIZE',
  'LIGHT_REGION_SIZE',
  'ROW_EXACT_DARK',
  'ROW_EXACT_LIGHT',
  'COL_EXACT_DARK',
  'COL_EXACT_LIGHT',
  'NURIBOU_STRIPES',
]); import { findSolution } from './solver.js';

/**
 * Génère une solution valide pour les règles incompatibles avec RSG.
 * Utilise des algorithmes de "Rejet Sampling" (Monte Carlo) avec générateurs dédiés.
 *
 * @param {SeededRandom} rng
 * @param {number}       size
 * @param {Array}        rules
 * @param {number}       minLightRatio
 * @param {number}       maxLightRatio
 * @param {number}       maxRestarts
 * @returns {number[][]|null}
 */
/**
 * Génère une solution au puzzle en utilisant l'approche Tiny-Seed + MRV.
 * On place 1 à 3 graines aléatoires pour casser le déterminisme de l'arbre
 * puis on laisse le solveur (ultra-rapide, non-shufflé) finir le travail.
 */
function generateSolutionProcedural(rng, size, rules, minLightRatio = 0.35, maxLightRatio = 0.65, maxRestarts = 500) {
  const total = size * size;
  const ruleIds = buildRuleIds(rules);

  for (let restart = 0; restart < maxRestarts; restart++) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(CELL_UNKNOWN));

    // On place 0 cellules pour l'instant (1 graine rend la grille NP-difficile aléatoirement)
    const numSeeds = 0;
    let validSeeds = true;
    for (let i = 0; i < numSeeds; i++) {
      const r = rng.randomInt(0, size);
      const c = rng.randomInt(0, size);
      const val = rng.random() < 0.5 ? CELL_DARK : CELL_LIGHT;
      if (grid[r][c] === CELL_UNKNOWN && canPlace(grid, size, r, c, val, ruleIds)) {
        grid[r][c] = val;
      } else {
        validSeeds = false; break;
      }
    }
    if (!validSeeds) continue;

    // Le solveur sans 'rng' utilise l'heuristique MRV complète et hyper-rapide
    const solution = findSolution(grid, size, rules);

    if (solution) {
      // On s'assure juste que le ratio de lumière est acceptable
      const lightCount = solution.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
      const rat = lightCount / total;
      if (rat >= minLightRatio && rat <= maxLightRatio) {
        return solution;
      }
    }
  }

  return null;
}


// ─────────────────────────────────────────────────────────────────────────────
// Phase 1-RSG : Croissance Bicolore (original)
// ─────────────────────────────────────────────────────────────────────────────

function generateSolutionRSG(
  rng,
  size,
  rules,
  minLightRatio = 0.35,
  maxLightRatio = 0.65,
  maxAttempts = 1000,
) {
  const total = size * size;
  const ruleIds = buildRuleIds(rules);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(CELL_UNKNOWN));

    // ── Choisir deux germes aléatoires distincts ──────────────────────────
    const a = rng.randomInt(0, total);
    let b = rng.randomInt(0, total - 1);
    if (b >= a) b++;

    // Germe clair = a, germe sombre = b
    const lr = Math.floor(a / size), lc = a % size;
    const dr = Math.floor(b / size), dc = b % size;

    // Placer les germes (impossible si contrainte locale violée)
    if (!canPlace(grid, size, lr, lc, CELL_LIGHT, ruleIds)) continue;
    grid[lr][lc] = CELL_LIGHT;
    if (!canPlace(grid, size, dr, dc, CELL_DARK, ruleIds)) { grid[lr][lc] = CELL_UNKNOWN; continue; }
    grid[dr][dc] = CELL_DARK;

    // ── Frontières des deux régions ───────────────────────────────────────
    const lightFrontier = new Set(); // voisins UNKNOWN adjacents au groupe clair
    const darkFrontier = new Set(); // voisins UNKNOWN adjacents au groupe sombre

    const addNeighbors = (r, c, frontier) => {
      for (const [ddr, ddc] of DIRS) {
        const nr = r + ddr, nc = c + ddc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === CELL_UNKNOWN)
          frontier.add(nr * size + nc);
      }
    };

    addNeighbors(lr, lc, lightFrontier);
    addNeighbors(dr, dc, darkFrontier);

    // ── Compteurs pour respecter le ratio ─────────────────────────────────
    let lightCount = 1, darkCount = 1;
    let remaining = total - 2;
    let ok = true;

    while (remaining > 0) {
      // Décider quelle couleur étendre en fonction du ratio courant
      const currentRatio = lightCount / (lightCount + darkCount);
      let frontier, val;

      if (lightFrontier.size > 0 && darkFrontier.size > 0) {
        // Favoriser la couleur "en retard" pour équilibrer
        const wantLight = currentRatio < (minLightRatio + maxLightRatio) / 2;
        if (wantLight) { frontier = lightFrontier; val = CELL_LIGHT; }
        else { frontier = darkFrontier; val = CELL_DARK; }
        // Un peu d'aléatoire pour varier les formes
        if (rng.random() < 0.35) {
          if (val === CELL_LIGHT) { frontier = darkFrontier; val = CELL_DARK; }
          else { frontier = lightFrontier; val = CELL_LIGHT; }
        }
      } else if (lightFrontier.size > 0) {
        frontier = lightFrontier; val = CELL_LIGHT;
      } else if (darkFrontier.size > 0) {
        frontier = darkFrontier; val = CELL_DARK;
      } else {
        // Plus aucune frontière — des cellules sont orphelines.
        // C'est une impasse : on restarte cette tentative.
        ok = false; break;
      }



      // Essayer de placer une cellule depuis la frontière choisie
      const candidates = [...frontier].filter(idx => grid[Math.floor(idx / size)][idx % size] === CELL_UNKNOWN);
      rng.shuffle(candidates);

      let placedOne = false;
      for (const idx of candidates) {
        const r = Math.floor(idx / size), c = idx % size;
        if (grid[r][c] !== CELL_UNKNOWN) { frontier.delete(idx); continue; }

        if (canPlace(grid, size, r, c, val, ruleIds)) {
          grid[r][c] = val;
          lightFrontier.delete(idx);
          darkFrontier.delete(idx);
          addNeighbors(r, c, frontier);
          if (val === CELL_LIGHT) lightCount++; else darkCount++;
          remaining--;
          placedOne = true;
          break;
        } else {
          // Bloqué pour cette couleur : retirer de cette frontière
          // mais ajouter à l'autre frontière (l'autre couleur peut peut-être la prendre).
          frontier.delete(idx);
          const otherFrontier = (val === CELL_LIGHT) ? darkFrontier : lightFrontier;
          otherFrontier.add(idx);
        }
      }

      // Si la frontière est épuisée (tous les candidats ont été traités), la vider proprement.
      if (!placedOne) {
        const cleanFrontier = [...frontier].filter(idx => grid[Math.floor(idx / size)][idx % size] === CELL_UNKNOWN);
        if (cleanFrontier.length === 0) frontier.clear();
      }
    }

    if (!ok) continue;

    // ── Vérification finale ───────────────────────────────────────────────
    const finalLight = grid.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
    const ratio = finalLight / total;
    if (ratio < minLightRatio || ratio > maxLightRatio) continue;

    if (!checkAllRules(grid, size, rules)) continue;

    return grid;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 : Dispatch RSG ou BT selon les règles (API publique)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère une solution complète valide.
 * Choisit automatiquement RSG (rapide) ou BT (compatible toutes règles).
 */
export function generateSolution(rng, size, rules, minLightRatio = 0.35, maxLightRatio = 0.65, maxAttempts = 1000) {
  const needsProcedural = rules.some(r => BT_REQUIRED_RULES.has(r.id));
  if (needsProcedural) return generateSolutionProcedural(rng, size, rules, minLightRatio, maxLightRatio, 30000);
  return generateSolutionRSG(rng, size, rules, minLightRatio, maxLightRatio, maxAttempts);
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 : Sélection aléatoire des indices (remplace minimizeClues)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sélectionne aléatoirement un sous-ensemble de cellules de la solution
 * à révéler comme indices initiaux.
 *
 * Le jeu n'exigeant plus d'unicité, on révèle simplement ~clueRatio%
 * des cellules de façon déterministe (seed) depuis la solution.
 *
 * @param {number[][]} solution    - Grille solution complète
 * @param {number}     size
 * @param {SeededRandom} rng
 * @param {number}     clueRatio  - Proportion de cellules révélées (0.0 – 1.0)
 * @returns {number[][]}           Grille avec UNKNOWN là où le joueur joue
 */
export function selectClues(solution, size, rng, clueRatio = 0.35) {
  const grid = solution.map(row => [...row]);
  const total = size * size;

  // Construire une liste de toutes les cellules et la mélanger aléatoirement
  const allCells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      allCells.push([r, c]);

  const shuffled = rng.shuffle(allCells);

  // Nombre de cellules à révéler
  const clueCount = Math.max(3, Math.round(total * clueRatio));

  // Mettre les cellules non-révélées à UNKNOWN
  const hiddenCount = total - clueCount;
  const toHide = shuffled.slice(0, hiddenCount); // les N premières seront cachées

  for (const [r, c] of toHide) {
    grid[r][c] = CELL_UNKNOWN;
  }

  return grid;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline complet
// ─────────────────────────────────────────────────────────────────────────────

export function generatePuzzle(seed, config = {}) {
  const {
    size = 7,
    rules = [{ id: 'CONNECT_LIGHT' }],
    minLightRatio = 0.35,
    maxLightRatio = 0.65,
    clueRatio = 0.35, // proportion des cellules révélées (indices)
  } = config;

  const rng = new SeededRandom(`${seed}_lumizle`);
  const t0 = Date.now();

  // ── Phase 1 : solution ──────────────────────────────────────────────────
  const solution = generateSolution(rng, size, rules, minLightRatio, maxLightRatio);
  if (!solution) {
    throw new Error(`Lumizle: impossible de générer une solution (size=${size})`);
  }
  const t1 = Date.now();

  // ── Phase 2 : sélection aléatoire des indices ─────────────────────────
  const initialGrid = selectClues(solution, size, rng, clueRatio);
  const t2 = Date.now();

  const clueCount = initialGrid.reduce((s, row) => s + row.filter(v => v !== CELL_UNKNOWN).length, 0);
  const lightCount = solution.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
  const darkCount = size * size - lightCount;

  return {
    initialGrid,
    solution,
    rules,
    metadata: {
      seed: String(seed),
      gridSize: size,
      clueCount,
      lightCount,
      darkCount,
      totalCells: size * size,
      solutionTime: t1 - t0,
      selectionTime: t2 - t1,
      generationTime: t2 - t0,
      isUnique: false, // non vérifié, pas nécessaire
    },
  };
}
