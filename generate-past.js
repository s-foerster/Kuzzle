/**
 * Génère les puzzles des N derniers jours et les met en cache dans puzzle-cache.json
 * Usage : node generate-past.js [nb_jours]   (défaut: 30)
 */
import { generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';
import { readFileSync, writeFileSync } from 'fs';

// ─── Même logique que server.js ───────────────────────────────────────────────
const PUZZLE_CONFIGS = [
  { gridSize: 10, minSmallZones: 5, smallZoneSize: 4 },
  { gridSize: 9,  minSmallZones: 4, smallZoneSize: 4 },
  { gridSize: 9,  minSmallZones: 5, smallZoneSize: 4 },
  { gridSize: 10, minSmallZones: 4, smallZoneSize: 5 },
  { gridSize: 10, minSmallZones: 4, smallZoneSize: 4 },
];

function pickConfigForDate(dateKey) {
  let h = 0x811c9dc5;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
    h = h >>> 0;
  }
  const idx = h % PUZZLE_CONFIGS.length;
  return PUZZLE_CONFIGS[idx];
}
// ─────────────────────────────────────────────────────────────────────────────

const nbDays = parseInt(process.argv[2] ?? '30', 10);

const cache = JSON.parse(readFileSync('./puzzle-cache.json', 'utf8'));

// Construire la liste des N derniers jours (hors aujourd'hui, déjà géré par generate-future)
const today = new Date();
today.setHours(0, 0, 0, 0);

const targets = [];
for (let i = 1; i <= nbDays; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const key = d.toISOString().slice(0, 10);
  targets.push(key);
}

const missing = targets.filter(k => !cache[k]);
const alreadyCached = targets.filter(k => cache[k]);

if (alreadyCached.length) {
  console.log(`✅ Déjà en cache (${alreadyCached.length}) : ${alreadyCached.slice(0, 5).join(', ')}${alreadyCached.length > 5 ? '...' : ''}`);
}
if (!missing.length) {
  console.log('\n🎉 Tous les puzzles des 30 derniers jours sont déjà générés, rien à faire.');
  process.exit(0);
}

console.log(`\n⚙️  ${missing.length} puzzle(s) à générer (du passé) :\n   ${missing.join(', ')}\n`);

let generated = 0;
let failed = 0;

// Générer du plus récent au plus ancien pour que les dates utiles soient dispo en premier
for (const dateKey of missing) {
  const config = pickConfigForDate(dateKey);
  const seed = dateKey.replace(/-/g, '');
  console.log(`─── ${dateKey}  (seed=${seed}, gridSize=${config.gridSize}, minSmallZones=${config.minSmallZones}, smallZoneSize=${config.smallZoneSize})`);

  const t0 = Date.now();
  const puzzle = generatePuzzleHeartsFirst(seed, {
    ...config,
    checkUniqueness: true,
    maxTotalAttempts: 1_000_000,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (!puzzle || !puzzle.metadata?.isUnique) {
    console.error(`  ❌ ÉCHEC (${elapsed}s) - puzzle non généré ou non unique`);
    failed++;
    continue;
  }

  console.log(`  ✅ OK - ${puzzle.metadata.totalAttempts} tentatives, ${elapsed}s`);

  cache[dateKey] = {
    puzzle: { zones: puzzle.zones, solution: puzzle.solution },
    generatedAt: new Date().toISOString(),
    metadata: puzzle.metadata,
  };
  generated++;

  // Sauvegarde intermédiaire après chaque puzzle
  writeFileSync('./puzzle-cache.json', JSON.stringify(cache, null, 2), 'utf8');
  console.log(`  💾 puzzle-cache.json sauvegardé\n`);
}

console.log(`\n═══════════════════════════════════`);
console.log(`Généré  : ${generated} / ${missing.length}`);
if (failed) console.log(`Échoué  : ${failed}`);
console.log(`Cache total : ${Object.keys(cache).length} puzzles`);
console.log(`Dates en cache : ${Object.keys(cache).sort().slice(0, 5).join(', ')}...`);
