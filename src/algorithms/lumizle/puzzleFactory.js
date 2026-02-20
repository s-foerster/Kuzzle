/**
 * Lumizle - Fabrique de puzzles (API publique)
 *
 * Point d'entrée unique pour générer des puzzles Lumizle.
 * Gère la sélection de la configuration selon la difficulté
 * et fournit les helpers pour les puzzles quotidiens.
 */

import { generatePuzzle } from './generator.js';
import { SeededRandom }   from '../../utils/seededRandom.js';

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
    gridSize:      5,
    rules:         [{ id: 'CONNECT_LIGHT' }],
    minLightRatio: 0.38,
    maxLightRatio: 0.62,
  },
  medium: {
    gridSize:      7,
    rules:         [{ id: 'CONNECT_LIGHT' }],
    minLightRatio: 0.35,
    maxLightRatio: 0.65,
  },
  hard: {
    gridSize:      8,
    rules:         [{ id: 'CONNECT_LIGHT' }],
    minLightRatio: 0.35,
    maxLightRatio: 0.65,
  },
};

// Configs quotidiennes (rotation déterministe par date)
const DAILY_CONFIGS = [
  { gridSize: 6, difficulty: 'easy',   rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.38, maxLightRatio: 0.62 },
  { gridSize: 7, difficulty: 'medium', rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.35, maxLightRatio: 0.65 },
  { gridSize: 7, difficulty: 'medium', rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.35, maxLightRatio: 0.65 },
  { gridSize: 8, difficulty: 'hard',   rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.35, maxLightRatio: 0.65 },
  { gridSize: 8, difficulty: 'hard',   rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.35, maxLightRatio: 0.65 },
  { gridSize: 6, difficulty: 'easy',   rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.38, maxLightRatio: 0.62 },
  { gridSize: 7, difficulty: 'medium', rules: [{ id: 'CONNECT_LIGHT' }], minLightRatio: 0.35, maxLightRatio: 0.65 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit sur une string (même algo que seededRandom.js). */
function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash  = Math.imul(hash, 0x01000193);
    hash  = hash >>> 0;
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
    size:             cfg.gridSize,
    rules:            cfg.rules,
    checkUniqueness:  true,
    minLightRatio:    cfg.minLightRatio,
    maxLightRatio:    cfg.maxLightRatio,
  });
}

/**
 * Génère le puzzle quotidien Lumizle pour une date donnée.
 *
 * @param {string} dateKey - Format YYYY-MM-DD
 * @returns {{ initialGrid, solution, rules, metadata }}
 */
export function generateDailyLumizle(dateKey) {
  const cfg  = pickDailyConfig(dateKey);
  const seed = `lumizle_daily_${dateKey}`;
  return generatePuzzle(seed, {
    size:             cfg.gridSize,
    rules:            cfg.rules,
    checkUniqueness:  true,
    minLightRatio:    cfg.minLightRatio,
    maxLightRatio:    cfg.maxLightRatio,
  });
}
