/**
 * Lumizle - Fabrique de puzzles (API publique)
 *
 * Point d'entrée unique pour générer des puzzles Lumizle.
 *
 * Deux pipelines coexistent :
 *   - generateLumizlePuzzle / generateDailyLumizle : ancien pipeline (rapide,
 *     pas d'unicité garantie). Conservé pour compat des puzzles déjà cachés.
 *   - generateLogicalLumizlePuzzle / generateLogicalDailyLumizle : nouveau
 *     pipeline avec solveur logique, unicité garantie, difficulté mesurée.
 */

import { ALL_RULES } from './rules.js';
import { generatePuzzle } from './generator.js';
import { generateLogicalPuzzle } from './logicalGenerator.js';

const DEFAULT_LOGICAL_TIMEOUT_MS = 90000;
const DEFAULT_LOGICAL_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Configurations par difficulté (NOUVEAU pipeline logique)
// ---------------------------------------------------------------------------

/**
 * Chaque tier définit :
 *   gridSize        : taille de la grille NxN
 *   rules           : règles actives
 *   minLightRatio   : proportion minimale de cellules claires
 *   maxLightRatio   : proportion maximale de cellules claires
 *   targetMaxLevel  : niveau de technique maximum autorisé (1..6)
 *   minTargetLevel  : niveau de technique minimum souhaité
 *   targetClueRatio : ratio d'indices visé (arrêt anticipé de la minimisation)
 *   allowHypothesis : autoriser depth-1 hypothesis (tier expert)
 *   clueQuality     : contraintes minimales sur les indices sombres utiles
 */
export const LUMIZLE_LOGICAL_TIERS = {
  facile: {
    label: 'Facile',
    gridSize: 5,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
    ],
    minLightRatio: 0.45,
    maxLightRatio: 0.60,
    targetMaxLevel: 3,
    minTargetLevel: 1,
    targetClueRatio: 0.30,
    clueQuality: { minFixedDarkClues: 3, minOpenDarkRegions: 3, maxCompleteDarkRegions: 0 },
    allowHypothesis: false,
  },
  moyen: {
    label: 'Moyen',
    gridSize: 6,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'NO_2X2_DARK' },
      { id: 'DARK_REGION_SIZE', params: { n: 3 } },
      { id: 'NO_3_DIAGONAL_DARK' },
    ],
    minLightRatio: 0.45,
    maxLightRatio: 0.60,
    targetMaxLevel: 4,
    minTargetLevel: 2,
    targetClueRatio: 0.28,
    clueQuality: { minFixedDarkClues: 3, minOpenDarkRegions: 3, maxCompleteDarkRegions: 0 },
    allowHypothesis: false,
  },
  difficile: {
    label: 'Difficile',
    gridSize: 8,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'CONNECT_DARK' },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_ISOLATED_DARK' },
    ],
    minLightRatio: 0.40,
    maxLightRatio: 0.60,
    targetMaxLevel: 5,
    minTargetLevel: 3,
    targetClueRatio: 0.22,
    clueQuality: { minFixedDarkClues: 2, minOpenDarkRegions: 0, maxCompleteDarkRegions: Infinity },
    allowHypothesis: false,
  },
  expert: {
    label: 'Expert',
    gridSize: 8,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'NO_2X2_DARK' },
      { id: 'NO_2X2_LIGHT' },
      { id: 'NO_3_DIAGONAL_DARK' },
      { id: 'DARK_MAX_DEGREE' },
    ],
    minLightRatio: 0.45,
    maxLightRatio: 0.55,
    targetMaxLevel: 5,
    minTargetLevel: 3,
    targetClueRatio: 0.22,
    clueQuality: { minFixedDarkClues: 2, minOpenDarkRegions: 0, maxCompleteDarkRegions: Infinity },
    allowHypothesis: false,
  },
};

const LEGACY_CLUE_QUALITY = {
  minFixedDarkClues: 3,
  minOpenDarkRegions: 3,
  maxCompleteDarkRegions: 0,
};

// ---------------------------------------------------------------------------
// Packs quotidiens logiques
// ---------------------------------------------------------------------------

/**
 * Packs prévalidés : diversité contrôlée, sans combinaisons volontairement
 * incompatibles. La rotation annuelle garantit que toutes les règles du registre
 * apparaissent dans les archives sans les empiler dans un même puzzle.
 */
export const LUMIZLE_DAILY_RULE_PACKS = [
  // {
  //   id: 'light-pairs',
  //   label: 'Paires sombres',
  //   tier: 'facile',
  //   gridSize: 5,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'DARK_REGION_SIZE', params: { n: 2 } },
  //   ],
  //   minLightRatio: 0.45,
  //   maxLightRatio: 0.60,
  //   targetMaxLevel: 3,
  //   minTargetLevel: 1,
  //   targetClueRatio: 0.30,
  // },
  {
    id: 'test1',
    label: 'Test 1',
    tier: 'facile',
    gridSize: 8,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'NO_2X2_LIGHT' },
    ],
    minLightRatio: 0.35,
    maxLightRatio: 0.75,
    targetMaxLevel: 6,
    minTargetLevel: 1,
    targetClueRatio: 0.30,
  },
  // {
  //   id: 'test2',
  //   label: 'Test 2',
  //   tier: 'facile',
  //   gridSize: 8,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_PATTERN_LIGHT', params: { patternName: 'L_TROMINO' } },
  //   ],
  //   minLightRatio: 0.35,
  //   maxLightRatio: 0.75,
  //   targetMaxLevel: 6,
  //   minTargetLevel: 1,
  //   targetClueRatio: 0.30,
  // },
  {
    id: 'test3',
    label: 'Test 3',
    tier: 'facile',
    gridSize: 8,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'NO_PATTERN_LIGHT', params: { patternName: 'T_TETROMINO' } },
    ],
    minLightRatio: 0.35,
    maxLightRatio: 0.75,
    targetMaxLevel: 6,
    minTargetLevel: 1,
    targetClueRatio: 0.30,
  },
  // {
  //   id: 'test4',
  //   label: 'Test 4',
  //   tier: 'facile',
  //   gridSize: 8,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NURIBOU_STRIPES' },
  //     // { id: 'NO_ISOLATED_DARK' },
  //   ],
  //   minLightRatio: 0.35,
  //   maxLightRatio: 0.75,
  //   targetMaxLevel: 6,
  //   minTargetLevel: 1,
  //   targetClueRatio: 0.30,
  // },
  {
    id: 'test5',
    label: 'Test 5',
    tier: 'facile',
    gridSize: 8,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'NO_3_DIAGONAL_LIGHT' },
    ],
    minLightRatio: 0.35,
    maxLightRatio: 0.75,
    targetMaxLevel: 6,
    minTargetLevel: 1,
    targetClueRatio: 0.30,
  },
  // {
  //   id: 'light-islands',
  //   label: 'Îlots clairs',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_DARK' },
  //     { id: 'LIGHT_REGION_SIZE', params: { n: 2 } },
  //     // { id: 'NO_2X2_LIGHT' },
  //   ],
  //   minLightRatio: 0.36,
  //   maxLightRatio: 0.52,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.30,
  // },
  // {
  //   id: 'dark-total',
  //   label: 'Quota sombre',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'DARK_AREA_EXACT', params: { n: 14 } },
  //     { id: 'NO_2X2_DARK' },
  //   ],
  //   minLightRatio: 0.55,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'light-total',
  //   label: 'Quota clair',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_DARK' },
  //     { id: 'LIGHT_AREA_EXACT', params: { n: 14 } },
  //     { id: 'NO_2X2_LIGHT' },
  //   ],
  //   minLightRatio: 0.35,
  //   maxLightRatio: 0.45,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'row-dark',
  //   label: 'Lignes sombres',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'ROW_EXACT_DARK', params: { n: 2 } },
  //     // { id: 'NO_3_IN_A_ROW_DARK' },
  //   ],
  //   minLightRatio: 0.55,
  //   maxLightRatio: 0.70,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'row-light',
  //   label: 'Lignes claires',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_DARK' },
  //     { id: 'ROW_EXACT_LIGHT', params: { n: 2 } },
  //     // { id: 'NO_3_IN_A_ROW_LIGHT' },
  //   ],
  //   minLightRatio: 0.30,
  //   maxLightRatio: 0.45,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'col-dark',
  //   label: 'Colonnes sombres',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'COL_EXACT_DARK', params: { n: 2 } },
  //     // { id: 'NO_3_IN_A_ROW_DARK' },
  //   ],
  //   minLightRatio: 0.55,
  //   maxLightRatio: 0.70,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'col-light',
  //   label: 'Colonnes claires',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_DARK' },
  //     { id: 'COL_EXACT_LIGHT', params: { n: 2 } },
  //     // { id: 'NO_3_IN_A_ROW_LIGHT' },
  //   ],
  //   minLightRatio: 0.30,
  //   maxLightRatio: 0.45,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'symmetry-180',
  //   label: 'Symétrie 180°',
  //   tier: 'moyen',
  //   gridSize: 7,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     // { id: 'NO_2X2_DARK' },
  //     { id: 'SYMMETRY_180' },
  //   ],
  //   minLightRatio: 0.42,
  //   maxLightRatio: 0.58,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.26,
  // },
  // {
  //   id: 'dark-stripes',
  //   label: 'Bandes sombres',
  //   tier: 'difficile',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NURIBOU_STRIPES' },
  //     { id: 'NO_ISOLATED_DARK' },
  //   ],
  //   minLightRatio: 0.42,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'dark-pattern-l',
  //   label: 'Anti-L sombre',
  //   tier: 'difficile',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     // { id: 'NO_2X2_DARK' },
  //     { id: 'NO_PATTERN_DARK', params: { patternName: 'L_TROMINO' } },
  //   ],
  //   minLightRatio: 0.40,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'light-pattern-t',
  //   label: 'Anti-T clair',
  //   tier: 'difficile',
  //   gridSize: 7,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_2X2_DARK' },
  //     { id: 'NO_PATTERN_LIGHT', params: { patternName: 'T_TETROMINO' } },
  //   ],
  //   minLightRatio: 0.40,
  //   maxLightRatio: 0.60,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.24,
  // },
  // {
  //   id: 'dark-diagonal',
  //   label: 'Diagonales sombres',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_2X2_DARK' },
  //     { id: 'NO_3_DIAGONAL_DARK' },
  //   ],
  //   minLightRatio: 0.45,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'light-diagonal',
  //   label: 'Diagonales claires',
  //   tier: 'moyen',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_DARK' },
  //     { id: 'NO_2X2_LIGHT' },
  //     { id: 'NO_3_DIAGONAL_LIGHT' },
  //   ],
  //   minLightRatio: 0.35,
  //   maxLightRatio: 0.55,
  //   targetMaxLevel: 4,
  //   minTargetLevel: 2,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'dark-neighbors',
  //   label: 'Sombres groupées',
  //   tier: 'difficile',
  //   gridSize: 8,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     // { id: 'NO_2X2_DARK' },
  //     { id: 'NO_ISOLATED_DARK' },
  //   ],
  //   minLightRatio: 0.42,
  //   maxLightRatio: 0.62,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.23,
  // },
  // {
  //   id: 'dark-paths',
  //   label: 'Chemins sombres',
  //   tier: 'expert',
  //   gridSize: 8,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_2X2_DARK' },
  //     { id: 'DARK_MAX_DEGREE' },
  //   ],
  //   minLightRatio: 0.45,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.23,
  // },
  // {
  //   id: 'dark-border',
  //   label: 'Bords sombres',
  //   tier: 'difficile',
  //   gridSize: 7,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_2X2_DARK' },
  //     { id: 'DARK_REGIONS_TOUCH_BORDER' },
  //   ],
  //   minLightRatio: 0.42,
  //   maxLightRatio: 0.62,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.24,
  // },
  // {
  //   id: 'dark-region-count',
  //   label: 'Nombre de régions',
  //   tier: 'expert',
  //   gridSize: 6,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'DARK_REGION_COUNT_EXACT', params: { n: 4 } },
  //     { id: 'NO_ISOLATED_DARK' },
  //   ],
  //   minLightRatio: 0.45,
  //   maxLightRatio: 0.65,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.28,
  // },
  // {
  //   id: 'dense-local',
  //   label: 'Motifs serrés',
  //   tier: 'expert',
  //   gridSize: 8,
  //   rules: [
  //     { id: 'CONNECT_LIGHT' },
  //     { id: 'NO_2X2_DARK' },
  //     { id: 'NO_2X2_LIGHT' },
  //     { id: 'NO_3_DIAGONAL_DARK' },
  //     { id: 'DARK_MAX_DEGREE' },
  //   ],
  //   minLightRatio: 0.45,
  //   maxLightRatio: 0.55,
  //   targetMaxLevel: 5,
  //   minTargetLevel: 3,
  //   targetClueRatio: 0.22,
  // },
];

export function getLumizleDailyRuleCoverage() {
  const knownRuleIds = new Set(Object.keys(ALL_RULES));
  const usedRuleIds = new Set();
  for (const pack of LUMIZLE_DAILY_RULE_PACKS) {
    for (const rule of pack.rules) usedRuleIds.add(rule.id);
  }
  return {
    used: [...usedRuleIds].sort(),
    missing: [...knownRuleIds].filter(id => !usedRuleIds.has(id)).sort(),
    unknown: [...usedRuleIds].filter(id => !knownRuleIds.has(id)).sort(),
  };
}

// ---------------------------------------------------------------------------
// Configurations historiques (ANCIEN pipeline, conservées pour compat)
// ---------------------------------------------------------------------------

export const LUMIZLE_DIFFICULTY_CONFIGS = {
  easy: {
    gridSize: 5,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
    ],
    minLightRatio: 0.40,
    maxLightRatio: 0.60,
  },
  medium: {
    gridSize: 6,
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
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

export const DEFAULT_LEGACY_MAX_GRID_SIZE = 6;
export const DEFAULT_LEGACY_DAILY_RETRIES = 6;

// Configs quotidiennes - ancien pipeline (compat)
const DAILY_CONFIGS = [
  // ── Easy ──────────────────────────────────────────────────────────────────
  {
    gridSize: 5, difficulty: 'easy',
    rules: [{ id: 'CONNECT_LIGHT' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }],
    minLightRatio: 0.40, maxLightRatio: 0.60,
  },
  {
    gridSize: 6, difficulty: 'easy',
    rules: [{ id: 'CONNECT_LIGHT' }, { id: 'DARK_REGION_SIZE', params: { n: 2 } }],
    minLightRatio: 0.38, maxLightRatio: 0.62,
  },
  // ── Medium ────────────────────────────────────────────────────────────────
  {
    gridSize: 6, difficulty: 'medium',
    rules: [
      { id: 'CONNECT_LIGHT' },
      { id: 'DARK_REGION_SIZE', params: { n: 2 } },
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
// Rotation quotidienne pour le pipeline LOGIQUE
// ---------------------------------------------------------------------------

/**
 * Calendrier hebdomadaire de difficultés pour le pipeline logique :
 * lundi (0) -> facile, ..., dimanche (6) -> expert
 */
const WEEKLY_DIFFICULTY_PROGRESSION = [
  'facile',     // Mon
  'facile',     // Tue
  'moyen',      // Wed
  'moyen',      // Thu
  'difficile',  // Fri
  'difficile',  // Sat
  'expert',     // Sun
];

function getDayOfWeekIndex(dateKey) {
  // dateKey: YYYY-MM-DD
  const d = new Date(dateKey + 'T00:00:00');
  // getDay: 0=Sun, 1=Mon, ..., 6=Sat → on remet 0=Mon
  const day = d.getUTCDay();
  return (day + 6) % 7;
}

function getOrdinalDayIndex(dateKey) {
  const d = new Date(dateKey + 'T00:00:00Z');
  const epoch = new Date('2024-01-01T00:00:00Z');
  return Math.floor((d.getTime() - epoch.getTime()) / 86400000);
}

/**
 * Sélectionne la difficulté logique du jour (rotation hebdomadaire).
 */
export function pickLogicalDailyTier(dateKey) {
  const idx = getDayOfWeekIndex(dateKey);
  const tierKey = WEEKLY_DIFFICULTY_PROGRESSION[idx];
  return { tierKey, ...LUMIZLE_LOGICAL_TIERS[tierKey] };
}

/**
 * Sélectionne un pack de règles par date. La rotation est volontairement simple :
 * sur 365 jours, chaque pack apparaît plusieurs fois, donc toutes les règles
 * couvertes par LUMIZLE_DAILY_RULE_PACKS apparaissent en archive.
 */
export function pickLogicalDailyRulePack(dateKey, options = {}) {
  const maxGridSize = options.maxGridSize;
  const packs = Number.isFinite(maxGridSize)
    ? LUMIZLE_DAILY_RULE_PACKS.filter(pack => pack.gridSize <= maxGridSize)
    : LUMIZLE_DAILY_RULE_PACKS;
  const eligiblePacks = packs.length > 0 ? packs : LUMIZLE_DAILY_RULE_PACKS;
  const idx = Math.abs(getOrdinalDayIndex(dateKey)) % LUMIZLE_DAILY_RULE_PACKS.length;
  return eligiblePacks[idx % eligiblePacks.length];
}

// ---------------------------------------------------------------------------
// Helpers (FNV-1a pour ancien daily)
// ---------------------------------------------------------------------------

function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash = hash >>> 0;
  }
  return hash === 0 ? 1 : hash;
}

function getLegacyClueRatio(difficulty) {
  return difficulty === 'easy' ? 0.32 : difficulty === 'hard' ? 0.17 : 0.22;
}

function getDailyConfigPool(maxGridSize = DEFAULT_LEGACY_MAX_GRID_SIZE) {
  const eligible = DAILY_CONFIGS.filter(cfg => cfg.gridSize <= maxGridSize);
  return eligible.length > 0 ? eligible : DAILY_CONFIGS;
}

function buildDailyConfigCandidates(dateKey, options = {}) {
  const pool = getDailyConfigPool(options.maxGridSize);
  const h = hashString(`lumizle_${dateKey}`);
  const preferredIndex = h % pool.length;
  const preferred = pool[preferredIndex];
  const remaining = pool
    .filter((_, idx) => idx !== preferredIndex)
    .sort((a, b) => a.gridSize - b.gridSize || a.difficulty.localeCompare(b.difficulty));
  return [preferred, ...remaining];
}

function pickSizedDifficultyConfig(difficulty, maxGridSize = DEFAULT_LEGACY_MAX_GRID_SIZE) {
  const requested = LUMIZLE_DIFFICULTY_CONFIGS[difficulty] || LUMIZLE_DIFFICULTY_CONFIGS.medium;
  if (requested.gridSize <= maxGridSize) return requested;

  const dailyFallback = DAILY_CONFIGS
    .filter(cfg => cfg.difficulty === difficulty && cfg.gridSize <= maxGridSize)
    .sort((a, b) => b.gridSize - a.gridSize)[0];

  if (dailyFallback) return dailyFallback;

  const fallback = Object.values(LUMIZLE_DIFFICULTY_CONFIGS)
    .filter(cfg => cfg.gridSize <= maxGridSize)
    .sort((a, b) => b.gridSize - a.gridSize)[0];

  return fallback || requested;
}

/** Sélectionne la config quotidienne (ANCIEN pipeline). */
export function pickDailyConfig(dateKey, options = {}) {
  return buildDailyConfigCandidates(dateKey, options)[0];
}

// ---------------------------------------------------------------------------
// API publique - ANCIEN pipeline (compat)
// ---------------------------------------------------------------------------

export function generateLumizlePuzzle(seed, difficulty = 'medium', options = {}) {
  const maxGridSize = options.maxGridSize ?? DEFAULT_LEGACY_MAX_GRID_SIZE;
  const cfg = pickSizedDifficultyConfig(difficulty, maxGridSize);
  const clueDifficulty = cfg.difficulty || difficulty;
  return generatePuzzle(seed, {
    size: cfg.gridSize,
    rules: cfg.rules,
    minLightRatio: cfg.minLightRatio,
    maxLightRatio: cfg.maxLightRatio,
    clueRatio: getLegacyClueRatio(clueDifficulty),
    clueQuality: LEGACY_CLUE_QUALITY,
  });
}

export function generateDailyLumizle(dateKey, options = {}) {
  const {
    maxGridSize = DEFAULT_LEGACY_MAX_GRID_SIZE,
    maxConfigRetries = DEFAULT_LEGACY_DAILY_RETRIES,
  } = options;

  const candidates = buildDailyConfigCandidates(dateKey, { maxGridSize });
  const retryCount = Math.max(1, Math.min(maxConfigRetries, candidates.length));
  let lastError = null;

  for (let attempt = 0; attempt < retryCount; attempt++) {
    const cfg = candidates[attempt];
    const seed = `lumizle_daily_${dateKey}_cfg${attempt}`;

    try {
      const puzzle = generatePuzzle(seed, {
        size: cfg.gridSize,
        rules: cfg.rules,
        minLightRatio: cfg.minLightRatio,
        maxLightRatio: cfg.maxLightRatio,
        clueRatio: getLegacyClueRatio(cfg.difficulty),
        clueQuality: LEGACY_CLUE_QUALITY,
      });

      puzzle.metadata.dailyDifficulty = cfg.difficulty;
      puzzle.metadata.dailyFallbackAttempt = attempt;
      puzzle.metadata.dailyMaxGridSize = maxGridSize;
      puzzle.metadata.usedFallbackConfig = attempt > 0;
      return puzzle;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn(
      `Lumizle: génération échouée pour ${dateKey} après ${retryCount} configuration(s) ` +
      `(maxGridSize=${maxGridSize}): ${lastError.message}`,
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// API publique - NOUVEAU pipeline logique
// ---------------------------------------------------------------------------

/**
 * Génère un puzzle Lumizle avec solution unique et difficulté mesurée.
 *
 * @param {string|number} seed
 * @param {'facile'|'moyen'|'difficile'|'expert'} tier
 * @param {Object} overrides - surcharges optionnelles (timeoutMs, etc.)
 * @returns {Object|null}
 */
export function generateLogicalLumizlePuzzle(seed, tier = 'moyen', overrides = {}) {
  const cfg = LUMIZLE_LOGICAL_TIERS[tier] || LUMIZLE_LOGICAL_TIERS.moyen;
  const result = generateLogicalPuzzle(seed, {
    size: cfg.gridSize,
    rules: cfg.rules,
    minLightRatio: cfg.minLightRatio,
    maxLightRatio: cfg.maxLightRatio,
    targetMaxLevel: cfg.targetMaxLevel,
    minTargetLevel: cfg.minTargetLevel,
    targetClueRatio: cfg.targetClueRatio,
    clueQuality: cfg.clueQuality,
    allowHypothesis: cfg.allowHypothesis,
    maxGenerationAttempts: DEFAULT_LOGICAL_ATTEMPTS,
    timeoutMs: DEFAULT_LOGICAL_TIMEOUT_MS,
    ...overrides,
  });
  if (result) {
    result.metadata.tier = tier;
    result.metadata.tierLabel = cfg.label;
  }
  return result;
}

export function generateLogicalLumizlePackPuzzle(seed, pack, overrides = {}) {
  const result = generateLogicalPuzzle(seed, {
    size: pack.gridSize,
    rules: pack.rules,
    minLightRatio: pack.minLightRatio,
    maxLightRatio: pack.maxLightRatio,
    targetMaxLevel: pack.targetMaxLevel,
    minTargetLevel: pack.minTargetLevel,
    targetClueRatio: pack.targetClueRatio,
    clueQuality: pack.clueQuality,
    allowHypothesis: pack.allowHypothesis ?? false,
    maxGenerationAttempts: DEFAULT_LOGICAL_ATTEMPTS,
    timeoutMs: DEFAULT_LOGICAL_TIMEOUT_MS,
    ...overrides,
  });
  if (result) {
    result.metadata.tier = pack.tier;
    result.metadata.tierLabel = LUMIZLE_LOGICAL_TIERS[pack.tier]?.label || pack.tier;
    result.metadata.rulePackId = pack.id;
    result.metadata.rulePackLabel = pack.label;
  }
  return result;
}

/**
 * Génère le puzzle quotidien avec le pipeline logique.
 * Les packs tournent par date pour couvrir toutes les règles en archive.
 */
export function generateLogicalDailyLumizle(dateKey, overrides = {}) {
  const pack = pickLogicalDailyRulePack(dateKey, { maxGridSize: overrides.maxGridSize });
  const seed = `lumizle_logical_daily_${dateKey}_${pack.id}`;
  return generateLogicalLumizlePackPuzzle(seed, pack, overrides);
}
