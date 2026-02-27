/**
 * Génère les puzzles Lumizle des N prochains jours et les met en cache dans lumizle-cache.json
 * Usage : node generate-lumizle-future.js [nb_jours]   (défaut: 7)
 */
import { generateDailyLumizle } from './src/algorithms/lumizle/puzzleFactory.js';
import { readFileSync, writeFileSync } from 'fs';

const nbDays = parseInt(process.argv[2] ?? '7', 10);

const cache = JSON.parse(readFileSync('./lumizle-cache.json', 'utf8'));

// Construire la liste des dates à générer (aujourd'hui inclus si manquant, + N jours suivants)
const today = new Date();
today.setHours(0, 0, 0, 0);

const targets = [];
for (let i = 0; i <= nbDays; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  const key = d.toISOString().slice(0, 10);
  targets.push(key);
}

const missing = targets.filter(k => !cache[k]);
const alreadyCached = targets.filter(k => cache[k]);

if (alreadyCached.length) {
  console.log(`✅ Déjà en cache : ${alreadyCached.join(', ')}`);
}
if (!missing.length) {
  console.log('\n🎉 Tous les puzzles Lumizle sont déjà générés, rien à faire.');
  process.exit(0);
}

console.log(`\n⚙️  ${missing.length} puzzle(s) à générer : ${missing.join(', ')}\n`);

let generated = 0;
let failed = 0;

for (const dateKey of missing) {
  console.log(`─── ${dateKey}`);

  const t0 = Date.now();
  const puzzle = generateDailyLumizle(dateKey);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (!puzzle) {
    console.error(`  ❌ ÉCHEC (${elapsed}s) — puzzle non généré`);
    failed++;
    continue;
  }

  console.log(`  ✅ OK — ${elapsed}s`);

  cache[dateKey] = {
    puzzle: {
      initialGrid: puzzle.initialGrid,
      solution: puzzle.solution,
      rules: puzzle.rules,
      metadata: puzzle.metadata
    },
    generatedAt: new Date().toISOString(),
    metadata: { dateKey }
  };
  generated++;

  // Sauvegarde intermédiaire après chaque puzzle
  writeFileSync('./lumizle-cache.json', JSON.stringify(cache, null, 2), 'utf8');
  console.log(`  💾 lumizle-cache.json sauvegardé\n`);
}

console.log(`\n═══════════════════════════════════`);
console.log(`Généré  : ${generated} / ${missing.length}`);
if (failed) console.log(`Échoué  : ${failed}`);
console.log(`Cache total : ${Object.keys(cache).length} puzzles`);
console.log(`Dates en cache : ${Object.keys(cache).sort().join(', ')}`);
