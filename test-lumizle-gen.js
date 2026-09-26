/**
 * Script de test pour toutes les DAILY_CONFIGS avec checkUniqueness: true.
 * Usage: node test-lumizle-gen.js
 */

import { generateDailyLumizle } from './src/algorithms/lumizle/puzzleFactory.js';

// Tester 8 dates différentes (une par config)
const dates = [
    '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
    '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27',
];

console.log('Testing generateDailyLumizle for all DAILY_CONFIGS...\n');

for (const date of dates) {
    const t0 = Date.now();
    try {
        const p = generateDailyLumizle(date);
        const ms = Date.now() - t0;
        const rules = p.rules.map(r => r.id.replace('CONNECT_', 'C').replace('NO_2X2_', '!2x2').replace('NO_3_IN_A_ROW_', '!3')).join('+');
        console.log(`✅ ${date}  ${ms.toString().padStart(5)}ms | ${p.metadata.gridSize}x${p.metadata.gridSize} | ${rules}`);
        console.log(`            clues=${p.metadata.clueCount}/${p.metadata.gridSize ** 2} | unique=${p.metadata.isUnique} | light=${p.metadata.lightCount}`);
    } catch (e) {
        const ms = Date.now() - t0;
        console.log(`❌ ${date} - FAILED in ${ms}ms: ${e.message}`);
    }
}
