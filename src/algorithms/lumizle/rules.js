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
export const CELL_DARK    = 1;
export const CELL_LIGHT   = 2;

const DIRS = [[0,1],[0,-1],[1,0],[-1,0]];

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
// Règle : CONNECT_LIGHT — toutes les cellules claires forment un seul groupe
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
    return lightGroups.length <= 1;
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
// Règle : DARK_REGION_SIZE — chaque groupe sombre a exactement N cellules
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
// Règle : NO_2x2 — pas de carré 2×2 uniforme
// ---------------------------------------------------------------------------
const NO_2X2 = {
  id: 'NO_2X2',
  name: 'Pas de carré 2×2',
  description: 'Aucun carré 2×2 ne peut être entièrement sombre ou entièrement clair',
  icon: '🔲',
  previewSolution: [
    [1, 2, 1],
    [2, 1, 2],
    [1, 2, 1],
  ],

  check(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c+1], grid[r+1][c], grid[r+1][c+1]];
        if (vals.every(v => v === CELL_DARK) || vals.every(v => v === CELL_LIGHT)) {
          return false;
        }
      }
    }
    return true;
  },

  checkPartial(grid, size) {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const vals = [grid[r][c], grid[r][c+1], grid[r+1][c], grid[r+1][c+1]];
        // Si 4 cellules déjà fixées et toutes identiques (sombre ou clair) → violation
        if (vals.every(v => v !== CELL_UNKNOWN)) {
          if (vals.every(v => v === CELL_DARK) || vals.every(v => v === CELL_LIGHT)) {
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
        const cells = [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
        const vals = cells.map(([cr, cc]) => grid[cr][cc]);
        if (vals.every(v => v === CELL_DARK) || vals.every(v => v === CELL_LIGHT)) {
          for (const [cr, cc] of cells) violating.add(`${cr},${cc}`);
        }
      }
    }
    return violating;
  },
};

// ---------------------------------------------------------------------------
// Registre des règles
// ---------------------------------------------------------------------------
export const ALL_RULES = {
  CONNECT_LIGHT,
  DARK_REGION_SIZE,
  NO_2X2,
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

/** Vérification partielle pour pruning — retourne false si violation définitive. */
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
