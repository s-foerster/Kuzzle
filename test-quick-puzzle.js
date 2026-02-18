// Test rapide de génération de puzzle
import { generateDailyPuzzle } from './src/algorithms/puzzleGenerator.js';

console.log('🧪 Test de génération de puzzle avec minZoneSize = 4\n');
console.log('⏳ Génération en cours...\n');

const startTime = Date.now();

try {
  const puzzle = generateDailyPuzzle();
  const totalTime = Date.now() - startTime;

  if (puzzle && puzzle.metadata.isUnique) {
    console.log('\n✅ SUCCÈS ! Puzzle unique généré');
    console.log(`   ├─ Temps total: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`   ├─ Tentatives: ${puzzle.metadata.totalAttempts}`);
    console.log(`   ├─ Rejetés: ${puzzle.metadata.rejectedNonUnique}`);
    console.log(`   └─ Temps validation: ${puzzle.metadata.validationTime}ms`);
    
    // Analyser les tailles de zones
    const zoneSizes = Array(10).fill(0);
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        zoneSizes[puzzle.zones[row][col]]++;
      }
    }
    
    console.log(`\n📊 Zones finales: ${zoneSizes.join(', ')}`);
    const small = zoneSizes.filter(s => s <= 5).length;
    console.log(`   ├─ Petites (≤5): ${small}`);
    console.log(`   └─ Grandes: ${10 - small}`);
  } else {
    console.log('\n❌ ÉCHEC: Puzzle non-unique ou échec de génération');
  }
} catch (err) {
  console.error('\n❌ ERREUR:', err.message);
}
