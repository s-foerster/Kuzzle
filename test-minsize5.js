// Test de génération avec minZoneSize = 5
import { generateZones } from './src/algorithms/zoneGenerator.js';
import { SeededRandom } from './src/utils/seededRandom.js';

console.log('🧪 Test de génération avec minZoneSize = 5\n');

// Faire 5 tests avec différentes seeds
for (let i = 1; i <= 5; i++) {
  console.log(`═══ Test ${i}: minZoneSize = 5, 2 petites zones ═══`);
  const rng = new SeededRandom(`test-minsize5-${i}`);
  const grid = generateZones(rng, 5, 2, true); // minZoneSize=5, minSmallZones=2, verbose=true
  
  // Compter les tailles réelles
  const zoneSizes = Array(10).fill(0);
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      zoneSizes[grid[row][col]]++;
    }
  }
  
  // Vérifier combien de zones ont exactement 5 cellules
  const exactlyFive = zoneSizes.filter(s => s === 5).length;
  const lessThanSix = zoneSizes.filter(s => s < 6).length;
  
  console.log(`   Vérification :`);
  console.log(`   ├─ Zones de taille 5 exactement: ${exactlyFive}`);
  console.log(`   └─ Zones de taille <6: ${lessThanSix}\n`);
}

console.log('✅ Tests terminés');
