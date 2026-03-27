/**
 * Lumizle - Moteur de règles
 *
 * Valeurs des cellules :
 *   0 = CELL_UNKNOWN  (non décidée)
 *   1 = CELL_DARK     (noire)
 *   2 = CELL_LIGHT    (blanche)
 *
 * Chaque règle expose :
 *   id              : identifiant unique
 *   name            : nom court (FR)
 *   description     : texte complet (FR)
 *   icon            : emoji représentatif
 *   previewSolution : grille 3×3 illustrant la règle (1=sombre, 2=clair)
 *   check(grid, size)            → boolean  (grille complète)
 *   checkPartial(grid, size)     → boolean  (false = violation définitive, prune le backtracking)
 *   getViolatingCells(grid, size)→ Set<string> ("r,c" des cellules en violation)
 */

export const CELL_UNKNOWN = 0;
export const CELL_DARK = 1;
export const CELL_LIGHT = 2;

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// ---------------------------------------------------------------------------
// Helpers BFS
// ---------------------------------------------------------------------------

/**
 * BFS depuis (sr, sc) en traversant les cellules dont la valeur est dans cellValues.
 * Marque les cellules visitées dans `visited` (clés = r*size+c).
 * Retourne la liste des cellules du composant.
 */
function bfsComponent(grid, size, sr, sc, cellValues, visited) {
  const component = [];
  const queue = [[sr, sc]];
  visited.add(sr * size + sc);
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    component.push([r, c]);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const nk = nr * size + nc;
      if (visited.has(nk)) continue;
      if (cellValues.includes(grid[nr][nc])) {
        visited.add(nk);
        queue.push([nr, nc]);
      }
    }
  }
  return component;
}

/** Retourne tous les composants connexes pour les cellules de valeur dans cellValues. */
function getComponents(grid, size, cellValues) {
  const visited = new Set();
  const components = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const k = r * size + c;
      if (!visited.has(k) && cellValues.includes(grid[r][c])) {
        components.push(bfsComponent(grid, size, r, c, cellValues, visited));
      }
    }
  }
  return components;
}

// ---------------------------------------------------------------------------
// Règle : CONNECT_LIGHT - toutes les cellules claires forment un seul groupe
// ---------------------------------------------------------------------------
const CONNECT_LIGHT = {
  id: 'CONNECT_LIGHT',
  name: 'Connecter les cellules claires',
  description: 'Toutes les cellules claires doivent former un seul groupe connecté',
  icon: '🔆',
  // Exemple 3×3 (clair = 2, sombre = 1) illustrant la règle respectée
  previewSolution: [
    [1, 2, 2],
    [1, 1, 2],
    [2, 2, 1],
  ],

  /** Validation complète (aucun CELL_UNKNOWN dans la grille). */
  check(grid, size) {
    const components = getComponents(grid, size, [CELL_LIGHT]);
    return components.length <= 1; // 0 clair = acceptable (pas de violation)
  },

  /**
   * Vérification partielle pour le pruning du solveur.
   * Retourne false si deux cellules claires sont définitivement isolées
   * (pas de chemin clair+inconnu entre elles).
   */
  checkPartial(grid, size) {
    // Composants en traversant clair + inconnu
    const reachable = getComponents(grid, size, [CELL_LIGHT, CELL_UNKNOWN]);
    // Groupes qui contiennent au moins une cellule claire
    const lightGroups = reachable.filter(comp =>
      comp.some(([r, c]) => grid[r][c] === CELL_LIGHT)
    );
    if (lightGroups.length > 1) return false;

    // Additional prune: isolate check for LIGHT
    const lightOnlyComponents = getComponents(grid, size, [CELL_LIGHT]);
    for (const comp of lightOnlyComponents) {
      const hasUnknownNeighbor = comp.some(([r, c]) =>
        DIRS.some(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          return nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === CELL_UNKNOWN;
        })
      );
      if (!hasUnknownNeighbor) {
        const totalLight = grid.reduce((s, row) => s + row.filter(v => v === CELL_LIGHT).length, 0);
        if (comp.length < totalLight) return false;
      }
    }
    return true;
  },

  /**
   * Retourne le Set des clés "r,c" des cellules claires en violation.
   * Une violation est détectée quand il existe ≥ 2 groupes de cellules claires
   * qui ne peuvent plus se rejoindre même via des cellules inconnues.
   */
  getViolatingCells(grid, size) {
    const reachable = getComponents(grid, size, [CELL_LIGHT, CELL_UNKNOWN]);

    // Pour chaque composant "atteignable", récupérer les cellules claires
    const lightGroups = [];
    for (const comp of reachable) {
      const lights = comp.filter(([r, c]) => grid[r][c] === CELL_LIGHT);
      if (lights.length > 0) lightGroups.push(lights);
    }

    if (lightGroups.length <= 1) return new Set();

    // Plusieurs groupes isolés → highlight les groupes minoritaires
    const maxSize = Math.max(...lightGroups.map(g => g.length));
    const violating = new Set();

    for (const group of lightGroups) {
      if (group.length < maxSize) {
        for (const [r, c] of group) violating.add(`${r},${c}`);
      }
    }

    // Si tous les groupes ont la même taille (ambiguïté totale) → tout highlight
    if (violating.size === 0) {
      for (const group of lightGroups) {
        for (const [r, c] of group) violating.add(`${r},${c}`);
      }
    }

    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : CONNECT_DARK - toutes les cellules sombres forment un seul groupe
// ---------------------------------------------------------------------------
const CONNECT_DARK = {
  id: 'CONNECT_DARK',
  name: 'Connecter les cellules sombres',
  description: 'Toutes les cellules sombres doivent former un seul groupe connecté',
  icon: '🔗',
  // Exemple 3×3 (clair = 2, sombre = 1) illustrant la règle respectée
  previewSolution: [
    [2, 1, 1],
    [2, 2, 1],
    [1, 1, 2],
  ],

  check(grid, size) {
    const components = getComponents(grid, size, [CELL_DARK]);
    return components.length <= 1; // 0 sombre = acceptable
  },

  checkPartial(grid, size) {
    const reachable = getComponents(grid, size, [CELL_DARK, CELL_UNKNOWN]);
    const darkGroups = reachable.filter(comp =>
      comp.some(([r, c]) => grid[r][c] === CELL_DARK)
    );
    if (darkGroups.length > 1) return false;

    // Additional prune: if there's a dark component completely surrounded by LIGHT or edges,
    // and there are other dark cells elsewhere, it can never connect.
    const darkOnlyComponents = getComponents(grid, size, [CELL_DARK]);
    for (const comp of darkOnlyComponents) {
      const hasUnknownNeighbor = comp.some(([r, c]) =>
        DIRS.some(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          return nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === CELL_UNKNOWN;
        })
      );
      // If a dark group has no unknown neighbors, it can't grow.
      // If there are other dark cells in the grid, it's a permanent split.
      if (!hasUnknownNeighbor) {
        const totalDark = grid.reduce((s, row) => s + row.filter(v => v === CELL_DARK).length, 0);
        if (comp.length < totalDark) return false;
      }
    }
    return true;
  },

  getViolatingCells(grid, size) {
    const reachable = getComponents(grid, size, [CELL_DARK, CELL_UNKNOWN]);

    const darkGroups = [];
    for (const comp of reachable) {
      const darks = comp.filter(([r, c]) => grid[r][c] === CELL_DARK);
      if (darks.length > 0) darkGroups.push(darks);
    }

    if (darkGroups.length <= 1) return new Set();

    const maxSize = Math.max(...darkGroups.map(g => g.length));
    const violating = new Set();

    for (const group of darkGroups) {
      if (group.length < maxSize) {
        for (const [r, c] of group) violating.add(`${r},${c}`);
      }
    }

    if (violating.size === 0) {
      for (const group of darkGroups) {
        for (const [r, c] of group) violating.add(`${r},${c}`);
      }
    }

    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : DARK_REGION_SIZE - chaque groupe sombre a exactement N cellules
// ---------------------------------------------------------------------------
const DARK_REGION_SIZE = {
  id: 'DARK_REGION_SIZE',
  name: 'Taille des régions sombres',
  description: 'Chaque groupe de cellules sombres doit contenir exactement {n} cellules',
  icon: '⬛',
  previewSolution: [
    [2, 1, 2],
    [2, 1, 2],
    [2, 2, 2],
  ],

  check(grid, size, params = { n: 2 }) {
    const components = getComponents(grid, size, [CELL_DARK]);
    return components.every(c => c.length === params.n);
  },

  checkPartial(grid, size, params = { n: 2 }) {
    const components = getComponents(grid, size, [CELL_DARK]);
    // Un composant purement sombre (sans voisin inconnu) ne peut plus grandir
    for (const comp of components) {
      if (comp.length > params.n) return false; // Déjà trop grand
      if (comp.length === params.n) {
        // Vérifie que tous les voisins sont sombres ou de la bonne taille
        // (si un voisin est inconnu, le groupe pourrait encore grandir)
        const hasUnknownNeighbor = comp.some(([r, c]) =>
          DIRS.some(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            return nr >= 0 && nr < size && nc >= 0 && nc < size
              && grid[nr][nc] === CELL_UNKNOWN;
          })
        );
        // OK : si pas de voisin inconnu, la taille est exactement n ✓
        // On ne peut pas prouver de violation ici sans plus de contexte
        void hasUnknownNeighbor;
      }
    }
    return true;
  },

  getViolatingCells(grid, size, params = { n: 2 }) {
    const components = getComponents(grid, size, [CELL_DARK]);
    const violating = new Set();
    for (const comp of components) {
      // Violant si le groupe dépasse n ET n'a plus de voisin inconnu pour se "séparer"
      if (comp.length > params.n) {
        for (const [r, c] of comp) violating.add(`${r},${c}`);
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_2X2_DARK - pas de carré 2×2 sombre
// ---------------------------------------------------------------------------
const NO_2X2_DARK = {
  id: 'NO_2X2_DARK',
  name: 'Pas de carré 2×2 sombre',
  description: 'Aucun carré 2×2 ne peut être entièrement sombre',
  icon: '🔲',
  previewSolution: [
    [1, 2, 1],
    [2, 1, 2],
    [1, 2, 1],
  ],

  check(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]];
        if (vals.every(v => v === CELL_DARK)) {
          return false;
        }
      }
    }
    return true;
  },

  checkPartial(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]];
        if (vals.every(v => v !== CELL_UNKNOWN)) {
          if (vals.every(v => v === CELL_DARK)) {
            return false;
          }
        }
      }
    }
    return true;
  },

  getViolatingCells(grid, size) {
    const violating = new Set();
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const cells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
        const vals = cells.map(([cr, cc]) => grid[cr][cc]);
        if (vals.every(v => v === CELL_DARK)) {
          for (const [cr, cc] of cells) violating.add(`${cr},${cc}`);
        }
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_2X2_LIGHT - pas de carré 2×2 clair
// ---------------------------------------------------------------------------
const NO_2X2_LIGHT = {
  id: 'NO_2X2_LIGHT',
  name: 'Pas de carré 2×2 clair',
  description: 'Aucun carré 2×2 ne peut être entièrement clair',
  icon: '🔳',
  previewSolution: [
    [2, 1, 2],
    [1, 2, 1],
    [2, 1, 2],
  ],

  check(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]];
        if (vals.every(v => v === CELL_LIGHT)) {
          return false;
        }
      }
    }
    return true;
  },

  checkPartial(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]];
        if (vals.every(v => v !== CELL_UNKNOWN)) {
          if (vals.every(v => v === CELL_LIGHT)) {
            return false;
          }
        }
      }
    }
    return true;
  },

  getViolatingCells(grid, size) {
    const violating = new Set();
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const cells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
        const vals = cells.map(([cr, cc]) => grid[cr][cc]);
        if (vals.every(v => v === CELL_LIGHT)) {
          for (const [cr, cc] of cells) violating.add(`${cr},${cc}`);
        }
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_3_IN_A_ROW_DARK - pas de ligne de 3 cellules sombres
// ---------------------------------------------------------------------------
const NO_3_IN_A_ROW_DARK = {
  id: 'NO_3_IN_A_ROW_DARK',
  name: 'Max 2 sombres alignées',
  description: 'Pas de 3 cellules sombres consécutives horizontalement ou verticalement',
  icon: '➖',
  previewSolution: [
    [1, 1, 2],
    [2, 2, 1],
    [1, 2, 1],
  ],

  check(grid, size) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c <= size - 3 && grid[r][c] === CELL_DARK && grid[r][c + 1] === CELL_DARK && grid[r][c + 2] === CELL_DARK) return false;
        if (r <= size - 3 && grid[r][c] === CELL_DARK && grid[r + 1][c] === CELL_DARK && grid[r + 2][c] === CELL_DARK) return false;
      }
    }
    return true;
  },

  checkPartial(grid, size) {
    return this.check(grid, size); // Same logic as unknown doesn't trigger violation
  },

  getViolatingCells(grid, size) {
    const violating = new Set();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c <= size - 3 && grid[r][c] === CELL_DARK && grid[r][c + 1] === CELL_DARK && grid[r][c + 2] === CELL_DARK) {
          violating.add(`${r},${c}`); violating.add(`${r},${c + 1}`); violating.add(`${r},${c + 2}`);
        }
        if (r <= size - 3 && grid[r][c] === CELL_DARK && grid[r + 1][c] === CELL_DARK && grid[r + 2][c] === CELL_DARK) {
          violating.add(`${r},${c}`); violating.add(`${r + 1},${c}`); violating.add(`${r + 2},${c}`);
        }
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_3_IN_A_ROW_LIGHT - pas de ligne de 3 cellules claires
// ---------------------------------------------------------------------------
const NO_3_IN_A_ROW_LIGHT = {
  id: 'NO_3_IN_A_ROW_LIGHT',
  name: 'Max 2 claires alignées',
  description: 'Pas de 3 cellules claires consécutives horizontalement ou verticalement',
  icon: '➕',
  previewSolution: [
    [2, 2, 1],
    [1, 1, 2],
    [2, 1, 2],
  ],

  check(grid, size) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c <= size - 3 && grid[r][c] === CELL_LIGHT && grid[r][c + 1] === CELL_LIGHT && grid[r][c + 2] === CELL_LIGHT) return false;
        if (r <= size - 3 && grid[r][c] === CELL_LIGHT && grid[r + 1][c] === CELL_LIGHT && grid[r + 2][c] === CELL_LIGHT) return false;
      }
    }
    return true;
  },

  checkPartial(grid, size) {
    return this.check(grid, size);
  },

  getViolatingCells(grid, size) {
    const violating = new Set();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c <= size - 3 && grid[r][c] === CELL_LIGHT && grid[r][c + 1] === CELL_LIGHT && grid[r][c + 2] === CELL_LIGHT) {
          violating.add(`${r},${c}`); violating.add(`${r},${c + 1}`); violating.add(`${r},${c + 2}`);
        }
        if (r <= size - 3 && grid[r][c] === CELL_LIGHT && grid[r + 1][c] === CELL_LIGHT && grid[r + 2][c] === CELL_LIGHT) {
          violating.add(`${r},${c}`); violating.add(`${r + 1},${c}`); violating.add(`${r + 2},${c}`);
        }
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Helpers - rotations de patterns pour NO_PATTERN_*
// ---------------------------------------------------------------------------

function rotate90(pattern) {
  const rotated = pattern.map(([r, c]) => [c, -r]);
  const minR = Math.min(...rotated.map(([r]) => r));
  const minC = Math.min(...rotated.map(([, c]) => c));
  return rotated.map(([r, c]) => [r - minR, c - minC]);
}

function getAllRotationVariants(basePattern) {
  const variants = [];
  const seen = new Set();
  let p = basePattern;
  for (let i = 0; i < 4; i++) {
    const key = p.map(pt => pt.join(',')).sort().join(';');
    if (!seen.has(key)) { seen.add(key); variants.push(p); }
    p = rotate90(p);
  }
  return variants;
}

// Patterns disponibles (toutes rotations incluses)
export const NAMED_PATTERNS = {
  L_TROMINO: getAllRotationVariants([[0, 0], [1, 0], [1, 1]]),
  T_TETROMINO: getAllRotationVariants([[0, 0], [0, 1], [0, 2], [1, 1]]),
  S_TETROMINO: getAllRotationVariants([[0, 1], [0, 2], [1, 0], [1, 1]]),
  PLUS: [[[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]],
};

function gridHasPattern(grid, size, cellVal, patternVariants) {
  for (const pattern of patternVariants) {
    const maxR = Math.max(...pattern.map(([r]) => r));
    const maxC = Math.max(...pattern.map(([, c]) => c));
    for (let dr = 0; dr + maxR < size; dr++) {
      for (let dc = 0; dc + maxC < size; dc++) {
        if (pattern.every(([r, c]) => grid[dr + r][dc + c] === cellVal)) return true;
      }
    }
  }
  return false;
}

function getPatternViolations(grid, size, cellVal, patternVariants) {
  const violating = new Set();
  for (const pattern of patternVariants) {
    const maxR = Math.max(...pattern.map(([r]) => r));
    const maxC = Math.max(...pattern.map(([, c]) => c));
    for (let dr = 0; dr + maxR < size; dr++) {
      for (let dc = 0; dc + maxC < size; dc++) {
        if (pattern.every(([r, c]) => grid[dr + r][dc + c] === cellVal)) {
          for (const [r, c] of pattern) violating.add(`${dr + r},${dc + c}`);
        }
      }
    }
  }
  return violating;
}

// ---------------------------------------------------------------------------
// Règle : LIGHT_REGION_SIZE - chaque région claire a exactement n cellules
// ---------------------------------------------------------------------------
const LIGHT_REGION_SIZE = {
  id: 'LIGHT_REGION_SIZE',
  name: 'Taille des régions claires',
  description: 'Chaque groupe de cellules claires doit contenir exactement {n} cellules',
  icon: '🔳',
  previewSolution: [[1, 2, 1], [1, 2, 1], [1, 1, 1]],

  check(grid, size, params = { n: 2 }) {
    return getComponents(grid, size, [CELL_LIGHT]).every(c => c.length === params.n);
  },
  checkPartial(grid, size, params = { n: 2 }) {
    return getComponents(grid, size, [CELL_LIGHT]).every(c => c.length <= params.n);
  },
  getViolatingCells(grid, size, params = { n: 2 }) {
    const v = new Set();
    for (const comp of getComponents(grid, size, [CELL_LIGHT])) {
      if (comp.length > params.n) for (const [r, c] of comp) v.add(`${r},${c}`);
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : DARK_AREA_EXACT - total de cellules sombres = exactement n
// ---------------------------------------------------------------------------
const DARK_AREA_EXACT = {
  id: 'DARK_AREA_EXACT',
  name: 'Total de cellules sombres exact',
  description: 'Le nombre total de cellules sombres doit être exactement {n}',
  icon: '🔢',
  previewSolution: [[1, 2, 1], [2, 2, 2], [1, 2, 1]],

  check(grid, size, params = { n: 4 }) {
    return grid.flat().filter(v => v === CELL_DARK).length === params.n;
  },
  checkPartial(grid, size, params = { n: 4 }) {
    const flat = grid.flat();
    const dark = flat.filter(v => v === CELL_DARK).length;
    const unknown = flat.filter(v => v === CELL_UNKNOWN).length;
    return dark <= params.n && dark + unknown >= params.n;
  },
  getViolatingCells(grid, size, params = { n: 4 }) {
    const dark = grid.flat().filter(v => v === CELL_DARK).length;
    if (dark === params.n) return new Set();
    const v = new Set();
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === CELL_DARK) v.add(`${r},${c}`);
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : LIGHT_AREA_EXACT - total de cellules claires = exactement n
// ---------------------------------------------------------------------------
const LIGHT_AREA_EXACT = {
  id: 'LIGHT_AREA_EXACT',
  name: 'Total de cellules claires exact',
  description: 'Le nombre total de cellules claires doit être exactement {n}',
  icon: '🔡',
  previewSolution: [[2, 1, 2], [1, 1, 1], [2, 1, 2]],

  check(grid, size, params = { n: 4 }) {
    return grid.flat().filter(v => v === CELL_LIGHT).length === params.n;
  },
  checkPartial(grid, size, params = { n: 4 }) {
    const flat = grid.flat();
    const light = flat.filter(v => v === CELL_LIGHT).length;
    const unknown = flat.filter(v => v === CELL_UNKNOWN).length;
    return light <= params.n && light + unknown >= params.n;
  },
  getViolatingCells(grid, size, params = { n: 4 }) {
    const light = grid.flat().filter(v => v === CELL_LIGHT).length;
    if (light === params.n) return new Set();
    const v = new Set();
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === CELL_LIGHT) v.add(`${r},${c}`);
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : ROW_EXACT_DARK - exactement n cellules sombres par ligne
// ---------------------------------------------------------------------------
const ROW_EXACT_DARK = {
  id: 'ROW_EXACT_DARK',
  name: 'Exactement {n} sombre(s) par ligne',
  description: 'Chaque ligne doit contenir exactement {n} cellule(s) sombre(s)',
  icon: '↔️',
  previewSolution: [[2, 1, 2], [1, 2, 1], [2, 1, 2]],

  check(grid, size, params = { n: 1 }) {
    return grid.every(row => row.filter(v => v === CELL_DARK).length === params.n);
  },
  checkPartial(grid, size, params = { n: 1 }) {
    return grid.every(row => {
      const dark = row.filter(v => v === CELL_DARK).length;
      const unknown = row.filter(v => v === CELL_UNKNOWN).length;
      return dark <= params.n && dark + unknown >= params.n;
    });
  },
  getViolatingCells(grid, size, params = { n: 1 }) {
    const v = new Set();
    for (let r = 0; r < size; r++) {
      const dark = grid[r].filter(x => x === CELL_DARK).length;
      const unknown = grid[r].filter(x => x === CELL_UNKNOWN).length;
      if (dark > params.n || (unknown === 0 && dark !== params.n)) {
        for (let c = 0; c < size; c++)
          if (grid[r][c] === CELL_DARK) v.add(`${r},${c}`);
      }
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : ROW_EXACT_LIGHT - exactement n cellules claires par ligne
// ---------------------------------------------------------------------------
const ROW_EXACT_LIGHT = {
  id: 'ROW_EXACT_LIGHT',
  name: 'Exactement {n} clair(es) par ligne',
  description: 'Chaque ligne doit contenir exactement {n} cellule(s) claire(s)',
  icon: '↔',
  previewSolution: [[1, 2, 1], [2, 1, 2], [1, 2, 1]],

  check(grid, size, params = { n: 1 }) {
    return grid.every(row => row.filter(v => v === CELL_LIGHT).length === params.n);
  },
  checkPartial(grid, size, params = { n: 1 }) {
    return grid.every(row => {
      const light = row.filter(v => v === CELL_LIGHT).length;
      const unknown = row.filter(v => v === CELL_UNKNOWN).length;
      return light <= params.n && light + unknown >= params.n;
    });
  },
  getViolatingCells(grid, size, params = { n: 1 }) {
    const v = new Set();
    for (let r = 0; r < size; r++) {
      const light = grid[r].filter(x => x === CELL_LIGHT).length;
      const unknown = grid[r].filter(x => x === CELL_UNKNOWN).length;
      if (light > params.n || (unknown === 0 && light !== params.n)) {
        for (let c = 0; c < size; c++)
          if (grid[r][c] === CELL_LIGHT) v.add(`${r},${c}`);
      }
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : COL_EXACT_DARK - exactement n cellules sombres par colonne
// ---------------------------------------------------------------------------
const COL_EXACT_DARK = {
  id: 'COL_EXACT_DARK',
  name: 'Exactement {n} sombre(s) par colonne',
  description: 'Chaque colonne doit contenir exactement {n} cellule(s) sombre(s)',
  icon: '↕️',
  previewSolution: [[1, 2, 1], [2, 1, 2], [1, 2, 1]],

  check(grid, size, params = { n: 1 }) {
    for (let c = 0; c < size; c++) {
      if (grid.filter((_, r) => grid[r][c] === CELL_DARK).length !== params.n) return false;
    }
    return true;
  },
  checkPartial(grid, size, params = { n: 1 }) {
    for (let c = 0; c < size; c++) {
      const dark = grid.reduce((s, row) => s + (row[c] === CELL_DARK ? 1 : 0), 0);
      const unknown = grid.reduce((s, row) => s + (row[c] === CELL_UNKNOWN ? 1 : 0), 0);
      if (dark > params.n || dark + unknown < params.n) return false;
    }
    return true;
  },
  getViolatingCells(grid, size, params = { n: 1 }) {
    const v = new Set();
    for (let c = 0; c < size; c++) {
      const dark = grid.reduce((s, row) => s + (row[c] === CELL_DARK ? 1 : 0), 0);
      const unknown = grid.reduce((s, row) => s + (row[c] === CELL_UNKNOWN ? 1 : 0), 0);
      if (dark > params.n || (unknown === 0 && dark !== params.n)) {
        for (let r = 0; r < size; r++)
          if (grid[r][c] === CELL_DARK) v.add(`${r},${c}`);
      }
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : COL_EXACT_LIGHT - exactement n cellules claires par colonne
// ---------------------------------------------------------------------------
const COL_EXACT_LIGHT = {
  id: 'COL_EXACT_LIGHT',
  name: 'Exactement {n} clair(es) par colonne',
  description: 'Chaque colonne doit contenir exactement {n} cellule(s) claire(s)',
  icon: '↕',
  previewSolution: [[2, 1, 2], [1, 2, 1], [2, 1, 2]],

  check(grid, size, params = { n: 1 }) {
    for (let c = 0; c < size; c++) {
      if (grid.reduce((s, row) => s + (row[c] === CELL_LIGHT ? 1 : 0), 0) !== params.n) return false;
    }
    return true;
  },
  checkPartial(grid, size, params = { n: 1 }) {
    for (let c = 0; c < size; c++) {
      const light = grid.reduce((s, row) => s + (row[c] === CELL_LIGHT ? 1 : 0), 0);
      const unknown = grid.reduce((s, row) => s + (row[c] === CELL_UNKNOWN ? 1 : 0), 0);
      if (light > params.n || light + unknown < params.n) return false;
    }
    return true;
  },
  getViolatingCells(grid, size, params = { n: 1 }) {
    const v = new Set();
    for (let c = 0; c < size; c++) {
      const light = grid.reduce((s, row) => s + (row[c] === CELL_LIGHT ? 1 : 0), 0);
      const unknown = grid.reduce((s, row) => s + (row[c] === CELL_UNKNOWN ? 1 : 0), 0);
      if (light > params.n || (unknown === 0 && light !== params.n)) {
        for (let r = 0; r < size; r++)
          if (grid[r][c] === CELL_LIGHT) v.add(`${r},${c}`);
      }
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : SYMMETRY_180 - symétrie rotationnelle 180°
// ---------------------------------------------------------------------------
const SYMMETRY_180 = {
  id: 'SYMMETRY_180',
  name: 'Symétrie 180°',
  description: 'La grille doit être symétrique par rotation de 180°',
  icon: '🔄',
  previewSolution: [[1, 2, 1], [2, 1, 2], [1, 2, 1]],

  check(grid, size) {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] !== grid[size - 1 - r][size - 1 - c]) return false;
    return true;
  },
  checkPartial(grid, size) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const a = grid[r][c], b = grid[size - 1 - r][size - 1 - c];
        if (a !== CELL_UNKNOWN && b !== CELL_UNKNOWN && a !== b) return false;
      }
    }
    return true;
  },
  getViolatingCells(grid, size) {
    const v = new Set();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const a = grid[r][c], b = grid[size - 1 - r][size - 1 - c];
        if (a !== CELL_UNKNOWN && b !== CELL_UNKNOWN && a !== b) {
          v.add(`${r},${c}`); v.add(`${size - 1 - r},${size - 1 - c}`);
        }
      }
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : NURIBOU_STRIPES - les îles sombres sont des bandes rectilignes
// ---------------------------------------------------------------------------
const NURIBOU_STRIPES = {
  id: 'NURIBOU_STRIPES',
  name: 'Bandes sombres',
  description: 'Chaque groupe de cellules sombres doit former une bande rectiligne (1×N ou N×1)',
  icon: '▬',
  previewSolution: [[1, 1, 2], [2, 2, 2], [1, 1, 2]],

  _isStripe(comp) {
    const rows = new Set(comp.map(([r]) => r));
    const cols = new Set(comp.map(([, c]) => c));
    return rows.size === 1 || cols.size === 1;
  },
  check(grid, size) {
    return getComponents(grid, size, [CELL_DARK]).every(c => this._isStripe(c));
  },
  checkPartial(grid, size) {
    return getComponents(grid, size, [CELL_DARK]).every(c => this._isStripe(c));
  },
  getViolatingCells(grid, size) {
    const v = new Set();
    for (const comp of getComponents(grid, size, [CELL_DARK])) {
      if (!this._isStripe(comp)) for (const [r, c] of comp) v.add(`${r},${c}`);
    }
    return v;
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_PATTERN_DARK - pattern sombre interdit (L, T, S, PLUS)
// ---------------------------------------------------------------------------
const NO_PATTERN_DARK = {
  id: 'NO_PATTERN_DARK',
  name: 'Motif sombre interdit',
  description: 'Le motif sombre {patternName} est interdit',
  icon: '🚫',
  previewSolution: [[1, 2, 1], [2, 1, 2], [1, 2, 1]],

  _getVariants(params) {
    return NAMED_PATTERNS[params?.patternName] ?? NAMED_PATTERNS.L_TROMINO;
  },
  check(grid, size, params) {
    return !gridHasPattern(grid, size, CELL_DARK, this._getVariants(params));
  },
  checkPartial(grid, size, params) {
    return !gridHasPattern(grid, size, CELL_DARK, this._getVariants(params));
  },
  getViolatingCells(grid, size, params) {
    return getPatternViolations(grid, size, CELL_DARK, this._getVariants(params));
  },
};

// ---------------------------------------------------------------------------
// Règle : NO_PATTERN_LIGHT - pattern clair interdit (L, T, S, PLUS)
// ---------------------------------------------------------------------------
const NO_PATTERN_LIGHT = {
  id: 'NO_PATTERN_LIGHT',
  name: 'Motif clair interdit',
  description: 'Le motif clair {patternName} est interdit',
  icon: '🚷',
  previewSolution: [[2, 1, 2], [1, 2, 1], [2, 1, 2]],

  _getVariants(params) {
    return NAMED_PATTERNS[params?.patternName] ?? NAMED_PATTERNS.L_TROMINO;
  },
  check(grid, size, params) {
    return !gridHasPattern(grid, size, CELL_LIGHT, this._getVariants(params));
  },
  checkPartial(grid, size, params) {
    return !gridHasPattern(grid, size, CELL_LIGHT, this._getVariants(params));
  },
  getViolatingCells(grid, size, params) {
    return getPatternViolations(grid, size, CELL_LIGHT, this._getVariants(params));
  },
};

// ---------------------------------------------------------------------------
// Registre des règles
// ---------------------------------------------------------------------------
export const ALL_RULES = {
  CONNECT_LIGHT,
  CONNECT_DARK,
  DARK_REGION_SIZE,
  LIGHT_REGION_SIZE,
  DARK_AREA_EXACT,
  LIGHT_AREA_EXACT,
  NO_2X2_DARK,
  NO_2X2_LIGHT,
  NO_3_IN_A_ROW_DARK,
  NO_3_IN_A_ROW_LIGHT,
  ROW_EXACT_DARK,
  ROW_EXACT_LIGHT,
  COL_EXACT_DARK,
  COL_EXACT_LIGHT,
  SYMMETRY_180,
  NURIBOU_STRIPES,
  NO_PATTERN_DARK,
  NO_PATTERN_LIGHT,
};

export function getRuleById(id) {
  return ALL_RULES[id] || null;
}

/** Validation complète de toutes les règles actives (grille sans inconnues). */
export function checkAllRules(grid, size, rules) {
  return rules.every(({ id, params }) => {
    const rule = getRuleById(id);
    return rule ? rule.check(grid, size, params) : true;
  });
}

/** Vérification partielle pour pruning - retourne false si violation définitive. */
export function checkAllPartialRules(grid, size, rules) {
  return rules.every(({ id, params }) => {
    const rule = getRuleById(id);
    return rule ? rule.checkPartial(grid, size, params) : true;
  });
}

/** Retourne le Set union de toutes les cellules en violation pour l'UI. */
export function getAllViolatingCells(grid, size, rules) {
  const violations = new Set();
  for (const { id, params } of rules) {
    const rule = getRuleById(id);
    if (rule) {
      const cells = rule.getViolatingCells(grid, size, params);
      for (const cell of cells) violations.add(cell);
    }
  }
  return violations;
}
