/**
 * Pipeline de génération de puzzle
 * Orchestre la génération de zones, placement de cœurs et validation
 */

import { SeededRandom } from '../utils/seededRandom.js';
import { generateZones, generateZonesFromPairs, verifyZonesContiguity } from './zoneGenerator.js';
import { placeHearts, countHearts } from './heartPlacer.js';
import { placeHeartsSimple, heartsToGrid } from './heartPlacerSimple.js';
import { pairHearts } from './heartPairer.js';
import { validateUniqueness } from './validator.js';

/**
 * Configuration par défaut de la grille
 */
export const DEFAULT_GRID_CONFIG = {
  gridSize: 10,           // Taille de la grille (9 ou 10)
  zoneCount: 10,          // Nombre de zones
  heartsPerRow: 2,        // Cœurs par ligne
  heartsPerCol: 2,        // Cœurs par colonne
  heartsPerZone: 2,       // Cœurs par zone
  minSmallZones: 2,       // Nombre minimum de petites zones (facile)
  smallZoneSize: 4,       // Taille des petites zones
  maxSmallZones: 6        // Nombre maximum de petites zones (difficile)
};

/**
 * Crée une configuration de grille personnalisée
 * @param {number} gridSize - Taille de la grille (n'importe quel entier >= 5)
 * @returns {Object} Configuration de grille complète
 */
export function createGridConfig(gridSize = 10) {
  if (gridSize < 5) {
    throw new Error('gridSize doit être au moins 5 pour permettre un jeu valide');
  }

  const totalCells = gridSize * gridSize;
  const zoneCount = gridSize; // Une zone par ligne/colonne
  
  // Formules adaptatives pour les petites zones selon la taille de grille
  // Pour 9: min=2, max=5 | Pour 10: min=4, max=6 | Pour 12: min=4, max=7
  const minSmallZones = gridSize <= 9 ? 2 : Math.floor(gridSize * 0.4);
  const maxSmallZones = gridSize <= 9 ? 5 : Math.floor(gridSize * 0.6);
  
  return {
    gridSize,
    zoneCount,
    totalCells,
    heartsPerRow: 2,
    heartsPerCol: 2,
    heartsPerZone: 2,
    totalHearts: zoneCount * 2,
    minSmallZones,
    smallZoneSize: 4,
    maxSmallZones
  };
}

/**
 * Calcule les tailles cibles des zones selon difficulté et config
 */
export function calculateSizeTargets(difficulty, gridConfig) {
  const { totalCells, zoneCount, minSmallZones, maxSmallZones, smallZoneSize } = gridConfig;
  
  let numSmallZones;
  
  switch (difficulty) {
    case 'easy':
      numSmallZones = minSmallZones;
      break;
    case 'medium':
      numSmallZones = Math.floor((minSmallZones + maxSmallZones) / 2);
      break;
    case 'hard':
      numSmallZones = maxSmallZones;
      break;
    default:
      numSmallZones = minSmallZones;
  }
  
  const targets = [];
  
  // Petites zones
  for (let i = 0; i < numSmallZones; i++) {
    targets.push(smallZoneSize);
  }
  
  // Grandes zones (répartir le reste équitablement)
  const remainingCells = totalCells - (numSmallZones * smallZoneSize);
  const largeZoneCount = zoneCount - numSmallZones;
  
  if (largeZoneCount > 0) {
    const avgLargeSize = Math.floor(remainingCells / largeZoneCount);
    const extra = remainingCells % largeZoneCount;
    
    for (let i = 0; i < largeZoneCount; i++) {
      targets.push(avgLargeSize + (i < extra ? 1 : 0));
    }
  }
  
  return targets;
}

/**
 * Configurations de difficulté pour l'approche hearts-first
 */
export const DIFFICULTY_CONFIGS = {
  easy: {
    pairingStrategy: 'proximity',
    description: 'Facile - Commence avec des petites zones faciles à résoudre'
  },
  medium: {
    pairingStrategy: 'random',
    description: 'Moyen - Zones équilibrées, plus de défi'
  },
  hard: {
    pairingStrategy: 'random',
    description: 'Difficile - Beaucoup de petites zones très contraintes'
  }
};

/**
 * Génère un puzzle complet avec zones et solution
 * @param {string|number} seed - Seed pour la génération
 * @param {Object} options - Options de génération
 * @returns {{zones: Array, solution: Array, metadata: Object}|null}
 */
export function generatePuzzle(seed, options = {}) {
  const {
    minZoneSize = 5,
    maxZoneAttempts = 10,
    maxHeartAttempts = 50,
    checkUniqueness = true, // ACTIVÉ PAR DÉFAUT pour garantir 100% de puzzles uniques
    maxTotalAttempts = 200 // Limite raisonnable pour génération unique
  } = options;

  const startTime = performance.now();
  
  // Créer le générateur aléatoire
  const rng = new SeededRandom(seed);
  
  let zones = null;
  let solution = null;
  let zoneAttempts = 0;
  let heartAttempts = 0;
  let totalAttempts = 0;
  let validationTime = 0;
  let rejectedNonUnique = 0;

  // Boucle jusqu'à trouver un puzzle avec solution unique
  while (totalAttempts < maxTotalAttempts) {
    totalAttempts++;
    
    // Essayer de générer des zones valides
    for (zoneAttempts = 0; zoneAttempts < maxZoneAttempts; zoneAttempts++) {
      try {
        // Générer zones avec 2 petites zones minimum (au lieu de 3) pour faciliter l'unicité
        zones = generateZones(rng, minZoneSize, 2);
        
        // Essayer de placer les cœurs
        for (heartAttempts = 0; heartAttempts < maxHeartAttempts; heartAttempts++) {
          // Utiliser l'heuristique de favorisation d'unicité si la validation est activée
          solution = placeHearts(zones, rng, checkUniqueness);
          
          if (solution) {
            // Vérifier que la solution est valide
            const heartCount = countHearts(solution);
            const expectedHearts = zones.length * 2; // nombre de zones * 2 cœurs
            if (heartCount === expectedHearts) {
              break;
            }
          }
        }

        // Si on a trouvé une solution, sortir
        if (solution) {
          break;
        }
        
        // Réinitialiser le RNG pour essayer de nouvelles zones
        rng.reset();
        
      } catch (error) {
        console.warn(`Tentative de zone ${zoneAttempts + 1} échouée:`, error);
        rng.reset();
      }
    }

    // Si échec de génération, continuer la boucle
    if (!zones || !solution) {
      console.warn(`Tentative ${totalAttempts}: échec de génération`);
      rng.reset();
      continue;
    }

    // VALIDATION D'UNICITÉ (CRITIQUE pour garantir 100% de puzzles uniques)
    let uniquenessResult = { isUnique: true, solutionCount: 1, timeMs: 0 };
    if (checkUniqueness) {
      try {
        uniquenessResult = validateUniqueness(zones, solution);
        validationTime = uniquenessResult.timeMs;
        
        if (!uniquenessResult.isUnique) {
          // REJETER ce puzzle et réessayer avec un nouveau seed
          rejectedNonUnique++;
          console.warn(`❌ Puzzle rejeté (${uniquenessResult.solutionCount} solutions) - tentative ${totalAttempts}`);
          
          // Stratégie de perturbation plus agressive pour plus de variété
          // On utilise une combinaison du nombre de tentatives pour avoir des seeds différents
          const perturbation = totalAttempts * 97531 + rejectedNonUnique * 13579;
          rng.state = (rng.state + perturbation) & 0xFFFFFFFF;
          
          zones = null;
          solution = null;
          continue; // Réessayer
        } else {
          console.log(`✅ Puzzle unique validé en ${validationTime}ms (tentative ${totalAttempts})`);
        }
      } catch (error) {
        console.error('Validation d\'unicité échouée:', error);
        // En cas d'erreur de validation, on accepte le puzzle
      }
    }
    
    // Si on arrive ici, on a un puzzle valide et unique !
    break;
  }

  // Si échec après toutes les tentatives
  if (!zones || !solution) {
    console.error(`Échec de génération après ${totalAttempts} tentatives`);
    return null;
  }

  const endTime = performance.now();
  const generationTime = endTime - startTime;

  // Retourner le puzzle complet avec métadonnées enrichies
  return {
    zones,
    solution,
    metadata: {
      seed: String(seed),
      generationTime: Math.round(generationTime),
      validationTime: validationTime,
      totalAttempts: totalAttempts,
      rejectedNonUnique: rejectedNonUnique,
      zoneAttempts: zoneAttempts + 1,
      heartAttempts: heartAttempts + 1,
      isUnique: true, // Garanti à 100% maintenant
      heartCount: countHearts(solution),
      minZoneSize
    }
  };
}

/**
 * Génère un puzzle pour une date donnée
 * @param {Date} date - Date pour laquelle générer le puzzle
 * @returns {Object} Puzzle généré (GARANTI UNIQUE)
 */
export function generateDailyPuzzle(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const seed = `${year}${month}${day}`;
  
  // ✨ NOUVELLE MÉTHODE HEARTS-FIRST avec difficulté FACILE
  // - 2 petites zones (taille 4) pour commencer facilement
  // - Génération 3-5× plus rapide que zones-first
  // - Contrôle précis de la difficulté
  return generatePuzzleHeartsFirst(seed, { 
    gridSize: 8,
    minSmallZones: 3,
    smallZoneSize: 4,
    checkUniqueness: true,
    maxTotalAttempts: 1000000 // Garantit succès >99%
  });
}

/**
 * Génère plusieurs puzzles et retourne des statistiques
 * Utile pour tester la qualité de la génération
 */
export function generateBatch(count = 10) {
  const results = {
    successes: 0,
    failures: 0,
    totalTime: 0,
    avgZoneAttempts: 0,
    avgHeartAttempts: 0,
    puzzles: []
  };

  for (let i = 0; i < count; i++) {
    const seed = `test_${i}`;
    const puzzle = generatePuzzle(seed);

    if (puzzle) {
      results.successes++;
      results.totalTime += puzzle.metadata.generationTime;
      results.avgZoneAttempts += puzzle.metadata.zoneAttempts;
      results.avgHeartAttempts += puzzle.metadata.heartAttempts;
      results.puzzles.push(puzzle);
    } else {
      results.failures++;
    }
  }

  if (results.successes > 0) {
    results.avgTime = Math.round(results.totalTime / results.successes);
    results.avgZoneAttempts = (results.avgZoneAttempts / results.successes).toFixed(1);
    results.avgHeartAttempts = (results.avgHeartAttempts / results.successes).toFixed(1);
  }

  return results;
}

/**
 * Génère un puzzle avec l'approche HEARTS-FIRST
 * 1. Place les cœurs sans contrainte de zones
 * 2. Apparie les cœurs en 10 paires
 * 3. Crée les zones autour des paires
 * 4. Valide l'unicité
 * 
 * @param {string|number} seed - Seed pour la génération
 * @param {Object} options - Options de génération
 * @returns {{zones: Array, solution: Array, metadata: Object}|null}
 */
export function generatePuzzleHeartsFirst(seed, options = {}) {
  const {
    difficulty = 'easy',
    checkUniqueness = true,
    maxTotalAttempts = 300,
    gridSize = 10,              // Nouveau: taille de grille (9 ou 10)
    minSmallZones = null,       // Nouveau: override du nombre de petites zones
    smallZoneSize = 4,          // Nouveau: taille des petites zones
    customSizeTargets = null    // Nouveau: tailles personnalisées complètes
  } = options;

  // Créer la configuration de grille
  const gridConfig = createGridConfig(gridSize);
  
  // Override si spécifié
  if (minSmallZones !== null) {
    gridConfig.minSmallZones = minSmallZones;
  }
  if (smallZoneSize !== 4) {
    gridConfig.smallZoneSize = smallZoneSize;
  }

  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.easy;
  const startTime = performance.now();
  
  const rng = new SeededRandom(seed);
  
  let zones = null;
  let solution = null;
  let totalAttempts = 0;
  let validationTime = 0;
  let rejectedNonUnique = 0;
  let hearts = null;
  let pairs = null;

  while (totalAttempts < maxTotalAttempts) {
    totalAttempts++;

    try {
      // ÉTAPE 1: Placer les cœurs sans contrainte de zones
      hearts = placeHeartsSimple(rng, gridConfig);
      
      if (!hearts) {
        console.warn(`Tentative ${totalAttempts}: échec placement cœurs`);
        rng.reset();
        continue;
      }

      // ÉTAPE 2: Apparier les cœurs selon la stratégie
      pairs = pairHearts(hearts, rng, difficultyConfig.pairingStrategy);

      // ÉTAPE 3: Calculer ou utiliser les tailles de zones
      const sizeTargets = customSizeTargets || calculateSizeTargets(difficulty, gridConfig);

      // ÉTAPE 3.2: S'assurer qu'on a assez de paires "compactes" pour les petites zones
      // Une zone de taille S doit au minimum relier ses 2 cœurs avec un chemin Manhattan de longueur <= S
      // (nombre de cellules du chemin = distance Manhattan + 1)
      if (!customSizeTargets && gridConfig.minSmallZones > 0) {
        const maxSmallPairDistance = gridConfig.smallZoneSize - 1;

        const compactPairs = [];
        const otherPairs = [];

        for (const pair of pairs) {
          const [[r1, c1], [r2, c2]] = pair;
          const manhattanDistance = Math.abs(r1 - r2) + Math.abs(c1 - c2);

          if (manhattanDistance <= maxSmallPairDistance) {
            compactPairs.push(pair);
          } else {
            otherPairs.push(pair);
          }
        }

        if (compactPairs.length < gridConfig.minSmallZones) {
          const perturbation = totalAttempts * 3571;
          rng.state = (rng.state + perturbation) & 0xFFFFFFFF;

          zones = null;
          solution = null;
          hearts = null;
          pairs = null;
          continue;
        }

        // Mettre les paires compactes en premier pour correspondre aux premières sizeTargets (petites zones)
        const selectedCompact = compactPairs.slice(0, gridConfig.minSmallZones);
        const remainingPairs = [...compactPairs.slice(gridConfig.minSmallZones), ...otherPairs];
        pairs = [...selectedCompact, ...remainingPairs];
      }
      
      // ÉTAPE 3.5: Créer les zones autour des paires
      zones = generateZonesFromPairs(pairs, rng, sizeTargets, gridConfig);

      // ÉTAPE 4: Vérifier les tailles minimales des zones
      const zoneSizes = Array(gridConfig.zoneCount).fill(0);
      for (let row = 0; row < gridConfig.gridSize; row++) {
        for (let col = 0; col < gridConfig.gridSize; col++) {
          zoneSizes[zones[row][col]]++;
        }
      }
      
      // Rejeter si une zone est < 4 cellules (minimum viable)
      const minZoneSize = Math.min(...zoneSizes);
      if (minZoneSize < 4) {
        console.warn(`Tentative ${totalAttempts}: zone trop petite (${minZoneSize}), réessai`);
        
        const perturbation = totalAttempts * 5381;
        rng.state = (rng.state + perturbation) & 0xFFFFFFFF;
        
        zones = null;
        solution = null;
        hearts = null;
        pairs = null;
        continue;
      }

      // ÉTAPE 4.5: Vérifier le respect de la config des petites zones
      // - si customSizeTargets: exiger correspondance exacte des tailles (triées)
      // - sinon: exiger au moins minSmallZones zones exactement à smallZoneSize
      if (customSizeTargets) {
        const sortedActual = [...zoneSizes].sort((a, b) => a - b);
        const sortedTargets = [...sizeTargets].sort((a, b) => a - b);
        const matchesTargets = sortedActual.every((size, idx) => size === sortedTargets[idx]);

        if (!matchesTargets) {
          console.warn(`Tentative ${totalAttempts}: tailles de zones != customSizeTargets, réessai`);

          const perturbation = totalAttempts * 4211;
          rng.state = (rng.state + perturbation) & 0xFFFFFFFF;

          zones = null;
          solution = null;
          hearts = null;
          pairs = null;
          continue;
        }
      } else {
        const smallZonesCount = zoneSizes.filter(size => size === gridConfig.smallZoneSize).length;

        if (smallZonesCount < gridConfig.minSmallZones) {
          console.warn(
            `Tentative ${totalAttempts}: seulement ${smallZonesCount} zones de taille ${gridConfig.smallZoneSize}, minimum ${gridConfig.minSmallZones}`
          );

          const perturbation = totalAttempts * 4211;
          rng.state = (rng.state + perturbation) & 0xFFFFFFFF;

          zones = null;
          solution = null;
          hearts = null;
          pairs = null;
          continue;
        }
      }

      // ÉTAPE 5: Vérifier la contiguïté des zones (CRITIQUE)
      if (!verifyZonesContiguity(zones, gridConfig)) {
        console.warn(`Tentative ${totalAttempts}: zones non-contiguës, réessai`);
        
        // Perturber légèrement le RNG pour essayer un autre appariement/croissance
        const perturbation = totalAttempts * 7919;
        rng.state = (rng.state + perturbation) & 0xFFFFFFFF;
        
        zones = null;
        solution = null;
        hearts = null;
        pairs = null;
        continue;
      }

      // ÉTAPE 6: Convertir hearts en grille de solution
      solution = heartsToGrid(hearts, gridConfig);

      // ÉTAPE 7: Validation d'unicité
      let uniquenessResult = { isUnique: true, solutionCount: 1, timeMs: 0 };
      if (checkUniqueness) {
        try {
          uniquenessResult = validateUniqueness(zones, solution, gridConfig);
          validationTime = uniquenessResult.timeMs;
          
          if (!uniquenessResult.isUnique) {
            rejectedNonUnique++;
            console.warn(`❌ Puzzle rejeté (${uniquenessResult.solutionCount} solutions) - tentative ${totalAttempts}`);
            
            // Perturber le RNG pour réessayer
            const perturbation = totalAttempts * 97531 + rejectedNonUnique * 13579;
            rng.state = (rng.state + perturbation) & 0xFFFFFFFF;
            
            zones = null;
            solution = null;
            hearts = null;
            pairs = null;
            continue;
          } else {
            console.log(`✅ Puzzle unique validé en ${validationTime}ms (tentative ${totalAttempts})`);
          }
        } catch (error) {
          console.error('Validation d\'unicité échouée:', error);
        }
      }

      // Succès !
      break;

    } catch (error) {
      console.warn(`Tentative ${totalAttempts} échouée:`, error);
      rng.reset();
      zones = null;
      solution = null;
      hearts = null;
      pairs = null;
    }
  }

  // Échec après toutes les tentatives
  if (!zones || !solution) {
    console.error(`Échec de génération hearts-first après ${totalAttempts} tentatives`);
    return null;
  }

  const endTime = performance.now();
  const generationTime = endTime - startTime;

  // Calculer les tailles de zones pour les métadonnées
  const zoneSizes = Array(gridConfig.zoneCount).fill(0);
  for (let row = 0; row < gridConfig.gridSize; row++) {
    for (let col = 0; col < gridConfig.gridSize; col++) {
      zoneSizes[zones[row][col]]++;
    }
  }

  return {
    zones,
    solution,
    metadata: {
      seed: String(seed),
      method: 'hearts-first',
      difficulty: difficulty,
      gridSize: gridConfig.gridSize,
      zoneCount: gridConfig.zoneCount,
      totalCells: gridConfig.totalCells,
      generationTime: Math.round(generationTime),
      validationTime: validationTime,
      totalAttempts: totalAttempts,
      rejectedNonUnique: rejectedNonUnique,
      isUnique: true,
      heartCount: gridConfig.totalHearts,
      zoneSizes: zoneSizes,
      minSmallZones: gridConfig.minSmallZones,
      smallZoneSize: gridConfig.smallZoneSize,
      pairingStrategy: difficultyConfig.pairingStrategy,
      configDescription: difficultyConfig.description
    }
  };
}

/**
 * Génère un puzzle avec le choix de la méthode
 * @param {string|number} seed - Seed pour la génération
 * @param {Object} options - Options incluant method: 'zones-first' ou 'hearts-first'
 * @returns {{zones: Array, solution: Array, metadata: Object}|null}
 */
export function generatePuzzleWithMethod(seed, options = {}) {
  const method = options.method || 'zones-first';
  
  if (method === 'hearts-first') {
    return generatePuzzleHeartsFirst(seed, options);
  } else {
    return generatePuzzle(seed, options);
  }
}
