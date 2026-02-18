/**
 * Algorithme de placement des cœurs avec backtracking
 * Place 2 cœurs dans chaque zone en respectant les contraintes
 */

const GRID_SIZE = 10;
const ZONE_COUNT = 10;
const HEARTS_PER_ROW = 2;
const HEARTS_PER_COL = 2;
const HEARTS_PER_ZONE = 2;

/**
 * Place les cœurs sur la grille en respectant toutes les contraintes
 * Utilise une heuristique "most-constrained-first" pour favoriser l'unicité
 * @param {Array<Array<number>>} zoneGrid - Grille avec les zone_id
 * @param {SeededRandom} rng - Générateur aléatoire
 * @param {boolean} favorUniqueness - Si true, utilise des heuristiques pour favoriser l'unicité
 * @returns {Array<Array<boolean>>|null} Grille de solution (true = cœur) ou null si échec
 */
export function placeHearts(zoneGrid, rng, favorUniqueness = false) {
  // Initialiser la grille de solution
  const solution = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  
  // Compteurs pour les contraintes
  const rowCounts = Array(GRID_SIZE).fill(0);
  const colCounts = Array(GRID_SIZE).fill(0);
  const zoneCounts = Array(ZONE_COUNT).fill(0);
  
  // Créer une liste de cellules par zone
  const zonesCells = Array(ZONE_COUNT).fill(null).map(() => []);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const zoneId = zoneGrid[row][col];
      zonesCells[zoneId].push([row, col]);
    }
  }

  let zoneOrder;
  if (favorUniqueness) {
    // Heuristique : traiter les zones les plus contraintes en premier
    // Les zones plus petites et plus dispersées créent plus de contraintes
    zoneOrder = Array.from({ length: ZONE_COUNT }, (_, i) => i).sort((a, b) => {
      // Trier par taille de zone (plus petites d'abord)
      const sizeA = zonesCells[a].length;
      const sizeB = zonesCells[b].length;
      if (sizeA !== sizeB) return sizeA - sizeB;
      
      // En cas d'égalité, calculer la dispersion (zones plus dispersées d'abord)
      const dispersionA = calculateZoneDispersion(zonesCells[a]);
      const dispersionB = calculateZoneDispersion(zonesCells[b]);
      return dispersionB - dispersionA;
    });
  } else {
    // Ordre aléatoire (comportement original)
    zoneOrder = rng.shuffle(Array.from({ length: ZONE_COUNT }, (_, i) => i));
  }

  // Essayer de placer les cœurs zone par zone
  return backtrack(
    0,
    zoneOrder,
    zonesCells,
    solution,
    rowCounts,
    colCounts,
    zoneCounts,
    rng
  ) ? solution : null;
}

/**
 * Algorithme de backtracking récursif
 */
function backtrack(
  zoneIndex,
  zoneOrder,
  zonesCells,
  solution,
  rowCounts,
  colCounts,
  zoneCounts,
  rng
) {
  // Cas de base : toutes les zones ont été traitées
  if (zoneIndex >= ZONE_COUNT) {
    return verifySolution(solution, rowCounts, colCounts, zoneCounts);
  }

  const currentZoneId = zoneOrder[zoneIndex];
  const cells = zonesCells[currentZoneId];

  // Mélanger les cellules pour plus de variété
  const shuffledCells = rng.shuffle(cells);

  // Essayer toutes les paires de cellules pour cette zone
  for (let i = 0; i < shuffledCells.length; i++) {
    const [row1, col1] = shuffledCells[i];

    // Vérifier si on peut placer le premier cœur
    if (!canPlaceHeart(row1, col1, solution, rowCounts, colCounts, zoneCounts, currentZoneId)) {
      continue;
    }

    // Placer le premier cœur
    solution[row1][col1] = true;
    rowCounts[row1]++;
    colCounts[col1]++;
    zoneCounts[currentZoneId]++;

    for (let j = i + 1; j < shuffledCells.length; j++) {
      const [row2, col2] = shuffledCells[j];

      // Vérifier si on peut placer le deuxième cœur
      if (!canPlaceHeart(row2, col2, solution, rowCounts, colCounts, zoneCounts, currentZoneId)) {
        continue;
      }

      // Placer le deuxième cœur
      solution[row2][col2] = true;
      rowCounts[row2]++;
      colCounts[col2]++;
      zoneCounts[currentZoneId]++;

      // Récursion
      if (backtrack(zoneIndex + 1, zoneOrder, zonesCells, solution, rowCounts, colCounts, zoneCounts, rng)) {
        return true;
      }

      // Backtrack : retirer le deuxième cœur
      solution[row2][col2] = false;
      rowCounts[row2]--;
      colCounts[col2]--;
      zoneCounts[currentZoneId]--;
    }

    // Backtrack : retirer le premier cœur
    solution[row1][col1] = false;
    rowCounts[row1]--;
    colCounts[col1]--;
    zoneCounts[currentZoneId]--;
  }

  return false;
}

/**
 * Vérifie si on peut placer un cœur à une position donnée
 */
function canPlaceHeart(row, col, solution, rowCounts, colCounts, zoneCounts, zoneId) {
  // Vérifier les limites de ligne et colonne
  if (rowCounts[row] >= HEARTS_PER_ROW) return false;
  if (colCounts[col] >= HEARTS_PER_COL) return false;
  if (zoneCounts[zoneId] >= HEARTS_PER_ZONE) return false;

  // Vérifier qu'il n'y a pas de cœurs adjacents (8 directions)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < GRID_SIZE &&
        newCol >= 0 && newCol < GRID_SIZE &&
        solution[newRow][newCol]) {
      return false;
    }
  }

  return true;
}

/**
 * Vérifie que la solution respecte toutes les contraintes
 */
function verifySolution(solution, rowCounts, colCounts, zoneCounts) {
  // Vérifier les compteurs
  for (let i = 0; i < GRID_SIZE; i++) {
    if (rowCounts[i] !== HEARTS_PER_ROW) return false;
    if (colCounts[i] !== HEARTS_PER_COL) return false;
  }

  for (let i = 0; i < ZONE_COUNT; i++) {
    if (zoneCounts[i] !== HEARTS_PER_ZONE) return false;
  }

  // Vérifier qu'il n'y a pas de cœurs adjacents
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (solution[row][col]) {
        if (hasAdjacentHeart(solution, row, col)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Vérifie si une cellule a un cœur adjacent
 */
function hasAdjacentHeart(solution, row, col) {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < GRID_SIZE &&
        newCol >= 0 && newCol < GRID_SIZE &&
        solution[newRow][newCol]) {
      return true;
    }
  }

  return false;
}

/**
 * Calcule la dispersion d'une zone (variance des positions)
 * Plus la valeur est élevée, plus la zone est dispersée
 */
function calculateZoneDispersion(cells) {
  if (cells.length === 0) return 0;
  
  let sumRow = 0, sumCol = 0;
  for (const [row, col] of cells) {
    sumRow += row;
    sumCol += col;
  }
  
  const avgRow = sumRow / cells.length;
  const avgCol = sumCol / cells.length;
  
  let variance = 0;
  for (const [row, col] of cells) {
    variance += Math.pow(row - avgRow, 2) + Math.pow(col - avgCol, 2);
  }
  
  return variance / cells.length;
}

/**
 * Compte le nombre total de cœurs dans la solution
 */
export function countHearts(solution) {
  let count = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (solution[row][col]) count++;
    }
  }
  return count;
}
