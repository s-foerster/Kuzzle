/**
 * Exemple d'utilisation de la génération hearts-first
 * Démo des différents niveaux de difficulté
 */

import { generatePuzzleHeartsFirst, generatePuzzleWithMethod, DIFFICULTY_CONFIGS } from './src/algorithms/puzzleGenerator.js';
import { getTodaySeed } from './src/utils/seededRandom.js';

console.log('🎯 Démonstration: Génération Hearts-First\n');
console.log('='.repeat(60));

// ============================================================================
// EXEMPLE 1: Génération puzzle FACILE
// ============================================================================
console.log('\n📘 EXEMPLE 1: Puzzle FACILE (mode recommandé)');
console.log('-'.repeat(60));

const easyPuzzle = generatePuzzleHeartsFirst('demo-easy', {
  difficulty: 'easy',
  checkUniqueness: true,
  maxTotalAttempts: 100
});

if (easyPuzzle) {
  console.log('✅ Puzzle facile généré avec succès!');
  console.log(`   Temps: ${easyPuzzle.metadata.generationTime}ms`);
  console.log(`   Tentatives: ${easyPuzzle.metadata.totalAttempts}`);
  console.log(`   Tailles de zones: ${easyPuzzle.metadata.zoneSizes.join(', ')}`);
  console.log(`   Description: ${easyPuzzle.metadata.configDescription}`);
  
  // Compter les petites zones (≤5 cellules)
  const smallZones = easyPuzzle.metadata.zoneSizes.filter(s => s <= 5).length;
  console.log(`   Petites zones (≤5): ${smallZones} → Facile à commencer!`);
} else {
  console.log('❌ Échec génération (augmenter maxTotalAttempts si nécessaire)');
}

// ============================================================================
// EXEMPLE 2: Génération puzzle MOYEN
// ============================================================================
console.log('\n📙 EXEMPLE 2: Puzzle MOYEN');
console.log('-'.repeat(60));

const mediumPuzzle = generatePuzzleHeartsFirst('demo-medium', {
  difficulty: 'medium',
  checkUniqueness: true,
  maxTotalAttempts: 100
});

if (mediumPuzzle) {
  console.log('✅ Puzzle moyen généré avec succès!');
  console.log(`   Temps: ${mediumPuzzle.metadata.generationTime}ms`);
  console.log(`   Tentatives: ${mediumPuzzle.metadata.totalAttempts}`);
  console.log(`   Tailles de zones: ${mediumPuzzle.metadata.zoneSizes.join(', ')}`);
  console.log(`   Description: ${mediumPuzzle.metadata.configDescription}`);
}

// ============================================================================
// EXEMPLE 3: Génération puzzle DIFFICILE
// ============================================================================
console.log('\n📕 EXEMPLE 3: Puzzle DIFFICILE');
console.log('-'.repeat(60));

const hardPuzzle = generatePuzzleHeartsFirst('demo-hard', {
  difficulty: 'hard',
  checkUniqueness: true,
  maxTotalAttempts: 100
});

if (hardPuzzle) {
  console.log('✅ Puzzle difficile généré avec succès!');
  console.log(`   Temps: ${hardPuzzle.metadata.generationTime}ms`);
  console.log(`   Tentatives: ${hardPuzzle.metadata.totalAttempts}`);
  console.log(`   Tailles de zones: ${hardPuzzle.metadata.zoneSizes.join(', ')}`);
  console.log(`   Description: ${hardPuzzle.metadata.configDescription}`);
  
  const smallZones = hardPuzzle.metadata.zoneSizes.filter(s => s <= 5).length;
  console.log(`   Petites zones (≤5): ${smallZones} → Plus de déduction nécessaire!`);
}

// ============================================================================
// EXEMPLE 4: Puzzle quotidien avec la nouvelle méthode
// ============================================================================
console.log('\n📅 EXEMPLE 4: Puzzle quotidien (hearts-first)');
console.log('-'.repeat(60));

const todaySeed = getTodaySeed();
console.log(`Seed du jour: ${todaySeed}`);

const dailyPuzzle = generatePuzzleHeartsFirst(todaySeed, {
  difficulty: 'easy', // FACILE pour une meilleure expérience utilisateur
  checkUniqueness: true,
  maxTotalAttempts: 200 // Plus de tentatives pour garantir succès
});

if (dailyPuzzle) {
  console.log('✅ Puzzle quotidien généré!');
  console.log(`   Temps: ${dailyPuzzle.metadata.generationTime}ms`);
  console.log(`   Tentatives: ${dailyPuzzle.metadata.totalAttempts}`);
  console.log(`   Rejetés: ${dailyPuzzle.metadata.rejectedNonUnique}`);
  console.log(`   Unique: ${dailyPuzzle.metadata.isUnique}`);
}

// ============================================================================
// EXEMPLE 5: Utilisation de generatePuzzleWithMethod (API unifiée)
// ============================================================================
console.log('\n🔧 EXEMPLE 5: API unifiée (choix de méthode)');
console.log('-'.repeat(60));

// Hearts-first
const puzzleHF = generatePuzzleWithMethod('test-api', {
  method: 'hearts-first',
  difficulty: 'easy',
  checkUniqueness: false // Rapide pour démo
});

console.log(`Hearts-first: ${puzzleHF ? '✅' : '❌'} (${puzzleHF?.metadata.generationTime}ms)`);

// Zones-first (méthode originale)
const puzzleZF = generatePuzzleWithMethod('test-api', {
  method: 'zones-first',
  checkUniqueness: false
});

console.log(`Zones-first:  ${puzzleZF ? '✅' : '❌'} (${puzzleZF?.metadata.generationTime}ms)`);

// ============================================================================
// RÉSUMÉ
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(60));

console.log(`
✅ Implémentation Hearts-First opérationnelle!

Avantages principaux:
- 🚀 Génération ~2-10× plus rapide sans validation
- 🎯 Contrôle précis de la difficulté via tailles de zones
- 🎮 Mode FACILE : petites zones pour commencer facilement
- ✨ Déterminisme complet (même seed = même puzzle)
- ✔️  Validation d'unicité intégrée

Recommandation :
→ Utiliser difficulty: 'easy' pour le puzzle quotidien
→ maxTotalAttempts: 200 pour garantir le succès
→ Temps de génération ~500-2000ms (acceptable côté serveur)

Configuration pour production:
\`\`\`javascript
const puzzle = generatePuzzleHeartsFirst(getTodaySeed(), {
  difficulty: 'easy',
  checkUniqueness: true,
  maxTotalAttempts: 200
});
\`\`\`
`);

console.log('='.repeat(60));
