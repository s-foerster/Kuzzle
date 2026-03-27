/**
 * Lumizle - Fabrique de puzzles (API publique)
 *
 * Point d'entrée unique pour générer des puzzles Lumizle.
 * Gère la sélection de la configuration selon la difficulté
 * et fournit les helpers pour les puzzles quotidiens.
 */

import { generatePuzzle } from './generator.js';
import { SeededRandom } from '../../utils/seededRandom.js';

// ---------------------------------------------------------------------------
// Configurations par difficulté
// ---------------------------------------------------------------------------

/**
 * Chaque config définit :
 *   gridSize      : taille de la grille NxN
 *   rules         : règles actives
 *   minLightRatio : proportion minimale de cellules claires
 *   maxLightRatio : proportion maximale de cellules claires
 */
export const LUMIZLE_DIFFICULTY_CONFIGS = {
  easy: {
    gridSize: 5,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
      { id: 'NO_2X2_DARK' },
    ],
    minLightRatio: 0.40,
    maxLightRatio: 0.60,
  },
  medium: {
    gridSize: 6,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
      { id: 'NO_2X2_DARK' },
      { id: 'ROW_EXACT_DARK', params: { n: 2 } },
    ],
    minLightRatio: 0.38,
    maxLightRatio: 0.62,
  },
  hard: {
    gridSize: 7,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 3 } },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_2X2_LIGHT' },
      { id: 'NURIBOU_STRIPES' },
    ],
    minLightRatio: 0.40,
    maxLightRatio: 0.60,
  },
};

// Configs quotidiennes - progression de difficulté variée
const DAILY_CONFIGS = [
  // ── Easy ──────────────────────────────────────────────────────────────────
  {
    gridSize: 5, difficulty: 'easy',
    rules: [{ id: 'CONNECT_LIGHT' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }, { id: 'NO_2X2_DARK' }],
    minLightRatio: 0.40, maxLightRatio: 0.60,
  },
  {
    gridSize: 6, difficulty: 'easy',
    rules: [{ id: 'CONNECT_LIGHT' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }, { id: 'NO_2X2_DARK' }],
    minLightRatio: 0.38, maxLightRatio: 0.62,
  },
  // ── Medium ────────────────────────────────────────────────────────────────
  {
    gridSize: 6, difficulty: 'medium',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
      { id: 'NO_2X2_DARK' },
      { id: 'ROW_EXACT_DARK', params: { n: 2 } },
    ],
    minLightRatio: 0.38, maxLightRatio: 0.62,
  },
  {
    gridSize: 7, difficulty: 'medium',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'CONNECT_DARK' },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_PATTERN_DARK', params: { patternName: 'L_TROMINO' } },
    ],
    minLightRatio: 0.38, maxLightRatio: 0.62,
  },
  {
    gridSize: 6, difficulty: 'medium',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 3 } },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_2X2_LIGHT' },
    ],
    minLightRatio: 0.40, maxLightRatio: 0.60,
  },
  // ── Hard ──────────────────────────────────────────────────────────────────
  {
    gridSize: 7, difficulty: 'hard',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
      { id: 'NO_2X2_DARK' },
      { id: 'NURIBOU_STRIPES' },
    ],
    minLightRatio: 0.40, maxLightRatio: 0.60,
  },
  {
    gridSize: 7, difficulty: 'hard',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'CONNECT_DARK' },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_2X2_LIGHT' },
      { id: 'NO_PATTERN_DARK', params: { patternName: 'T_TETROMINO' } },
    ],
    minLightRatio: 0.38, maxLightRatio: 0.62,
  },
  {
    gridSize: 7, difficulty: 'hard',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 3 } },
      { id: 'NO_2X2_DARK' },
      { id: 'SYMMETRY_180' },
    ],
    minLightRatio: 0.40, maxLightRatio: 0.60,
  },
];


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit sur une string (même algo que seededRandom.js). */
function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash = hash >>> 0;
  }
  return hash === 0 ? 1 : hash;
}

/** Sélectionne la config quotidienne de manière déterministe par date. */
export function pickDailyConfig(dateKey) {
  const h = hashString(`lumizle_${dateKey}`);
  return DAILY_CONFIGS[h % DAILY_CONFIGS.length];
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Génère un puzzle Lumizle à difficulté donnée.
 *
 * @param {string|number} seed
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ initialGrid, solution, rules, metadata }}
 */
export function generateLumizlePuzzle(seed, difficulty = 'medium') {
  const cfg = LUMIZLE_DIFFICULTY_CONFIGS[difficulty] || LUMIZLE_DIFFICULTY_CONFIGS.medium;
  return generatePuzzle(seed, {
    size: cfg.gridSize,
    rules: cfg.rules,
    minLightRatio: cfg.minLightRatio,
    maxLightRatio: cfg.maxLightRatio,
    clueRatio: difficulty === 'easy' ? 0.32 : difficulty === 'hard' ? 0.17 : 0.22,
  });
}

/**
 * Génère le puzzle quotidien Lumizle pour une date donnée.
 *
 * @param {string} dateKey - Format YYYY-MM-DD
 * @returns {{ initialGrid, solution, rules, metadata }}
 */
export function generateDailyLumizle(dateKey) {
  const cfg = pickDailyConfig(dateKey);
  const seed = `lumizle_daily_${dateKey}`;
  return generatePuzzle(seed, {
    size: cfg.gridSize,
    rules: cfg.rules,
    minLightRatio: cfg.minLightRatio,
    maxLightRatio: cfg.maxLightRatio,
    clueRatio: cfg.difficulty === 'easy' ? 0.32 : cfg.difficulty === 'hard' ? 0.17 : 0.22,
  });
}
