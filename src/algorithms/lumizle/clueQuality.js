/**
 * Lumizle - Qualité des indices initiaux.
 *
 * Un puzzle peut être valide techniquement mais peu intéressant si les indices
 * sombres ne forcent aucune décision. Ces helpers gardent des ancres sombres
 * utiles, notamment pour DARK_REGION_SIZE où une région déjà entièrement
 * révélée ne crée pas de déduction.
 */

import {
  CELL_UNKNOWN,
  CELL_DARK,
  CELL_LIGHT,
  checkAllRules,
} from './rules.js';

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

export function countClues(grid) {
  return grid.reduce((sum, row) => sum + row.filter(v => v !== CELL_UNKNOWN).length, 0);
}

function countFixedDarkClues(grid) {
  return grid.reduce((sum, row) => sum + row.filter(v => v === CELL_DARK).length, 0);
}

function getRule(rules, id) {
  return rules.find(rule => rule.id === id) || null;
}

function hasRule(rules, id) {
  return !!getRule(rules, id);
}

function getDarkRegionTarget(rules) {
  const rule = getRule(rules, 'DARK_REGION_SIZE');
  return rule ? (rule.params?.n ?? 2) : null;
}

function getDarkRegions(solution, size) {
  const visited = new Set();
  const regions = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = r * size + c;
      if (visited.has(key) || solution[r][c] !== CELL_DARK) continue;

      const cells = [];
      const queue = [[r, c]];
      visited.add(key);

      while (queue.length > 0) {
        const [cr, cc] = queue.shift();
        cells.push([cr, cc]);

        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          const nk = nr * size + nc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (visited.has(nk) || solution[nr][nc] !== CELL_DARK) continue;
          visited.add(nk);
          queue.push([nr, nc]);
        }
      }

      regions.push(cells);
    }
  }

  return regions;
}

function buildAllUnknownsAsLight(initialGrid) {
  return initialGrid.map(row => row.map(v => v === CELL_UNKNOWN ? CELL_LIGHT : v));
}

function buildAllUnknownsAsDark(initialGrid) {
  return initialGrid.map(row => row.map(v => v === CELL_UNKNOWN ? CELL_DARK : v));
}

function getRegionStats(initialGrid, darkRegions) {
  return darkRegions.map((cells, index) => {
    const fixedCells = cells.filter(([r, c]) => initialGrid[r][c] === CELL_DARK);
    return {
      index,
      cells,
      size: cells.length,
      fixedCount: fixedCells.length,
      fixedCells,
      unknownCells: cells.filter(([r, c]) => initialGrid[r][c] === CELL_UNKNOWN),
    };
  });
}

function defaultMinFixedDarkClues(size, darkRegions, rules) {
  const totalDark = darkRegions.reduce((sum, region) => sum + region.length, 0);
  if (totalDark === 0) return 0;

  if (getDarkRegionTarget(rules)) {
    return Math.min(darkRegions.length, Math.max(2, Math.ceil(size / 2)));
  }

  if (hasRule(rules, 'CONNECT_DARK')) {
    return Math.min(totalDark, 2);
  }

  return 1;
}

function hasDarkFocusedRule(rules) {
  return rules.some(rule => (
    rule.id === 'CONNECT_DARK' ||
    rule.id === 'DARK_AREA_EXACT' ||
    rule.id === 'DARK_REGION_COUNT_EXACT' ||
    rule.id === 'NO_ISOLATED_DARK' ||
    rule.id === 'DARK_MAX_DEGREE' ||
    rule.id === 'DARK_REGIONS_TOUCH_BORDER' ||
    rule.id === 'ROW_EXACT_DARK' ||
    rule.id === 'COL_EXACT_DARK' ||
    rule.id === 'NO_PATTERN_DARK'
  ));
}

function hasLightFocusedRule(rules) {
  return rules.some(rule => (
    rule.id === 'CONNECT_LIGHT' ||
    rule.id === 'LIGHT_AREA_EXACT' ||
    rule.id === 'LIGHT_REGION_SIZE' ||
    rule.id === 'ROW_EXACT_LIGHT' ||
    rule.id === 'COL_EXACT_LIGHT' ||
    rule.id === 'NO_PATTERN_LIGHT' ||
    rule.id === 'NO_2X2_LIGHT' ||
    rule.id === 'NO_3_IN_A_ROW_LIGHT' ||
    rule.id === 'NO_3_DIAGONAL_LIGHT'
  ));
}

function defaultMinOpenDarkRegions(size, darkRegions, rules) {
  if (!getDarkRegionTarget(rules)) return 0;
  return Math.min(darkRegions.length, Math.max(2, Math.ceil(size / 2)));
}

function defaultMaxCompleteDarkRegions(rules) {
  return getDarkRegionTarget(rules) ? 0 : Infinity;
}

function resolveQualityOptions(size, darkRegions, rules, options = {}) {
  const darkRegionTarget = getDarkRegionTarget(rules);
  return {
    darkRegionTarget,
    minFixedDarkClues: options.minFixedDarkClues ?? defaultMinFixedDarkClues(size, darkRegions, rules),
    minOpenDarkRegions: options.minOpenDarkRegions ?? defaultMinOpenDarkRegions(size, darkRegions, rules),
    maxCompleteDarkRegions: options.maxCompleteDarkRegions ?? defaultMaxCompleteDarkRegions(rules),
    requireAllLightInvalid: options.requireAllLightInvalid ?? (!!darkRegionTarget || hasDarkFocusedRule(rules)),
    requireAllDarkInvalid: options.requireAllDarkInvalid ?? hasLightFocusedRule(rules),
    maxRepairSteps: options.maxRepairSteps ?? Math.max(20, size * size),
  };
}

export function evaluateClueQuality(initialGrid, solution, size, rules, options = {}) {
  const darkRegions = getDarkRegions(solution, size);
  const resolved = resolveQualityOptions(size, darkRegions, rules, options);
  const regionStats = getRegionStats(initialGrid, darkRegions);
  const fixedDarkClues = countFixedDarkClues(initialGrid);
  const openDarkRegions = regionStats.filter(stat => stat.fixedCount > 0 && stat.fixedCount < stat.size).length;
  const completeDarkRegions = regionStats.filter(stat => stat.fixedCount === stat.size && stat.size > 0).length;
  const allUnknownsAsLightValid = checkAllRules(buildAllUnknownsAsLight(initialGrid), size, rules);
  const allUnknownsAsDarkValid = checkAllRules(buildAllUnknownsAsDark(initialGrid), size, rules);

  const issues = [];
  if (fixedDarkClues < resolved.minFixedDarkClues) issues.push('missing-dark-clues');
  if (openDarkRegions < resolved.minOpenDarkRegions) issues.push('missing-open-dark-regions');
  if (completeDarkRegions > resolved.maxCompleteDarkRegions) issues.push('complete-dark-regions');
  if (resolved.requireAllLightInvalid && allUnknownsAsLightValid) issues.push('all-unknowns-as-light-valid');
  if (resolved.requireAllDarkInvalid && allUnknownsAsDarkValid) issues.push('all-unknowns-as-dark-valid');

  return {
    isValid: issues.length === 0,
    issues,
    fixedDarkClues,
    openDarkRegions,
    completeDarkRegions,
    allUnknownsAsLightValid,
    allUnknownsAsDarkValid,
    requireAllLightInvalid: resolved.requireAllLightInvalid,
    requireAllDarkInvalid: resolved.requireAllDarkInvalid,
    darkRegionCount: darkRegions.length,
    darkRegions,
    regionStats,
    options: resolved,
  };
}

function addLightAnchor(grid, solution, rng) {
  const candidates = [];
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      if (solution[r][c] === CELL_LIGHT && grid[r][c] === CELL_UNKNOWN) candidates.push([r, c]);
    }
  }

  const cell = pickRandom(rng, candidates);
  if (!cell) return false;

  grid[cell[0]][cell[1]] = CELL_LIGHT;
  return true;
}

function pickRandom(rng, items) {
  if (items.length === 0) return null;
  return items[Math.floor(rng.random() * items.length)];
}

function addDarkAnchor(grid, metrics, rng) {
  const target = getDarkRegionTargetFromMetrics(metrics);
  const candidates = metrics.regionStats.filter(stat => {
    if (stat.unknownCells.length === 0) return false;
    if (!target) return true;
    return stat.fixedCount < Math.min(stat.size - 1, target - 1);
  });

  const emptyRegions = candidates.filter(stat => stat.fixedCount === 0);
  const stat = pickRandom(rng, emptyRegions.length > 0 ? emptyRegions : candidates);
  if (!stat) return false;

  const cell = pickRandom(rng, stat.unknownCells);
  if (!cell) return false;

  grid[cell[0]][cell[1]] = CELL_DARK;
  return true;
}

function getDarkRegionTargetFromMetrics(metrics) {
  return metrics.options.darkRegionTarget;
}

function trimCompleteDarkRegion(grid, metrics, rng) {
  const complete = metrics.regionStats.filter(stat => stat.fixedCount === stat.size && stat.size > 0);
  if (complete.length <= metrics.options.maxCompleteDarkRegions) return false;

  const stat = pickRandom(rng, complete);
  if (!stat) return false;
  const cell = pickRandom(rng, stat.fixedCells);
  if (!cell) return false;

  grid[cell[0]][cell[1]] = CELL_UNKNOWN;
  return true;
}

/**
 * Tente de réparer une grille d'indices sans toucher à la solution.
 * Retourne null si le puzzle reste trivial ou pauvre après réparation.
 */
export function ensureClueQuality(initialGrid, solution, size, rules, rng, options = {}) {
  const grid = cloneGrid(initialGrid);
  let metrics = evaluateClueQuality(grid, solution, size, rules, options);

  for (let step = 0; step < metrics.options.maxRepairSteps && !metrics.isValid; step++) {
    let changed = false;

    if (metrics.completeDarkRegions > metrics.options.maxCompleteDarkRegions) {
      changed = trimCompleteDarkRegion(grid, metrics, rng);
    } else if (
      metrics.fixedDarkClues < metrics.options.minFixedDarkClues ||
      metrics.openDarkRegions < metrics.options.minOpenDarkRegions ||
      metrics.allUnknownsAsLightValid
    ) {
      changed = addDarkAnchor(grid, metrics, rng);
    } else if (metrics.allUnknownsAsDarkValid) {
      changed = addLightAnchor(grid, solution, rng);
    }

    if (!changed) break;
    metrics = evaluateClueQuality(grid, solution, size, rules, options);
  }

  return metrics.isValid ? { initialGrid: grid, metrics } : null;
}
