/**
 * Script de test pour vérifier la génération de puzzles
 * Utilisation : node test-generation.js
 */

import { generateBatch, generatePuzzle } from './src/algorithms/puzzleGenerator.js';
import { getTodaySeed } from './src/utils/seededRandom.js';

console.log('🧪 Test de génération de puzzles avec validation d\'unicité\n');

// Test 1: Génération du puzzle du jour avec validation
console.log('📅 Test 1: Puzzle du jour (avec validation d\'unicité)');
const todaySeed = getTodaySeed();
console.log(`Seed du jour: ${todaySeed}`);

const todayPuzzle = generatePuzzle(todaySeed, { checkUniqueness: true });
if (todayPuzzle) {
  console.log('✅ Puzzle généré avec succès !');
  console.log(`   Temps total: ${todayPuzzle.metadata.generationTime}ms`);
  console.log(`   Temps validation: ${todayPuzzle.metadata.validationTime}ms`);
  console.log(`   Tentatives totales: ${todayPuzzle.metadata.totalAttempts}`);
  console.log(`   Puzzles rejetés: ${todayPuzzle.metadata.rejectedNonUnique}`);
  console.log(`   Nombre de cœurs: ${todayPuzzle.metadata.heartCount}`);
  console.log(`   ⭐ UNICITÉ GARANTIE: ${todayPuzzle.metadata.isUnique ? 'OUI' : 'NON'}`);
} else {
  console.log('❌ Échec de génération');
}

// Test 2: Reproductibilité avec validation
console.log('\n🔄 Test 2: Reproductibilité (avec validation)');
const puzzle1 = generatePuzzle('test-seed-123', { checkUniqueness: true });
const puzzle2 = generatePuzzle('test-seed-123', { checkUniqueness: true });

if (puzzle1 && puzzle2) {
  let identical = true;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (puzzle1.zones[row][col] !== puzzle2.zones[row][col]) {
        identical = false;
        break;
      }
      if (puzzle1.solution[row][col] !== puzzle2.solution[row][col]) {
        identical = false;
        break;
      }
    }
    if (!identical) break;
  }
  
  if (identical) {
    console.log('✅ Les puzzles sont identiques (seed déterministe fonctionne)');
  } else {
    console.log('❌ Les puzzles sont différents (problème de déterminisme)');
  }
} else {
  console.log('❌ Échec de génération pour le test de reproductibilité');
}

// Test 3: Génération en batch avec validation d'unicité
console.log('\n📊 Test 3: Génération de 5 puzzles avec validation');
console.log('(Cela peut prendre quelques secondes...)');

const batchStart = performance.now();
const uniquePuzzles = [];
for (let i = 0; i < 5; i++) {
  console.log(`\n  Puzzle ${i + 1}/5...`);
  const puzzle = generatePuzzle(`batch-test-${i}`, { checkUniqueness: true });
  if (puzzle) {
    uniquePuzzles.push(puzzle);
    console.log(`  ✅ Généré en ${puzzle.metadata.generationTime}ms (validation: ${puzzle.metadata.validationTime}ms)`);
    if (puzzle.metadata.rejectedNonUnique > 0) {
      console.log(`  ⚠️  ${puzzle.metadata.rejectedNonUnique} puzzle(s) rejeté(s)`);
    }
  } else {
    console.log(`  ❌ Échec`);
  }
}
const batchEnd = performance.now();

console.log(`\n✅ ${uniquePuzzles.length}/5 puzzles uniques générés`);
console.log(`Temps total: ${Math.round(batchEnd - batchStart)}ms`);
if (uniquePuzzles.length > 0) {
  const avgTime = Math.round(uniquePuzzles.reduce((sum, p) => sum + p.metadata.generationTime, 0) / uniquePuzzles.length);
  const avgValidation = Math.round(uniquePuzzles.reduce((sum, p) => sum + p.metadata.validationTime, 0) / uniquePuzzles.length);
  const totalRejected = uniquePuzzles.reduce((sum, p) => sum + p.metadata.rejectedNonUnique, 0);
  console.log(`Temps moyen génération: ${avgTime}ms`);
  console.log(`Temps moyen validation: ${avgValidation}ms`);
  console.log(`Total de puzzles rejetés: ${totalRejected}`);
}

// Test 4: Vérification des contraintes
console.log('\n✔️  Test 4: Vérification des contraintes');
if (todayPuzzle) {
  const { zones, solution } = todayPuzzle;
  
  // Vérifier lignes
  const rowCounts = Array(10).fill(0);
  const colCounts = Array(10).fill(0);
  const zoneCounts = Array(10).fill(0);
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (solution[row][col]) {
        rowCounts[row]++;
        colCounts[col]++;
        zoneCounts[zones[row][col]]++;
      }
    }
  }
  
  let allValid = true;
  
  // Vérifier 2 par ligne
  for (let i = 0; i < 10; i++) {
    if (rowCounts[i] !== 2) {
      console.log(`❌ Ligne ${i+1}: ${rowCounts[i]} cœurs (attendu: 2)`);
      allValid = false;
    }
  }
  
  // Vérifier 2 par colonne
  for (let i = 0; i < 10; i++) {
    if (colCounts[i] !== 2) {
      console.log(`❌ Colonne ${i+1}: ${colCounts[i]} cœurs (attendu: 2)`);
      allValid = false;
    }
  }
  
  // Vérifier 2 par zone
  for (let i = 0; i < 10; i++) {
    if (zoneCounts[i] !== 2) {
      console.log(`❌ Zone ${i+1}: ${zoneCounts[i]} cœurs (attendu: 2)`);
      allValid = false;
    }
  }
  
  // Vérifier adjacence
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (solution[row][col]) {
        // Vérifier les 8 voisins
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dr, dc] of dirs) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            if (solution[newRow][newCol]) {
              console.log(`❌ Cœurs adjacents en (${row},${col}) et (${newRow},${newCol})`);
              allValid = false;
            }
          }
        }
      }
    }
  }
  
  if (allValid) {
    console.log('✅ Toutes les contraintes sont respectées !');
  } else {
    console.log('❌ Certaines contraintes sont violées');
  }
}

console.log('\n✨ Tests terminés !');
