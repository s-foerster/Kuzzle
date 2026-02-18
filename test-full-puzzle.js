// Test de génération complète de puzzle avec minZoneSize = 5
import { generateDailyPuzzle } from './src/algorithms/puzzleGenerator.js';

console.log('🧪 Test de génération de puzzle avec minZoneSize = 5\n');
console.log('⏳ Génération en cours (peut prendre 30s-2min)...\n');

const startTime = Date.now();
const puzzle = generateDailyPuzzle();
const totalTime = Date.now() - startTime;

if (puzzle) {
  console.log('\n✅ Puzzle généré avec succès !');
  console.log(`   ├─ Temps total: ${totalTime}ms`);
  console.log(`   ├─ Est unique: ${puzzle.metadata.isUnique}`);
  console.log(`   ├─ Tentatives totales: ${puzzle.metadata.totalAttempts}`);
  console.log(`   ├─ Puzzles rejetés: ${puzzle.metadata.rejectedNonUnique}`);
  console.log(`   └─ Temps validation: ${puzzle.metadata.validationTime}ms`);
  
  // Compter les tailles de zones
  const zoneSizes = Array(10).fill(0);
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      zoneSizes[puzzle.zones[row][col]]++;
    }
  }
  
  console.log(`\n📊 Tailles des zones:`);
  console.log(`   Zones: ${zoneSizes.join(', ')}`);
  const smallZones = zoneSizes.filter(s => s <= 6).length;
  console.log(`   ├─ Petites zones (≤6): ${smallZones}`);
  console.log(`   └─ Grandes zones: ${10 - smallZones}`);
} else {
  console.log('\n❌ Échec de génération du puzzle');
}
