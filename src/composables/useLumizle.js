/**
 * useLumizle - Composable de gestion d'état pour le puzzle Lumizle.
 *
 * Cellule player :
 *   0 = CELL_UNKNOWN  (non décidée, gris)
 *   1 = CELL_DARK     (sombre, noir)
 *   2 = CELL_LIGHT    (clair, blanc)
 *
 * Les cellules fixes (indices du puzzle) sont non-modifiables par le joueur.
 */

import { ref, computed, onUnmounted } from 'vue';
import { checkAllRules, getAllViolatingCells, CELL_UNKNOWN, CELL_DARK, CELL_LIGHT } from '../algorithms/lumizle/rules.js';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

const LS_STATE_PREFIX = 'lumizle-game-state';
const LS_COMPLETED_KEY = 'lumizle-completed-levels';
const LS_STATS_KEY = 'lumizle-level-stats';
const LS_STRICT_MODE_KEY = 'lumizle-strict-mode';
const MAX_UNDO = 50;

export function useLumizle() {
  // ── Core state ────────────────────────────────────────────────────────────
  const puzzle = ref(null);   // { initialGrid, solution, rules, metadata }
  const gameState = ref([]);     // Décisions joueur : NxN de 0/1/2
  const isLoading = ref(false);
  const error = ref(null);
  const currentDate = ref('');     // 'YYYY-MM-DD' pour daily, id court pour practice
  const isPractice = ref(false);
  const isWonByUserInSession = ref(false);

  // ── Couleur du premier clic ───────────────────────────────────────────────
  // CELL_LIGHT (blanc) par défaut ; peut être basculé à tout moment.
  const firstClickColor = ref(CELL_LIGHT);

  function toggleFirstClickColor() {
    firstClickColor.value = firstClickColor.value === CELL_LIGHT ? CELL_DARK : CELL_LIGHT;
  }

  // ── Mode strict (cache les violations en temps réel) ──────────────────────
  // Par défaut : aide activée (strictMode = false). On ne restaure depuis
  // localStorage que si l'utilisateur avait explicitement activé le mode strict.
  const strictMode = ref(false);
  try {
    const saved = localStorage.getItem(LS_STRICT_MODE_KEY);
    if (saved === '1') strictMode.value = true;
  } catch (_) { /* ignore */ }

  function toggleStrictMode() {
    strictMode.value = !strictMode.value;
    try {
      localStorage.setItem(LS_STRICT_MODE_KEY, strictMode.value ? '1' : '0');
    } catch (_) { /* ignore */ }
  }

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undoHistory = ref([]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const elapsedSeconds = ref(0);
  const isTimerStarted = ref(false);
  const isPaused = ref(false);
  const _timerFrozen = ref(false);
  let timerInterval = null;

  function freezeTimer(frozen) {
    _timerFrozen.value = frozen;
  }

  const formattedTime = computed(() => {
    const s = elapsedSeconds.value;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  function startTimer() {
    if (timerInterval) return;
    isTimerStarted.value = true;
    isPaused.value = false;
    timerInterval = setInterval(() => {
      if (!isPaused.value && !_timerFrozen.value && !isWon.value) {
        elapsedSeconds.value++;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    stopTimer();
    elapsedSeconds.value = 0;
    isTimerStarted.value = false;
    isPaused.value = false;
    _timerFrozen.value = false;
  }

  function togglePause() {
    if (!isTimerStarted.value || isWon.value) return;
    isPaused.value = !isPaused.value;
    saveGameState();
  }

  // ── Helpers grille ───────────────────────────────────────────────────────

  function getSize() {
    return puzzle.value?.metadata?.gridSize ?? 0;
  }

  function makeEmptyGameState(size) {
    return Array.from({ length: size }, () => new Array(size).fill(CELL_UNKNOWN));
  }

  /**
   * Retourne la valeur effective d'une cellule : indice fixe si présent,
   * sinon décision du joueur.
   */
  function effectiveValue(r, c) {
    const fixed = puzzle.value?.initialGrid?.[r]?.[c];
    if (fixed) return fixed;
    return gameState.value?.[r]?.[c] ?? CELL_UNKNOWN;
  }

  /**
   * Construit la grille effective complète (NxN) combinant indices + joueur.
   */
  function buildEffectiveGrid() {
    const size = getSize();
    if (!size) return [];
    return Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => effectiveValue(r, c))
    );
  }

  // ── Cellules fixes ────────────────────────────────────────────────────────
  const fixedCells = computed(() => {
    const set = new Set();
    if (!puzzle.value) return set;
    const { initialGrid, metadata: { gridSize: size } } = puzzle.value;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (initialGrid[r][c] !== CELL_UNKNOWN) set.add(`${r},${c}`);
    return set;
  });

  // ── Violations en temps réel ───────────────────────────────────────────────
  // Calcul brut (utilisé par isWon) — toujours effectué.
  const rawViolatingCells = computed(() => {
    if (!puzzle.value) return new Set();
    const size = getSize();
    const eff = buildEffectiveGrid();
    return getAllViolatingCells(eff, size, puzzle.value.rules);
  });

  // Exposé au UI — caché en mode strict pour forcer la déduction.
  const violatingCells = computed(() => {
    if (strictMode.value) return new Set();
    return rawViolatingCells.value;
  });

  // ── Victoire ──────────────────────────────────────────────────────────────
  const isWon = computed(() => {
    if (!puzzle.value) return false;

    // 1. Toutes les cellules joueur doivent être remplies (pas d'UNKNOWN)
    const { initialGrid, metadata: { gridSize: size } } = puzzle.value;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (initialGrid[r][c] !== CELL_UNKNOWN) continue; // cellule fixe OK
        if ((gameState.value[r]?.[c] ?? CELL_UNKNOWN) === CELL_UNKNOWN) return false;
      }
    }

    // 2. La grille complète doit satisfaire les règles, pas seulement éviter
    // les violations visuelles partielles.
    const eff = buildEffectiveGrid();
    if (!checkAllRules(eff, size, puzzle.value.rules)) return false;

    return true;
  });


  // ── Undo helpers ──────────────────────────────────────────────────────────
  function pushHistory() {
    const snap = gameState.value.map(row => [...row]);
    undoHistory.value.push(snap);
    if (undoHistory.value.length > MAX_UNDO) undoHistory.value.shift();
  }

  function undo() {
    if (undoHistory.value.length === 0) return;
    gameState.value = undoHistory.value.pop();
    saveGameState();
  }

  // ── Interactions cellule ──────────────────────────────────────────────────

  /**
   * Retourne la prochaine valeur dans le cycle.
   * Si la cellule est vide, applique firstClickColor.
   * Sinon : couleur choisie → autre couleur → vide.
   */
  function nextCellValue(current) {
    const first = firstClickColor.value;
    const second = first === CELL_LIGHT ? CELL_DARK : CELL_LIGHT;
    if (current === CELL_UNKNOWN) return first;
    if (current === first) return second;
    return CELL_UNKNOWN;
  }

  function finishIfWon() {
    if (!isWon.value || isWonByUserInSession.value) return;
    isWonByUserInSession.value = true;
    stopTimer();
    saveLevelStats(currentDate.value, elapsedSeconds.value);
  }

  /**
   * Clic simple : cycle vide → blanc → noir → vide.
   * Lance le timer au premier clic.
   */
  function handleCellClick(r, c) {
    if (!puzzle.value) return;
    if (isWon.value || isPaused.value) return;
    if (fixedCells.value.has(`${r},${c}`)) return; // cellule fixe

    if (!isTimerStarted.value) {
      startTimer();
    }

    pushHistory();
    const current = gameState.value[r][c];
    gameState.value[r][c] = nextCellValue(current);
    finishIfWon();
    saveGameState();
  }

  /**
   * Drag : applique la même transition que la première cellule draguée.
   * dragTargetValue est la valeur cible déterminée au mousedown.
   */
  function handleCellDrag(r, c, dragTargetValue) {
    if (!puzzle.value) return;
    if (isWon.value || isPaused.value) return;
    if (fixedCells.value.has(`${r},${c}`)) return;
    if (gameState.value[r][c] === dragTargetValue) return; // déjà à la valeur cible

    if (!isTimerStarted.value) {
      startTimer();
    }

    pushHistory();
    gameState.value[r][c] = dragTargetValue;
    finishIfWon();
    saveGameState();
  }

  // ── Persistance localStorage ───────────────────────────────────────────────

  function lsKey() {
    return `${LS_STATE_PREFIX}-${currentDate.value}`;
  }

  function saveGameState() {
    if (!currentDate.value) return;
    try {
      localStorage.setItem(lsKey(), JSON.stringify({
        state: gameState.value,
        elapsedSeconds: elapsedSeconds.value,
        isTimerStarted: isTimerStarted.value,
        isPaused: isPaused.value,
      }));
    } catch (_) { /* quota */ }
  }

  function loadGameState() {
    if (!currentDate.value) return false;
    try {
      const raw = localStorage.getItem(lsKey());
      if (!raw) return false;
      const saved = JSON.parse(raw);
      const savedState = Array.isArray(saved) ? saved : saved?.state;
      // Vérifier que la taille correspond
      const size = getSize();
      if (!savedState || savedState.length !== size || savedState[0]?.length !== size) return false;
      gameState.value = savedState;

      if (!Array.isArray(saved)) {
        if (typeof saved.elapsedSeconds === 'number') elapsedSeconds.value = saved.elapsedSeconds;
        isTimerStarted.value = !!saved.isTimerStarted;
        isPaused.value = !!saved.isPaused;
        if (isTimerStarted.value && !isPaused.value && !isWon.value) {
          startTimer();
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function resetGameState() {
    if (!puzzle.value) return;
    const size = getSize();
    gameState.value = makeEmptyGameState(size);
    undoHistory.value = [];
    isWonByUserInSession.value = false;
    firstClickColor.value = CELL_LIGHT;
    resetTimer();
    saveGameState();
  }

  // ── Chargement de puzzle ───────────────────────────────────────────────────

  function _loadPuzzleData(puzzleData, dateKey, practice = false) {
    puzzle.value = puzzleData;
    currentDate.value = dateKey;
    isPractice.value = practice;
    isWonByUserInSession.value = false;
    undoHistory.value = [];
    firstClickColor.value = CELL_LIGHT;

    const size = puzzleData.metadata.gridSize;
    gameState.value = makeEmptyGameState(size);

    // Restaurer sauvegarde si elle existe
    if (!loadGameState()) {
      // Pas de sauvegarde, démarrer vide
    }

    // Si la partie était déjà gagnée, remplir avec la solution
    if (isAlreadyCompleted(dateKey)) {
      fillWithSolution();
    }
  }

  /** Charge le puzzle quotidien depuis l'API. */
  async function initPuzzle(dateKey) {
    isLoading.value = true;
    error.value = null;
    resetTimer();

    try {
      const res = await fetch(`${API_URL}/api/lumizle-daily?date=${dateKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _loadPuzzleData(data.puzzle, dateKey, false);
    } catch (err) {
      error.value = err.message || 'Erreur de chargement';
    } finally {
      isLoading.value = false;
    }
  }

  /** Charge directement un puzzle pré-généré (practice). */
  function initPracticePuzzle(puzzleData, id, practice = true) {
    error.value = null;
    isLoading.value = false;
    resetTimer();
    _loadPuzzleData(puzzleData, id, practice);
  }

  /** Remplit la grille avec la solution (niveau déjà complété). */
  function fillWithSolution() {
    if (!puzzle.value) return;
    const { solution, initialGrid, metadata: { gridSize: size } } = puzzle.value;
    const newState = makeEmptyGameState(size);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (initialGrid[r][c] === CELL_UNKNOWN) {
          newState[r][c] = solution[r][c];
        }
      }
    }
    gameState.value = newState;
    isWonByUserInSession.value = false;
    stopTimer();
    isTimerStarted.value = false;

    const stats = getLevelStats(currentDate.value);
    if (stats) {
      elapsedSeconds.value = stats.elapsedSeconds;
    }
    saveGameState();
  }

  // ── Statistiques par niveau ───────────────────────────────────────────────

  function saveLevelStats(levelId, time) {
    if (!levelId) return;
    try {
      const all = JSON.parse(localStorage.getItem(LS_STATS_KEY) || '{}');
      all[levelId] = { elapsedSeconds: time };
      localStorage.setItem(LS_STATS_KEY, JSON.stringify(all));
    } catch (_) { /* ignore */ }
  }

  function getLevelStats(levelId) {
    if (!levelId) return null;
    try {
      const all = JSON.parse(localStorage.getItem(LS_STATS_KEY) || '{}');
      return all[levelId] || null;
    } catch (_) {
      return null;
    }
  }

  // ── Niveaux complétés ─────────────────────────────────────────────────────

  function getCompletedLevels() {
    try {
      return JSON.parse(localStorage.getItem(LS_COMPLETED_KEY) || '[]');
    } catch (_) { return []; }
  }

  function markCompleted(id) {
    const list = getCompletedLevels();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(LS_COMPLETED_KEY, JSON.stringify(list));
    }
  }

  function isAlreadyCompleted(id) {
    return getCompletedLevels().includes(id);
  }

  onUnmounted(() => {
    stopTimer();
  });

  return {
    // State
    puzzle,
    gameState,
    isLoading,
    error,
    currentDate,
    isPractice,
    isWonByUserInSession,
    fixedCells,

    // Violations (real-time)
    violatingCells,

    // Mode strict
    strictMode,
    toggleStrictMode,

    // Couleur du premier clic
    firstClickColor,
    toggleFirstClickColor,

    // Win
    isWon,

    // Timer
    elapsedSeconds,
    formattedTime,
    isTimerStarted,
    isPaused,
    startTimer,
    togglePause,
    freezeTimer,
    resetTimer,

    // Undo
    undoHistory,
    undo,

    // Helpers
    effectiveValue,
    buildEffectiveGrid,
    nextCellValue,

    // Interactions
    handleCellClick,
    handleCellDrag,

    // Lifecycle
    initPuzzle,
    initPracticePuzzle,
    resetGameState,
    fillWithSolution,

    // Persistence
    saveGameState,
    getLevelStats,
    saveLevelStats,

    // Completion tracking
    getCompletedLevels,
    markCompleted,
    isAlreadyCompleted,
  };
}
