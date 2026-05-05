/**
 * Génère les puzzles Lumizle des N derniers jours et les met en cache dans lumizle-cache.json
 * Usage : node generate-lumizle-past.js [nb_jours] [--force] [--max-grid=N]
 */
import {
    generateLogicalLumizlePackPuzzle,
    getLumizleDailyRuleCoverage,
    pickLogicalDailyRulePack,
    LUMIZLE_DAILY_RULE_PACKS,
} from './src/algorithms/lumizle/puzzleFactory.js';
import { readFileSync, writeFileSync, renameSync } from 'fs';

const args = process.argv.slice(2);
const nbDays = parseInt(args.find(arg => /^\d+$/.test(arg)) ?? '30', 10);
const force = args.includes('--force');
const maxGridArg = args.find(arg => arg.startsWith('--max-grid='));
const maxGridSize = maxGridArg ? parseInt(maxGridArg.split('=')[1], 10) : undefined;

const CACHE_PATH = './lumizle-cache.json';

/**
 * Sauvegarde atomique : écrit dans un fichier .tmp puis renomme.
 * Évite les erreurs UNKNOWN sur Windows (fichier verrouillé par un watcher).
 */
function saveCacheAtomic(cache) {
    const tmp = CACHE_PATH + '.tmp';
    writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf8');
    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            renameSync(tmp, CACHE_PATH);
            return;
        } catch (err) {
            lastError = err;
            // Petite pause synchrone avant de réessayer (antivirus / watcher)
            const wait = 300 * (attempt + 1);
            const t = Date.now();
            while (Date.now() - t < wait) { /* spin */ }
        }
    }
    throw lastError;
}

/**
 * Retourne la liste ordonnée des packs à essayer pour une date donnée.
 * Le pack primaire (sélection normale) est en tête ; les fallbacks sont
 * triés par gridSize croissant (plus petites grilles = génération plus fiable).
 */
function getFallbackPacks(dateKey) {
    const eligiblePacks = Number.isFinite(maxGridSize)
        ? LUMIZLE_DAILY_RULE_PACKS.filter(p => p.gridSize <= maxGridSize)
        : LUMIZLE_DAILY_RULE_PACKS;
    const primary = pickLogicalDailyRulePack(dateKey, { maxGridSize });
    const fallbacks = eligiblePacks
        .filter(p => p.id !== primary.id)
        .sort((a, b) => a.gridSize - b.gridSize);
    return [primary, ...fallbacks];
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8').replace(/^\uFEFF/, ''));

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

const missing = targets.filter(k => force || !cache[k]);
const alreadyCached = targets.filter(k => !force && cache[k]);

if (alreadyCached.length) {
    console.log(`✅ Déjà en cache (${alreadyCached.length}) : ${alreadyCached.slice(0, 5).join(', ')}${alreadyCached.length > 5 ? '...' : ''}`);
}
if (!missing.length) {
    console.log(`\n🎉 Tous les puzzles Lumizle des ${nbDays} derniers jours sont déjà générés, rien à faire.`);
    process.exit(0);
}

console.log(`\n⚙️  ${missing.length} puzzle(s) à générer (du passé) :\n   ${missing.join(', ')}\n`);
if (force) console.log('Mode force : les entrées existantes seront régénérées.\n');
if (Number.isFinite(maxGridSize)) console.log(`Taille max grille : ${maxGridSize}x${maxGridSize}\n`);

const coverage = getLumizleDailyRuleCoverage();
if (coverage.missing.length || coverage.unknown.length) {
    console.warn(`⚠️ Couverture règles incomplète. Missing=${coverage.missing.join(', ') || 'aucune'} Unknown=${coverage.unknown.join(', ') || 'aucune'}\n`);
} else {
    console.log(`Couverture règles OK : ${coverage.used.length} règle(s) couvertes par les packs.\n`);
}

let generated = 0;
let failed = 0;

for (const dateKey of missing) {
    console.log(`─── ${dateKey}`);
    const packsToTry = getFallbackPacks(dateKey);
    const t0 = Date.now();
    let puzzle = null;
    let usedPack = null;
    let lastError = null;

    for (const pack of packsToTry) {
        try {
            const seed = `lumizle_logical_daily_${dateKey}_${pack.id}`;
            const candidate = generateLogicalLumizlePackPuzzle(seed, pack, {
                timeoutMs: pack.tier === 'expert' ? 180000 : 90000,
                maxGenerationAttempts: pack.tier === 'expert' ? 8 : 5,
            });
            if (candidate) {
                puzzle = candidate;
                usedPack = pack;
                break;
            }
        } catch (err) {
            lastError = err;
        }
        const elapsedSoFar = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`    ↳ ${pack.id} échoué (${elapsedSoFar}s)${lastError ? ` : ${lastError.message}` : ''}`);
        lastError = null;
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    if (!puzzle) {
        console.error(`  ❌ ÉCHEC (${elapsed}s) - tous les ${packsToTry.length} packs ont échoué`);
        failed++;
        continue;
    }

    const wasFallback = usedPack.id !== packsToTry[0].id;
    console.log(`  ✅ OK - ${elapsed}s | ${puzzle.metadata.gridSize}x${puzzle.metadata.gridSize} | ${usedPack.id}${wasFallback ? ' (fallback)' : ''} | ${usedPack.rules.map(r => r.id).join(', ')}`);

    cache[dateKey] = {
        puzzle: {
            initialGrid: puzzle.initialGrid,
            solution: puzzle.solution,
            rules: puzzle.rules,
            metadata: puzzle.metadata
        },
        generatedAt: new Date().toISOString(),
        metadata: { dateKey, version: 'logical-rule-packs-v1', rulePackId: usedPack.id }
    };
    generated++;

    // Sauvegarde atomique après chaque puzzle
    saveCacheAtomic(cache);
    console.log(`  💾 lumizle-cache.json sauvegardé\n`);
}

console.log(`\n═══════════════════════════════════`);
console.log(`Généré  : ${generated} / ${missing.length}`);
if (failed) console.log(`Échoué  : ${failed}`);
console.log(`Cache total : ${Object.keys(cache).length} puzzles Lumizle`);
console.log(`Dates en cache : ${Object.keys(cache).sort().slice(0, 5).join(', ')}...`);
