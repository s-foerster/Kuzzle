/**
 * Test diagnostique pour analyser le taux de puzzles uniques
 */

import { generatePuzzle } from './src/algorithms/puzzleGenerator.js';
import { generateZones } from './src/algorithms/zoneGenerator.js';
import { placeHearts } from './src/algorithms/heartPlacer.js';
import { validateUniqueness } from './src/algorithms/validator.js';
import { SeededRandom } from './src/utils/seededRandom.js';

console.log('🔬 Diagnostic : Analyse du taux d\'unicité\n');

const testCount = 20;
let uniqueCount = 0;
let multipleCount = 0;
const results = [];

console.log(`Génération de ${testCount} puzzles sans filtre...`);
console.log('(Cela peut prendre 1-2 minutes)\n');

for (let i = 0; i < testCount; i++) {
  process.stdout.write(`Test ${i + 1}/${testCount}... `);
  
  const rng = new SeededRandom(`diagnostic-${i}`);
  const zones = generateZones(rng, 3);
  const solution = placeHearts(zones, rng, true); // Avec heuristique
  
  if (solution) {
    const validation = validateUniqueness(zones, solution);
    results.push({
      seed: `diagnostic-${i}`,
      unique: validation.isUnique,
      solutionCount: validation.solutionCount,
      validationTime: validation.timeMs
    });
    
    if (validation.isUnique) {
      uniqueCount++;
      console.log(`✅ UNIQUE (${validation.timeMs}ms)`);
    } else {
      multipleCount++;
      console.log(`❌ ${validation.solutionCount} solutions (${validation.timeMs}ms)`);
    }
  } else {
    console.log('⚠️  Échec de génération');
  }
}

console.log('\n📊 RÉSULTATS :');
console.log(`================`);
console.log(`Total testé    : ${testCount}`);
console.log(`Uniques        : ${uniqueCount} (${(uniqueCount/testCount*100).toFixed(1)}%)`);
console.log(`Multiples      : ${multipleCount} (${(multipleCount/testCount*100).toFixed(1)}%)`);

if (uniqueCount > 0) {
  const avgTime = results
    .filter(r => r.unique)
    .reduce((sum, r) => sum + r.validationTime, 0) / uniqueCount;
  console.log(`Temps moyen validation (uniques) : ${Math.round(avgTime)}ms`);
}

console.log('\n💡 ANALYSE :');
if (uniqueCount === 0) {
  console.log('❌ PROBLÈME CRITIQUE : Aucun puzzle unique trouvé !');
  console.log('   Solutions possibles :');
  console.log('   1. Ajouter des indices pré-placés pour forcer l\'unicité');
  console.log('   2. Modifier les contraintes du jeu (ex: 3 cœurs par ligne/colonne)');
  console.log('   3. Utiliser des zones plus petites et plus contraintes');
  console.log('   4. Changer complètement l\'algorithme de génération');
} else if (uniqueCount < testCount / 4) {
  console.log(`⚠️  Taux d'unicité faible (${(uniqueCount/testCount*100).toFixed(1)}%)`);
  console.log('   Temps de génération avec filtre sera LONG.');
  console.log('   Recommandation : accepter ~5-10% de puzzles non-uniques');
  console.log('   OU implémenter génération avec indices pré-placés.');
} else {
  console.log(`✅ Taux d'unicité acceptable (${(uniqueCount/testCount*100).toFixed(1)}%)`);
  console.log('   La génération avec filtre devrait fonctionner.');
  console.log(`   Estimation : ${Math.ceil(testCount/uniqueCount)} tentatives en moyenne.`);
}

console.log('\n✨ Diagnostic terminé !');
