// Test rapide du serveur
import express from 'express';
import { generateDailyPuzzle } from './src/algorithms/puzzleGenerator.js';

console.log('✅ Import réussi');

const app = express();

app.get('/test', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('✅ Serveur de test démarré sur le port 3000');
});

// Test génération
console.log('🧪 Test génération puzzle...');
const puzzle = generateDailyPuzzle();
console.log('✅ Puzzle généré:', {
  hasZones: !!puzzle.zones,
  hasSolution: !!puzzle.solution,
  isUnique: puzzle.metadata?.isUnique
});
