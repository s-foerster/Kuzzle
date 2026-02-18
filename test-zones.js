// Test de génération de zones avec différentes configurations
import { generateZones } from './src/algorithms/zoneGenerator.js';
import { SeededRandom } from './src/utils/seededRandom.js';

console.log('🧪 Test de génération de zones avec minZoneSize\n');

// Test 1: minZoneSize = 6 avec 2 petites zones (nouvelle config)
console.log('═══ Test 1: minZoneSize = 6, 2 petites zones ═══');
const rng1 = new SeededRandom('test-seed-1');
generateZones(rng1, 6, 2, true); // verbose=true

console.log('\n═══ Test 2: minZoneSize = 7, 2 petites zones ═══');
const rng2 = new SeededRandom('test-seed-2');
generateZones(rng2, 7, 2, true);

console.log('\n═══ Test 3: minZoneSize = 5, 2 petites zones ═══');
const rng3 = new SeededRandom('test-seed-3');
generateZones(rng3, 5, 2, true);

console.log('\n═══ Test 4: minZoneSize = 4, 2 petites zones ═══');
const rng4 = new SeededRandom('test-seed-4');
generateZones(rng4, 4, 2, true);

console.log('\n✅ Tests terminés');
