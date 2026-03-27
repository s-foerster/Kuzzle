import { writeFileSync } from 'fs';
import { generatePuzzle } from './src/algorithms/lumizle/generator.js';

const CONFIGS = [
    {
        id: 'easy_1', seed: 'prac_e1_v6', difficulty: 'easy',
        size: 5,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }],
        minLightRatio: 0.40, maxLightRatio: 0.60, clueRatio: 0.32,
    },
    {
        id: 'easy_2', seed: 'prac_e2_v6', difficulty: 'easy',
        size: 6,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }],
        minLightRatio: 0.40, maxLightRatio: 0.60, clueRatio: 0.28,
    },
    {
        id: 'easy_3', seed: 'prac_e3_v6', difficulty: 'easy',
        size: 5,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }],
        minLightRatio: 0.40, maxLightRatio: 0.65, clueRatio: 0.26,
    },
    {
        id: 'medium_1', seed: 'prac_m1_v6', difficulty: 'medium',
        size: 7,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'NO_2X2_DARK' }],
        minLightRatio: 0.38, maxLightRatio: 0.62, clueRatio: 0.20,
    },
    // NOUVEAUX NIVEAUX POUR TESTER LES RÈGLES
    {
        id: 'medium_2', seed: 'prac_m2_rowexact2', difficulty: 'medium',
        size: 6,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'CONNECT_DARK' }, { id: 'ROW_EXACT_DARK', params: { n: 2 } }],
        minLightRatio: 0.40, maxLightRatio: 0.70, clueRatio: 0.18,
    },
    {
        id: 'medium_3', seed: 'prac_m3_nuribou1', difficulty: 'medium',
        size: 7,
        rules: [{ id: 'CONNECT_LIGHT' }, { id: 'NO_2X2_DARK' }, { id: 'NURIBOU_STRIPES' }],
        minLightRatio: 0.35, maxLightRatio: 0.65, clueRatio: 0.16,
    },
];
const out = {};
for (const cfg of CONFIGS) {
    process.stdout.write(`⏳ ${cfg.id} (${cfg.size}×${cfg.size}) clue=${Math.round(cfg.clueRatio * 100)}%… `);
    const t0 = Date.now();
    try {
        const puzzle = generatePuzzle(cfg.seed, {
            size: cfg.size, rules: cfg.rules,
            minLightRatio: cfg.minLightRatio, maxLightRatio: cfg.maxLightRatio,
            clueRatio: cfg.clueRatio,
        });
        console.log(`✅ ${Date.now() - t0}ms - ${puzzle.metadata.clueCount}/${puzzle.metadata.totalCells}`);
        out[cfg.id] = { id: cfg.id, difficulty: cfg.difficulty, puzzle };
    } catch (e) {
        console.log(`❌ ${e.message}`);
    }
}
writeFileSync('./src/data/lumizle-puzzles.json', JSON.stringify(out, null, 2), 'utf-8');
console.log(`\n📦 ${Object.keys(out).length}/${CONFIGS.length} générés.`);
