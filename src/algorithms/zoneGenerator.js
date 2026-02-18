/**
 * Générateur de zones pour le puzzle
 * Utilise un algorithme de flood-fill avec croissance contrôlée
 */

/**
 * Génère 10 zones contiguës sur une grille 10x10
 * @param {SeededRandom} rng - Générateur aléatoire avec seed
 * @param {number} minZoneSize - Taille minimale acceptable pour une zone (défaut 4)
 * @param {number} minSmallZones - Nombre minimum de zones qui doivent avoir la taille minimale (défaut 3)
 * @returns {Array<Array<number>>} Grille 10x10 avec zone_id (0-9) pour chaque cellule
 */
export function generateZones(rng, minZoneSize = 4, minSmallZones = 3, verbose = false) {
  // Initialiser la grille avec -1 (pas de zone assignée)
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(-1));
  
  // Calculer les tailles cibles des zones
  // Au moins minSmallZones zones doivent avoir la taille minimale
  const totalCells = GRID_SIZE * GRID_SIZE;
  const smallZoneCount = minSmallZones; // Respecter exactement le paramètre minSmallZones
  const cellsInSmallZones = smallZoneCount * minZoneSize;
  const remainingCells = totalCells - cellsInSmallZones;
  const largeZoneCount = ZONE_COUNT - smallZoneCount;
  const avgLargeZoneSize = Math.floor(remainingCells / largeZoneCount);
  
  // Créer les zones avec leurs tailles cibles
  const zones = Array(ZONE_COUNT).fill(null).map((_, i) => ({
    id: i,
    cells: [],
    targetSize: i < smallZoneCount ? minZoneSize : avgLargeZoneSize
  }));
  
  // Distribuer les cellules excédentaires sur plusieurs grandes zones (au lieu d'une seule)
  const totalAssigned = zones.reduce((sum, z) => sum + z.targetSize, 0);
  if (totalAssigned < totalCells) {
    const extra = totalCells - totalAssigned;
    for (let i = 0; i < extra; i++) {
      zones[smallZoneCount + (i % largeZoneCount)].targetSize++;
    }
  }

  // Choisir des cellules seed aléatoires pour chaque zone
  const seeds = generateSeeds(rng);
  
  // Assigner les seeds aux zones
  for (let i = 0; i < ZONE_COUNT; i++) {
    const [row, col] = seeds[i];
    grid[row][col] = i;
    zones[i].cells.push([row, col]);
  }

  // Faire croître les zones jusqu'à ce que toutes les cellules soient assignées
  let unassignedCount = GRID_SIZE * GRID_SIZE - ZONE_COUNT;
  
  while (unassignedCount > 0) {
    // Trouver les zones qui ont besoin de croître
    const zonesToGrow = zones.filter(z => z.cells.length < z.targetSize);
    
    if (zonesToGrow.length === 0) break;

    // Mélanger pour croissance aléatoire
    const shuffledZones = rng.shuffle(zonesToGrow);

    let grewThisRound = false;
    
    for (const zone of shuffledZones) {
      if (zone.cells.length >= zone.targetSize) continue;

      // Trouver les voisins disponibles de cette zone
      const neighbors = getAvailableNeighbors(grid, zone.cells);
      
      if (neighbors.length > 0) {
        // Choisir un voisin aléatoire
        const [row, col] = rng.choice(neighbors);
        grid[row][col] = zone.id;
        zone.cells.push([row, col]);
        unassignedCount--;
        grewThisRound = true;
      }
    }

    // Si aucune zone n'a pu croître, assigner les cellules restantes UNIQUEMENT aux grandes zones
    if (!grewThisRound && unassignedCount > 0) {
      const unassigned = findUnassignedCells(grid);
      // Ne donner les cellules excédentaires QU'AUX grandes zones
      const largeZones = zones.filter(z => z.targetSize > minZoneSize).map(z => z.id);
      
      for (const [row, col] of unassigned) {
        const nearestZone = findNearestZone(grid, row, col, largeZones);
        if (nearestZone !== -1) {
          grid[row][col] = nearestZone;
          zones[nearestZone].cells.push([row, col]);
          unassignedCount--;
        }
        // Ne pas assigner aux petites zones pour respecter minZoneSize exactement
      }
      
      // Si des cellules restent non-assignées après ce tour, arrêter la boucle
      // (cela peut arriver si toutes les zones ont atteint leur cible)
      if (unassignedCount > 0 && findUnassignedCells(grid).length === unassigned.length) {
        // Forcer l'assignation aux zones les plus proches en dernier recours
        for (const [row, col] of findUnassignedCells(grid)) {
          const anyZone = findNearestZone(grid, row, col);
          if (anyZone !== -1) {
            grid[row][col] = anyZone;
            zones[anyZone].cells.push([row, col]);
            unassignedCount--;
          }
        }
      }
    }
  }

  // Vérifier que toutes les zones sont contiguës
  if (!verifyZonesContiguity(grid)) {
    console.warn('Zones générées ne sont pas toutes contiguës');
  }

  // Afficher les statistiques des zones générées (seulement si verbose)
  if (verbose) {
    const zoneSizes = zones.map(z => z.cells.length);
    const smallZones = zoneSizes.filter(size => size <= minZoneSize + 1).length;
    console.log(`✓ Zones générées: ${zoneSizes.join(', ')}`);
    console.log(`  ├─ Petites zones (≤${minZoneSize + 1}): ${smallZones}`);
    console.log(`  └─ Grandes zones: ${ZONE_COUNT - smallZones}`);
  }

  return grid;
}

/**
 * Génère des cellules seed bien espacées pour les zones
 */
function generateSeeds(rng) {
  const seeds = [];
  const attempts = 100;
  
  for (let zoneId = 0; zoneId < ZONE_COUNT; zoneId++) {
    let bestSeed = null;
    let bestMinDist = 0;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const row = rng.randomInt(0, GRID_SIZE);
      const col = rng.randomInt(0, GRID_SIZE);
      
      // Vérifier si cette position est déjà utilisée
      if (seeds.some(([r, c]) => r === row && c === col)) {
        continue;
      }

      // Calculer la distance minimale aux autres seeds
      let minDist = Infinity;
      for (const [r, c] of seeds) {
        const dist = Math.abs(row - r) + Math.abs(col - c);
        minDist = Math.min(minDist, dist);
      }

      // Garder le seed avec la meilleure distance minimale
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestSeed = [row, col];
      }
    }

    if (bestSeed) {
      seeds.push(bestSeed);
    } else {
      // Fallback: placer aléatoirement
      let row, col;
      do {
        row = rng.randomInt(0, GRID_SIZE);
        col = rng.randomInt(0, GRID_SIZE);
      } while (seeds.some(([r, c]) => r === row && c === col));
      seeds.push([row, col]);
    }
  }

  return seeds;
}

/**
 * Trouve toutes les cellules voisines disponibles d'une zone
 */
function getAvailableNeighbors(grid, zoneCells, gridConfig = { gridSize: 10 }) {
  const { gridSize } = gridConfig;
  const neighbors = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 4 directions

  for (const [row, col] of zoneCells) {
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < gridSize && 
          newCol >= 0 && newCol < gridSize &&
          grid[newRow][newCol] === -1) {
        neighbors.add(`${newRow},${newCol}`);
      }
    }
  }

  return Array.from(neighbors).map(key => {
    const [row, col] = key.split(',').map(Number);
    return [row, col];
  });
}

/**
 * Trouve toutes les cellules non assignées
 */
function findUnassignedCells(grid, gridConfig = { gridSize: 10 }) {
  const { gridSize } = gridConfig;
  const unassigned = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === -1) {
        unassigned.push([row, col]);
      }
    }
  }
  return unassigned;
}

/**
 * Trouve la zone la plus proche d'une cellule
 * @param {Array} grid - La grille
 * @param {number} row - Ligne de la cellule
 * @param {number} col - Colonne de la cellule
 * @param {Array} preferredZones - IDs de zones préférées (optionnel)
 * @param {Object} gridConfig - Configuration de la grille
 */
function findNearestZone(grid, row, col, preferredZones = null, gridConfig = { gridSize: 10 }) {
  const { gridSize } = gridConfig;
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow >= 0 && newRow < gridSize && 
        newCol >= 0 && newCol < gridSize &&
        grid[newRow][newCol] !== -1) {
      const zoneId = grid[newRow][newCol];
      // Si on a des zones préférées, vérifier que la zone est dedans
      if (preferredZones === null || preferredZones.includes(zoneId)) {
        return zoneId;
      }
    }
  }
  
  return -1;
}

/**
 * Vérifie que toutes les zones sont contiguës
 */
export function verifyZonesContiguity(grid, gridConfig = { gridSize: 10, zoneCount: 10 }) {
  const { zoneCount } = gridConfig;
  for (let zoneId = 0; zoneId < zoneCount; zoneId++) {
    if (!isZoneContiguous(grid, zoneId, gridConfig)) {
      return false;
    }
  }
  return true;
}

/**
 * Vérifie qu'une zone est contiguë en utilisant BFS
 */
function isZoneContiguous(grid, zoneId, gridConfig = { gridSize: 10 }) {
  const { gridSize } = gridConfig;
  // Trouver toutes les cellules de cette zone
  const zoneCells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === zoneId) {
        zoneCells.push([row, col]);
      }
    }
  }

  if (zoneCells.length === 0) return false;

  // BFS depuis la première cellule
  const visited = new Set();
  const queue = [zoneCells[0]];
  visited.add(`${zoneCells[0][0]},${zoneCells[0][1]}`);

  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = `${newRow},${newCol}`;

      if (newRow >= 0 && newRow < gridSize &&
          newCol >= 0 && newCol < gridSize &&
          grid[newRow][newCol] === zoneId &&
          !visited.has(key)) {
        visited.add(key);
        queue.push([newRow, newCol]);
      }
    }
  }

  return visited.size === zoneCells.length;
}

/**
 * Génère des zones à partir de paires de cœurs (approche hearts-first)
 * @param {Array<[[number, number], [number, number]]>} pairs - 10 paires de positions de cœurs
 * @param {SeededRandom} rng - Générateur aléatoire
 * @param {Array<number>} sizeTargets - Tailles cibles pour chaque zone (doit sommer à 100)
 * @returns {Array<Array<number>>} Grille 10x10 avec zone_id (0-9)
 */
export function generateZonesFromPairs(pairs, rng, sizeTargets, gridConfig = { gridSize: 10, zoneCount: 10 }) {
  const { gridSize, zoneCount } = gridConfig;
  
  if (pairs.length !== zoneCount) {
    throw new Error(`Expected ${zoneCount} pairs, got ${pairs.length}`);
  }

  const totalTargetSize = sizeTargets.reduce((sum, size) => sum + size, 0);
  if (totalTargetSize !== gridSize * gridSize) {
    throw new Error(`Size targets must sum to ${gridSize * gridSize}, got ${totalTargetSize}`);
  }

  // Initialiser la grille avec -1 (non assigné)
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(-1));

  // ÉTAPE 1: Collecter toutes les positions de cœurs pour éviter de les écraser
  const heartPositions = new Set();
  for (const pair of pairs) {
    heartPositions.add(`${pair[0][0]},${pair[0][1]}`);
    heartPositions.add(`${pair[1][0]},${pair[1][1]}`);
  }

  // ÉTAPE 2: Placer les cœurs et créer des chemins sûrs
  const zones = pairs.map((pair, i) => {
    const [heart1, heart2] = pair;
    
    // Créer un chemin entre les 2 cœurs qui évite les autres cœurs
    const pathCells = createSafePathBetweenHearts(heart1, heart2, heartPositions, grid, gridConfig);

    // Marquer toutes les cellules du chemin
    for (const cell of pathCells) {
      grid[cell[0]][cell[1]] = i;
    }

    return {
      id: i,
      cells: pathCells,
      targetSize: sizeTargets[i],
      frontier: []
    };
  });

  // Initialiser les frontières
  for (const zone of zones) {
    zone.frontier = getAvailableNeighbors(grid, zone.cells, gridConfig);
  }

  let unassigned = gridSize * gridSize - zones.reduce((sum, z) => sum + z.cells.length, 0);

  // Croissance compétitive des zones
  while (unassigned > 0) {
    // Filtrer les zones qui peuvent encore croître
    const zonesToGrow = zones.filter(z => 
      z.cells.length < z.targetSize && z.frontier.length > 0
    );

    if (zonesToGrow.length === 0) break;

    // Prioriser les zones avec le plus grand déficit
    zonesToGrow.sort((a, b) => {
      const deficitA = a.targetSize - a.cells.length;
      const deficitB = b.targetSize - b.cells.length;
      return deficitB - deficitA;
    });

    // Prendre les zones de priorité maximale et en choisir une aléatoirement
    const maxDeficit = zonesToGrow[0].targetSize - zonesToGrow[0].cells.length;
    const topPriority = zonesToGrow.filter(z => 
      (z.targetSize - z.cells.length) === maxDeficit
    );

    const zoneToGrow = rng.choice(topPriority);

    // Faire croître cette zone d'une cellule
    if (zoneToGrow.frontier.length > 0) {
      const cell = rng.choice(zoneToGrow.frontier);
      grid[cell[0]][cell[1]] = zoneToGrow.id;
      zoneToGrow.cells.push(cell);
      unassigned--;

      // Mettre à jour toutes les frontières
      updateAllFrontiers(zones, grid, gridConfig);
    } else {
      // Cette zone n'a plus de frontière, la retirer de la liste
      break;
    }
  }

  // Gérer les cellules restantes (greedy assignment au plus proche)
  if (unassigned > 0) {
    const remaining = findUnassignedCells(grid, gridConfig);
    
    for (const [row, col] of remaining) {
      // Chercher la zone la plus proche (4-directionnelle d'abord)
      let nearestZone = findNearestZone(grid, row, col, null, gridConfig);
      
      // Si aucune zone adjacente, chercher la plus proche en distance euclidienne
      if (nearestZone === -1) {
        let minDist = Infinity;
        for (let zoneId = 0; zoneId < zoneCount; zoneId++) {
          for (const cell of zones[zoneId].cells) {
            const dist = Math.abs(cell[0] - row) + Math.abs(cell[1] - col);
            if (dist < minDist) {
              minDist = dist;
              nearestZone = zoneId;
            }
          }
        }
      }
      
      // Assigner à la zone trouvée (TOUJOURS trouvée maintenant)
      if (nearestZone !== -1) {
        grid[row][col] = nearestZone;
        zones[nearestZone].cells.push([row, col]);
        unassigned--;
      } else {
        // Fallback ultime: assigner à zone 0 si vraiment rien ne marche
        console.warn(`⚠️ Cellule orpheline (${row},${col}) assignée à zone 0 par défaut`);
        grid[row][col] = 0;
        zones[0].cells.push([row, col]);
        unassigned--;
      }
    }
  }
  
  // Vérification finale: s'assurer qu'il n'y a plus de cellules à -1
  let stillUnassigned = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === -1) {
        stillUnassigned++;
        grid[row][col] = 0;
        zones[0].cells.push([row, col]);
      }
    }
  }

  if (stillUnassigned > 0) {
    console.warn(`⚠️ ${stillUnassigned} cellules orphelines forcées à zone 0`);
  }

  // Vérification de contiguïté (pas de warning ici, géré par l'appelant)
  // La fonction appelante gérera la vérification et décidera de rejeter ou non

  return grid;
}

/**
 * Crée un chemin de cellules entre deux cœurs en ÉVITANT les autres cœurs
 * Utilise un chemin Manhattan (horizontal puis vertical, ou vice-versa)
 */
function createSafePathBetweenHearts(heart1, heart2, allHeartPositions, grid, gridConfig) {
  const [r1, c1] = heart1;
  const [r2, c2] = heart2;
  const path = [];

  // Toujours inclure les deux cœurs de cette paire
  path.push(heart1);

  // Si les cœurs sont identiques ou adjacents, pas besoin de chemin intermédiaire
  const manhattanDist = Math.abs(r2 - r1) + Math.abs(c2 - c1);
  if (manhattanDist <= 1) {
    if (r1 !== r2 || c1 !== c2) {
      path.push(heart2);
    }
    return path;
  }

  // Créer un chemin en L: horizontal d'abord, puis vertical
  let currentR = r1;
  let currentC = c1;

  // Phase horizontale
  while (currentC !== c2) {
    currentC += (c2 > c1) ? 1 : -1;
    const cellKey = `${currentR},${currentC}`;
    
    // N'ajouter que si ce n'est pas un cœur d'une autre paire
    // (on vérifie si c'est heart2, auquel cas on l'ajoute)
    if (currentR === r2 && currentC === c2) {
      // C'est heart2, on l'ajoute et on termine
      if (!path.some(p => p[0] === r2 && p[1] === c2)) {
        path.push(heart2);
      }
      return path;
    } else if (!allHeartPositions.has(cellKey)) {
      // Ce n'est pas un cœur, on peut l'ajouter au chemin
      path.push([currentR, currentC]);
    }
    // Si c'est un cœur d'une autre paire, on le saute
  }

  // Phase verticale
  while (currentR !== r2) {
    currentR += (r2 > r1) ? 1 : -1;
    const cellKey = `${currentR},${currentC}`;
    
    if (currentR === r2 && currentC === c2) {
      // C'est heart2, on l'ajoute si pas déjà présent
      if (!path.some(p => p[0] === r2 && p[1] === c2)) {
        path.push(heart2);
      }
      return path;
    } else if (!allHeartPositions.has(cellKey)) {
      // Ce n'est pas un cœur, on peut l'ajouter au chemin
      path.push([currentR, currentC]);
    }
    // Si c'est un cœur d'une autre paire, on le saute
  }

  // S'assurer que heart2 est dans le path
  if (!path.some(p => p[0] === r2 && p[1] === c2)) {
    path.push(heart2);
  }

  return path;
}

/**
 * Crée un chemin de cellules entre deux cœurs pour garantir la contiguïté
 * Utilise un chemin Manhattan (horizontal puis vertical, ou vice-versa)
 * ATTENTION: Cette fonction est dépréciée, utiliser createSafePathBetweenHearts
 */
function createPathBetweenHearts(heart1, heart2, grid, gridConfig) {
  const [r1, c1] = heart1;
  const [r2, c2] = heart2;
  const path = [];

  // Toujours inclure les deux cœurs
  path.push(heart1);

  // Si les cœurs sont déjà adjacents, pas besoin de chemin intermédiaire
  const manhattanDist = Math.abs(r2 - r1) + Math.abs(c2 - c1);
  if (manhattanDist <= 1) {
    if (r1 !== r2 || c1 !== c2) {
      path.push(heart2);
    }
    return path;
  }

  // Créer un chemin en L: horizontal d'abord, puis vertical
  let currentR = r1;
  let currentC = c1;

  // Phase horizontale
  while (currentC !== c2) {
    currentC += (c2 > c1) ? 1 : -1;
    if (currentR !== r2 || currentC !== c2) {
      path.push([currentR, currentC]);
    }
  }

  // Phase verticale
  while (currentR !== r2) {
    currentR += (r2 > r1) ? 1 : -1;
    path.push([currentR, currentC]);
  }

  return path;
}

/**
 * Met à jour les frontières de toutes les zones
 */
function updateAllFrontiers(zones, grid, gridConfig) {
  for (const zone of zones) {
    zone.frontier = getAvailableNeighbors(grid, zone.cells, gridConfig);
  }
}
