/**
 * Test des différentes configurations de grille (9x9 et 10x10)
 * Montre comment utiliser les paramètres flexibles pour contrôler la difficulté
 */

import { generatePuzzleHeartsFirst, createGridConfig, calculateSizeTargets } from './src/algorithms/puzzleGenerator.js';

console.log('🧪 TEST DES CONFIGURATIONS DE GRILLE\n');
console.log('=' .repeat(60));

// ============================================================================
// TEST 1: Grille 9x9 en mode FACILE (2 petites zones minimum)
// ============================================================================
console.log('\n📊 TEST 1: Grille 9x9 en mode FACILE');
console.log('-'.repeat(60));

const seed9x9Easy = 20260217;
const gridConfig9Easy = createGridConfig(9);
const sizeTargets9Easy = calculateSizeTargets('easy', gridConfig9Easy);

console.log('Configuration:');
console.log(`  - Taille grille: ${gridConfig9Easy.gridSize}x${gridConfig9Easy.gridSize}`);
console.log(`  - Total cellules: ${gridConfig9Easy.totalCells}`);
console.log(`  - Nombre de zones: ${gridConfig9Easy.zoneCount}`);
console.log(`  - Petites zones min: ${gridConfig9Easy.minSmallZones}`);
console.log(`  - Taille petites zones: ${gridConfig9Easy.smallZoneSize}`);
console.log(`  - Tailles cibles: [${sizeTargets9Easy.join(', ')}]`);

try {
  const puzzle9Easy = generatePuzzleHeartsFirst(seed9x9Easy, {
    difficulty: 'easy',
    gridSize: 9,
    checkUniqueness: true
  });

  console.log('\n✅ Génération réussie!');
  console.log(`  - Temps génération: ${puzzle9Easy.metadata.generationTime}ms`);
  console.log(`  - Temps validation: ${puzzle9Easy.metadata.validationTime}ms`);
  console.log(`  - Tentatives: ${puzzle9Easy.metadata.totalAttempts}`);
  console.log(`  - Tailles zones: [${puzzle9Easy.metadata.zoneSizes.join(', ')}]`);
  
  const smallZones9 = puzzle9Easy.metadata.zoneSizes.filter(s => s === 4).length;
  console.log(`  - Petites zones (taille 4): ${smallZones9}`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ============================================================================
// TEST 2: Grille 10x10 en mode FACILE (4 petites zones minimum)
// ============================================================================
console.log('\n📊 TEST 2: Grille 10x10 en mode FACILE');
console.log('-'.repeat(60));

const seed10x10Easy = 20260217;
const gridConfig10Easy = createGridConfig(10);
const sizeTargets10Easy = calculateSizeTargets('easy', gridConfig10Easy);

console.log('Configuration:');
console.log(`  - Taille grille: ${gridConfig10Easy.gridSize}x${gridConfig10Easy.gridSize}`);
console.log(`  - Total cellules: ${gridConfig10Easy.totalCells}`);
console.log(`  - Nombre de zones: ${gridConfig10Easy.zoneCount}`);
console.log(`  - Petites zones min: ${gridConfig10Easy.minSmallZones}`);
console.log(`  - Taille petites zones: ${gridConfig10Easy.smallZoneSize}`);
console.log(`  - Tailles cibles: [${sizeTargets10Easy.join(', ')}]`);

try {
  const puzzle10Easy = generatePuzzleHeartsFirst(seed10x10Easy, {
    difficulty: 'easy',
    gridSize: 10,
    checkUniqueness: true
  });

  console.log('\n✅ Génération réussie!');
  console.log(`  - Temps génération: ${puzzle10Easy.metadata.generationTime}ms`);
  console.log(`  - Temps validation: ${puzzle10Easy.metadata.validationTime}ms`);
  console.log(`  - Tentatives: ${puzzle10Easy.metadata.totalAttempts}`);
  console.log(`  - Tailles zones: [${puzzle10Easy.metadata.zoneSizes.join(', ')}]`);
  
  const smallZones10 = puzzle10Easy.metadata.zoneSizes.filter(s => s === 4).length;
  console.log(`  - Petites zones (taille 4): ${smallZones10}`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ============================================================================
// TEST 3: Grille 9x9 en mode DIFFICILE
// ============================================================================
console.log('\n📊 TEST 3: Grille 9x9 en mode DIFFICILE');
console.log('-'.repeat(60));

const seed9x9Hard = 20260218;
const gridConfig9Hard = createGridConfig(9);
const sizeTargets9Hard = calculateSizeTargets('hard', gridConfig9Hard);

console.log('Configuration:');
console.log(`  - Taille grille: ${gridConfig9Hard.gridSize}x${gridConfig9Hard.gridSize}`);
console.log(`  - Petites zones max: ${gridConfig9Hard.maxSmallZones}`);
console.log(`  - Tailles cibles: [${sizeTargets9Hard.join(', ')}]`);

try {
  const puzzle9Hard = generatePuzzleHeartsFirst(seed9x9Hard, {
    difficulty: 'hard',
    gridSize: 9,
    checkUniqueness: true
  });

  console.log('\n✅ Génération réussie!');
  console.log(`  - Temps génération: ${puzzle9Hard.metadata.generationTime}ms`);
  console.log(`  - Temps validation: ${puzzle9Hard.metadata.validationTime}ms`);
  console.log(`  - Tentatives: ${puzzle9Hard.metadata.totalAttempts}`);
  console.log(`  - Tailles zones: [${puzzle9Hard.metadata.zoneSizes.join(', ')}]`);
  
  const smallZones9H = puzzle9Hard.metadata.zoneSizes.filter(s => s === 4).length;
  console.log(`  - Petites zones (taille 4): ${smallZones9H}`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ============================================================================
// TEST 4: Configuration personnalisée (grille 10x10 avec 6 petites zones)
// ============================================================================
console.log('\n📊 TEST 4: Configuration PERSONNALISÉE (10x10, 6 petites zones)');
console.log('-'.repeat(60));

const seedCustom = 20260219;

console.log('Configuration personnalisée:');
console.log(`  - Grille: 10x10`);
console.log(`  - Petites zones forcées: 6`);
console.log(`  - Taille petites zones: 4`);

try {
  const puzzleCustom = generatePuzzleHeartsFirst(seedCustom, {
    difficulty: 'medium',  // Base medium
    gridSize: 10,
    minSmallZones: 6,      // Override: forcer 6 petites zones
    smallZoneSize: 4,
    checkUniqueness: true
  });

  console.log('\n✅ Génération réussie!');
  console.log(`  - Temps génération: ${puzzleCustom.metadata.generationTime}ms`);
  console.log(`  - Temps validation: ${puzzleCustom.metadata.validationTime}ms`);
  console.log(`  - Tentatives: ${puzzleCustom.metadata.totalAttempts}`);
  console.log(`  - Tailles zones: [${puzzleCustom.metadata.zoneSizes.join(', ')}]`);
  
  const smallZonesCustom = puzzleCustom.metadata.zoneSizes.filter(s => s === 4).length;
  console.log(`  - Petites zones (taille 4): ${smallZonesCustom}`);
  console.log(`  - Vérification: ${smallZonesCustom === 6 ? '✅ OK' : '❌ ERREUR'}`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ============================================================================
// TEST 5: Configuration totalement personnalisée avec tailles spécifiques
// ============================================================================
console.log('\n📊 TEST 5: Tailles de zones COMPLÈTEMENT PERSONNALISÉES (9x9)');
console.log('-'.repeat(60));

const seedFullCustom = 20260220;
const customSizes = [4, 4, 4, 10, 10, 10, 13, 13, 13]; // 9 zones pour grille 9x9

console.log('Configuration personnalisée:');
console.log(`  - Grille: 9x9 (81 cellules)`);
console.log(`  - Tailles zones: [${customSizes.join(', ')}]`);
console.log(`  - Total: ${customSizes.reduce((a, b) => a + b, 0)} cellules`);

try {
  const puzzleFullCustom = generatePuzzleHeartsFirst(seedFullCustom, {
    difficulty: 'easy',
    gridSize: 9,
    customSizeTargets: customSizes,  // Tailles complètement personnalisées
    checkUniqueness: true
  });

  console.log('\n✅ Génération réussie!');
  console.log(`  - Temps génération: ${puzzleFullCustom.metadata.generationTime}ms`);
  console.log(`  - Temps validation: ${puzzleFullCustom.metadata.validationTime}ms`);
  console.log(`  - Tentatives: ${puzzleFullCustom.metadata.totalAttempts}`);
  console.log(`  - Tailles zones: [${puzzleFullCustom.metadata.zoneSizes.join(', ')}]`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ============================================================================
// RÉSUMÉ
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('📋 RÉSUMÉ DES PARAMÈTRES DISPONIBLES');
console.log('='.repeat(60));
console.log(`
Options disponibles pour generatePuzzleHeartsFirst():

1. gridSize: 9 ou 10 (taille de la grille)
   - 9: grille 9x9 (81 cellules, 9 zones, 18 cœurs)
   - 10: grille 10x10 (100 cellules, 10 zones, 20 cœurs)

2. difficulty: 'easy' | 'medium' | 'hard'
   - Détermine le nombre de petites zones
   - easy: min petites zones (2 pour 9x9, 4 pour 10x10)
   - hard: max petites zones (5 pour 9x9, 6 pour 10x10)

3. minSmallZones: nombre (override)
   - Force un nombre spécifique de petites zones

4. smallZoneSize: nombre (défaut 4)
   - Taille des petites zones

5. customSizeTargets: Array<number>
   - Tailles complètement personnalisées pour chaque zone
   - Doit sommer à gridSize²

6. checkUniqueness: boolean (défaut true)
   - Active/désactive la validation d'unicité

Exemples:
  // Grille 9x9 facile (2 petites zones)
  generatePuzzleHeartsFirst(seed, { gridSize: 9, difficulty: 'easy' })

  // Grille 10x10 difficile (6 petites zones)
  generatePuzzleHeartsFirst(seed, { gridSize: 10, difficulty: 'hard' })

  // Grille 9x9 avec 3 petites zones personnalisées
  generatePuzzleHeartsFirst(seed, { gridSize: 9, minSmallZones: 3 })

  // Tailles complètement personnalisées
  generatePuzzleHeartsFirst(seed, { 
    gridSize: 9, 
    customSizeTargets: [4,4,4,10,10,10,13,13,13] 
  })
`);

console.log('✨ Tests terminés!\n');
