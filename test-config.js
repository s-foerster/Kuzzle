// Test rapide de génération avec nouvelle configuration
import { generateDailyPuzzle } from './src/algorithms/puzzleGenerator.js';

console.log('🧪 Test génération avec minZoneSize = 6 + 2 petites zones\n');
console.log('Configuration:');
console.log('  ├─ minZoneSize: 6');
console.log('  ├─ minSmallZones: 2');
console.log('  ├─ checkUniqueness: true');
console.log('  └─ maxTotalAttempts: 200\n');

console.log('⏳ Génération en cours (peut prendre 30s-2min)...\n');

const startTime = Date.now();

try {
  const puzzle = generateDailyPuzzle();
  const totalTime = Date.now() - startTime;

  if (puzzle && puzzle.metadata.isUnique) {
    console.log('\n✅✅✅ SUCCÈS ! Puzzle unique généré');
    console.log(`\n📊 Statistiques:`);
    console.log(`   ├─ Temps total: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`   ├─ Tentatives: ${puzzle.metadata.totalAttempts}`);
    console.log(`   ├─ Rejetés: ${puzzle.metadata.rejectedNonUnique}`);
    console.log(`   └─ Temps validation: ${puzzle.metadata.validationTime}ms`);
    
    // Analyser les zones
    const zoneSizes = Array(10).fill(0);
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        zoneSizes[puzzle.zones[row][col]]++;
      }
    }
    
    console.log(`\n🎯 Zones: ${zoneSizes.join(', ')}`);
    const small = zoneSizes.filter(s => s <= 7).length;
    const medium = zoneSizes.filter(s => s >= 8 && s <= 12).length;
    const large = zoneSizes.filter(s => s > 12).length;
    console.log(`   ├─ Petites (≤7): ${small}`);
    console.log(`   ├─ Moyennes (8-12): ${medium}`);
    console.log(`   └─ Grandes (>12): ${large}`);
    
    process.exit(0);
  } else {
    console.log('\n❌ ÉCHEC: Puzzle non trouvé après les tentatives');
    console.log(`   └─ Temps écoulé: ${totalTime}ms`);
    process.exit(1);
  }
} catch (err) {
  console.error('\n❌ ERREUR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
