/**
 * Génère des puzzles Lumizle "logiques" (avec solution unique et difficulté
 * mesurée) et les stocke dans lumizle-cache.json.
 *
 * Format de cache (nouveau) :
 *   {
 *     "YYYY-MM-DD": {
 *       puzzle: { initialGrid, solution, rules, metadata },
 *       generatedAt: ISO,
 *       metadata: { dateKey, version: 'logical-rule-packs-v2', rulePackId }
 *     }
 *   }
 *
 * Usage :
 *   node generate-lumizle-logical-archive.js [days_back] [--force] [--from=YYYY-MM-DD] [--max-grid=N]
 *
 * Examples :
 *   node generate-lumizle-logical-archive.js 30
 *   node generate-lumizle-logical-archive.js 365 --force
 *   node generate-lumizle-logical-archive.js --from=2025-01-01
 */
import { generateLogicalDailyLumizle, pickLogicalDailyRulePack } from './src/algorithms/lumizle/puzzleFactory.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const fromArg = args.find(a => a.startsWith('--from='));
const maxGridArg = args.find(a => a.startsWith('--max-grid='));
const maxGridSize = maxGridArg ? parseInt(maxGridArg.split('=')[1], 10) : undefined;
const daysArg = args.find(a => /^\d+$/.test(a));

const cachePath = './lumizle-cache.json';
const cache = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, 'utf8').replace(/^\uFEFF/, ''))
  : {};

function hasClueQuality(entry) {
  const quality = entry?.puzzle?.metadata?.clueQuality;
  if (!quality) return false;
  return !quality.requireAllLightInvalid || quality.allUnknownsAsLightValid === false;
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

// Construire la liste des dates à traiter
const targets = [];
if (fromArg) {
  const fromDate = new Date(fromArg.split('=')[1] + 'T00:00:00Z');
  for (let d = new Date(fromDate); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    targets.push(d.toISOString().slice(0, 10));
  }
} else {
  const days = parseInt(daysArg ?? '30', 10);
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    targets.push(d.toISOString().slice(0, 10));
  }
  // Inclure aujourd'hui aussi
  targets.unshift(today.toISOString().slice(0, 10));
}

const todo = targets.filter(k => {
  if (force) return true;
  const entry = cache[k];
  if (!entry) return true;
  // Régénérer si l'entrée est sous l'ancien format ou sans qualité d'indices.
  const meta = entry.puzzle?.metadata || {};
  return meta.isUnique !== true || !meta.difficulty || !hasClueQuality(entry);
});

const skipped = targets.length - todo.length;
console.log(`📋 Cibles : ${targets.length}  À générer : ${todo.length}  Déjà en cache : ${skipped}`);
if (Number.isFinite(maxGridSize)) console.log(`Taille max grille : ${maxGridSize}x${maxGridSize}`);

if (todo.length === 0) {
  console.log('\n✅ Rien à faire.');
  process.exit(0);
}

let generated = 0;
let failed = 0;
const failedDates = [];

const tierStats = { facile: 0, moyen: 0, difficile: 0, expert: 0 };

const tStart = Date.now();
for (let i = 0; i < todo.length; i++) {
  const dateKey = todo[i];
  const pack = pickLogicalDailyRulePack(dateKey, { maxGridSize });

  process.stdout.write(`[${i + 1}/${todo.length}] ${dateKey} (${pack.tier}, ${pack.id}, ${pack.gridSize}x${pack.gridSize}) ... `);

  const t0 = Date.now();
  const puzzle = generateLogicalDailyLumizle(dateKey, {
    timeoutMs: pack.tier === 'expert' ? 180000 : 90000,
    maxGenerationAttempts: pack.tier === 'expert' ? 8 : 5,
    maxGridSize,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (!puzzle) {
    console.log(`❌ ÉCHEC (${elapsed}s)`);
    failed++;
    failedDates.push(dateKey);
    continue;
  }

  const d = puzzle.metadata.difficulty;
  console.log(`✅ ${elapsed}s  L${d.maxLevel} score=${d.score} clues=${puzzle.metadata.clueCount}/${puzzle.metadata.totalCells}`);

  cache[dateKey] = {
    puzzle: {
      initialGrid: puzzle.initialGrid,
      solution: puzzle.solution,
      rules: puzzle.rules,
      metadata: puzzle.metadata,
    },
    generatedAt: new Date().toISOString(),
    metadata: { dateKey, version: 'logical-rule-packs-v2', rulePackId: pack.id },
  };
  generated++;
  tierStats[pack.tier]++;

  // Sauvegarde après chaque puzzle pour résister aux interruptions
  writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

const totalElapsed = ((Date.now() - tStart) / 1000).toFixed(1);
console.log(`\n═══════════════════════════════════`);
console.log(`Généré : ${generated} / ${todo.length}  en ${totalElapsed}s`);
if (failed) {
  console.log(`Échoué : ${failed}`);
  console.log(`Dates : ${failedDates.join(', ')}`);
}
console.log(`Répartition tiers générés : facile=${tierStats.facile} moyen=${tierStats.moyen} difficile=${tierStats.difficile} expert=${tierStats.expert}`);
console.log(`Cache total : ${Object.keys(cache).length} entrées`);
