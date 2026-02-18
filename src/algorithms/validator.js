/**
 * Validateur d'unicité de solution OPTIMISÉ
 * Vérifie qu'un puzzle n'a qu'une seule solution
 * Utilise recherche zone par zone avec élagage précoce pour performance
 */

/**
 * Vérifie si un puzzle a une solution unique (VERSION OPTIMISÉE)
 * @param {Array<Array<number>>} zoneGrid - Grille avec les zone_id
 * @param {Array<Array<boolean>>} knownSolution - Solution connue (optionnel)
 * @param {Object} gridConfig - Configuration de la grille
 * @returns {{isUnique: boolean, solutionCount: number, timeMs: number}}
 */
export function validateUniqueness(zoneGrid, knownSolution = null, gridConfig = { gridSize: 10, zoneCount: 10, heartsPerRow: 2, heartsPerCol: 2, heartsPerZone: 2 }) {
  const { gridSize, zoneCount, heartsPerRow, heartsPerCol } = gridConfig;
  const startTime = performance.now();
  
  // Initialiser l'état de recherche
  const state = {
    solution: Array(gridSize).fill(null).map(() => Array(gridSize).fill(false)),
    rowCounts: Array(gridSize).fill(0),
    colCounts: Array(gridSize).fill(0),
    zoneCounts: Array(zoneCount).fill(0),
    forbidden: new Set() // Cellules adjacentes aux cœurs
  };

  // Grouper les cellules par zone (beaucoup plus efficace)
  const cellsByZone = Array(zoneCount).fill(null).map(() => []);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const zoneId = zoneGrid[row][col];
      
      // Vérifier que la zone est valide
      if (zoneId === undefined || zoneId === null || zoneId < 0 || zoneId >= zoneCount) {
        throw new Error(`Cellule (${row},${col}) a un zoneId invalide: ${zoneId}`);
      }
      
      cellsByZone[zoneId].push({ row, col, zoneId });
    }
  }

  const solutions = [];
  const maxSolutions = 2; // On s'arrête dès qu'on trouve 2 solutions

  // Lancer la recherche exhaustive zone par zone
  solveZoneByZone(0, cellsByZone, state, solutions, maxSolutions, gridConfig);

  const endTime = performance.now();

  return {
    isUnique: solutions.length === 1,
    solutionCount: solutions.length,
    timeMs: Math.round(endTime - startTime)
  };
}

/**
 * Résout zone par zone avec backtracking (BEAUCOUP plus efficace)
 * Au lieu de tester 100 cellules, on teste 10 zones avec paires de cellules
 */
function solveZoneByZone(zoneIndex, cellsByZone, state, solutions, maxSolutions, gridConfig) {
  const { zoneCount } = gridConfig;
  
  // Si on a trouvé 2 solutions, arrêter
  if (solutions.length >= maxSolutions) {
    return;
  }

  // Si toutes les zones sont traitées, on a une solution complète
  if (zoneIndex >= zoneCount) {
    if (isCompleteSolution(state, gridConfig)) {
      const solCopy = state.solution.map(row => [...row]);
      solutions.push(solCopy);
    }
    return;
  }

  const cells = cellsByZone[zoneIndex];

  // Essayer toutes les paires de cellules pour cette zone
  for (let i = 0; i < cells.length && solutions.length < maxSolutions; i++) {
    const cell1 = cells[i];
    
    // Élagage précoce : vérifier si on peut placer le premier cœur
    if (!canPlaceHeartOptimized(cell1.row, cell1.col, state, cell1.zoneId, gridConfig)) {
      continue;
    }

    // Placer le premier cœur
    placeHeart(cell1.row, cell1.col, state, cell1.zoneId, gridConfig);

    for (let j = i + 1; j < cells.length && solutions.length < maxSolutions; j++) {
      const cell2 = cells[j];

      // Élagage précoce : vérifier si on peut placer le deuxième cœur
      if (!canPlaceHeartOptimized(cell2.row, cell2.col, state, cell2.zoneId, gridConfig)) {
        continue;
      }

      // Placer le deuxième cœur
      placeHeart(cell2.row, cell2.col, state, cell2.zoneId, gridConfig);

      // ÉLAGAGE PRÉCOCE CRUCIAL : vérifier si l'état peut mener à une solution
      if (isStateViable(state, zoneIndex + 1, gridConfig)) {
        // Récursion sur la zone suivante
        solveZoneByZone(zoneIndex + 1, cellsByZone, state, solutions, maxSolutions, gridConfig);
      }

      // Backtrack : retirer le deuxième cœur
      removeHeart(cell2.row, cell2.col, state, cell2.zoneId, gridConfig);
    }

    // Backtrack : retirer le premier cœur
    removeHeart(cell1.row, cell1.col, state, cell1.zoneId, gridConfig);
  }
}

/**
 * Vérifie si on peut placer un cœur (VERSION OPTIMISÉE avec Set)
 */
function canPlaceHeartOptimized(row, col, state, zoneId, gridConfig) {
  const { heartsPerRow, heartsPerCol, heartsPerZone } = gridConfig;
  
  // Vérifier les limites
  if (state.rowCounts[row] >= heartsPerRow) return false;
  if (state.colCounts[col] >= heartsPerCol) return false;
  if (state.zoneCounts[zoneId] >= heartsPerZone) return false;

  // Vérifier si la cellule est interdite (adjacente à un cœur)
  if (state.forbidden.has(`${row},${col}`)) return false;

  return true;
}

/**
 * Place un cœur et met à jour l'état
 */
function placeHeart(row, col, state, zoneId, gridConfig) {
  const { gridSize } = gridConfig;
  
  state.solution[row][col] = true;
  state.rowCounts[row]++;
  state.colCounts[col]++;
  state.zoneCounts[zoneId]++;

  // Marquer les cellules adjacentes comme interdites
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      state.forbidden.add(`${newRow},${newCol}`);
    }
  }
}

/**
 * Retire un cœur et met à jour l'état
 */
function removeHeart(row, col, state, zoneId, gridConfig) {
  const { gridSize } = gridConfig;
  
  state.solution[row][col] = false;
  state.rowCounts[row]--;
  state.colCounts[col]--;
  state.zoneCounts[zoneId]--;

  // Reconstruire le set forbidden en parcourant tous les cœurs
  state.forbidden.clear();
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (state.solution[r][c]) {
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            state.forbidden.add(`${nr},${nc}`);
          }
        }
      }
    }
  }
}

/**
 * ÉLAGAGE PRÉCOCE : vérifie si l'état actuel peut mener à une solution
 * Détecte les impossibilités avant de continuer (crucial pour performance)
 */
function isStateViable(state, zonesProcessed, gridConfig) {
  const { gridSize, heartsPerRow, heartsPerCol } = gridConfig;
  
  // Vérifier que chaque ligne peut encore atteindre heartsPerRow cœurs
  for (let row = 0; row < gridSize; row++) {
    if (state.rowCounts[row] > heartsPerRow) return false;
    
    if (state.rowCounts[row] < heartsPerRow) {
      const needed = heartsPerRow - state.rowCounts[row];
      let available = 0;

      for (let col = 0; col < gridSize; col++) {
        if (!state.solution[row][col] && 
            !state.forbidden.has(`${row},${col}`) &&
            state.colCounts[col] < heartsPerCol) {
          available++;
        }
      }

      if (available < needed) return false;
    }
  }

  // Vérifier que chaque colonne peut encore atteindre heartsPerCol cœurs
  for (let col = 0; col < gridSize; col++) {
    if (state.colCounts[col] > heartsPerCol) return false;
    
    if (state.colCounts[col] < heartsPerCol) {
      const needed = heartsPerCol - state.colCounts[col];
      let available = 0;

      for (let row = 0; row < gridSize; row++) {
        if (!state.solution[row][col] && 
            !state.forbidden.has(`${row},${col}`) &&
            state.rowCounts[row] < heartsPerRow) {
          available++;
        }
      }

      if (available < needed) return false;
    }
  }

  return true;
}

/**
 * Vérifie si la solution actuelle est complète et valide
 */
function isCompleteSolution(state, gridConfig) {
  const { gridSize, zoneCount, heartsPerRow, heartsPerCol, heartsPerZone } = gridConfig;
  
  // Vérifier que toutes les lignes ont exactement heartsPerRow cœurs
  for (let i = 0; i < gridSize; i++) {
    if (state.rowCounts[i] !== heartsPerRow) return false;
  }

  // Vérifier que toutes les colonnes ont exactement heartsPerCol cœurs
  for (let i = 0; i < gridSize; i++) {
    if (state.colCounts[i] !== heartsPerCol) return false;
  }

  // Vérifier que toutes les zones ont exactement heartsPerZone cœurs
  for (let i = 0; i < zoneCount; i++) {
    if (state.zoneCounts[i] !== heartsPerZone) return false;
  }

  return true;
}

// Plus besoin de validateUniquenessOptimized, on utilise validateUniqueness partout
