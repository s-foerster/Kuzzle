/**
 * Test pour vérifier que chaque zone a exactement 2 cœurs
 */

import { generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';

console.log('🧪 TEST: Vérification du nombre de cœurs par zone\n');
console.log('=' .repeat(60));

// Tester plusieurs puzzles
for (let i = 0; i < 10; i++) {
  const seed = 20260217 + i;
  
  try {
    console.log(`\n📅 Test ${i + 1} - Seed: ${seed}`);
    
    const result = generatePuzzleHeartsFirst(seed, {
      difficulty: 'easy',
      checkUniqueness: false, // Désactiver pour aller plus vite
      maxTotalAttempts: 10
    });
    
    const { zones, solution } = result;
    
    // Compter les cœurs par zone
    const heartsPerZone = Array(10).fill(0);
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (solution[row][col]) {
          const zoneId = zones[row][col];
          heartsPerZone[zoneId]++;
        }
      }
    }
    
    // Vérifier que chaque zone a exactement 2 cœurs
    let hasError = false;
    for (let zoneId = 0; zoneId < 10; zoneId++) {
      const count = heartsPerZone[zoneId];
      if (count !== 2) {
        console.error(`  ❌ ERREUR: Zone ${zoneId} a ${count} cœur(s) au lieu de 2`);
        hasError = true;
      }
    }
    
    if (!hasError) {
      console.log(`  ✅ OK - Toutes les zones ont exactement 2 cœurs`);
      console.log(`  📊 Répartition: [${heartsPerZone.join(', ')}]`);
    }
    
  } catch (err) {
    console.error(`  ❌ Erreur de génération: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Tests terminés\n');
