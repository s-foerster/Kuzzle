/**
 * Placement simple de cœurs SANS contraintes de zones
 * Utilisé pour l'approche hearts-first où les zones sont créées après
 */

/**
 * Place les cœurs sur la grille en respectant uniquement:
 * - 2 cœurs par ligne
 * - 2 cœurs par colonne
 * - Pas de cœurs adjacents (8 directions)
 * 
 * SANS contrainte de zones (zones n'existent pas encore)
 * 
 * @param {SeededRandom} rng - Générateur aléatoire avec seed
 * @param {Object} gridConfig - Configuration de la grille { gridSize, totalHearts, heartsPerRow, heartsPerCol }
 * @returns {Array<[number, number]>|null} Tableau de positions [row, col] ou null si échec
 */
export function placeHeartsSimple(rng, gridConfig = { gridSize: 10, totalHearts: 20, heartsPerRow: 2, heartsPerCol: 2 }) {
  const { gridSize, heartsPerRow, heartsPerCol } = gridConfig;
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  const rowCounts = Array(gridSize).fill(0);
  const colCounts = Array(gridSize).fill(0);
  const forbidden = new Set();
  const hearts = [];

  // Utiliser backtracking pour garantir le succès
  if (placeHeartsBacktrack(0, grid, rowCounts, colCounts, forbidden, hearts, rng, gridConfig)) {
    return hearts;
  }
  
  return null;
}

/**
 * Placement avec backtracking récursif
 */
function placeHeartsBacktrack(row, grid, rowCounts, colCounts, forbidden, hearts, rng, gridConfig) {
  const { gridSize, heartsPerRow, heartsPerCol } = gridConfig;
  
  // Cas de base: toutes les lignes traitées
  if (row >= gridSize) {
    // Vérifier que toutes les colonnes ont exactement heartsPerCol cœurs
    for (let col = 0; col < gridSize; col++) {
      if (colCounts[col] !== heartsPerCol) {
        return false;
      }
    }
    return true;
  }

  // Trouver toutes les paires de colonnes valides pour cette ligne
  const validCols = [];
  for (let col = 0; col < gridSize; col++) {
    if (canPlaceHeart(row, col, grid, rowCounts, colCounts, forbidden, gridConfig)) {
      validCols.push(col);
    }
  }

  // Besoin de placer exactement heartsPerRow cœurs dans cette ligne
  if (validCols.length < heartsPerRow) {
    return false;
  }

  // Générer toutes les combinaisons possibles de heartsPerRow colonnes
  const combinations = [];
  for (let i = 0; i < validCols.length; i++) {
    for (let j = i + 1; j < validCols.length; j++) {
      combinations.push([validCols[i], validCols[j]]);
    }
  }

  // Mélanger les combinaisons pour variété (déterministe via RNG)
  const shuffledCombos = rng.shuffle(combinations);

  // Essayer chaque combinaison
  for (const [col1, col2] of shuffledCombos) {
    // Vérifier que les deux placements sont toujours valides
    if (!canPlaceHeart(row, col1, grid, rowCounts, colCounts, forbidden, gridConfig)) continue;
    if (!canPlaceHeart(row, col2, grid, rowCounts, colCounts, forbidden, gridConfig)) continue;

    // Sauvegarder l'état
    const heartsBefore = hearts.length;
    const forbiddenBefore = new Set(forbidden);

    // Placer le premier cœur
    placeHeart(row, col1, grid, rowCounts, colCounts, forbidden, hearts, gridConfig);
    
    // Vérifier que le deuxième placement est toujours valide après le premier
    if (!canPlaceHeart(row, col2, grid, rowCounts, colCounts, forbidden, gridConfig)) {
      // Défaire le premier placement
      undoPlaceHeart(row, col1, grid, rowCounts, colCounts, forbidden, hearts, forbiddenBefore, gridConfig);
      continue;
    }

    // Placer le deuxième cœur
    placeHeart(row, col2, grid, rowCounts, colCounts, forbidden, hearts, gridConfig);

    // Récursion sur la ligne suivante
    if (placeHeartsBacktrack(row + 1, grid, rowCounts, colCounts, forbidden, hearts, rng, gridConfig)) {
      return true; // Succès !
    }

    // Backtrack: défaire les deux placements
    undoPlaceHeart(row, col2, grid, rowCounts, colCounts, forbidden, hearts, forbiddenBefore, gridConfig);
    undoPlaceHeart(row, col1, grid, rowCounts, colCounts, forbidden, hearts, forbiddenBefore, gridConfig);
  }

  return false; // Aucune combinaison n'a fonctionné
}

/**
 * Vérifie si un cœur peut être placé à une position donnée
 */
function canPlaceHeart(row, col, grid, rowCounts, colCounts, forbidden, gridConfig) {
  const { heartsPerRow, heartsPerCol } = gridConfig;
  
  // Vérifier si la cellule n'est pas déjà occupée
  if (grid[row][col]) return false;

  // Vérifier si la cellule n'est pas interdite (adjacente à un autre cœur)
  const key = `${row},${col}`;
  if (forbidden.has(key)) return false;

  // Vérifier les contraintes de ligne et colonne
  if (rowCounts[row] >= heartsPerRow) return false;
  if (colCounts[col] >= heartsPerCol) return false;

  return true;
}

/**
 * Place un cœur et met à jour toutes les structures de données
 */
function placeHeart(row, col, grid, rowCounts, colCounts, forbidden, hearts, gridConfig) {
  const { gridSize } = gridConfig;
  
  grid[row][col] = true;
  rowCounts[row]++;
  colCounts[col]++;
  hearts.push([row, col]);

  // Marquer toutes les cellules adjacentes comme interdites
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      forbidden.add(`${newRow},${newCol}`);
    }
  }
}

/**
 * Défait le placement d'un cœur (pour backtracking)
 */
function undoPlaceHeart(row, col, grid, rowCounts, colCounts, forbidden, hearts, forbiddenBefore, gridConfig) {
  grid[row][col] = false;
  rowCounts[row]--;
  colCounts[col]--;
  hearts.pop();

  // Restaurer l'état précédent du set forbidden
  forbidden.clear();
  for (const key of forbiddenBefore) {
    forbidden.add(key);
  }
}

/**
 * Convertit un tableau de positions de cœurs en grille de solution
 * @param {Array<[number, number]>} hearts - Positions des cœurs
 * @param {Object} gridConfig - Configuration de la grille
 * @returns {Array<Array<boolean>>} Grille avec true pour les cœurs
 */
export function heartsToGrid(hearts, gridConfig = { gridSize: 10 }) {
  const { gridSize } = gridConfig;
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  for (const [row, col] of hearts) {
    grid[row][col] = true;
  }
  return grid;
}
